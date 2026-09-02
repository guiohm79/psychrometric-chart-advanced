import { PsychrometricCalculations } from './psychrometric-helpers.js';

/**
 * Rendu 3D du diagramme psychrométrique, en Canvas 2D pur.
 *
 * Aucune dépendance : Three.js aurait ajouté 947 Ko au bundle (mesuré, tree-shaking
 * compris) alors que la scène n'est qu'un plan, des polylignes et quelques pastilles.
 * S'y ajoutent deux problèmes propres à WebGL dans un tableau de bord Home Assistant :
 * les navigateurs limitent le nombre de contextes vivants (~8 à 16), si bien que
 * plusieurs cartes sur un même tableau de bord se seraient éteintes l'une après
 * l'autre, et la boucle de rendu permanente vide la batterie d'une tablette murale.
 *
 * Le repère de scène reprend celui du design :
 *   X = température sèche      → de -SCENE.halfWidth à +SCENE.halfWidth
 *   Z = teneur en eau          → de +SCENE.halfDepth (sec) à -SCENE.halfDepth (humide)
 *   Y = hauteur, portée par la métrique choisie (PMV, enthalpie, ou plat)
 *
 * La caméra reste toujours au-dessus du plan (voir PITCH_MIN/PITCH_MAX) : l'ordre de
 * dessin par altitude Y est alors toujours le bon, ce qui remplace un tampon de
 * profondeur par un simple empilement de couches. Seuls les capteurs, qui flottent à
 * des hauteurs et des profondeurs quelconques, sont triés entre eux.
 */

/** Demi-dimensions du plan de base, en unités de scène. */
export const SCENE = {
    halfWidth: 10,
    halfDepth: 7,
    /** Hauteur du « mur de saturation » dressé le long de la courbe 100 % HR. */
    wallHeight: 1.5,
    /** Hauteur maximale d'un capteur au-dessus du plan. */
    maxSensorHeight: 6,
    /** Épaisseur du prisme de la zone de confort. */
    comfortDepth: 0.22,
};

/** Bornes d'inclinaison de la caméra, en radians depuis la verticale. */
export const PITCH_MIN = 0.02;
export const PITCH_MAX = 1.45;

/** Champ de vision vertical, en radians. */
export const FOV = 40 * Math.PI / 180;

/** Orientations prédéfinies proposées par les boutons de vue. */
export const VIEWS = {
    '3d': { yaw: 0.6, pitch: 0.8 },
    top: { yaw: 0, pitch: PITCH_MIN },
};

// ========================================
// ALGÈBRE VECTORIELLE
// ========================================

/**
 * Différence de deux vecteurs.
 * @param {number[]} a - Vecteur [x, y, z]
 * @param {number[]} b - Vecteur [x, y, z]
 * @returns {number[]} a - b
 */
export function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Produit scalaire.
 * @param {number[]} a - Vecteur [x, y, z]
 * @param {number[]} b - Vecteur [x, y, z]
 * @returns {number} a · b
 */
export function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Produit vectoriel.
 * @param {number[]} a - Vecteur [x, y, z]
 * @param {number[]} b - Vecteur [x, y, z]
 * @returns {number[]} a × b
 */
export function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

/**
 * Vecteur unitaire de même direction.
 * Un vecteur nul est renvoyé tel quel plutôt que de produire des NaN.
 * @param {number[]} a - Vecteur [x, y, z]
 * @returns {number[]} Vecteur normalisé
 */
export function normalize(a) {
    const length = Math.hypot(a[0], a[1], a[2]);
    if (!length) return [0, 0, 0];
    return [a[0] / length, a[1] / length, a[2] / length];
}

// ========================================
// CAMÉRA
// ========================================

/**
 * Position de l'œil sur l'orbite autour de la cible.
 *
 * `pitch` est l'angle depuis la verticale : 0 place la caméra à l'aplomb (vue de
 * dessus), PITCH_MAX la rapproche de l'horizontale sans jamais passer sous le plan.
 * @param {number[]} target - Point visé [x, y, z]
 * @param {number} yaw - Azimut en radians
 * @param {number} pitch - Inclinaison depuis la verticale, en radians
 * @param {number} distance - Distance à la cible
 * @returns {number[]} Position de l'œil [x, y, z]
 */
export function orbitEye(target, yaw, pitch, distance) {
    const clamped = Math.min(PITCH_MAX, Math.max(PITCH_MIN, pitch));
    const sin = Math.sin(clamped);
    return [
        target[0] + distance * sin * Math.sin(yaw),
        target[1] + distance * Math.cos(clamped),
        target[2] + distance * sin * Math.cos(yaw),
    ];
}

/**
 * Repère orthonormé de la caméra.
 *
 * Vue de dessus, la verticale du monde est parallèle à l'axe de visée et le roulis
 * de l'image devient indéterminé : on bascule alors sur -Z comme « haut » d'écran,
 * ce qui garde l'humidité vers le haut, exactement comme en 2D.
 * @param {number[]} eye - Position de l'œil
 * @param {number[]} target - Point visé
 * @returns {{right: number[], up: number[], forward: number[]}} Repère caméra
 */
export function viewBasis(eye, target) {
    const forward = normalize(sub(target, eye));
    let worldUp = [0, 1, 0];
    // Au-delà de 0,999 de colinéarité, le produit vectoriel s'effondre vers zéro.
    if (Math.abs(dot(forward, worldUp)) > 0.999) worldUp = [0, 0, -1];
    const right = normalize(cross(forward, worldUp));
    const up = cross(right, forward);
    return { right, up, forward };
}

/**
 * Construit la fonction de projection perspective d'une caméra.
 *
 * Renvoie une fonction pure : la même caméra projette toujours identiquement, ce qui
 * permet au test de survol de rejouer exactement la géométrie du dernier dessin.
 * @param {Object} camera - Paramètres de caméra
 * @param {number[]} camera.eye - Position de l'œil
 * @param {number[]} camera.target - Point visé
 * @param {number} camera.width - Largeur du viewport en pixels CSS
 * @param {number} camera.height - Hauteur du viewport en pixels CSS
 * @param {number} [camera.fov] - Champ de vision vertical en radians
 * @returns {function(number[]): {x: number, y: number, z: number, visible: boolean}} Projecteur
 */
export function makeProjector({ eye, target, width, height, fov = FOV }) {
    const { right, up, forward } = viewBasis(eye, target);
    const focal = (height / 2) / Math.tan(fov / 2);
    const centerX = width / 2;
    const centerY = height / 2;

    const project = (point) => {
        const d = sub(point, eye);
        const z = dot(d, forward);
        // Un point derrière l'œil (ou dessus) se projetterait en miroir à l'infini.
        if (z <= 0.01) return { x: 0, y: 0, z, visible: false };
        const scale = focal / z;
        return {
            x: centerX + dot(d, right) * scale,
            y: centerY - dot(d, up) * scale,
            z,
            visible: true,
        };
    };
    // La focale sert à dimensionner les pastilles en perspective (rayon écran =
    // rayon monde × focale / profondeur) ; elle est portée par la fonction pour que
    // le projecteur reste un objet unique, sans risque de désaccord entre les deux.
    project.focal = focal;
    project.basis = { right, up, forward };
    return project;
}

/**
 * Distance de caméra qui fait tenir tous les points dans le viewport.
 *
 * Un simple rayon de sphère englobante cadre beaucoup trop large : un plan vu de
 * biais se projette bien plus petit que sa sphère. On résout donc par itérations en
 * projetant les vrais coins, comme le faisait le design.
 * @param {number[][]} points - Points à cadrer
 * @param {Object} options - Paramètres de cadrage
 * @param {number[]} options.target - Point visé
 * @param {number} options.yaw - Azimut en radians
 * @param {number} options.pitch - Inclinaison en radians
 * @param {number} options.width - Largeur du viewport
 * @param {number} options.height - Hauteur du viewport
 * @param {number} [options.fov] - Champ de vision vertical
 * @param {number} [options.fill] - Fraction du viewport à remplir (0-1)
 * @returns {number} Distance à la cible
 */
export function fitDistance(points, { target, yaw, pitch, width, height, fov = FOV, fill = 0.86 }) {
    if (!points.length || !width || !height) return 40;

    // Départ : rayon de la sphère englobante, volontairement large.
    let distance = 0;
    for (const p of points) distance = Math.max(distance, Math.hypot(...sub(p, target)));
    distance = Math.max(1, distance * 2.2);

    // On cadre l'écart maximal au centre de l'image, et non la largeur de l'empreinte :
    // la cible d'orbite restant fixe, cette empreinte n'est pas centrée à l'écran, si
    // bien qu'ajuster sa seule taille laissait déborder les points du côté décentré.
    const halfW = width * fill / 2;
    const halfH = height * fill / 2;
    for (let iteration = 0; iteration < 8; iteration++) {
        const project = makeProjector({
            eye: orbitEye(target, yaw, pitch, distance), target, width, height, fov,
        });
        let ratio = 0;
        for (const p of points) {
            const s = project(p);
            // Un point non projetable est trop près de l'œil : reculer davantage.
            if (!s.visible) { ratio = Math.max(ratio, 2); continue; }
            ratio = Math.max(ratio, Math.abs(s.x - width / 2) / halfW, Math.abs(s.y - height / 2) / halfH);
        }
        if (!Number.isFinite(ratio) || ratio <= 0) break;
        distance *= ratio;
        // La perspective n'étant pas linéaire, le rapport ne se referme pas d'un coup :
        // quelques passes suffisent, on s'arrête dès qu'il est stable.
        if (Math.abs(ratio - 1) < 0.005) break;
    }
    return distance;
}

// ========================================
// TRI ET ÉTIQUETTES
// ========================================

/**
 * Trie du plus lointain au plus proche (algorithme du peintre).
 * @param {Array<{depth: number}>} items - Éléments porteurs d'une profondeur
 * @returns {Array} Nouveau tableau trié
 */
export function sortByDepth(items) {
    return [...items].sort((a, b) => b.depth - a.depth);
}

/**
 * Écarte verticalement des étiquettes qui se recouvriraient.
 *
 * Les étiquettes sont traitées de haut en bas : chacune est repoussée juste sous la
 * précédente si elle empiète dessus. `anchorY` conserve la position d'origine pour
 * que l'appelant puisse tracer un trait de rappel vers le point réel.
 * @param {Array<{x: number, y: number}>} labels - Étiquettes projetées
 * @param {Object} [options] - Options de placement
 * @param {number} [options.minGap] - Écart vertical minimal en pixels
 * @param {number} [options.height] - Hauteur du viewport, pour borner le débordement
 * @returns {Array<{x: number, y: number, anchorY: number}>} Étiquettes placées
 */
export function layoutLabels(labels, { minGap = 16, height = Infinity } = {}) {
    const placed = labels
        .map((label, index) => ({ ...label, anchorY: label.y, index }))
        .sort((a, b) => a.y - b.y);

    let previous = -Infinity;
    for (const label of placed) {
        const y = Math.max(label.y, previous + minGap);
        label.y = Number.isFinite(height) ? Math.min(y, height - minGap / 2) : y;
        previous = label.y;
    }
    // Rendre l'ordre d'origine : l'appelant associe les étiquettes à ses points par index.
    return placed.sort((a, b) => a.index - b.index);
}

/**
 * Indique si deux rectangles [x1, y1, x2, y2] se chevauchent.
 * @param {number[]} a - Premier rectangle
 * @param {number[]} b - Second rectangle
 * @returns {boolean} Vrai en cas de recouvrement
 */
export function overlaps(a, b) {
    return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}

// ========================================
// GÉOMÉTRIE DU DIAGRAMME
// ========================================

/**
 * Teneur en eau en g/kg, plafonnée à la borne du diagramme.
 *
 * Passe par `calculateWaterContent` (kg/kg) : recopier la formule de la pression de
 * saturation ici la ferait diverger de celle de la carte 2D.
 * @param {number} temp - Température sèche en Celsius
 * @param {number} rh - Humidité relative en %
 * @returns {number} Teneur en eau en g/kg d'air sec
 */
export function waterContentGkg(temp, rh) {
    return PsychrometricCalculations.calculateWaterContent(temp, rh) * 1000;
}

/**
 * Construit les convertisseurs « grandeur physique → coordonnée de scène ».
 * @param {Object} bounds - Bornes du diagramme
 * @param {number} bounds.minTemp - Température minimale en Celsius
 * @param {number} bounds.maxTemp - Température maximale en Celsius
 * @param {number} maxW - Teneur en eau maximale affichée, en g/kg
 * @returns {{toX: function(number): number, toZ: function(number): number, maxW: number}} Convertisseurs
 */
export function makeScales(bounds, maxW) {
    const tempRange = bounds.maxTemp - bounds.minTemp || 1;
    const center = (bounds.minTemp + bounds.maxTemp) / 2;
    return {
        maxW,
        toX: (temp) => (temp - center) * (2 * SCENE.halfWidth / tempRange),
        toZ: (w) => SCENE.halfDepth - Math.min(w, maxW) * (2 * SCENE.halfDepth / (maxW || 1)),
    };
}

/**
 * Teneur en eau maximale à afficher, arrondie au multiple de 5 supérieur.
 *
 * Elle est déduite de la borne haute de température à saturation, puis plafonnée :
 * au-delà de 40 °C saturés, la courbe part si haut que tout le reste du diagramme
 * s'écrase dans le bas de la scène.
 * @param {Object} bounds - Bornes du diagramme
 * @returns {number} Teneur en eau maximale en g/kg
 */
export function maxWaterContent(bounds) {
    const saturated = waterContentGkg(bounds.maxTemp, 100);
    return Math.max(5, Math.min(60, Math.ceil(saturated / 5) * 5));
}

/**
 * Hauteur d'un capteur au-dessus du plan, selon la métrique choisie.
 *
 * Le design ne montait que les PMV positifs (`max(0, pmv)`), ce qui écrasait au sol
 * une pièce trop froide alors que son inconfort est tout aussi réel : on prend la
 * valeur absolue, la hauteur signifiant « écart au confort » dans les deux sens.
 * @param {Object} point - Point calculé par la carte
 * @param {string} metric - 'pmv', 'enthalpy' ou 'flat'
 * @param {{min: number, max: number}} enthalpyRange - Bornes d'enthalpie de la scène
 * @returns {number} Hauteur en unités de scène
 */
export function sensorHeight(point, metric, enthalpyRange) {
    if (metric === 'flat') return 0;
    if (metric === 'enthalpy') {
        const span = enthalpyRange.max - enthalpyRange.min || 1;
        const ratio = (point.enthalpy - enthalpyRange.min) / span;
        return Math.min(1, Math.max(0, ratio)) * SCENE.maxSensorHeight;
    }
    // PMV : l'échelle ISO 7730 va de -3 à +3, l'inconfort maximal est donc à |pmv| = 3.
    const ratio = Math.min(1, Math.abs(point.pmv ?? 0) / 3);
    return ratio * SCENE.maxSensorHeight;
}

/**
 * Bornes d'enthalpie couvertes par le diagramme, pour normaliser les hauteurs.
 *
 * Elles viennent des bornes du graphique et non des capteurs : sinon la hauteur d'un
 * point changerait à chaque relevé d'un *autre* capteur, et la scène tressauterait.
 * @param {Object} bounds - Bornes du diagramme
 * @param {number} maxW - Teneur en eau maximale en g/kg
 * @returns {{min: number, max: number}} Bornes d'enthalpie en kJ/kg
 */
export function enthalpyRange(bounds, maxW) {
    const min = PsychrometricCalculations.calculateEnthalpy(bounds.minTemp, 0);
    const max = PsychrometricCalculations.calculateEnthalpy(bounds.maxTemp, maxW / 1000);
    return { min, max: max > min ? max : min + 1 };
}

// ========================================
// RENDU
// ========================================

/**
 * Recompose une couleur en lui imposant une opacité.
 * Une couleur non analysable (mot-clé CSS, dégradé) est renvoyée telle quelle plutôt
 * que virée au noir par `colorToRgb`.
 * @param {string} color - Couleur CSS
 * @param {number} alpha - Opacité entre 0 et 1
 * @returns {string} Couleur CSS
 */
export function withAlpha(color, alpha) {
    if (!PsychrometricCalculations.isParsableColor(color)) return color;
    const rgb = PsychrometricCalculations.colorToRgb(color);
    return PsychrometricCalculations.rgbToCss(rgb, Math.min(1, Math.max(0, alpha)));
}

/**
 * Trace une polyligne de scène, en coupant aux points non projetables.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin
 * @param {function} project - Projecteur
 * @param {number[][]} points - Points de scène
 */
function strokePath3(ctx, project, points) {
    ctx.beginPath();
    let started = false;
    for (const p of points) {
        const s = project(p);
        if (!s.visible) { started = false; continue; }
        if (started) ctx.lineTo(s.x, s.y);
        else { ctx.moveTo(s.x, s.y); started = true; }
    }
    ctx.stroke();
}

/**
 * Remplit un polygone de scène. Abandonne si un seul sommet n'est pas projetable :
 * un polygone partiellement projeté se referme n'importe où à l'écran.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin
 * @param {function} project - Projecteur
 * @param {number[][]} points - Sommets de scène
 * @param {string} fill - Couleur de remplissage
 */
function fillPath3(ctx, project, points, fill) {
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const s = project(points[i]);
        if (!s.visible) return;
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

/**
 * Dessine un halo par dégradé radial, en composition additive.
 * Remplace la texture de sprite du design : le résultat visuel est le même et rien
 * n'a besoin d'être préchargé.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin
 * @param {number} x - Abscisse écran
 * @param {number} y - Ordonnée écran
 * @param {number} radius - Rayon écran
 * @param {string} color - Couleur du halo
 * @param {number} alpha - Opacité au centre
 */
function drawGlow(ctx, x, y, radius, color, alpha, additive = true) {
    if (!(radius > 0.5)) return;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, withAlpha(color, alpha));
    gradient.addColorStop(0.25, withAlpha(color, alpha * 0.55));
    gradient.addColorStop(1, withAlpha(color, 0));
    // La composition additive n'a de sens que sur un fond sombre : sur un thème
    // clair elle sature vers le blanc, effaçant le halo au lieu de l'allumer.
    if (additive) ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

/**
 * Dessine une pastille de capteur en volume.
 * Un dégradé radial décalé vers la source lumineuse suffit à donner le relief d'une
 * sphère éclairée, sans le moindre calcul d'éclairage.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin
 * @param {number} x - Abscisse écran
 * @param {number} y - Ordonnée écran
 * @param {number} radius - Rayon écran
 * @param {string} color - Couleur du capteur
 */
function drawSphere(ctx, x, y, radius, color) {
    const rgb = PsychrometricCalculations.colorToRgb(color);
    const lighten = (factor) => PsychrometricCalculations.rgbToHex(
        rgb.map(channel => channel + (255 - channel) * factor)
    );
    const darken = (factor) => PsychrometricCalculations.rgbToHex(rgb.map(channel => channel * factor));
    const gradient = ctx.createRadialGradient(
        x - radius * 0.35, y - radius * 0.4, radius * 0.1,
        x, y, radius
    );
    gradient.addColorStop(0, lighten(0.65));
    gradient.addColorStop(0.45, color);
    gradient.addColorStop(1, darken(0.55));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

/**
 * Encombrement écran d'une étiquette, sans rien dessiner.
 *
 * La détection de recouvrement s'appuyait sur une demi-largeur fixe : les étiquettes
 * longues, « Zone de confort » la première, passaient à travers le filtre et
 * ressortaient barrées par une vignette de capteur. On mesure donc le texte réel.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin
 * @param {string} text - Texte
 * @param {number} x - Abscisse écran du centre
 * @param {number} y - Ordonnée écran du centre
 * @param {Object} style - Apparence
 * @returns {number[]} Rectangle occupé [x1, y1, x2, y2]
 */
function measureChip(ctx, text, x, y, style) {
    ctx.font = `${style.weight || 400} ${style.size}px Arial`;
    const halfW = ctx.measureText(text).width / 2 + (style.padX ?? 0);
    const halfH = style.size * 0.62 + (style.padY ?? 0);
    return [x - halfW, y - halfH, x + halfW, y + halfH];
}

/**
 * Dessine une étiquette encadrée.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin
 * @param {string} text - Texte
 * @param {number} x - Abscisse écran du centre
 * @param {number} y - Ordonnée écran du centre
 * @param {Object} style - Apparence
 * @returns {number[]} Rectangle occupé [x1, y1, x2, y2]
 */
function drawChip(ctx, text, x, y, style) {
    const [x1, y1, x2, y2] = measureChip(ctx, text, x, y, style);
    const halfW = (x2 - x1) / 2;
    const halfH = (y2 - y1) / 2;

    if (style.bg) {
        ctx.fillStyle = style.bg;
        ctx.beginPath();
        // `roundRect` manque encore sur quelques navigateurs embarqués (WebView
        // ancienne d'une tablette murale) : on retombe sur un rectangle droit.
        if (ctx.roundRect) ctx.roundRect(x - halfW, y - halfH, halfW * 2, halfH * 2, 4);
        else ctx.rect(x - halfW, y - halfH, halfW * 2, halfH * 2);
        ctx.fill();
        if (style.border) {
            ctx.strokeStyle = style.border;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    ctx.fillStyle = style.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    return [x - halfW, y - halfH, x + halfW, y + halfH];
}

/**
 * Dessine le diagramme psychrométrique en perspective.
 *
 * L'ordre de dessin est un empilement de couches par altitude, non un tri global :
 * la caméra ne passant jamais sous le plan (PITCH_MAX), une couche plus haute est
 * toujours devant. Seuls les capteurs sont triés entre eux par profondeur.
 * @param {CanvasRenderingContext2D} ctx - Contexte de dessin, en pixels CSS
 * @param {Object} opts - Paramètres de rendu
 * @returns {{sensors: Array<{x: number, y: number, radius: number, index: number}>}} Positions écran, pour le test de survol
 */
export function drawScene3D(ctx, opts) {
    const {
        width, height, bounds, points = [], palette, camera,
        metric = 'pmv', comfortRange, comfortOpacity = 0.28,
        showEnthalpy = true, showPointLabels = true, minimal = false,
        axisFont = 11, tempStep = 5,
        comfortLabel = 'CONFORT', chipText = () => '', formatTempAxis = (t) => `${t}`,
    } = opts;

    const maxW = maxWaterContent(bounds);
    const { toX, toZ } = makeScales(bounds, maxW);
    const hRange = enthalpyRange(bounds, maxW);

    // Cadrage : les quatre coins du plan, plus le sommet de chaque capteur pour que
    // les pastilles hautes ne sortent jamais du champ.
    const corners = [
        [-SCENE.halfWidth * 1.08, 0, -SCENE.halfDepth * 1.12],
        [SCENE.halfWidth * 1.08, 0, -SCENE.halfDepth * 1.12],
        [-SCENE.halfWidth * 1.08, 0, SCENE.halfDepth * 1.12],
        [SCENE.halfWidth * 1.08, 0, SCENE.halfDepth * 1.12],
    ];
    const sensorScene = points.map((point, index) => {
        const y = sensorHeight(point, metric, hRange) + 0.35;
        return {
            index,
            point,
            pos: [toX(point.temp), y, toZ(waterContentGkg(point.temp, point.humidity))],
        };
    });
    const fitPoints = corners.concat(sensorScene.map(s => [s.pos[0], s.pos[1] + 1, s.pos[2]]));

    const target = [0, 1, 0];
    const distance = fitDistance(fitPoints, {
        target, yaw: camera.yaw, pitch: camera.pitch, width, height,
    }) * (camera.zoom || 1);
    const eye = orbitEye(target, camera.yaw, camera.pitch, distance);
    const project = makeProjector({ eye, target, width, height });

    // Étiquettes collectées pendant le dessin, posées en dernier pour qu'aucune
    // courbe tracée après ne vienne les barrer.
    const axisLabels = [];
    const rhLabels = [];

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.setLineDash([]);

    // --- Plan de base -------------------------------------------------------
    // Une surface translucide neutre plutôt qu'un noir codé en dur : elle se pose
    // aussi bien sur un thème clair que sombre.
    const plane = [
        [-SCENE.halfWidth * 1.08, 0, -SCENE.halfDepth * 1.12],
        [SCENE.halfWidth * 1.08, 0, -SCENE.halfDepth * 1.12],
        [SCENE.halfWidth * 1.08, 0, SCENE.halfDepth * 1.12],
        [-SCENE.halfWidth * 1.08, 0, SCENE.halfDepth * 1.12],
    ];
    fillPath3(ctx, project, plane, palette.dark ? 'rgba(127, 127, 127, 0.08)' : 'rgba(127, 127, 127, 0.16)');

    ctx.strokeStyle = withAlpha(palette.grid, palette.dark ? 0.8 : 1);
    ctx.lineWidth = 1;
    strokePath3(ctx, project, plane.concat([plane[0]]));

    // --- Grille -------------------------------------------------------------
    const gridY = 0.004;
    ctx.strokeStyle = withAlpha(palette.grid, palette.dark ? 0.55 : 0.8);
    for (let temp = bounds.minTemp; temp <= bounds.maxTemp + 1e-6; temp += tempStep) {
        const wsat = Math.min(waterContentGkg(temp, 100), maxW);
        strokePath3(ctx, project, [
            [toX(temp), gridY, toZ(0)],
            [toX(temp), gridY, toZ(wsat)],
        ]);
        axisLabels.push({
            text: formatTempAxis(temp),
            anchor: [toX(temp), 0, toZ(0) + 0.6],
            size: axisFont,
            color: palette.text,
        });
    }

    if (!minimal) {
        for (let w = 5; w <= maxW + 1e-6; w += 5) {
            // La grille d'humidité s'arrête à la courbe de saturation : au-delà, l'air
            // ne peut pas contenir cette quantité d'eau et la ligne n'aurait aucun sens.
            if (waterContentGkg(bounds.maxTemp, 100) < w) continue;
            let start = bounds.minTemp;
            for (let temp = bounds.minTemp; temp <= bounds.maxTemp; temp += 0.25) {
                if (waterContentGkg(temp, 100) >= w) { start = temp; break; }
            }
            strokePath3(ctx, project, [
                [toX(start), gridY, toZ(w)],
                [toX(bounds.maxTemp), gridY, toZ(w)],
            ]);
            axisLabels.push({
                text: `${w} g/kg`,
                anchor: [toX(bounds.maxTemp) + 1.5, 0, toZ(w)],
                size: axisFont * 0.9,
                color: withAlpha(palette.text, 0.65),
            });
        }
    }

    // --- Droites d'enthalpie ------------------------------------------------
    if (showEnthalpy && !minimal) {
        ctx.strokeStyle = withAlpha(palette.enthalpy, 0.45);
        for (let h = 10; h <= 140; h += 10) {
            const path = [];
            for (let temp = bounds.minTemp; temp <= bounds.maxTemp + 1e-6; temp += 0.5) {
                // Enthalpie constante : on inverse h = 1.006 T + w (2501 + 1.84 T),
                // la même relation que calculateEnthalpy, exprimée en g/kg.
                const w = (h - 1.006 * temp) / (2501 + 1.84 * temp) * 1000;
                if (w < 0 || w > Math.min(waterContentGkg(temp, 100), maxW)) continue;
                path.push([toX(temp), 0.008, toZ(w)]);
            }
            if (path.length > 1) strokePath3(ctx, project, path);
        }
    }

    // --- Courbes d'humidité relative ---------------------------------------
    for (let rh = 10; rh <= 100; rh += 10) {
        if (minimal && rh !== 100) continue;
        const saturation = rh === 100;
        const path = [];
        for (let temp = bounds.minTemp; temp <= bounds.maxTemp + 1e-6; temp += 0.5) {
            const w = waterContentGkg(temp, rh);
            if (w > maxW) break;
            path.push([toX(temp), 0.012, toZ(w)]);
        }
        if (path.length < 2) continue;

        ctx.strokeStyle = saturation ? palette.saturation : withAlpha(palette.curve, 0.55);
        ctx.lineWidth = saturation ? 2 : 1;
        strokePath3(ctx, project, path);
        ctx.lineWidth = 1;

        if (rh % 20 === 0) {
            const anchor = path[Math.floor((path.length - 1) * (0.45 + rh * 0.0045))];
            rhLabels.push({
                text: `${rh} %`,
                anchor: [anchor[0], saturation ? 0.3 : 0.05, anchor[2]],
                size: axisFont,
                weight: 500,
                color: saturation ? palette.saturation : palette.curve,
                bg: withAlpha(palette.bg, 0.72),
                padX: 4, padY: 1,
            });
        }

        // Mur de saturation : une bande translucide dressée le long de la courbe
        // 100 %, qui matérialise la limite physique de l'air humide.
        if (saturation && !minimal) {
            if (palette.dark) ctx.globalCompositeOperation = 'lighter';
            const wall = withAlpha(palette.curve, 0.10);
            for (let i = 0; i < path.length - 1; i++) {
                const a = path[i], b = path[i + 1];
                fillPath3(ctx, project, [
                    [a[0], 0, a[2]], [b[0], 0, b[2]],
                    [b[0], SCENE.wallHeight, b[2]], [a[0], SCENE.wallHeight, a[2]],
                ], wall);
            }
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    // --- Zone de confort ----------------------------------------------------
    // Les bords suivent les courbes d'humidité relative constante, comme sur un
    // vrai diagramme : un quadrilatère à quatre sommets en fausserait la forme.
    const edge = [];
    for (let temp = comfortRange.tempMin; temp <= comfortRange.tempMax + 1e-6; temp += 0.5) {
        edge.push([toX(temp), 0, toZ(waterContentGkg(temp, comfortRange.rhMin))]);
    }
    for (let temp = comfortRange.tempMax; temp >= comfortRange.tempMin - 1e-6; temp -= 0.5) {
        edge.push([toX(temp), 0, toZ(waterContentGkg(temp, comfortRange.rhMax))]);
    }
    if (edge.length > 2) {
        const top = SCENE.comfortDepth;
        const face = withAlpha(palette.comfort, comfortOpacity);
        const side = withAlpha(palette.comfort, Math.min(1, comfortOpacity * 1.5));
        // Flancs du prisme d'abord, face supérieure ensuite : le dessus est plus haut,
        // donc toujours devant depuis une caméra qui reste au-dessus du plan.
        for (let i = 0; i < edge.length; i++) {
            const a = edge[i], b = edge[(i + 1) % edge.length];
            fillPath3(ctx, project, [
                [a[0], 0, a[2]], [b[0], 0, b[2]],
                [b[0], top, b[2]], [a[0], top, a[2]],
            ], side);
        }
        fillPath3(ctx, project, edge.map(p => [p[0], top, p[2]]), face);

        ctx.strokeStyle = withAlpha(palette.comfort, 0.95);
        ctx.lineWidth = 1.5;
        strokePath3(ctx, project, edge.concat([edge[0]]).map(p => [p[0], top + 0.01, p[2]]));
        ctx.lineWidth = 1;

        if (!minimal) {
            const midTemp = (comfortRange.tempMin + comfortRange.tempMax) / 2;
            const midRh = (comfortRange.rhMin + comfortRange.rhMax) / 2;
            axisLabels.push({
                text: comfortLabel,
                anchor: [toX(midTemp), top + 0.05, toZ(waterContentGkg(midTemp, midRh))],
                size: axisFont * 0.9,
                // Plus parlante qu'une graduation « 35 g/kg » : elle passe en premier
                // et c'est la graduation qui cède si les deux se disputent la place.
                priority: 1,
                weight: 500,
                color: palette.comfort,
                bg: withAlpha(palette.bg, 0.7),
                border: withAlpha(palette.comfort, 0.45),
                padX: 6, padY: 2,
            });
        }
    }

    // --- Ancrage au sol des capteurs ---------------------------------------
    for (const sensor of sensorScene) {
        const [x, y, z] = sensor.pos;
        const ground = project([x, 0.02, z]);
        if (!ground.visible) continue;

        drawGlow(ctx, ground.x, ground.y, 1.1 * project.focal / ground.z, sensor.point.color, 0.28, palette.dark);

        // Anneau au sol : un cercle du plan se projette en ellipse, on le tire donc
        // d'un vrai échantillonnage plutôt que d'un `arc` qui resterait circulaire.
        ctx.strokeStyle = withAlpha(sensor.point.color, 0.75);
        ctx.lineWidth = 1.5;
        const ring = [];
        for (let a = 0; a <= 32; a++) {
            const angle = (a / 32) * 2 * Math.PI;
            ring.push([x + 0.3 * Math.cos(angle), 0.015, z + 0.3 * Math.sin(angle)]);
        }
        strokePath3(ctx, project, ring);
        ctx.lineWidth = 1;

        // Tige reliant la pastille à sa position réelle sur le diagramme : sans elle,
        // une pastille haute semble flotter au-dessus d'un autre point.
        if (y > 0.4) {
            ctx.strokeStyle = withAlpha(sensor.point.color, 0.45);
            strokePath3(ctx, project, [[x, 0.02, z], [x, y - 0.3, z]]);
        }
    }

    // --- Pastilles ----------------------------------------------------------
    const projected = sensorScene
        .map(sensor => ({ ...sensor, screen: project(sensor.pos) }))
        .filter(sensor => sensor.screen.visible);
    const hitTargets = [];

    for (const sensor of sortByDepth(projected.map(s => ({ ...s, depth: s.screen.z })))) {
        const { screen, point } = sensor;
        const radius = Math.max(3, 0.4 * project.focal / screen.z);
        drawGlow(ctx, screen.x, screen.y, radius * 3.2, point.color, 0.5, palette.dark);
        drawSphere(ctx, screen.x, screen.y, radius, point.color);
        ctx.strokeStyle = withAlpha(palette.pointOutline, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        hitTargets.push({ x: screen.x, y: screen.y, radius, index: sensor.index });
    }

    // --- Étiquettes ---------------------------------------------------------
    const chips = [];
    if (showPointLabels) {
        const anchors = projected.map(sensor => {
            const above = project([sensor.pos[0], sensor.pos[1] + 0.6, sensor.pos[2]]);
            return { x: above.x, y: above.y - 18, sensor };
        });
        for (const item of layoutLabels(anchors, { minGap: axisFont * 2.1, height })) {
            const { sensor } = item;
            // Trait de rappel : l'étiquette ayant pu être repoussée, il rattache
            // visuellement le texte à sa pastille.
            if (Math.abs(item.y - item.anchorY) > 3) {
                ctx.strokeStyle = withAlpha(sensor.point.color, 0.45);
                ctx.beginPath();
                ctx.moveTo(item.x, item.y + axisFont * 0.8);
                ctx.lineTo(item.x, item.anchorY + 18);
                ctx.stroke();
            }
            chips.push(drawChip(ctx, chipText(sensor.point), item.x, item.y, {
                size: axisFont, weight: 500, color: palette.text,
                bg: withAlpha(palette.bg, 0.82),
                border: sensor.point.color, padX: 7, padY: 3,
            }));
        }
    }

    // Chaque étiquette posée occupe sa place pour les suivantes : sans cet inventaire
    // partagé, les graduations n'évitaient que les vignettes et se recouvraient entre
    // elles. L'ordre vaut priorité — vignettes, puis humidité relative, puis le reste.
    const occupied = [...chips];

    // Les étiquettes d'humidité relative sont décalées vers le bas tant qu'elles
    // croisent quelque chose, plutôt que purement masquées : ce sont elles qui
    // rendent le diagramme lisible.
    for (const label of rhLabels) {
        const screen = project(label.anchor);
        if (!screen.visible) continue;
        let y = screen.y;
        let box = measureChip(ctx, label.text, screen.x, y, label);
        for (let attempt = 0; attempt < 6 && occupied.some(rect => overlaps(box, rect)); attempt++) {
            y += axisFont * 1.8;
            box = measureChip(ctx, label.text, screen.x, y, label);
        }
        if (y > height - 4) continue;
        occupied.push(drawChip(ctx, label.text, screen.x, y, label));
    }

    // Les graduations, elles, disparaissent en cas de conflit : illisibles hors du
    // plan, elles n'apportent rien à moitié recouvertes. La plus parlante d'abord.
    const ordered = [...axisLabels].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    for (const label of ordered) {
        const screen = project(label.anchor);
        if (!screen.visible) continue;
        const box = measureChip(ctx, label.text, screen.x, screen.y, label);
        if (box[0] < 2 || box[2] > width - 2 || box[1] < 2 || box[3] > height - 2) continue;
        if (occupied.some(rect => overlaps(box, rect))) continue;
        occupied.push(drawChip(ctx, label.text, screen.x, screen.y, label));
    }

    return { sensors: hitTargets };
}
