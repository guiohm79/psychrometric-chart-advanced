import test from 'node:test';
import assert from 'node:assert/strict';
import { PsychrometricCalculations as P, LINE_STYLES, DEFAULT_LINE_STYLES, pickAxisStep, alignSeries, timeOutsideRange } from '../src/psychrometric-helpers.js';

/**
 * Les valeurs de référence proviennent de tables psychrométriques standard
 * (air à pression atmosphérique, 101.325 kPa).
 * Toute formule ajoutée à PsychrometricCalculations doit être couverte ici :
 * c'est la seule vérification automatisée du projet, la carte elle-même ne
 * pouvant être testée qu'à la main dans Home Assistant.
 */

/**
 * Compare deux nombres à une tolérance donnée.
 * @param {number} actual - Valeur calculée
 * @param {number} expected - Valeur de référence
 * @param {number} tolerance - Écart absolu toléré
 * @param {string} message - Message en cas d'échec
 */
const near = (actual, expected, tolerance, message) => {
    assert.ok(
        Math.abs(actual - expected) <= tolerance,
        `${message}\n  attendu ${expected} ± ${tolerance}\n  obtenu  ${actual}`
    );
};

test('calculateSaturationPressure suit les tables de vapeur saturante', () => {
    near(P.calculateSaturationPressure(0), 0.611, 0.005, 'Psat à 0 °C');
    near(P.calculateSaturationPressure(20), 2.339, 0.01, 'Psat à 20 °C');
    near(P.calculateSaturationPressure(25), 3.169, 0.01, 'Psat à 25 °C');
    near(P.calculateSaturationPressure(100), 101.3, 3, 'Psat à 100 °C ≈ pression atmosphérique');
});

test('calculateDewPoint', () => {
    near(P.calculateDewPoint(25, 50), 13.9, 0.2, 'point de rosée 25 °C / 50 %');
    near(P.calculateDewPoint(20, 100), 20, 0.1, 'à saturation, le point de rosée égale la température sèche');
    near(P.calculateDewPoint(30, 80), 26.2, 0.3, 'point de rosée 30 °C / 80 %');
});

test('calculateWetBulbTemp suit les tables psychrométriques', () => {
    // Tolérance de 0.15 °C : c'est l'écart mesuré entre la relation ASHRAE utilisée ici
    // et l'équation du psychromètre (Pv = Psat(tw) - 6.62e-4·P·(t - tw)), deux modèles
    // indépendants. Une dérive au-delà signale une régression, pas un désaccord de modèle.
    near(P.calculateWetBulbTemp(25, 50), 17.89, 0.15, 'temp. humide 25 °C / 50 %');
    near(P.calculateWetBulbTemp(20, 60), 15.16, 0.15, 'temp. humide 20 °C / 60 %');
    near(P.calculateWetBulbTemp(30, 50), 22.0, 0.15, 'temp. humide 30 °C / 50 %');
    near(P.calculateWetBulbTemp(35, 30), 21.55, 0.15, 'temp. humide 35 °C / 30 %');
    assert.equal(P.calculateWetBulbTemp(20, 100), 20, 'à saturation, temp. humide = temp. sèche');
});

test('calculateWetBulbTemp reste encadrée par le point de rosée et la température sèche', () => {
    for (const [t, rh] of [[10, 20], [25, 50], [30, 40], [35, 95], [40, 30], [0, 60], [-10, 50]]) {
        const tw = P.calculateWetBulbTemp(t, rh);
        const dp = P.calculateDewPoint(t, rh);
        assert.ok(tw <= t + 1e-6, `temp. humide > temp. sèche à ${t} °C / ${rh} %`);
        assert.ok(tw >= dp - 1e-6, `temp. humide < point de rosée à ${t} °C / ${rh} %`);
    }
});

test('calculateWaterContent', () => {
    near(P.calculateWaterContent(25, 50), 0.00988, 0.0003, 'teneur en eau 25 °C / 50 %');
    near(P.calculateWaterContent(20, 60), 0.00877, 0.0003, 'teneur en eau 20 °C / 60 %');
    near(P.calculateWaterContent(25, 0), 0, 1e-9, 'air sec');
});

test('calculateEnthalpy', () => {
    near(P.calculateEnthalpy(25, P.calculateWaterContent(25, 50)), 50.4, 0.5, 'enthalpie 25 °C / 50 %');
    near(P.calculateEnthalpy(20, P.calculateWaterContent(20, 60)), 42.3, 0.5, 'enthalpie 20 °C / 60 %');
    near(P.calculateEnthalpy(0, 0), 0, 1e-9, 'référence : 0 °C et air sec');
});

test('calculateSpecificVolume rend des m³/kg, pas des milliers', () => {
    // Régression : la formule divisait par une pression en kPa avec Rd en J/(kg·K),
    // ce qui rendait ~871 m³/kg au lieu de ~0.86.
    near(P.calculateSpecificVolume(25, 50), 0.858, 0.005, 'volume spécifique 25 °C / 50 %');
    near(P.calculateSpecificVolume(20, 60), 0.842, 0.005, 'volume spécifique 20 °C / 60 %');
    near(P.calculateSpecificVolume(0, 0), 0.773, 0.005, 'volume spécifique air sec à 0 °C');

    for (const [t, rh] of [[-10, 50], [0, 80], [20, 50], [35, 70], [45, 30]]) {
        const v = P.calculateSpecificVolume(t, rh);
        assert.ok(v > 0.7 && v < 1.0, `volume spécifique à ${t} °C / ${rh} % hors plage physique : ${v}`);
    }
});

test('calculateAbsoluteHumidity', () => {
    near(P.calculateAbsoluteHumidity(25, 50), 11.5, 0.3, 'humidité absolue 25 °C / 50 %');
    near(P.calculateAbsoluteHumidity(20, 100), 17.3, 0.4, 'humidité absolue à saturation, 20 °C');
    near(P.calculateAbsoluteHumidity(25, 0), 0, 1e-9, 'air sec');
});

test('calculateApparentTemperature suit la formule de Steadman', () => {
    // AT = t + 0.33·e − 0.70·v − 4.00, avec e la pression de vapeur en hPa.
    // Références calculées depuis l'équation publiée, pas depuis le code :
    //   22 °C / 50 % → e = 13.219 hPa → 22 + 4.362 − 4 = 22.362
    //   30 °C / 70 % → e = 29.689 hPa → 30 + 9.797 − 4 = 35.797
    near(P.calculateApparentTemperature(22, 50), 22.362, 0.01, 'ressentie 22 °C / 50 %');
    near(P.calculateApparentTemperature(30, 70), 35.797, 0.01, 'ressentie 30 °C / 70 %');
});

test('calculateApparentTemperature : l’air humide réchauffe, l’air sec rafraîchit', () => {
    // Le seul intérêt du champ est de s'écarter de la température sèche dans le bon
    // sens : à humidité élevée l'évaporation de la sueur est freinée (il fait plus
    // chaud que le thermomètre), à humidité faible elle est facilitée.
    assert.ok(P.calculateApparentTemperature(30, 70) > 30, '30 °C / 70 % doit sembler plus chaud');
    assert.ok(P.calculateApparentTemperature(30, 20) < 30, '30 °C / 20 % doit sembler plus frais');

    // Monotonie en humidité, à température constante.
    let previous = -Infinity;
    for (const rh of [10, 30, 50, 70, 90]) {
        const at = P.calculateApparentTemperature(25, rh);
        assert.ok(at > previous, `la ressentie doit croître avec l'humidité (${rh} %)`);
        previous = at;
    }
});

test('calculateApparentTemperature reste définie hors des plages chaudes', () => {
    // C'est la raison du choix de Steadman plutôt que l'indice de chaleur ou l'humidex :
    // un point extérieur en hiver doit rendre une valeur exploitable, pas un NaN ni un
    // repli silencieux sur la température sèche.
    for (const [t, rh] of [[-10, 80], [0, 60], [5, 90], [15, 40]]) {
        const at = P.calculateApparentTemperature(t, rh);
        assert.ok(Number.isFinite(at), `ressentie non finie à ${t} °C / ${rh} %`);
        assert.ok(at < t, `par temps froid, l'air humide et immobile ne réchauffe pas (${t} °C)`);
    }
});

test('calculateApparentTemperature : le vent rafraîchit', () => {
    const still = P.calculateApparentTemperature(30, 70);
    near(P.calculateApparentTemperature(30, 70, 2), still - 1.4, 0.01, '2 m/s retirent 1.4 °C');
    assert.equal(P.calculateApparentTemperature(30, 70, 0), still, 'vent nul = valeur par défaut');
});

test('calculatePMV suit ISO 7730 et devient négatif quand il fait frais', () => {
    // Régression : la pression de vapeur était calculée avec un facteur 10 d'écart,
    // ce qui rendait le PMV positif même à 18 °C.
    near(P.calculatePMV(22, 50), -0.45, 0.3, 'PMV 22 °C / 50 % (légèrement frais)');
    near(P.calculatePMV(26, 50), 0.55, 0.3, 'PMV 26 °C / 50 % (légèrement chaud)');
    near(P.calculatePMV(18, 50), -1.65, 0.4, 'PMV 18 °C / 50 % (frais)');

    assert.ok(P.calculatePMV(18, 50) < 0, 'à 18 °C le PMV doit être négatif');
    assert.ok(P.calculatePMV(30, 60) > 1, 'à 30 °C / 60 % le PMV doit être franchement positif');
});

test('calculatePMV est monotone croissant avec la température', () => {
    let previous = -Infinity;
    for (let t = 14; t <= 34; t += 2) {
        const pmv = P.calculatePMV(t, 50);
        assert.ok(pmv > previous, `PMV non monotone entre ${t - 2} °C et ${t} °C`);
        previous = pmv;
    }
});

test('calculatePMV reste borné à -3..+3 et accepte ses paramètres', () => {
    assert.equal(P.calculatePMV(-20, 50), -3, 'borne basse');
    assert.equal(P.calculatePMV(60, 90), 3, 'borne haute');
    assert.ok(
        P.calculatePMV(22, 50, { clo: 1.2 }) > P.calculatePMV(22, 50, { clo: 0.5 }),
        'plus de vêtements doit réchauffer le ressenti'
    );
    assert.ok(
        P.calculatePMV(26, 50, { vel: 0.8 }) < P.calculatePMV(26, 50, { vel: 0.1 }),
        'un courant d’air doit rafraîchir le ressenti'
    );
});

test('calculateWaterContentFromWetBulb rend exactement Ws à saturation', () => {
    // Identité algébrique : à t = tw, la formule ASHRAE doit se réduire à Ws(tw).
    // C'est le test fort de la ligne iso-temp-humide utilisée par le tracé.
    for (const tw of [-5, 0, 10, 20, 30, 40]) {
        near(
            P.calculateWaterContentFromWetBulb(tw, tw),
            P.calculateWaterContent(tw, 100),
            1e-12,
            `W(${tw}, ${tw}) doit valoir Ws(${tw})`
        );
    }
});

test('la temp. humide affichée et les lignes iso-humides tracées concordent', () => {
    // La carte affiche calculateWetBulbTemp par point et trace les lignes via
    // calculateWaterContentFromWetBulb : les deux doivent désigner le même air.
    for (const [t, rh] of [[10, 50], [25, 50], [30, 40], [20, 70], [35, 30], [40, 20]]) {
        const tw = P.calculateWetBulbTemp(t, rh);
        const W = P.calculateWaterContentFromWetBulb(t, tw);
        const rhBack = (P.waterContentToVaporPressure(W) / P.calculateSaturationPressure(t)) * 100;
        near(rhBack, rh, 0.01, `aller-retour temp. humide à ${t} °C / ${rh} %`);
    }
});

test('waterContentToVaporPressure inverse calculateWaterContent', () => {
    for (const [t, rh] of [[25, 50], [10, 80], [35, 20]]) {
        const W = P.calculateWaterContent(t, rh);
        near(P.waterContentToVaporPressure(W), P.calculateVaporPressure(t, rh), 1e-6, `inversion à ${t} °C / ${rh} %`);
    }
});

test('conversions de température', () => {
    near(P.celsiusToFahrenheit(0), 32, 1e-9, '0 °C');
    near(P.celsiusToFahrenheit(100), 212, 1e-9, '100 °C');
    near(P.fahrenheitToCelsius(32), 0, 1e-9, '32 °F');
    near(P.fahrenheitToCelsius(P.celsiusToFahrenheit(21.5)), 21.5, 1e-9, 'aller-retour');
});

test('calculateMoldRisk', () => {
    assert.equal(P.calculateMoldRisk(2, 30), 0, 'froid et sec : aucun risque');
    assert.ok(P.calculateMoldRisk(22, 95) > P.calculateMoldRisk(22, 50), 'plus humide = plus risqué');
    assert.ok(P.calculateMoldRisk(22, 85) <= 6, 'le risque est plafonné à 6');
    for (const [t, rh] of [[-5, 10], [22, 95], [30, 99], [15, 65]]) {
        const risk = P.calculateMoldRisk(t, rh);
        assert.ok(risk >= 0 && risk <= 6, `risque hors bornes à ${t} °C / ${rh} % : ${risk}`);
    }
});

test('calculateIdealSetpoint ramène dans la zone de confort', () => {
    const range = { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };
    assert.deepEqual(P.calculateIdealSetpoint(15, 30, range), { temp: 20, humidity: 40 }, 'trop froid et trop sec');
    assert.deepEqual(P.calculateIdealSetpoint(30, 80, range), { temp: 26, humidity: 60 }, 'trop chaud et trop humide');

    const inside = P.calculateIdealSetpoint(23, 50, range);
    assert.ok(
        inside.temp >= range.tempMin && inside.temp <= range.tempMax
        && inside.humidity >= range.rhMin && inside.humidity <= range.rhMax,
        'un point déjà confortable doit rester dans la zone'
    );
});

test('puissances de traitement d’air', () => {
    // 0.5 kg/s d'air à réchauffer de 18 à 20 °C : 0.5 · 1.006 · 2 · 1000 ≈ 1006 W
    near(P.calculateHeatingPower(18, 20, 0.5), 1006, 1, 'puissance de chauffage');
    assert.ok(P.calculateCoolingPower(30, 26, 0.5) > 0, 'la puissance de refroidissement est positive');
    assert.equal(P.calculateHeatingPower(20, 20, 0.5), 0, 'aucun écart, aucune puissance');
    assert.equal(P.calculateHumidityPower(22, 50, 50, 0.5), 0, 'aucun écart d’humidité, aucune puissance');
    assert.ok(P.calculateHumidityPower(22, 30, 50, 0.5) > 0, 'humidifier demande de la puissance');
});

test('utilitaires couleur : analyse', () => {
    assert.deepEqual(P.colorToRgb('#ff0000'), [255, 0, 0], 'hex 6 chiffres');
    assert.deepEqual(P.colorToRgb('#f00'), [255, 0, 0], 'hex 3 chiffres');
    assert.deepEqual(P.colorToRgb('#ff000080'), [255, 0, 0], 'hex 8 chiffres');
    assert.deepEqual(P.colorToRgb('rgba(144, 238, 144, 0.5)'), [144, 238, 144], 'rgba()');
    assert.deepEqual(P.colorToRgb('rgb(1,2,3)'), [1, 2, 3], 'rgb() sans espaces');
    assert.deepEqual(P.colorToRgb(undefined), [0, 0, 0], 'entrée invalide');

    assert.equal(P.colorToAlpha('#ff0000'), 1, 'hex opaque');
    assert.equal(P.colorToAlpha('rgb(1,2,3)'), 1, 'rgb() sans alpha');
    assert.equal(P.colorToAlpha('rgba(1, 2, 3, 0.25)'), 0.25, 'rgba()');
    near(P.colorToAlpha('#ff000080'), 0.502, 0.01, 'hex 8 chiffres');
});

test('utilitaires couleur : rendu', () => {
    assert.equal(P.rgbToHex([255, 0, 0]), '#ff0000', 'hex minuscule sur 6 chiffres');
    assert.equal(P.rgbToHex([1, 2, 3]), '#010203', 'zéros de tête');
    assert.equal(P.rgbToHex([300, -5, 3.6]), '#ff0004', 'valeurs hors bornes ramenées dans 0-255');
    assert.equal(P.rgbToCss([1, 2, 3], 1), '#010203', 'opacité pleine : hex');
    assert.equal(P.rgbToCss([1, 2, 3], 0.5), 'rgba(1, 2, 3, 0.5)', 'opacité partielle : rgba()');
    assert.equal(P.rgbToCss([1, 2, 3], NaN), '#010203', 'opacité invalide : repli sur hex');
});

test('les couleurs rgba() de la carte survivent à un aller-retour par l’éditeur', () => {
    for (const source of [
        'rgba(144, 238, 144, 0.5)',
        'rgba(100, 200, 100, 0.3)',
        'rgba(255, 99, 71, 0.7)',
        'rgba(255, 165, 0, 0.7)',
    ]) {
        const slider = Math.round(P.colorToAlpha(source) * 100);
        assert.equal(P.rgbToCss(P.colorToRgb(source), slider / 100), source, `aller-retour de ${source}`);
    }
});

test('rgbToCss reste compatible avec le regex du dégradé de la carte', () => {
    const cardRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
    for (const alpha of [0, 0.05, 0.3, 0.5, 0.99]) {
        assert.match(P.rgbToCss([144, 238, 144], alpha), cardRegex, `alpha ${alpha}`);
    }
});

/**
 * Produit les graduations affichées pour une plage donnée.
 * @param {number} min - Borne basse des données
 * @param {number} max - Borne haute des données
 * @returns {string[]} Libellés des graduations
 */
const ticksFor = (min, max) => {
    const axis = P.niceScale(min, max, 6);
    const ticks = [];
    for (let value = axis.min; value <= axis.max + axis.step / 2; value += axis.step) {
        ticks.push(value.toFixed(axis.decimals));
    }
    return ticks;
};

test('niceScale produit des graduations rondes', () => {
    // Cas réel : l'échelle naïve (min + i/steps · plage) affichait 26.1 / 28.1 / 30.1.
    assert.deepEqual(ticksFor(26.1, 36.0), ['26', '28', '30', '32', '34', '36'], 'plage de la capture');
    assert.deepEqual(ticksFor(40, 85), ['40', '50', '60', '70', '80', '90'], 'humidité');
    assert.deepEqual(ticksFor(0, 100), ['0', '20', '40', '60', '80', '100'], 'plage complète');
});

test('niceScale garde un écart affiché constant', () => {
    // Régression : un pas de 2.5 s'affichait avec 0 décimale (-5, -3, 0, 3, 5, 8),
    // donnant une échelle d'apparence irrégulière.
    assert.deepEqual(ticksFor(-3.4, 7.1), ['-5.0', '-2.5', '0.0', '2.5', '5.0', '7.5'], 'pas de 2.5');

    for (const [min, max] of [[26.1, 36], [18.2, 24.9], [-15.7, -2.2], [20.05, 20.35], [0.004, 0.021], [21, 21]]) {
        const ticks = ticksFor(min, max).map(Number);
        const gaps = ticks.slice(1).map((v, i) => Number((v - ticks[i]).toFixed(6)));
        assert.equal(new Set(gaps).size, 1, `graduations non équidistantes pour [${min}, ${max}] : ${ticks}`);
    }
});

test('niceScale encadre toujours les données', () => {
    for (const [min, max] of [[26.1, 36], [-3.4, 7.1], [20.05, 20.35], [21, 21], [0.004, 0.021], [-15.7, -2.2]]) {
        const axis = P.niceScale(min, max, 6);
        assert.ok(axis.min <= min + 1e-9, `borne basse ${axis.min} au-dessus de ${min}`);
        assert.ok(axis.max >= max - 1e-9, `borne haute ${axis.max} en dessous de ${max}`);
        assert.ok(axis.max > axis.min, `plage nulle pour [${min}, ${max}]`);
        assert.ok(axis.step > 0, `pas non positif pour [${min}, ${max}]`);
    }
});

test('generateColorFromHash est déterministe et rend un hex exploitable', () => {
    const color = P.generateColorFromHash('sensor.salon_temp_sensor.salon_hum');
    assert.equal(color, P.generateColorFromHash('sensor.salon_temp_sensor.salon_hum'), 'déterminisme');
    assert.notEqual(color, P.generateColorFromHash('sensor.cuisine_temp_sensor.cuisine_hum'), 'entrées distinctes');
    // La carte concatène `point.color + '40'` pour le halo : le format hex 6 chiffres est obligatoire.
    assert.match(color, /^#[0-9a-f]{6}$/, 'hex 6 chiffres en minuscules');
});

test('chaque style de trait par défaut existe dans la table des motifs', () => {
    // L'éditeur tire ses options de LINE_STYLES et ses valeurs initiales de
    // DEFAULT_LINE_STYLES : un défaut absent de la table ouvrirait un selector
    // sur une valeur que la carte ne sait pas dessiner.
    for (const [option, style] of Object.entries(DEFAULT_LINE_STYLES)) {
        assert.ok(style in LINE_STYLES, `${option} référence un style inconnu : ${style}`);
    }
    for (const [style, pattern] of Object.entries(LINE_STYLES)) {
        assert.ok(Array.isArray(pattern), `${style} doit être un motif setLineDash`);
        assert.ok(pattern.every(segment => segment > 0), `${style} ne doit contenir que des longueurs positives`);
    }
});

test('opacityKey associe chaque couleur à son option d’opacité', () => {
    assert.equal(P.opacityKey('bgColor'), 'bgOpacity');
    assert.equal(P.opacityKey('comfortColor'), 'comfortOpacity');
    // Le suffixe n'est remplacé qu'en fin de nom.
    assert.equal(P.opacityKey('curveColor'), 'curveOpacity');
});

test('isParsableColor écarte ce que colorToRgb rendrait noir', () => {
    for (const color of ['#fff', '#1c1c1c', 'rgb(1, 2, 3)', 'rgba(1, 2, 3, 0.5)']) {
        assert.equal(P.isParsableColor(color), true, `${color} devrait être analysable`);
    }
    // Ces valeurs peuvent sortir d'une variable de thème : leur appliquer une opacité
    // via colorToRgb donnerait du noir translucide au lieu de la teinte attendue.
    for (const color of ['white', 'var(--x)', 'linear-gradient(#fff, #000)', '', undefined, null]) {
        assert.equal(P.isParsableColor(color), false, `${color} ne devrait pas être analysable`);
    }
});

test('une opacité séparée n’altère jamais la teinte résolue', () => {
    // Reproduit ce que fait _palette() : la teinte vient du mode courant, l'opacité
    // d'une option distincte. Le mode clair doit rester atteignable après réglage.
    const applied = P.rgbToCss(P.colorToRgb('#ffffff'), 46 / 100);
    assert.equal(applied, 'rgba(255, 255, 255, 0.46)');
    assert.deepEqual(P.colorToRgb(applied), [255, 255, 255], 'la teinte claire est préservée');
});

test('pickAxisStep garde le pas de référence quand la place suffit', () => {
    // Cas de la carte pleine page : axe -10..50 °C sur ~680 px, étiquettes de ~39 px.
    // Un pas de 5 °C laisse 56 px entre deux traits : rien à élargir.
    assert.equal(pickAxisStep(60, 680, 39, 5), 5);
});

test('pickAxisStep élargit le pas quand les étiquettes se toucheraient', () => {
    // Même axe sur une carte de ~400 px : 345 px utiles, étiquettes de ~33 px.
    // Un pas de 5 °C ne laisserait que 29 px, donc chevauchement.
    assert.equal(pickAxisStep(60, 345, 33, 5), 10);
    // Carte très étroite : il faut monter d'un cran de plus.
    assert.equal(pickAxisStep(60, 150, 33, 5), 20);
});

test('pickAxisStep ne rend que des multiples du pas de référence', () => {
    for (const availablePx of [80, 150, 260, 400, 700, 1400]) {
        const step = pickAxisStep(60, availablePx, 33, 5);
        assert.ok([5, 10, 20, 50].includes(step), `pas inattendu : ${step}`);
        // La contrainte d'espacement doit être tenue, sauf au dernier cran disponible.
        if (step !== 50) {
            assert.ok((availablePx * step) / 60 >= 33, `étiquettes trop serrées à ${availablePx} px`);
        }
    }
});

test('pickAxisStep accepte une autre échelle de multiples', () => {
    // Axe des pressions : pas de 1 kPa, multiples 1/2/5/10.
    assert.equal(pickAxisStep(12.3, 250, 16, 1, [1, 2, 5, 10]), 1);
    assert.equal(pickAxisStep(12.3, 120, 16, 1, [1, 2, 5, 10]), 2);
    assert.equal(pickAxisStep(12.3, 40, 16, 1, [1, 2, 5, 10]), 5);
});

test('pickAxisStep retombe sur le pas de référence si la mesure est inexploitable', () => {
    // Canvas pas encore mesuré : un pas nul ou négatif ferait boucler le tracé.
    for (const availablePx of [0, -10, NaN]) {
        assert.equal(pickAxisStep(60, availablePx, 33, 5), 5);
    }
    assert.equal(pickAxisStep(0, 400, 33, 5), 5);
});

test('alignSeries reporte la dernière valeur connue de chaque série', () => {
    const temp = [{ time: 0, value: 20 }, { time: 30, value: 22 }];
    const hum = [{ time: 10, value: 50 }, { time: 40, value: 55 }];
    assert.deepEqual(alignSeries(temp, hum), [
        // Avant t=10, l'humidité est inconnue : aucun couple n'est produit.
        { time: 10, a: 20, b: 50 },
        { time: 30, a: 22, b: 50 },
        { time: 40, a: 22, b: 55 },
    ]);
});

test('alignSeries fusionne les horodatages simultanés en un seul couple', () => {
    const a = [{ time: 0, value: 1 }, { time: 5, value: 2 }];
    const b = [{ time: 0, value: 10 }, { time: 5, value: 20 }];
    assert.deepEqual(alignSeries(a, b), [
        { time: 0, a: 1, b: 10 },
        { time: 5, a: 2, b: 20 },
    ]);
});

test('alignSeries rend une liste vide si une série manque', () => {
    assert.deepEqual(alignSeries([], [{ time: 0, value: 1 }]), []);
    assert.deepEqual(alignSeries([{ time: 0, value: 1 }], []), []);
    assert.deepEqual(alignSeries(undefined, undefined), []);
});

test('timeOutsideRange pèse chaque échantillon par sa durée, pas par son nombre', () => {
    // Trois relevés rapprochés hors bornes, puis un long palier dans les bornes :
    // compter les échantillons donnerait 75 % hors confort, la durée en donne 3 %.
    const samples = [
        { time: 0, value: 30 },
        { time: 1, value: 30 },
        { time: 2, value: 30 },
        { time: 3, value: 21 },
    ];
    const fraction = timeOutsideRange(samples, 18, 22, 100);
    assert.equal(fraction, 3 / 100);
});

test('timeOutsideRange compte les deux côtés de l’intervalle', () => {
    const samples = [
        { time: 0, value: 10 },   // sous la borne basse, 10 unités de temps
        { time: 10, value: 20 },  // dans les bornes, 10 unités
        { time: 20, value: 30 },  // au-dessus, 10 unités
    ];
    assert.equal(timeOutsideRange(samples, 18, 22, 30), 20 / 30);
});

test('timeOutsideRange rend null sans durée exploitable', () => {
    assert.equal(timeOutsideRange([], 18, 22, 100), null);
    assert.equal(timeOutsideRange([{ time: 5, value: 30 }], 18, 22), null);
    assert.equal(timeOutsideRange(null, 18, 22, 100), null);
});
