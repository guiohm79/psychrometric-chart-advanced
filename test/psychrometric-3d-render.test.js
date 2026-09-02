import test from 'node:test';
import assert from 'node:assert/strict';
import { drawScene3D, VIEWS, PITCH_MIN, PITCH_MAX } from '../src/psychrometric-3d.js';

/**
 * Test de fumée du rendu 3D.
 *
 * Il n'y a pas de canvas hors navigateur, mais un contexte simulé suffit à attraper
 * le mode de défaillance propre au Canvas : une coordonnée `NaN` n'y lève aucune
 * erreur, elle escamote silencieusement le tracé. Un diagramme muet est bien plus
 * difficile à diagnostiquer dans Home Assistant qu'ici.
 */

/**
 * Contexte de dessin simulé, qui refuse toute coordonnée non finie.
 * @returns {Object} Contexte compatible avec les appels de drawScene3D
 */
function stubContext() {
    const calls = [];
    /**
     * Vérifie que tous les arguments numériques attendus sont finis.
     * @param {string} name - Nom de l'opération
     * @param {number[]} numbers - Arguments à contrôler
     */
    const check = (name, numbers) => {
        for (const value of numbers) {
            assert.ok(
                Number.isFinite(value),
                `${name} a reçu une coordonnée non finie : ${value}`
            );
        }
        calls.push(name);
    };

    const gradient = { addColorStop: (offset, color) => check('addColorStop', [offset]) };

    return {
        calls,
        canvas: { width: 800, height: 600 },
        // Propriétés simplement stockées, comme le ferait un vrai contexte.
        fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
        globalCompositeOperation: 'source-over', lineJoin: '', lineCap: '',
        textAlign: '', textBaseline: '',

        beginPath: () => calls.push('beginPath'),
        closePath: () => calls.push('closePath'),
        fill: () => calls.push('fill'),
        stroke: () => calls.push('stroke'),
        save: () => calls.push('save'),
        restore: () => calls.push('restore'),
        setLineDash: () => calls.push('setLineDash'),
        moveTo: (x, y) => check('moveTo', [x, y]),
        lineTo: (x, y) => check('lineTo', [x, y]),
        rect: (x, y, w, h) => check('rect', [x, y, w, h]),
        roundRect: (x, y, w, h, r) => check('roundRect', [x, y, w, h, r]),
        fillRect: (x, y, w, h) => check('fillRect', [x, y, w, h]),
        arc: (x, y, r, a, b) => check('arc', [x, y, r, a, b]),
        fillText: (text, x, y) => {
            assert.equal(typeof text, 'string', 'fillText a reçu autre chose qu\'une chaîne');
            check('fillText', [x, y]);
        },
        measureText: (text) => ({ width: String(text).length * 6 }),
        createRadialGradient: (x0, y0, r0, x1, y1, r1) => {
            check('createRadialGradient', [x0, y0, r0, x1, y1, r1]);
            return gradient;
        },
    };
}

const PALETTE = {
    dark: true,
    forced: false,
    bg: '#1c1c1c',
    text: '#e0e0e0',
    grid: '#444444',
    curve: '#4fc3f7',
    comfort: 'rgba(100, 200, 100, 0.3)',
    enthalpy: 'rgba(255, 165, 0, 0.7)',
    wetBulb: 'rgba(0, 255, 255, 0.4)',
    saturation: 'rgba(80, 180, 255, 0.9)',
    pointOutline: '#ffffff',
};

const POINTS = [
    { temp: 26.0, humidity: 74.0, pmv: 0.85, enthalpy: 66.1, color: '#4caf50', label: 'Exterieur' },
    { temp: 28.9, humidity: 64.0, pmv: 1.57, enthalpy: 68.0, color: '#e91e8c', label: 'Emma' },
    { temp: 18.2, humidity: 35.0, pmv: -1.20, enthalpy: 31.4, color: '#7986cb', label: 'Cave' },
];

/**
 * Construit un jeu d'options de rendu complet.
 * @param {Object} [overrides] - Réglages à surcharger
 * @returns {Object} Options pour drawScene3D
 */
function options(overrides = {}) {
    return {
        width: 800,
        height: 600,
        bounds: { minTemp: 0, maxTemp: 40, minHum: 0, maxHum: 100 },
        points: POINTS,
        palette: PALETTE,
        camera: { ...VIEWS['3d'], zoom: 1 },
        metric: 'pmv',
        comfortRange: { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 },
        comfortOpacity: 0.28,
        showEnthalpy: true,
        showPointLabels: true,
        minimal: false,
        axisFont: 12,
        tempStep: 5,
        comfortLabel: 'Zone de confort',
        chipText: (point) => `${point.label} ${point.temp.toFixed(1)} °C`,
        formatTempAxis: (temp) => `${Math.round(temp)}°C`,
        ...overrides,
    };
}

test('drawScene3D dessine sans produire de coordonnée non finie', () => {
    const ctx = stubContext();
    const result = drawScene3D(ctx, options());

    assert.ok(ctx.calls.length > 100, 'la scène a bien été tracée');
    assert.equal(result.sensors.length, POINTS.length, 'un point de survol par capteur');
    for (const sensor of result.sensors) {
        assert.ok(Number.isFinite(sensor.x) && Number.isFinite(sensor.y), 'position écran exploitable');
        assert.ok(sensor.radius > 0, 'rayon de capture positif');
        assert.ok(sensor.x >= 0 && sensor.x <= 800, `capteur dans le canvas : ${sensor.x}`);
        assert.ok(sensor.y >= 0 && sensor.y <= 600, `capteur dans le canvas : ${sensor.y}`);
    }
});

test('drawScene3D restaure la composition après les halos', () => {
    // Un `lighter` laissé actif contaminerait tout ce que la carte dessine ensuite.
    const ctx = stubContext();
    drawScene3D(ctx, options());
    assert.equal(ctx.globalCompositeOperation, 'source-over', 'composition rendue à la normale');
});

test('drawScene3D tient toutes les orientations de caméra', () => {
    for (const pitch of [PITCH_MIN, 0.5, 1.0, PITCH_MAX]) {
        for (const yaw of [0, 1.7, 3.9, -2.4]) {
            for (const zoom of [0.35, 1, 2.5]) {
                const ctx = stubContext();
                const result = drawScene3D(ctx, options({ camera: { yaw, pitch, zoom } }));
                assert.ok(ctx.calls.length > 50, `scène tracée (yaw ${yaw}, pitch ${pitch}, zoom ${zoom})`);
                assert.equal(result.sensors.length, POINTS.length, 'capteurs projetés');
            }
        }
    }
});

test('drawScene3D tient toutes les métriques de hauteur', () => {
    for (const metric of ['pmv', 'enthalpy', 'flat']) {
        const ctx = stubContext();
        const result = drawScene3D(ctx, options({ metric }));
        assert.equal(result.sensors.length, POINTS.length, `capteurs projetés (${metric})`);
    }
});

test('drawScene3D supporte l\'absence de capteur', () => {
    // La carte n'appelle le rendu qu'avec au moins un point, mais un cadrage sur une
    // liste vide ne doit pas produire une caméra à distance NaN.
    const ctx = stubContext();
    const result = drawScene3D(ctx, options({ points: [] }));
    assert.equal(result.sensors.length, 0, 'aucun capteur');
    assert.ok(ctx.calls.length > 50, 'le diagramme est tout de même tracé');
});

test('drawScene3D supporte un canvas minuscule et le mode minimal', () => {
    for (const opts of [
        { width: 220, height: 160, minimal: true, axisFont: 10 },
        { width: 2000, height: 400 },
        { width: 300, height: 1200 },
    ]) {
        const ctx = stubContext();
        drawScene3D(ctx, options(opts));
        assert.ok(ctx.calls.length > 20, `scène tracée en ${opts.width}x${opts.height}`);
    }
});

test('drawScene3D supporte un thème clair et des couleurs non analysables', () => {
    const ctx = stubContext();
    // `currentColor` ou une variable CSS non résolue arrive telle quelle du thème :
    // elle doit traverser le rendu sans virer au noir ni casser les dégradés.
    drawScene3D(ctx, options({
        palette: { ...PALETTE, dark: false, bg: '#ffffff', text: '#333333', comfort: 'currentColor' },
    }));
    assert.ok(ctx.calls.length > 100, 'scène tracée en thème clair');
});

test('drawScene3D supporte des bornes de zoom resserrées', () => {
    // `zoom_temp_*` peut réduire le diagramme à quelques degrés : la teneur en eau
    // maximale et les pas de grille doivent y survivre.
    for (const bounds of [
        { minTemp: 18, maxTemp: 24, minHum: 30, maxHum: 70 },
        { minTemp: -20, maxTemp: 50, minHum: 0, maxHum: 100 },
    ]) {
        const ctx = stubContext();
        drawScene3D(ctx, options({ bounds, tempStep: 2 }));
        assert.ok(ctx.calls.length > 50, `scène tracée sur ${bounds.minTemp}..${bounds.maxTemp} °C`);
    }
});

test('drawScene3D retombe sur un rectangle sans roundRect', () => {
    // Les WebView anciennes des tablettes murales ne connaissent pas roundRect.
    const ctx = stubContext();
    delete ctx.roundRect;
    drawScene3D(ctx, options());
    assert.ok(ctx.calls.includes('rect'), 'le repli rectangulaire a bien servi');
});
