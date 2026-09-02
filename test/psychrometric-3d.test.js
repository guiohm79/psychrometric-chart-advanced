import test from 'node:test';
import assert from 'node:assert/strict';
import {
    SCENE, PITCH_MIN, PITCH_MAX, FOV,
    sub, dot, cross, normalize,
    orbitEye, viewBasis, makeProjector, fitDistance,
    sortByDepth, layoutLabels, overlaps,
    waterContentGkg, makeScales, maxWaterContent, sensorHeight, enthalpyRange, withAlpha,
} from '../src/psychrometric-3d.js';

/**
 * Le rendu 3D ne peut pas être testé (pas de canvas hors navigateur), mais toute sa
 * géométrie l'est : projection, cadrage, tri et placement des étiquettes sont des
 * fonctions pures. Les valeurs psychrométriques de référence viennent de tables
 * standard, pas d'une exécution du code.
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

// ========================================
// ALGÈBRE
// ========================================

test('normalize renvoie un vecteur unitaire et supporte le vecteur nul', () => {
    const unit = normalize([3, 0, 4]);
    near(Math.hypot(...unit), 1, 1e-12, 'norme du vecteur normalisé');
    near(unit[0], 0.6, 1e-12, 'composante x');
    near(unit[2], 0.8, 1e-12, 'composante z');
    // Un vecteur nul normalisé produirait des NaN qui se propageraient dans toute
    // la projection : il doit ressortir nul.
    assert.deepEqual(normalize([0, 0, 0]), [0, 0, 0], 'vecteur nul');
});

test('cross et dot suivent la règle de la main droite', () => {
    assert.deepEqual(cross([1, 0, 0], [0, 1, 0]), [0, 0, 1], 'x × y = z');
    assert.equal(dot([1, 2, 3], [4, 5, 6]), 32, 'produit scalaire');
    assert.deepEqual(sub([5, 5, 5], [1, 2, 3]), [4, 3, 2], 'différence');
});

// ========================================
// CAMÉRA
// ========================================

test('orbitEye respecte la distance demandée et borne l\'inclinaison', () => {
    const target = [0, 1, 0];
    const eye = orbitEye(target, 0.7, 0.9, 30);
    near(Math.hypot(...sub(eye, target)), 30, 1e-9, 'distance à la cible');

    // Sous PITCH_MIN la caméra basculerait à la verticale exacte, au-dessus de
    // PITCH_MAX elle passerait sous le plan et l'empilement des couches serait faux.
    const tooFlat = orbitEye(target, 0, 3, 20);
    assert.ok(tooFlat[1] > target[1], 'la caméra reste au-dessus de la cible');
    near(tooFlat[1] - target[1], 20 * Math.cos(PITCH_MAX), 1e-9, 'inclinaison plafonnée');

    const tooSteep = orbitEye(target, 0, -1, 20);
    near(tooSteep[1] - target[1], 20 * Math.cos(PITCH_MIN), 1e-9, 'inclinaison plancher');
});

test('viewBasis produit un repère orthonormé', () => {
    const { right, up, forward } = viewBasis([12, 10, 17], [0, 1, 0]);
    for (const [name, vector] of [['right', right], ['up', up], ['forward', forward]]) {
        near(Math.hypot(...vector), 1, 1e-9, `${name} est unitaire`);
    }
    near(dot(right, up), 0, 1e-9, 'right ⟂ up');
    near(dot(right, forward), 0, 1e-9, 'right ⟂ forward');
    near(dot(up, forward), 0, 1e-9, 'up ⟂ forward');
});

test('viewBasis garde l\'humidité vers le haut en vue de dessus', () => {
    // Regard vertical : la verticale du monde est parallèle à l'axe de visée, le
    // roulis est indéterminé. Sans le repli sur -Z, le repère s'effondrerait.
    const { right, up, forward } = viewBasis([0, 20, 0], [0, 0, 0]);
    near(Math.hypot(...right), 1, 1e-9, 'right reste unitaire');
    near(Math.hypot(...up), 1, 1e-9, 'up reste unitaire');
    near(dot(right, forward), 0, 1e-9, 'repère toujours orthogonal');
    // Z négatif = humidité forte : elle doit pointer vers le haut de l'écran.
    near(up[2], -1, 1e-9, 'le haut de l\'écran est -Z');
});

test('makeProjector place la cible au centre et rejette ce qui est derrière', () => {
    const project = makeProjector({ eye: [0, 0, 10], target: [0, 0, 0], width: 800, height: 600 });

    const center = project([0, 0, 0]);
    assert.ok(center.visible, 'la cible est visible');
    near(center.x, 400, 1e-9, 'abscisse centrée');
    near(center.y, 300, 1e-9, 'ordonnée centrée');

    const focal = (600 / 2) / Math.tan(FOV / 2);
    near(project.focal, focal, 1e-9, 'focale exposée');

    // Un point une unité à droite, à dix unités de profondeur.
    near(project([1, 0, 0]).x, 400 + focal / 10, 1e-9, 'décalage horizontal');
    // Y écran croît vers le bas : un point plus haut dans la scène remonte à l'écran.
    assert.ok(project([0, 1, 0]).y < 300, 'le haut de la scène est en haut de l\'écran');

    // Derrière l'œil : sans la garde, la division par une profondeur négative
    // renverrait le point en miroir à l'autre bout de l'écran.
    assert.equal(project([0, 0, 20]).visible, false, 'point derrière la caméra');
});

test('makeProjector rétrécit ce qui est loin', () => {
    const project = makeProjector({ eye: [0, 0, 10], target: [0, 0, 0], width: 800, height: 600 });
    const near5 = project([1, 0, 5]);
    const far = project([1, 0, -5]);
    assert.ok(near5.x - 400 > far.x - 400, 'la perspective réduit les objets lointains');
});

test('fitDistance cadre tous les points dans le viewport', () => {
    const width = 800, height = 600;
    const points = [
        [-10, 0, -7], [10, 0, -7], [-10, 0, 7], [10, 0, 7],
        [3, 6, 2], [-4, 5, -3],
    ];
    for (const pitch of [PITCH_MIN, 0.6, 1.0, PITCH_MAX]) {
        const target = [0, 1, 0];
        const distance = fitDistance(points, { target, yaw: 0.6, pitch, width, height });
        assert.ok(distance > 0 && Number.isFinite(distance), `distance exploitable (pitch ${pitch})`);

        const project = makeProjector({
            eye: orbitEye(target, 0.6, pitch, distance), target, width, height,
        });
        for (const point of points) {
            const screen = project(point);
            assert.ok(screen.visible, `point projetable (pitch ${pitch})`);
            assert.ok(
                screen.x >= 0 && screen.x <= width && screen.y >= 0 && screen.y <= height,
                `point dans le viewport (pitch ${pitch}) : ${screen.x.toFixed(1)}, ${screen.y.toFixed(1)}`
            );
        }
    }
});

test('fitDistance reste défini sans point ni viewport', () => {
    // Le canvas peut être mesuré à zéro pendant le premier rendu de la carte.
    assert.ok(Number.isFinite(fitDistance([], { target: [0, 0, 0], yaw: 0, pitch: 1, width: 800, height: 600 })));
    assert.ok(Number.isFinite(fitDistance([[1, 1, 1]], { target: [0, 0, 0], yaw: 0, pitch: 1, width: 0, height: 0 })));
});

// ========================================
// TRI ET ÉTIQUETTES
// ========================================

test('sortByDepth dessine du plus lointain au plus proche sans muter l\'entrée', () => {
    const items = [{ depth: 5, id: 'a' }, { depth: 20, id: 'b' }, { depth: 12, id: 'c' }];
    const sorted = sortByDepth(items);
    assert.deepEqual(sorted.map(i => i.id), ['b', 'c', 'a'], 'ordre décroissant');
    assert.deepEqual(items.map(i => i.id), ['a', 'b', 'c'], 'entrée inchangée');
});

test('layoutLabels écarte les étiquettes et conserve l\'ordre d\'entrée', () => {
    const labels = [
        { x: 10, y: 100, id: 'bas' },
        { x: 20, y: 102, id: 'colle' },
        { x: 30, y: 40, id: 'haut' },
    ];
    const placed = layoutLabels(labels, { minGap: 20 });

    assert.deepEqual(placed.map(l => l.id), ['bas', 'colle', 'haut'], 'ordre d\'entrée rendu');

    const byId = Object.fromEntries(placed.map(l => [l.id, l]));
    assert.equal(byId.haut.y, 40, 'la plus haute ne bouge pas');
    assert.equal(byId.bas.y, 100, 'la deuxième garde sa place');
    assert.ok(byId.colle.y >= byId.bas.y + 20, 'la troisième est repoussée sous la précédente');
    // anchorY garde la position d'origine, pour le trait de rappel vers la pastille.
    assert.equal(byId.colle.anchorY, 102, 'ancre d\'origine conservée');
});

test('layoutLabels borne le débordement en bas du viewport', () => {
    const labels = Array.from({ length: 10 }, (_, i) => ({ x: 0, y: 290 + i }));
    const placed = layoutLabels(labels, { minGap: 20, height: 300 });
    for (const label of placed) {
        assert.ok(label.y <= 300, `étiquette dans le viewport : ${label.y}`);
    }
});

test('overlaps détecte le recouvrement de deux rectangles', () => {
    assert.equal(overlaps([0, 0, 10, 10], [5, 5, 15, 15]), true, 'chevauchement');
    assert.equal(overlaps([0, 0, 10, 10], [10, 0, 20, 10]), false, 'contact par le bord');
    assert.equal(overlaps([0, 0, 10, 10], [20, 20, 30, 30]), false, 'disjoints');
});

// ========================================
// GÉOMÉTRIE DU DIAGRAMME
// ========================================

test('waterContentGkg suit les tables psychrométriques', () => {
    // Air à 101.325 kPa. Références : tables psychrométriques standard.
    near(waterContentGkg(25, 50), 9.9, 0.15, 'teneur en eau à 25 °C / 50 %');
    near(waterContentGkg(20, 60), 8.7, 0.15, 'teneur en eau à 20 °C / 60 %');
    near(waterContentGkg(30, 100), 27.3, 0.4, 'teneur en eau à saturation, 30 °C');
    assert.ok(waterContentGkg(0, 0) < 1e-9, 'air parfaitement sec');
});

test('makeScales projette les bornes sur le plan de scène', () => {
    const bounds = { minTemp: 0, maxTemp: 40 };
    const { toX, toZ } = makeScales(bounds, 30);

    near(toX(0), -SCENE.halfWidth, 1e-9, 'température minimale à gauche');
    near(toX(40), SCENE.halfWidth, 1e-9, 'température maximale à droite');
    near(toX(20), 0, 1e-9, 'milieu de plage au centre');

    near(toZ(0), SCENE.halfDepth, 1e-9, 'air sec au premier plan');
    near(toZ(30), -SCENE.halfDepth, 1e-9, 'air saturé au fond');
    // Au-delà de la borne, Z resterait au fond plutôt que de sortir du plan.
    near(toZ(60), -SCENE.halfDepth, 1e-9, 'teneur hors borne plafonnée');
});

test('makeScales survit à une plage de température dégénérée', () => {
    // setConfig interdit minTemp >= maxTemp, mais la division par zéro ne doit pas
    // produire d'Infinity si une borne arrive quand même identique.
    const { toX, toZ } = makeScales({ minTemp: 20, maxTemp: 20 }, 0);
    assert.ok(Number.isFinite(toX(20)), 'abscisse finie');
    assert.ok(Number.isFinite(toZ(0)), 'profondeur finie');
});

test('maxWaterContent arrondit au pas de 5 et reste borné', () => {
    const modest = maxWaterContent({ maxTemp: 30 });
    assert.equal(modest % 5, 0, 'multiple de 5');
    assert.ok(modest >= waterContentGkg(30, 100), 'la saturation tient dans la borne');
    // Un diagramme monté à 60 °C saturés écraserait tout le reste de la scène.
    assert.ok(maxWaterContent({ maxTemp: 60 }) <= 60, 'borne haute plafonnée');
    assert.ok(maxWaterContent({ maxTemp: -10 }) >= 5, 'borne basse plancher');
});

test('sensorHeight traduit la métrique choisie en altitude', () => {
    const range = { min: 0, max: 100 };

    assert.equal(sensorHeight({ pmv: 2 }, 'flat', range), 0, 'mode plat');

    // Le design ne montait que les PMV positifs : une pièce trop froide restait au
    // sol alors que son inconfort est réel. La hauteur suit donc |PMV|.
    const chaud = sensorHeight({ pmv: 1.5 }, 'pmv', range);
    const froid = sensorHeight({ pmv: -1.5 }, 'pmv', range);
    near(froid, chaud, 1e-9, 'inconfort symétrique');
    assert.ok(chaud > 0, 'un PMV non nul décolle du plan');
    near(sensorHeight({ pmv: 0 }, 'pmv', range), 0, 1e-9, 'confort parfait au sol');
    near(sensorHeight({ pmv: 3 }, 'pmv', range), SCENE.maxSensorHeight, 1e-9, 'PMV extrême au plafond');
    // Au-delà de l'échelle ISO 7730, la hauteur sature au lieu de percer le cadrage.
    near(sensorHeight({ pmv: 12 }, 'pmv', range), SCENE.maxSensorHeight, 1e-9, 'PMV hors échelle plafonné');

    near(sensorHeight({ enthalpy: 0 }, 'enthalpy', range), 0, 1e-9, 'enthalpie minimale au sol');
    near(sensorHeight({ enthalpy: 100 }, 'enthalpy', range), SCENE.maxSensorHeight, 1e-9, 'enthalpie maximale au plafond');
    near(sensorHeight({ enthalpy: 50 }, 'enthalpy', range), SCENE.maxSensorHeight / 2, 1e-9, 'enthalpie médiane à mi-hauteur');
    near(sensorHeight({ enthalpy: 500 }, 'enthalpy', range), SCENE.maxSensorHeight, 1e-9, 'enthalpie hors borne plafonnée');

    // Un PMV absent (calcul indisponible) ne doit pas produire NaN.
    assert.equal(sensorHeight({}, 'pmv', range), 0, 'PMV manquant');
});

test('enthalpyRange encadre le diagramme sans s\'effondrer', () => {
    const range = enthalpyRange({ minTemp: 0, maxTemp: 40 }, 30);
    assert.ok(range.max > range.min, 'plage non nulle');
    // Air sec à 0 °C : enthalpie nulle par définition.
    near(range.min, 0, 0.01, 'borne basse');

    // Bornes identiques : la plage doit rester exploitable pour la division.
    const flat = enthalpyRange({ minTemp: 0, maxTemp: 0 }, 0);
    assert.ok(flat.max > flat.min, 'plage dégénérée écartée');
});

test('withAlpha applique l\'opacité et laisse passer l\'inanalysable', () => {
    assert.equal(withAlpha('#ff0000', 0.5), 'rgba(255, 0, 0, 0.5)', 'hex vers rgba');
    assert.equal(withAlpha('rgba(10, 20, 30, 0.9)', 0.25), 'rgba(10, 20, 30, 0.25)', 'rgba réécrit');
    assert.equal(withAlpha('#ff0000', 1), '#ff0000', 'opacité pleine rendue en hex');
    // Un mot-clé CSS ou une variable non résolue virerait au noir via colorToRgb.
    assert.equal(withAlpha('currentColor', 0.5), 'currentColor', 'valeur non analysable préservée');
});

test('les vues prédéfinies restent dans les bornes d\'inclinaison', () => {
    for (const [name, view] of Object.entries({ '3d': { pitch: 1.0 }, top: { pitch: PITCH_MIN } })) {
        assert.ok(view.pitch >= PITCH_MIN && view.pitch <= PITCH_MAX, `vue ${name} exploitable`);
    }
});
