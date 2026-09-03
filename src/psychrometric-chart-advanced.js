import { LitElement, html, css } from 'lit';
import {
    PsychrometricCalculations, LINE_STYLES, DEFAULT_LINE_STYLES,
    pickAxisStep, alignSeries, timeOutsideRange,
} from "./psychrometric-helpers.js";
import { drawScene3D, VIEWS, PITCH_MIN, PITCH_MAX } from "./psychrometric-3d.js";
import "./psychrometric-chart-editor.js";

/**
 * Taille de police minimale du canvas, en pixels CSS. En dessous, les étiquettes
 * deviennent illisibles : c'est la densité des graduations qui doit céder, pas la
 * police (voir `_chartLayout()` et `pickAxisStep`).
 */
const MIN_AXIS_FONT = 10;

/** Hauteur minimale du graphique, en pixels CSS. */
const MIN_CHART_HEIGHT = 150;

/** Rapport largeur/hauteur du graphique quand la carte n'impose pas de hauteur. */
const DEFAULT_CHART_RATIO = 4 / 3;

/**
 * Bornes du facteur de zoom de la caméra 3D. Elles empêchent de traverser la scène
 * ou de la réduire à un point, et servent aussi à valider une vue relue du stockage.
 */
const ZOOM3D_MIN = 0.35;
const ZOOM3D_MAX = 2.5;

/**
 * Préfixe des clés mémorisant la vue 3D dans le stockage local du navigateur.
 *
 * Home Assistant reconstruit la carte à chaque ouverture du tableau de bord : sans
 * cette mémoire, la caméra repartirait de la vue par défaut à chaque fois.
 */
const CAM3D_STORAGE_PREFIX = 'psychrometric-chart-advanced:cam3d:';

/**
 * Largeur approchée d'un texte Arial, en pixels CSS.
 *
 * `measureText` serait exact mais exige un contexte de canvas : la mise en page doit
 * rester calculable hors dessin, puisque `tempToX`/`humidityToY` la reconstruisent
 * pour le test de survol. Une approximation stable vaut mieux que deux géométries
 * divergentes — 0,55 em est l'avance moyenne des chiffres et minuscules en Arial.
 * @param {string} text - Texte à mesurer
 * @param {number} fontSize - Taille de police en pixels CSS
 * @returns {number} Largeur estimée en pixels CSS
 */
function estimateTextWidth(text, fontSize) {
    return text.length * fontSize * 0.55;
}

/**
 * Psychrometric Chart Enhanced
 * A Home Assistant custom card that displays a psychrometric chart with real-time entity data.
 * Built with LitElement for performance.
 */
class PsychrometricChartEnhanced extends LitElement {
    static get properties() {
        return {
            /** Home Assistant object */
            hass: { attribute: false },
            /** Card configuration */
            config: { attribute: false },
            /** State for history modal visibility */
            _modalOpen: { state: true },
            /** State for history data */
            _historyData: { state: true },
            /** Currently selected entity for history */
            _selectedEntity: { state: true },
            /** Currently selected type (temperature/humidity) */
            _selectedType: { state: true },
            /** Canvas width in CSS pixels, driven by the resize observer */
            _canvasWidth: { state: true },
            /** Canvas height in CSS pixels, driven by the resize observer */
            _canvasHeight: { state: true },
            /** Pointer position on the history chart, if any */
            _historyCursor: { state: true },
            /** Series keys hidden through the history legend */
            _historyHidden: { state: true },
            /** Point currently hovered on the canvas, if any */
            _hoveredPoint: { state: true },
            /** Viewport position of the tooltip */
            _tooltipPos: { state: true },
            /** Orientation courante de la caméra 3D : '3d', 'top' ou 'free' */
            _view3d: { state: true },
        };
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }
            /* Sans surcharge explicite, ha-card garde le fond et le texte du thème HA. */
            ha-card {
                overflow: hidden;
                display: flex;
                flex-direction: column;
                height: 100%;
                color: var(--primary-text-color);
            }
            .card-header {
                padding: 16px;
                font-size: 1.5rem;
                font-weight: 500;
                text-align: center;
                color: inherit;
            }
            /*
             * La hauteur de repos est posée en style en ligne (voir _chartContainerStyle) ;
             * flex 1 1 auto la fait ensuite grandir pour remplir une carte plus haute que
             * son contenu, et min-height 0 autorise la compression quand Home Assistant
             * impose une carte plus courte — sans quoi le graphique débordait sur la
             * carte suivante.
             */
            .chart-container {
                position: relative;
                width: 100%;
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }
            canvas {
                max-width: 100%;
                cursor: crosshair;
            }
            /*
             * Barre de vues du mode 3D. Aucune couleur opaque : des surfaces grises
             * translucides se posent aussi bien sur un thème clair que sombre, et
             * l'accent reprend la couleur primaire de Home Assistant.
             */
            .view3d-bar {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                padding: 0 16px 10px;
            }
            .view3d-btn {
                font: inherit;
                font-size: 12px;
                line-height: 1;
                padding: 7px 14px;
                border-radius: 999px;
                cursor: pointer;
                color: inherit;
                background: transparent;
                border: 1px solid rgba(127, 127, 127, 0.35);
            }
            .view3d-btn:hover {
                background: rgba(127, 127, 127, 0.12);
            }
            .view3d-btn.active {
                background: rgba(127, 127, 127, 0.18);
                border-color: var(--primary-color, #03a9f4);
                color: var(--primary-color, #03a9f4);
            }
            
            /* Enhanced Data Display Styles */
            .psychro-data {
                margin-top: 20px;
                text-align: left;
                font-size: 14px;
                max-width: 100%;
                padding: 0 20px 20px;
                margin-left: auto;
                margin-right: auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
                gap: 20px;
            }

            .data-box {
                padding: 15px;
                border-radius: 15px;
                border-left-width: 5px;
                border-left-style: solid;
                backdrop-filter: blur(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }

            .data-box:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .data-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-weight: bold;
                font-size: 1.1em;
            }

            .status-badge {
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 11px;
                color: white;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .data-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 0.9em;
            }

            .data-row {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 5px;
                border-radius: 5px;
                transition: background 0.2s;
            }

            .data-row:hover {
                background: rgba(127, 127, 127, 0.15);
            }

            .action-box {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                font-size: 0.9em;
            }

            .action-icon {
                margin-right: 5px;
                font-weight: bold;
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                border-radius: 20px;
                padding: 30px;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
                width: 800px;
            }
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s;
                background: rgba(127, 127, 127, 0.2);
                color: inherit;
            }
            .modal-close:hover {
                transform: rotate(90deg);
                background: rgba(127, 127, 127, 0.35);
            }
            /* Le graphique porte un calque de curseur : c'est lui le repère de position. */
            .history-chart-wrap {
                position: relative;
                margin-top: 16px;
                /* Le survol doit rester possible sans bloquer le défilement vertical
                   de la modale au doigt. */
                touch-action: pan-y;
            }
            .history-chart,
            .history-cursor {
                width: 100%;
                /* Hauteur adaptative : 300 px en dur débordaient d'une modale de mobile. */
                height: clamp(200px, 38vh, 320px);
                display: block;
            }
            .history-cursor {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
            /*
             * L'infobulle se pose dans le coin haut opposé au curseur plutôt que de le
             * suivre : collée au trait, elle masquait la courbe qu'on cherchait à lire.
             */
            .history-tooltip {
                position: absolute;
                top: 4px;
                z-index: 1;
                pointer-events: none;
                padding: 8px 10px;
                border-radius: 10px;
                font-size: 12px;
                white-space: nowrap;
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
            }
            .history-tooltip.at-left {
                left: 8px;
            }
            .history-tooltip.at-right {
                right: 8px;
            }
            .history-tooltip-time {
                font-weight: bold;
                margin-bottom: 4px;
                opacity: 0.75;
            }
            .history-tooltip-row {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .history-tooltip-label {
                opacity: 0.75;
            }
            .history-tooltip-value {
                margin-left: auto;
                font-weight: bold;
                padding-left: 10px;
            }
            .history-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
            }
            .history-legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 5px 10px;
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                border-radius: 15px;
                background: rgba(127, 127, 127, 0.12);
                color: inherit;
                font: inherit;
                font-size: 12px;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            .history-legend-item.off {
                opacity: 0.4;
            }
            .history-legend-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex: 0 0 auto;
            }
            /* Le point de rosée est tracé en pointillés : la pastille le rappelle. */
            .history-legend-dot.dashed {
                border-radius: 2px;
                height: 4px;
                width: 14px;
                mask-image: repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 7px);
                -webkit-mask-image: repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 7px);
            }
            .history-stats-caption {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 15px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                opacity: 0.7;
            }
            .history-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
                gap: 10px;
                margin-top: 8px;
            }
            .history-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 10px;
                border-radius: 10px;
                background: rgba(127, 127, 127, 0.12);
            }
            .history-stat-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                opacity: 0.7;
            }
            .history-stat-value {
                font-size: 1.2em;
                font-weight: 600;
            }
            .history-empty {
                padding: 30px 0;
                text-align: center;
                opacity: 0.7;
            }
            .card-message {
                padding: 24px 16px 32px;
                text-align: center;
                opacity: 0.8;
            }
            .tooltip {
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 10000;
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border-left: 3px solid transparent;
            }
            .tooltip-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .tooltip-hint {
                margin-top: 5px;
                font-size: 11px;
                opacity: 0.8;
            }
            .legend-box {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 12px;
                border-radius: 10px;
                text-align: left;
                pointer-events: none;
                color: inherit;
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            }
            .legend-title {
                margin-bottom: 8px;
                font-weight: bold;
                font-size: 13px;
            }
            .legend-item {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
            }
            .legend-color {
                width: 12px;
                height: 12px;
                display: inline-block;
                margin-right: 8px;
                border-radius: 50%;
            }
            /* La zone de confort est une surface, pas un point : carré plutôt que pastille. */
            .legend-comfort {
                border-radius: 3px;
                border: 1px solid rgba(127, 127, 127, 0.5);
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @media (max-width: 768px) {
                .psychro-data { grid-template-columns: 1fr !important; }
                .modal-content { padding: 20px; max-width: 95%; }
            }

            /* === THEME: CLASSIC === */
            .theme-classic .data-box {
                border-radius: 4px;
                border: 1px solid var(--divider-color, #e0e0e0);
                backdrop-filter: none;
                background: var(--card-background-color, #fff);
                box-shadow: none;
            }
            .theme-classic .data-box:hover {
                transform: none;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .theme-classic .status-badge {
                border-radius: 4px;
                box-shadow: none;
            }
            .theme-classic .legend-box {
                backdrop-filter: none;
                border: 1px solid var(--divider-color, #e0e0e0);
                box-shadow: none;
            }

            /* === THEME: COMPACT === */
            .theme-compact .psychro-data {
                gap: 8px;
                padding: 0 10px 10px;
            }
            .theme-compact .data-box {
                padding: 8px;
                border-radius: 8px;
                backdrop-filter: none;
            }
            .theme-compact .data-box:hover {
                transform: translateY(-2px);
            }
            .theme-compact .data-header {
                margin-bottom: 6px;
                font-size: 1em;
            }
            .theme-compact .data-grid {
                gap: 4px;
                font-size: 0.85em;
            }
            .theme-compact .data-row {
                padding: 2px;
            }
            .theme-compact .action-box {
                margin-top: 8px;
                padding-top: 6px;
            }
            .theme-compact .legend-box {
                padding: 6px;
                backdrop-filter: none;
            }
            .theme-compact .card-header {
                padding: 10px;
                font-size: 1.2rem;
            }

            /*
             * Thème « mono » : relevé technique dense. Les valeurs sont alignées à droite
             * en chasse fixe, ce qui les met en colonne et les rend comparables d'un
             * coup d'œil entre pièces — impossible avec un « label : valeur » au fil du
             * texte, où chaque nombre commence à une abscisse différente.
             *
             * La police vient de la pile système : le design d'origine chargeait Roboto
             * Mono depuis Google Fonts, ce qu'une installation hors-ligne ne peut pas
             * suivre et que la règle « aucun import externe » interdit de toute façon.
             */
            .theme-mono .psychro-data {
                gap: 12px;
                padding: 0 14px 16px;
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
            }
            .theme-mono .data-box {
                padding: 13px 14px;
                border-radius: 14px;
                border: 1px solid rgba(127, 127, 127, 0.22);
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .theme-mono .data-box:hover {
                transform: none;
                border-color: rgba(127, 127, 127, 0.4);
            }
            .theme-mono .data-header {
                margin-bottom: 0;
                font-size: 14px;
                font-weight: 500;
                gap: 8px;
            }
            .theme-mono .mono-name {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .theme-mono .mono-dot {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                flex: none;
            }
            .theme-mono .mono-badge {
                background: none;
                box-shadow: none;
                border: 1px solid currentColor;
                font-size: 10.5px;
                font-weight: 500;
                padding: 3px 8px;
                border-radius: 999px;
                white-space: nowrap;
            }
            .theme-mono .mono-headline {
                display: flex;
                align-items: baseline;
                gap: 10px;
                font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            }
            .theme-mono .mono-temp {
                font-size: 26px;
                font-weight: 500;
                letter-spacing: -0.02em;
                cursor: pointer;
            }
            .theme-mono .mono-hum {
                font-size: 15px;
                cursor: pointer;
            }
            .theme-mono .mono-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px 12px;
                font-size: 11.5px;
            }
            .theme-mono .mono-foot {
                display: flex;
                flex-direction: column;
                gap: 5px;
                font-size: 11.5px;
                padding-top: 8px;
                border-top: 1px solid rgba(127, 127, 127, 0.22);
            }
            .theme-mono .mono-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 8px;
                border-bottom: 1px solid rgba(127, 127, 127, 0.14);
                padding-bottom: 3px;
            }
            .theme-mono .mono-foot .mono-row {
                border-bottom: none;
                padding-bottom: 0;
            }
            .theme-mono .mono-k {
                opacity: 0.7;
            }
            .theme-mono .mono-v {
                font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                text-align: right;
                white-space: nowrap;
            }
            /* Une pièce par colonne devient illisible en dessous : on repasse à une
               seule colonne de relevés plutôt que de tronquer les valeurs. */
            @media (max-width: 380px) {
                .theme-mono .mono-grid { grid-template-columns: 1fr; }
            }
        `;
    }

    constructor() {
        super();
        this._canvasWidth = 800;
        this._canvasHeight = 600;
        this.resizeObserver = null;
        this._resizeTarget = null;
        this._resizeDebounceTimer = null;
        this._language = 'fr';
        this._temperatureUnit = null;
        this._currentPoints = [];
        this._currentLayout = null;
        this._hoveredPoint = null;
        this._tooltipPos = { x: 0, y: 0 };
        // Modale d'historique
        this._historyCursor = null;
        this._historyHidden = [];
        this._historyPoint = null;
        this._historyEnd = null;
        this._historyResizeObserver = null;
        this._historyResizeTarget = null;
        this._historyPlot = null;
        // Caméra du mode 3D. `zoom` multiplie la distance de cadrage automatique :
        // 1 correspond au cadrage qui fait tout tenir dans le canvas.
        this._cam3d = { ...VIEWS['3d'], zoom: 1 };
        this._view3d = '3d';
        this._plot3d = null;
        this._drag3d = null;
        // Pointeurs tactiles actifs, pour distinguer rotation (un doigt) et
        // pincement (deux doigts) — le zoom n'a aucun autre geste sur mobile.
        this._pointers3d = new Map();
        this._pinch3d = null;
        // Écriture différée de la vue 3D dans le stockage local (voir `_persistCam3d`).
        this._cam3dSaveTimer = null;

        // Références stables pour pouvoir retirer les écouteurs au démontage.
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseLeave = this._handleMouseLeave.bind(this);
        this._onCanvasClick = this._handleCanvasClick.bind(this);
        this._onPointerDown = this._handlePointerDown.bind(this);
        this._onPointerMove = this._handlePointerMove.bind(this);
        this._onPointerUp = this._handlePointerUp.bind(this);
        this._onWheel = this._handleWheel.bind(this);
        this._onHistoryPointer = this._handleHistoryPointer.bind(this);
        this._onHistoryPointerLeave = () => { this._historyCursor = null; };
        this._onModalKeyDown = this._handleModalKeyDown.bind(this);

        this.translations = {
            fr: {
                noPointsConfigured: 'Aucun point ou entité configuré dans la carte !',
                noValidEntity: 'Aucune entité valide trouvée. Vérifiez votre configuration.',
                temperature: 'Température',
                humidity: 'Humidité',
                dewPoint: 'Point de rosée',
                enthalpy: 'Enthalpie',
                absHumidity: 'Humidité abs.',
                waterContent: 'Teneur en eau',
                specificVolume: 'Volume spécifique',
                pmvIndex: 'Indice PMV',
                shortDewPoint: 'Rosée',
                shortWetBulb: 'T. humide',
                shortApparentTemp: 'Ressentie',
                shortEnthalpy: 'Enthalpie',
                shortAbsHumidity: 'Hum. abs.',
                shortWaterContent: 'Teneur eau',
                shortSpecificVolume: 'Vol. spéc.',
                shortPmvIndex: 'PMV',
                apparentTemp: 'Temp. ressentie',
                wetBulb: 'Temp. humide',
                moldRisk: 'Moisissure',
                action: 'Action',
                power: 'Puissance totale',
                humidification: 'Humidification',
                dehumidification: 'Déshumidification',
                idealSetpoint: 'Consigne idéale',
                comfortOptimal: 'Confort optimal',
                comfortTooHot: 'Trop chaud',
                comfortTooCold: 'Trop froid',
                comfortTooHumid: 'Trop humide',
                comfortTooDry: 'Trop sec',
                outOfComfort: 'Hors confort',
                comfortZone: 'Zone de confort',
                legend: 'Légende',
                clickToViewHistory: 'Cliquez pour voir l\'historique',
                warm: 'Réchauffer',
                cool: 'Refroidir',
                andHumidify: 'et Humidifier',
                andDehumidify: 'et Déshumidifier',
                historyLast24h: 'Historique des dernières 24h',
                historyLoading: 'Chargement…',
                historyEmpty: 'Aucune donnée sur les dernières 24h.',
                statMin: 'Min',
                statMax: 'Max',
                statAvg: 'Moyenne',
                statTrend: 'Tendance',
                statOutOfComfort: 'Hors confort',
                close: 'Fermer',
                moldRiskNone: 'Aucun',
                moldRiskVeryLow: 'Très faible',
                moldRiskLow: 'Faible',
                moldRiskModerate: 'Modéré',
                moldRiskHigh: 'Élevé',
                moldRiskVeryHigh: 'Très élevé',
                moldRiskCritical: 'Critique',
                view3dLabel: 'Vue 3D',
                viewTop: 'Vue de dessus',
            },
            en: {
                noPointsConfigured: 'No points or entities configured in the card!',
                noValidEntity: 'No valid entity found. Check your configuration.',
                temperature: 'Temperature',
                humidity: 'Humidity',
                dewPoint: 'Dew point',
                enthalpy: 'Enthalpy',
                absHumidity: 'Abs. humidity',
                waterContent: 'Water content',
                specificVolume: 'Specific volume',
                pmvIndex: 'PMV Index',
                shortDewPoint: 'Dew pt.',
                shortWetBulb: 'Wet bulb',
                shortApparentTemp: 'Feels like',
                shortEnthalpy: 'Enthalpy',
                shortAbsHumidity: 'Abs. hum.',
                shortWaterContent: 'Water',
                shortSpecificVolume: 'Sp. vol.',
                shortPmvIndex: 'PMV',
                apparentTemp: 'Feels like',
                wetBulb: 'Wet bulb',
                moldRisk: 'Mold risk',
                action: 'Action',
                power: 'Total power',
                humidification: 'Humidification',
                dehumidification: 'Dehumidification',
                idealSetpoint: 'Ideal setpoint',
                comfortOptimal: 'Optimal comfort',
                comfortTooHot: 'Too hot',
                comfortTooCold: 'Too cold',
                comfortTooHumid: 'Too humid',
                comfortTooDry: 'Too dry',
                outOfComfort: 'Out of comfort',
                comfortZone: 'Comfort zone',
                legend: 'Legend',
                clickToViewHistory: 'Click to view history',
                warm: 'Warm up',
                cool: 'Cool down',
                andHumidify: 'and Humidify',
                andDehumidify: 'and Dehumidify',
                historyLast24h: 'History of the last 24 hours',
                historyLoading: 'Loading…',
                historyEmpty: 'No data for the last 24 hours.',
                statMin: 'Min',
                statMax: 'Max',
                statAvg: 'Average',
                statTrend: 'Trend',
                statOutOfComfort: 'Out of comfort',
                close: 'Close',
                moldRiskNone: 'No risk',
                moldRiskVeryLow: 'Very low',
                moldRiskLow: 'Low',
                moldRiskModerate: 'Moderate',
                moldRiskHigh: 'High',
                moldRiskVeryHigh: 'Very high',
                moldRiskCritical: 'Critical',
                view3dLabel: '3D view',
                viewTop: 'Top view',
            },
            es: {
                noPointsConfigured: '¡No hay puntos o entidades configuradas en la tarjeta!',
                noValidEntity: '¡No se encontraron entidades válidas!',
                temperature: 'Temperatura',
                humidity: 'Humedad',
                dewPoint: 'Punto de rocío',
                enthalpy: 'Entalpía',
                absHumidity: 'Humedad abs.',
                waterContent: 'Contenido de agua',
                specificVolume: 'Volumen específico',
                pmvIndex: 'Índice PMV',
                shortDewPoint: 'Rocío',
                shortWetBulb: 'T. húmeda',
                shortApparentTemp: 'Sensación',
                shortEnthalpy: 'Entalpía',
                shortAbsHumidity: 'Hum. abs.',
                shortWaterContent: 'Agua',
                shortSpecificVolume: 'Vol. esp.',
                shortPmvIndex: 'PMV',
                apparentTemp: 'Sensación térmica',
                wetBulb: 'Temp. húmeda',
                moldRisk: 'Moho',
                action: 'Acción',
                power: 'Potencia total',
                humidification: 'Humidificación',
                dehumidification: 'Deshumidificación',
                idealSetpoint: 'Consigna ideal',
                comfortOptimal: 'Confort óptimo',
                comfortTooHot: 'Demasiado calor',
                comfortTooCold: 'Demasiado frío',
                comfortTooHumid: 'Demasiado húmedo',
                comfortTooDry: 'Demasiado seco',
                outOfComfort: 'Fuera de confort',
                comfortZone: 'Zona de confort',
                legend: 'Leyenda',
                clickToViewHistory: 'Haga clic para ver el historial',
                warm: 'Calentar',
                cool: 'Enfriar',
                andHumidify: 'y Humidificar',
                andDehumidify: 'y Deshumidificar',
                historyLast24h: 'Historial de las últimas 24 horas',
                historyLoading: 'Cargando…',
                historyEmpty: 'Sin datos en las últimas 24 horas.',
                statMin: 'Mín',
                statMax: 'Máx',
                statAvg: 'Media',
                statTrend: 'Tendencia',
                statOutOfComfort: 'Fuera de confort',
                close: 'Cerrar',
                moldRiskNone: 'Sin riesgo',
                moldRiskVeryLow: 'Muy bajo',
                moldRiskLow: 'Bajo',
                moldRiskModerate: 'Moderado',
                moldRiskHigh: 'Alto',
                moldRiskVeryHigh: 'Muy alto',
                moldRiskCritical: 'Crítico',
                view3dLabel: 'Vista 3D',
                viewTop: 'Vista superior',
            },
            de: {
                noPointsConfigured: 'Keine Punkte oder Entitäten in der Karte konfiguriert!',
                noValidEntity: 'Keine gültigen Entitäten gefunden!',
                temperature: 'Temperatur',
                humidity: 'Luftfeuchtigkeit',
                dewPoint: 'Taupunkt',
                enthalpy: 'Enthalpie',
                absHumidity: 'Abs. Feuchtigkeit',
                waterContent: 'Wassergehalt',
                specificVolume: 'Spezifisches Volumen',
                pmvIndex: 'PMV-Index',
                shortDewPoint: 'Taupunkt',
                shortWetBulb: 'Feuchtkugel',
                shortApparentTemp: 'Gefühlt',
                shortEnthalpy: 'Enthalpie',
                shortAbsHumidity: 'Abs. F.',
                shortWaterContent: 'Wasser',
                shortSpecificVolume: 'Spez. Vol.',
                shortPmvIndex: 'PMV',
                apparentTemp: 'Gefühlte Temp.',
                wetBulb: 'Feuchtkugeltemp.',
                moldRisk: 'Schimmel',
                action: 'Aktion',
                power: 'Gesamtleistung',
                humidification: 'Befeuchtung',
                dehumidification: 'Entfeuchtung',
                idealSetpoint: 'Idealer Sollwert',
                comfortOptimal: 'Optimaler Komfort',
                comfortTooHot: 'Zu heiß',
                comfortTooCold: 'Zu kalt',
                comfortTooHumid: 'Zu feucht',
                comfortTooDry: 'Zu trocken',
                outOfComfort: 'Außerhalb Komfort',
                comfortZone: 'Komfortzone',
                legend: 'Legende',
                clickToViewHistory: 'Zum Anzeigen des Verlaufs klicken',
                warm: 'Erwärmen',
                cool: 'Abkühlen',
                andHumidify: 'und Befeuchten',
                andDehumidify: 'und Entfeuchten',
                historyLast24h: 'Verlauf der letzten 24 Stunden',
                historyLoading: 'Wird geladen…',
                historyEmpty: 'Keine Daten für die letzten 24 Stunden.',
                statMin: 'Min',
                statMax: 'Max',
                statAvg: 'Mittelwert',
                statTrend: 'Tendenz',
                statOutOfComfort: 'Außerhalb Komfort',
                close: 'Schließen',
                moldRiskNone: 'Kein Risiko',
                moldRiskVeryLow: 'Sehr niedrig',
                moldRiskLow: 'Niedrig',
                moldRiskModerate: 'Mäßig',
                moldRiskHigh: 'Hoch',
                moldRiskVeryHigh: 'Sehr hoch',
                moldRiskCritical: 'Kritisch',
                view3dLabel: '3D-Ansicht',
                viewTop: 'Draufsicht'
            }
        };
    }

    /**
     * Set the configuration for the card.
     * @param {Object} config - The configuration object
     */
    setConfig(config) {
        if (config.points !== undefined && !Array.isArray(config.points)) {
            throw new Error("`points` doit être une liste. / `points` must be a list.");
        }
        // Une liste vide n'est pas une erreur de configuration mais une carte en cours
        // de réglage : render() affiche alors `noPointsConfigured` plutôt qu'une erreur
        // rouge, ce qui est aussi l'état du stub servi au sélecteur de cartes.

        const language = config.language || 'fr';
        // Une langue inconnue ne doit pas faire planter chaque appel à t().
        this._language = this.translations[language] ? language : 'fr';

        const bounds = this._resolveBounds(config);
        if (bounds.minTemp >= bounds.maxTemp) {
            throw new Error(`zoom_temp_min (${bounds.minTemp}) doit être strictement inférieur à zoom_temp_max (${bounds.maxTemp}).`);
        }
        if (bounds.minHum >= bounds.maxHum) {
            throw new Error(`zoom_humidity_min (${bounds.minHum}) doit être strictement inférieur à zoom_humidity_max (${bounds.maxHum}).`);
        }

        // Une hauteur ou un rapport d'aspect non numérique donnerait un conteneur de
        // taille NaN, donc un canvas invisible : le dire plutôt que d'afficher un vide.
        if (config.chartHeight !== undefined && config.chartHeight !== null && config.chartHeight !== '') {
            const chartHeight = parseFloat(config.chartHeight);
            if (!Number.isFinite(chartHeight) || chartHeight <= 0) {
                throw new Error(`chartHeight (${config.chartHeight}) doit être un nombre de pixels positif.`);
            }
        }
        if (config.chartAspectRatio !== undefined && config.chartAspectRatio !== null && config.chartAspectRatio !== '') {
            const ratio = parseFloat(config.chartAspectRatio);
            if (!Number.isFinite(ratio) || ratio <= 0) {
                throw new Error(`chartAspectRatio (${config.chartAspectRatio}) doit être un nombre positif.`);
            }
        }

        if (config.chartMode !== undefined && !['2d', '3d'].includes(config.chartMode)) {
            throw new Error(`chartMode (${config.chartMode}) doit valoir '2d' ou '3d'.`);
        }
        if (config.heightMetric !== undefined && !['pmv', 'enthalpy', 'flat'].includes(config.heightMetric)) {
            throw new Error(`heightMetric (${config.heightMetric}) doit valoir 'pmv', 'enthalpy' ou 'flat'.`);
        }

        this.config = config;
        // L'unité peut changer avec la config : forcer une nouvelle détection.
        this._temperatureUnit = null;
        this._wetBulbCache = null;
        // Les bornes de zoom entrent dans la mise en page (largeur des étiquettes).
        this._currentLayout = null;
        // La géométrie 3D mémorisée décrit l'ancienne configuration : la garder ferait
        // pointer le survol sur des pastilles qui ne sont plus au même endroit.
        this._plot3d = null;
        // La clé de stockage dérive de la configuration : c'est ici, et pas dans le
        // constructeur, que la vue mémorisée peut être retrouvée.
        this._restoreCam3d();
    }

    /**
     * Mode de projection du graphique.
     * @returns {string} '2d' ou '3d'
     */
    _chartMode() {
        return this.config?.chartMode === '3d' ? '3d' : '2d';
    }

    /**
     * Grandeur portée par la hauteur des capteurs en 3D.
     * @returns {string} 'pmv', 'enthalpy' ou 'flat'
     */
    _heightMetric() {
        const metric = this.config?.heightMetric;
        return ['pmv', 'enthalpy', 'flat'].includes(metric) ? metric : 'pmv';
    }

    /**
     * Get the card size (height in rows).
     *
     * Une unité vaut ~50 px pour Home Assistant, qui s'en sert à équilibrer les colonnes
     * de la vue masonry. La valeur était figée à 3 (~150 px) pour une carte qui en fait
     * couramment 600 : les colonnes se remplissaient de travers. On annonce désormais la
     * hauteur réelle — graphique plus une carte de données par point.
     * @returns {number} The size of the card
     */
    getCardSize() {
        const pointCount = this.config?.points?.length ?? 0;
        const dataRows = this.config?.showCalculatedData === false ? 0 : pointCount * 3;
        // Sans le graphique, la carte se réduit aux cartes de données : annoncer la
        // même hauteur laisserait un grand vide dans les mises en page en colonnes.
        if (this.config?.showChart === false) return Math.max(1, dataRows);
        return Math.max(3, Math.ceil(this._chartBaseHeight() / 50) + dataRows);
    }

    /**
     * Placement par défaut dans la vue « sections ».
     *
     * Sans cette méthode, Home Assistant ne connaît ni la largeur ni la hauteur
     * minimales de la carte : `grid_options.rows` pouvait l'écraser jusqu'au
     * chevauchement, et rien n'empêchait de la réduire à une colonne. `rows: auto`
     * laisse la carte dicter sa hauteur (graphique + cartes de données) ; l'utilisateur
     * qui fixe un nombre de lignes obtient un graphique qui s'y adapte, puisque le
     * conteneur du canvas grandit et rétrécit avec la place disponible.
     * @returns {Object} Options de grille reconnues par la vue sections
     */
    getGridOptions() {
        return {
            // 12 colonnes = toute la largeur d'une section, exprimé en nombre plutôt
            // qu'avec le mot-clé « full » que les versions plus anciennes ignorent.
            columns: 12,
            rows: 'auto',
            min_columns: 6,
            min_rows: this.config?.showChart === false ? 1 : 3,
        };
    }

    /**
     * Create the configuration element for the editor.
     * @returns {HTMLElement} The editor element
     */
    static getConfigElement() {
        return document.createElement("psychrometric-chart-editor");
    }

    /**
     * Get the default configuration stub.
     *
     * Aucune couleur n'y figure : `textColor: '#333333'` y était codé en dur, si bien
     * que toute carte créée depuis le sélecteur naissait avec un texte gris foncé
     * illisible sur un thème sombre, et que `_palette()` ne pouvait plus résoudre la
     * variable du thème. Sans clé de couleur, la carte suit Home Assistant.
     * @returns {Object} Default configuration
     */
    static getStubConfig() {
        return {
            chartTitle: "Diagramme Psychrométrique",
            points: [],
            showEnthalpy: true,
            showDewPoint: true,
            showWetBulb: true,
            showVaporPressure: true,
            themeMode: "auto"
        };
    }

    /**
     * Lifecycle method called after the first update.
     * Initializes the resize observer. Les écouteurs du canvas sont posés par le
     * template Lit : le canvas peut apparaître ou disparaître avec `showChart`,
     * et un accrochage manuel ici ne serait joué qu'une fois.
     */
    firstUpdated() {
        this._observeResize();
    }

    connectedCallback() {
        super.connectedCallback();
        // firstUpdated ne rejoue pas après un remontage : ré-observer explicitement.
        this._observeResize();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this._resizeTarget = null;
        clearTimeout(this._resizeDebounceTimer);
        this._resizeDebounceTimer = null;
        this._hoveredPoint = null;
        // Une carte démontée en plein glissement de caméra garderait un état de
        // rotation actif, qui reprendrait au remontage sans que rien ne l'ait demandé.
        this._drag3d = null;
        this._pinch3d = null;
        this._pointers3d.clear();
        // Une vue modifiée juste avant le démontage serait perdue avec le minuteur :
        // l'écrire tout de suite plutôt que d'attendre un délai qui n'arrivera pas.
        if (this._cam3dSaveTimer) this._writeCam3d();
        // La modale d'historique pose un écouteur sur la fenêtre : le retirer, sinon il
        // survivrait au démontage de la carte.
        window.removeEventListener('keydown', this._onModalKeyDown);
        this._historyResizeObserver?.disconnect();
        this._historyResizeObserver = null;
        this._historyResizeTarget = null;
        clearTimeout(this._historyResizeTimer);
        this._historyResizeTimer = null;
    }

    /**
     * Observe la zone du graphique et tient le canvas à la taille réellement disponible.
     *
     * C'est le conteneur qui est mesuré, et non la carte : sa hauteur est décidée par le
     * flux flex — hauteur de repos issue de `_chartBaseHeight()`, puis étirement ou
     * compression selon la place que Home Assistant accorde à la carte (`grid_options`).
     * Mesurer la carte ne donnait que sa largeur, d'où une hauteur toujours déduite de
     * celle-ci : le graphique débordait d'une carte trop courte et ne remplissait pas
     * une carte trop haute.
     *
     * Pas de boucle de rétroaction : la hauteur de repos ne dépend que de la largeur du
     * conteneur, que le canvas — dessiné à la taille exacte du conteneur, sans mise à
     * l'échelle CSS — ne peut pas modifier.
     */
    _observeResize() {
        const target = this.shadowRoot?.querySelector('.chart-container');
        if (!target || this._resizeTarget === target) return;

        this.resizeObserver?.disconnect();
        this._resizeTarget = target;
        this.resizeObserver = new ResizeObserver(entries => {
            clearTimeout(this._resizeDebounceTimer);
            this._resizeDebounceTimer = setTimeout(() => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        this._canvasWidth = width;
                        this._canvasHeight = height;
                        // La géométrie dépend des deux dimensions : la recalculer.
                        this._currentLayout = null;
                    }
                }
            }, 100);
        });
        this.resizeObserver.observe(target);
    }

    /**
     * Entity IDs the card actually depends on.
     * @returns {string[]} List of entity IDs
     */
    _watchedEntityIds() {
        if (!this.config?.points) return [];
        const ids = [];
        for (const point of this.config.points) {
            if (point.temp) ids.push(point.temp);
            if (point.humidity) ids.push(point.humidity);
        }
        return ids;
    }

    /**
     * Home Assistant replaces `hass` on every state change of *any* entity in the
     * installation. Without this gate the whole chart would be recomputed and
     * redrawn dozens of times per second for entities the card never displays.
     * @param {Map} changedProperties - Map of changed properties
     * @returns {boolean} True when the card must re-render
     */
    shouldUpdate(changedProperties) {
        if (!changedProperties.has('hass')) return true;
        if (changedProperties.size > 1) return true;

        const oldHass = changedProperties.get('hass');
        if (!oldHass || !this.config) return true;

        // Le thème et la locale changent le rendu sans qu'aucune entité ne bouge :
        // sans ces deux gardes, basculer Home Assistant en sombre laisserait la carte
        // figée dans sa palette claire jusqu'au prochain relevé de capteur.
        if (oldHass.themes !== this.hass.themes) return true;
        if (oldHass.locale !== this.hass.locale) return true;

        return this._watchedEntityIds().some(id => oldHass.states[id] !== this.hass.states[id]);
    }

    /**
     * Lifecycle method called before update.
     * Computes the points once per cycle, for both `render()` and `_drawChart()`.
     * @param {Map} changedProperties - Map of changed properties
     */
    willUpdate(changedProperties) {
        if (changedProperties.has('hass') || changedProperties.has('config') || !this._currentPoints) {
            this._currentPoints = this._calculatePoints();
        }
        // Masquer le graphique retire le canvas sous le curseur : sans cela, une
        // infobulle ouverte à cet instant resterait affichée faute de `mouseleave`.
        if (changedProperties.has('config') && this.config?.showChart === false && this._hoveredPoint) {
            this._hoveredPoint = null;
        }
    }

    /**
     * Lifecycle method called when properties change.
     * Triggers chart redraw if relevant properties change.
     * @param {Map} changedProperties - Map of changed properties
     */
    updated(changedProperties) {
        // Le conteneur du graphique apparaît et disparaît avec `showChart` : il faut
        // ré-observer celui qui est réellement dans le DOM, sinon la carte resterait
        // dimensionnée d'après un élément détruit.
        this._observeResize();

        if (changedProperties.has('hass') || changedProperties.has('config')
            || changedProperties.has('_canvasWidth') || changedProperties.has('_canvasHeight')) {
            this._drawChart();
        }

        if (this._modalOpen && this._historyData
            && (changedProperties.has('_modalOpen') || changedProperties.has('_historyData')
                || changedProperties.has('_historyHidden'))) {
            // Une frame d'attente pour que la modale soit mise en page et que
            // offsetWidth soit exploitable (remplace un setTimeout arbitraire).
            requestAnimationFrame(() => {
                this._drawHistoryChart();
                this._drawHistoryCursor();
            });
        }

        // Le curseur vit sur son propre calque : le déplacer ne redessine pas les courbes.
        if (changedProperties.has('_historyCursor')) this._drawHistoryCursor();

        if (this._modalOpen) this._observeHistoryResize();
    }

    /**
     * Redraw the history chart when the modal is resized.
     *
     * Aucune boucle possible : la taille de rendu du canvas vient du CSS, le dessin ne
     * touchant que ses attributs `width`/`height` (la définition du bitmap).
     */
    _observeHistoryResize() {
        const target = this.shadowRoot?.querySelector('.history-chart-wrap');
        if (!target || this._historyResizeTarget === target) return;

        this._historyResizeObserver?.disconnect();
        this._historyResizeTarget = target;
        this._historyResizeObserver = new ResizeObserver(() => {
            clearTimeout(this._historyResizeTimer);
            this._historyResizeTimer = setTimeout(() => {
                this._drawHistoryChart();
                this._drawHistoryCursor();
            }, 100);
        });
        this._historyResizeObserver.observe(target);
    }

    /**
     * Translate a key to the current language.
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    t(key) {
        return this.translations[this._language]?.[key] ?? this.translations.fr[key] ?? key;
    }

    /**
     * Whether the card must render its dark palette.
     *
     * `themeMode` est l'unique commande : sans lui, la carte suit le thème de Home
     * Assistant. L'ancien booléen `darkMode` n'est volontairement plus lu — tant qu'il
     * l'était, une config l'ayant hérité (la documentation l'annonçait comme « force le
     * mode sombre ») figeait la carte en sombre à vie, et basculer Home Assistant en
     * clair n'avait aucun effet. Qui veut réellement forcer le sombre pose
     * `themeMode: dark`.
     * @returns {boolean} True when the dark palette applies
     */
    _isDark() {
        const mode = this.config?.themeMode;
        if (mode === 'dark') return true;
        if (mode === 'light') return false;
        return Boolean(this.hass?.themes?.darkMode);
    }

    /**
     * Resolve every colour the card draws with, once per use.
     *
     * Defaults come from the Home Assistant theme variables so the card blends into
     * any theme — the canvas needs concrete colour strings, which CSS variables
     * cannot provide directly, hence the computed-style read. Explicit config
     * colours always win.
     * @returns {Object} Resolved palette
     */
    _palette() {
        const dark = this._isDark();
        // `themeMode: light`/`dark` force un mode qui peut contredire celui de Home
        // Assistant : dans ce cas les variables CSS du thème sont ignorées, sinon
        // choisir « clair » sous un thème HA sombre laissait le fond et le texte
        // sombres — le mode clair semblait sans effet.
        const forced = this.config?.themeMode === 'light' || this.config?.themeMode === 'dark';
        const styles = getComputedStyle(this);
        /**
         * Reads a CSS custom property, falling back when the theme does not define it.
         * @param {string} name - Custom property name
         * @param {string} fallback - Value to use when unset
         * @returns {string} Resolved colour
         */
        const readVar = (name, fallback) => (forced ? fallback : (styles.getPropertyValue(name).trim() || fallback));

        /**
         * Résout une couleur : surcharge de configuration si présente, défaut sinon,
         * puis applique l'opacité indépendante `<clé>Opacity` quand elle est réglée.
         *
         * L'opacité est volontairement une clé distincte : intégrée à la couleur, elle
         * obligeait à figer aussi la teinte du mode courant, si bien qu'un simple
         * réglage de transparence bloquait ensuite la bascule clair/sombre.
         * @param {string} key - Option de couleur (ex. 'bgColor')
         * @param {string} fallback - Couleur du mode courant
         * @returns {string} Couleur CSS finale
         */
        const resolve = (key, fallback) => {
            const color = this.config?.[key] || fallback;
            const raw = this.config?.[PsychrometricCalculations.opacityKey(key)];
            if (raw === undefined || raw === null || raw === '') return color;
            const percent = parseFloat(raw);
            // Une couleur non analysable (mot-clé CSS, dégradé) virerait au noir.
            if (!Number.isFinite(percent) || !PsychrometricCalculations.isParsableColor(color)) return color;
            const alpha = Math.min(1, Math.max(0, percent / 100));
            return PsychrometricCalculations.rgbToCss(PsychrometricCalculations.colorToRgb(color), alpha);
        };

        return {
            dark,
            forced,
            bg: resolve('bgColor', readVar('--ha-card-background', readVar('--card-background-color', dark ? '#1c1c1c' : '#ffffff'))),
            text: resolve('textColor', readVar('--primary-text-color', dark ? '#e0e0e0' : '#333333')),
            grid: resolve('gridColor', dark ? '#444444' : '#cccccc'),
            curve: resolve('curveColor', dark ? '#4fc3f7' : '#1f77b4'),
            comfort: resolve('comfortColor', dark ? 'rgba(100, 200, 100, 0.3)' : 'rgba(144, 238, 144, 0.5)'),
            enthalpy: resolve('enthalpyColor', dark ? 'rgba(255, 165, 0, 0.7)' : 'rgba(255, 99, 71, 0.7)'),
            wetBulb: dark ? 'rgba(0, 255, 255, 0.4)' : 'rgba(0, 100, 255, 0.4)',
            saturation: dark ? 'rgba(80, 180, 255, 0.9)' : 'rgba(30, 144, 255, 0.8)',
            pointOutline: dark ? '#ffffff' : '#000000',
        };
    }

    /**
     * Motif de pointillés d'une famille de tracés, mis à l'échelle du canvas.
     *
     * Les longueurs de LINE_STYLES sont en pixels CSS de référence : les multiplier
     * par `scale` garde le même aspect quelle que soit la taille rendue, comme le
     * faisaient les motifs codés en dur qu'elle remplace.
     * @param {string} option - Nom de l'option de configuration (ex. 'gridLineStyle')
     * @param {number} scale - Facteur d'échelle du canvas
     * @returns {number[]} Motif à passer à ctx.setLineDash
     */
    _lineDash(option, scale) {
        const name = this.config?.[option] ?? DEFAULT_LINE_STYLES[option];
        const pattern = LINE_STYLES[name] ?? LINE_STYLES[DEFAULT_LINE_STYLES[option]];
        return pattern.map(segment => segment * scale);
    }

    /**
     * Nombre de sous-multiples tracés entre deux graduations de température sèche.
     *
     * 1 signifie « aucun trait intermédiaire », soit l'aspect historique du
     * graphique. La valeur est bornée : au-delà d'une dizaine, les traits se
     * confondent en aplat et la grille cesse d'être lisible.
     * @returns {number} Nombre entier de sous-multiples, entre 1 et 10
     */
    _tempSubdivisions() {
        const parsed = parseInt(this.config?.tempSubdivisions, 10);
        if (!Number.isFinite(parsed)) return 1;
        return Math.min(10, Math.max(1, parsed));
    }

    /**
     * Get the temperature unit symbol.
     * @returns {string} '°C' or '°F'
     */
    getTempUnit() {
        return this._temperatureUnit === '°F' ? '°F' : '°C';
    }

    /**
     * Detect temperature unit from Home Assistant or config.
     * @param {Object} hass - Home Assistant object
     * @returns {string} '°C' or '°F'
     */
    detectTemperatureUnit(hass) {
        if (this.config && this.config.temperatureUnit) {
            const configUnit = this.config.temperatureUnit.toLowerCase();
            if (['f', 'fahrenheit', '°f'].includes(configUnit)) return '°F';
            if (['c', 'celsius', '°c'].includes(configUnit)) return '°C';
        }
        if (hass && hass.config && hass.config.unit_system) {
            if (hass.config.unit_system.temperature === '°F') return '°F';
        }
        return '°C';
    }

    /**
     * Convert temperature to internal Celsius format.
     * @param {number} temp - Temperature value
     * @returns {number} Temperature in Celsius
     */
    toInternalTemp(temp) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.fahrenheitToCelsius(temp);
        }
        return temp;
    }

    /**
     * Convert internal Celsius temperature to display unit.
     * @param {number} tempC - Temperature in Celsius
     * @returns {number} Temperature in display unit
     */
    toDisplayTemp(tempC) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.celsiusToFahrenheit(tempC);
        }
        return tempC;
    }

    /**
     * Format temperature for display with unit.
     * @param {number} tempC - Temperature in Celsius
     * @param {number} [decimals=1] - Number of decimal places
     * @returns {string} Formatted temperature string
     */
    formatTemp(tempC, decimals = 1) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.celsiusToFahrenheit(tempC).toFixed(decimals) + '°F';
        }
        return tempC.toFixed(decimals) + '°C';
    }

    /**
     * Check if a point is within the comfort zone.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {boolean} True if in comfort zone
     */
    isInComfortZone(temp, humidity, comfortRange) {
        return (
            temp >= comfortRange.tempMin &&
            temp <= comfortRange.tempMax &&
            humidity >= comfortRange.rhMin &&
            humidity <= comfortRange.rhMax
        );
    }

    /**
     * Describe *why* a point sits outside the comfort zone.
     * Temperature takes precedence over humidity, being the dominant sensation.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {string} Translation key describing the comfort status
     */
    getComfortStatus(temp, humidity, comfortRange) {
        if (this.isInComfortZone(temp, humidity, comfortRange)) return 'comfortOptimal';
        if (temp > comfortRange.tempMax) return 'comfortTooHot';
        if (temp < comfortRange.tempMin) return 'comfortTooCold';
        if (humidity > comfortRange.rhMax) return 'comfortTooHumid';
        if (humidity < comfortRange.rhMin) return 'comfortTooDry';
        return 'outOfComfort';
    }

    /**
     * Get color for mold risk level.
     * @param {number} riskLevel - Risk level (0-6)
     * @param {boolean} darkMode - Whether dark mode is enabled
     * @returns {string} Color hex code
     */
    getMoldRiskColor(riskLevel, darkMode) {
        const colors = darkMode ?
            ["#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722"] :
            ["#2E7D32", "#558B2F", "#9E9D24", "#F9A825", "#EF6C00", "#E65100", "#C62828"];
        return colors[Math.min(Math.floor(riskLevel), 6)];
    }

    /**
     * Get text description for mold risk level.
     * @param {number} riskLevel - Risk level (0-6)
     * @returns {string} Localized risk description
     */
    getMoldRiskText(riskLevel) {
        const keys = ['moldRiskNone', 'moldRiskVeryLow', 'moldRiskLow', 'moldRiskModerate', 'moldRiskHigh', 'moldRiskVeryHigh', 'moldRiskCritical'];
        return this.t(keys[Math.min(Math.floor(riskLevel), 6)]);
    }

    /**
     * Calculate all psychrometric properties for configured points.
     * @returns {Array} List of calculated point objects
     */
    _calculatePoints() {
        if (!this.hass || !this.config || !this.config.points) return [];

        if (this._temperatureUnit === null) {
            this._temperatureUnit = this.detectTemperatureUnit(this.hass);
        }

        return this.config.points.map(point => {
            const tempState = this.hass.states[point.temp];
            const humState = this.hass.states[point.humidity];

            if (!tempState || !humState) return null;

            const tempRaw = parseFloat(tempState.state);
            const humidityRaw = parseFloat(humState.state);

            // Un capteur en 'unavailable' / 'unknown' donne NaN : sans cette garde le
            // NaN se propage dans tous les calculs et s'affiche tel quel sur la carte.
            if (!Number.isFinite(tempRaw) || !Number.isFinite(humidityRaw)) return null;

            const temp = this.toInternalTemp(tempRaw);
            // Une humidité nulle rendrait le point de rosée infini (log(0)).
            const humidity = Math.min(100, Math.max(0.01, humidityRaw));

            const comfortRange = this.config.comfortRange ? {
                tempMin: this.toInternalTemp(this.config.comfortRange.tempMin),
                tempMax: this.toInternalTemp(this.config.comfortRange.tempMax),
                rhMin: this.config.comfortRange.rhMin,
                rhMax: this.config.comfortRange.rhMax
            } : { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

            const { massFlowRate = 0.5 } = this.config;

            // Calculations
            let action = "";
            let power = 0;
            let heatingPower = 0;
            let coolingPower = 0;
            let humidificationPower = 0;
            let dehumidificationPower = 0;

            if (temp < comfortRange.tempMin) {
                action = this.t('warm');
                heatingPower = PsychrometricCalculations.calculateHeatingPower(temp, comfortRange.tempMin, massFlowRate);
                power += heatingPower;
            } else if (temp > comfortRange.tempMax) {
                action = this.t('cool');
                coolingPower = PsychrometricCalculations.calculateCoolingPower(temp, comfortRange.tempMax, massFlowRate);
                power += coolingPower;
            }

            if (humidity < comfortRange.rhMin) {
                action = action ? action + " " + this.t('andHumidify') : this.t('humidification');
                humidificationPower = PsychrometricCalculations.calculateHumidityPower(temp, humidity, comfortRange.rhMin, massFlowRate);
                power += humidificationPower;
            } else if (humidity > comfortRange.rhMax) {
                action = action ? action + " " + this.t('andDehumidify') : this.t('dehumidification');
                dehumidificationPower = PsychrometricCalculations.calculateHumidityPower(temp, humidity, comfortRange.rhMax, massFlowRate);
                power += dehumidificationPower;
            }

            const dewPoint = PsychrometricCalculations.calculateDewPoint(temp, humidity);
            const waterContent = PsychrometricCalculations.calculateWaterContent(temp, humidity);
            const enthalpy = PsychrometricCalculations.calculateEnthalpy(temp, waterContent);
            const absoluteHumidity = PsychrometricCalculations.calculateAbsoluteHumidity(temp, humidity);
            const wetBulbTemp = PsychrometricCalculations.calculateWetBulbTemp(temp, humidity);
            const specificVolume = PsychrometricCalculations.calculateSpecificVolume(temp, humidity);
            const moldRisk = PsychrometricCalculations.calculateMoldRisk(temp, humidity);
            const pmv = PsychrometricCalculations.calculatePMV(temp, humidity);
            const apparentTemp = PsychrometricCalculations.calculateApparentTemperature(temp, humidity);
            const idealSetpoint = PsychrometricCalculations.calculateIdealSetpoint(temp, humidity, comfortRange);

            // Normalisation en hex : le dessin concatène `color + '40'` pour le halo et
            // le rendu interpole `${color}15` dans un dégradé — un rgba() hérité d'une
            // ancienne config y produirait une couleur invalide, silencieusement ignorée.
            const rawColor = point.color || PsychrometricCalculations.generateColorFromHash(`${point.temp}_${point.humidity}`);
            const color = PsychrometricCalculations.rgbToHex(PsychrometricCalculations.colorToRgb(rawColor));

            return {
                temp, humidity, action, power, heatingPower, coolingPower, humidificationPower, dehumidificationPower,
                dewPoint, waterContent, enthalpy, absoluteHumidity, wetBulbTemp, specificVolume, moldRisk, pmv, apparentTemp, idealSetpoint,
                color,
                label: point.label || `${point.temp} & ${point.humidity}`,
                icon: point.icon || "mdi:thermometer",
                inComfortZone: this.isInComfortZone(temp, humidity, comfortRange),
                comfortStatus: this.getComfortStatus(temp, humidity, comfortRange),
                tempEntityId: point.temp,
                humidityEntityId: point.humidity,
                details: point.details // Pass through details config
            };
        }).filter(p => p !== null);
    }

    /**
     * Calculate chart boundaries based on config.
     * @returns {Object} Bounds object { minTemp, maxTemp, minHum, maxHum, maxPv }
     */
    _resolveBounds(config) {
        /**
         * Reads one numeric bound, falling back to the default when absent or unparseable.
         * @param {*} value - Raw config value
         * @param {number} fallback - Default bound
         * @returns {number} Resolved bound
         */
        const read = (value, fallback) => {
            if (value === undefined || value === null || value === '') return fallback;
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : fallback;
        };

        return {
            minTemp: read(config?.zoom_temp_min, -10),
            maxTemp: read(config?.zoom_temp_max, 50),
            minHum: read(config?.zoom_humidity_min, 0),
            maxHum: read(config?.zoom_humidity_max, 100),
        };
    }

    /**
     * Calculate chart boundaries based on config.
     * The Y axis maps vapor pressure, so the humidity bounds are converted into a
     * pressure window taken at `maxTemp` — the warmest column of the chart.
     * @returns {Object} Bounds object { minTemp, maxTemp, minHum, maxHum, minPv, maxPv }
     */
    _calculateChartBounds() {
        const { minTemp, maxTemp, minHum, maxHum } = this._resolveBounds(this.config);

        const P_sat_max = PsychrometricCalculations.calculateSaturationPressure(maxTemp);
        const minPv = (minHum / 100) * P_sat_max;
        const maxPv = (maxHum / 100) * P_sat_max;

        return { minTemp, maxTemp, minHum, maxHum, minPv, maxPv };
    }

    /**
     * Rapport largeur/hauteur du graphique quand aucune hauteur n'est imposée.
     * @returns {number} Rapport borné entre 0,5 et 4
     */
    _chartAspectRatio() {
        const parsed = parseFloat(this.config?.chartAspectRatio);
        if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_CHART_RATIO;
        return Math.min(4, Math.max(0.5, parsed));
    }

    /**
     * Hauteur demandée par `chartHeight`, si l'option est exploitable.
     * @returns {number|null} Hauteur en pixels CSS, ou null si l'option est absente
     */
    _chartHeightOption() {
        const parsed = parseFloat(this.config?.chartHeight);
        return Number.isFinite(parsed) && parsed > 0 ? Math.max(MIN_CHART_HEIGHT, parsed) : null;
    }

    /**
     * Hauteur de repos du graphique : celle qu'il prend quand la carte le laisse
     * dicter sa propre taille (vue masonry, `grid_options.rows: auto`).
     *
     * Ce n'est qu'une base : le conteneur est un élément flex qui peut ensuite grandir
     * pour remplir une carte plus haute, ou rétrécir pour en tenir une plus courte.
     * @returns {number} Hauteur en pixels CSS
     */
    _chartBaseHeight() {
        return this._chartHeightOption()
            ?? Math.max(MIN_CHART_HEIGHT, this._canvasWidth / this._chartAspectRatio());
    }

    /**
     * Style en ligne du conteneur du graphique.
     *
     * La hauteur de repos y est posée explicitement plutôt que laissée au contenu : le
     * conteneur cesse ainsi de dépendre de la taille du canvas, ce qui rend impossible
     * toute boucle entre le redimensionnement observé et le redessin.
     * @returns {string} Déclarations CSS à appliquer au conteneur
     */
    _chartContainerStyle() {
        const height = `height: ${Math.round(this._chartBaseHeight())}px`;
        // Une hauteur explicite est une consigne, pas une base : la grille de Home
        // Assistant ne doit pas l'étirer. Seule une carte trop courte la comprime encore,
        // faute de quoi le graphique déborderait à nouveau sur ses voisines.
        return this._chartHeightOption() ? `${height}; flex: 0 1 auto` : height;
    }

    /**
     * Mise en page du graphique : facteurs d'échelle, police et bords de la zone de tracé.
     *
     * Source unique de la géométrie : `_drawChart()` la calcule une fois par dessin et
     * la mémorise dans `_currentLayout`, d'où `tempToX`/`humidityToY` la relisent. Elle
     * doit rester **pure** (aucun contexte de canvas, aucun état de dessin) pour que le
     * test de survol puisse la reconstruire à l'identique.
     *
     * Les marges ne sont plus de simples multiples de la géométrie de référence
     * (800x600) : les polices étant bornées à MIN_AXIS_FONT, elles cessent de rétrécir
     * avec la carte et les étiquettes finissaient par déborder dans la zone de tracé.
     * @returns {Object} { scaleX, scaleY, scale, axisFont, compactAxis, axisLabelX, leftPadding, rightEdge, topPadding, bottomEdge }
     */
    _chartLayout() {
        const width = this._canvasWidth;
        const height = this._canvasHeight;
        const scaleX = width / 800;
        const scaleY = height / 600;
        // Plancher sur l'échelle des symboles : une carte large mais basse (grid_options
        // avec peu de lignes) donnait un scaleY minuscule, donc des pastilles de deux
        // pixels sur un graphique par ailleurs immense.
        const scale = Math.max(0.5, Math.min(scaleX, scaleY));
        const axisFont = Math.max(MIN_AXIS_FONT, 12 * scale);
        // La police a dû être relevée au plancher : le texte n'est plus à l'échelle du
        // dessin, on passe l'axe en version courte (nombres seuls, unité en en-tête).
        const compactAxis = 12 * scale < MIN_AXIS_FONT;

        const bounds = this._currentBounds || this._calculateChartBounds();
        const axisLabelX = Math.max(4, 10 * scaleX);
        const pvLabel = compactAxis ? bounds.maxPv.toFixed(1) : `${bounds.maxPv.toFixed(1)} kPa`;
        const yLabelWidth = this.config?.showVaporPressure === false
            ? 0
            : estimateTextWidth(pvLabel, axisFont);

        // Les marges sont ensuite bornées à une fraction du canvas : une carte très
        // basse ou très étroite finirait sinon avec une zone de tracé nulle, voire
        // inversée (bord bas au-dessus du bord haut), et plus rien ne serait dessiné.
        const leftPadding = Math.min(width * 0.35, Math.max(50 * scaleX, axisLabelX + yLabelWidth + 6 * scale));
        const rightEdge = width - Math.min(width * 0.15, Math.max(50 * scaleX, axisFont * 2));
        const topPadding = Math.min(height * 0.2, Math.max(50 * scaleY, axisFont * 1.6));
        const bottomEdge = height - Math.min(height * 0.25, Math.max(50 * scaleY, axisFont * 2.4));

        return {
            scaleX, scaleY, scale, axisFont, compactAxis,
            axisLabelX, leftPadding, rightEdge, topPadding, bottomEdge,
        };
    }

    /**
     * Draw the psychrometric chart on the canvas.
     */
    _drawChart() {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = this._canvasWidth;
        const height = this._canvasHeight;

        // Rendu net sur écrans HiDPI : le canvas travaille en pixels physiques,
        // la transformation ramène toutes les coordonnées de dessin en pixels CSS.
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (this._chartMode() === '3d') {
            this._draw3DChart(ctx, width, height);
            return;
        }

        const points = this._currentPoints || [];

        const {
            showEnthalpy = true,
            showWetBulb = true,
            showDewPoint = true,
            showVaporPressure = true,
            showPointLabels = true,
        } = this.config;

        const minimalMode = this._displayMode() === 'minimal';
        const palette = this._palette();
        const darkMode = palette.dark;
        const actualBgColor = palette.bg;
        const actualGridColor = palette.grid;
        const actualCurveColor = palette.curve;
        const actualTextColor = palette.text;
        const actualComfortColor = palette.comfort;
        const actualEnthalpyColor = palette.enthalpy;

        const comfortRange = this.config.comfortRange ? {
            tempMin: this.toInternalTemp(this.config.comfortRange.tempMin),
            tempMax: this.toInternalTemp(this.config.comfortRange.tempMax),
            rhMin: this.config.comfortRange.rhMin,
            rhMax: this.config.comfortRange.rhMax
        } : { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

        const bounds = this._calculateChartBounds();
        this._currentBounds = bounds; // Store for coordinate conversion

        // Mise en page : calculée une fois ici, puis relue par tempToX/humidityToY.
        const layout = this._chartLayout();
        this._currentLayout = layout;
        const {
            scaleX, scaleY, scale, axisFont, compactAxis,
            axisLabelX, leftPadding, rightEdge, topPadding, bottomEdge,
        } = layout;
        const plotWidth = rightEdge - leftPadding;
        const plotHeight = bottomEdge - topPadding;

        // Zone de tracé trop étroite pour superposer les familles de courbes : on
        // retombe sur le mode minimal, qui ne garde que la grille et les points. Ce
        // repli ne concerne que le canvas — les cartes de données, elles, se
        // réorganisent déjà toutes seules en CSS.
        const minimal = minimalMode || plotWidth < 300 || plotHeight < 220;

        // Clear canvas
        ctx.fillStyle = actualBgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw axes and grid
        ctx.strokeStyle = actualGridColor;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash(this._lineDash('gridLineStyle', scale));

        // Vertical grid (vapor pressure)
        if (showVaporPressure !== false) {
            ctx.font = `${axisFont}px Arial`;
            // Determine step size based on maxPv
            let pvStep = 0.5;
            if (bounds.maxPv < 1) pvStep = 0.1;
            else if (bounds.maxPv > 5) pvStep = 1;
            // ...puis on l'espace assez pour que deux étiquettes ne se touchent pas.
            pvStep = pickAxisStep(bounds.maxPv - bounds.minPv, plotHeight, axisFont * 1.6, pvStep, [1, 2, 5, 10]);

            // Axe compact : l'unité est écrite une fois en en-tête, les graduations ne
            // portent plus que le nombre — « 12.3 kPa » à chaque trait mangeait le quart
            // de la largeur d'une carte étroite.
            if (compactAxis) {
                ctx.fillStyle = actualTextColor;
                ctx.fillText('kPa', axisLabelX, topPadding - axisFont * 0.4);
            }

            for (let i = 0; i <= bounds.maxPv + pvStep; i += pvStep) {
                // L'axe Y porte la pression de vapeur : on la convertit en humidité
                // relative à la température de référence (maxTemp) pour réutiliser
                // humidityToY, qui est la seule projection Pv -> Y du graphique.
                const P_sat_ref = PsychrometricCalculations.calculateSaturationPressure(bounds.maxTemp);
                const rh = (i / P_sat_ref) * 100;
                const y = this.humidityToY(bounds.maxTemp, rh);

                if (y > topPadding && y < bottomEdge) {
                    ctx.beginPath();
                    ctx.moveTo(leftPadding, y);
                    ctx.lineTo(rightEdge, y);
                    ctx.stroke();
                    ctx.fillStyle = actualTextColor;
                    const label = compactAxis ? i.toFixed(1) : `${i.toFixed(1)} kPa`;
                    ctx.fillText(label, axisLabelX, y + axisFont * 0.35);
                }
            }
        }

        // Horizontal grid (temperature)
        // Les graduations sont posées dans l'unité d'affichage : convertir les bornes,
        // qui sont en Celsius interne, avant d'en déduire le premier et le dernier trait.
        const minDisplay = this.toDisplayTemp(bounds.minTemp);
        const maxDisplay = this.toDisplayTemp(bounds.maxTemp);
        // 10 °F plutôt que 9 (l'équivalent exact de 5 °C) : les graduations tombent sur
        // des dizaines rondes, comme sur n'importe quel axe en Fahrenheit.
        const baseTempStep = this._temperatureUnit === '°F' ? 10 : 5;
        // Un pas fixe faisait se chevaucher les étiquettes dès que la carte descendait
        // sous ~500 px : on l'élargit tant que « -10°C » ne tient pas entre deux traits.
        const tempStep = pickAxisStep(
            maxDisplay - minDisplay,
            plotWidth,
            estimateTextWidth(`-00${this.getTempUnit()}`, axisFont) + 8 * scale,
            baseTempStep
        );
        // Adjust start/end to be multiples of step
        const startT = Math.ceil(minDisplay / tempStep) * tempStep;
        const endT = Math.floor(maxDisplay / tempStep) * tempStep;

        // Sous-multiples : traits intermédiaires entre deux graduations, tracés avant
        // elles pour rester dessous, plus fins et atténués, et jamais étiquetés — les
        // étiquettes se chevaucheraient et l'axe deviendrait illisible.
        const subdivisions = this._tempSubdivisions();
        if (subdivisions > 1) {
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.lineWidth = 0.5 * scale;
            // Boucle indexée plutôt qu'un incrément de `tempStep / subdivisions` :
            // l'accumulation de flottants décalerait les derniers traits.
            for (let major = startT - tempStep; major < endT + tempStep; major += tempStep) {
                for (let k = 1; k < subdivisions; k++) {
                    const displayTemp = major + (k * tempStep) / subdivisions;
                    const x = this.tempToX(this.toInternalTemp(displayTemp));
                    if (x < leftPadding || x > rightEdge) continue;
                    ctx.beginPath();
                    ctx.moveTo(x, bottomEdge);
                    ctx.lineTo(x, topPadding);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // Étiquettes centrées sur leur graduation : le décalage fixe de -15 px les
        // désalignait dès que la police cessait de suivre l'échelle du dessin.
        ctx.textAlign = 'center';
        for (let displayTemp = startT; displayTemp <= endT; displayTemp += tempStep) {
            const tempC = this.toInternalTemp(displayTemp);
            const x = this.tempToX(tempC);
            if (x >= leftPadding && x <= rightEdge) {
                ctx.beginPath();
                ctx.moveTo(x, bottomEdge);
                ctx.lineTo(x, topPadding);
                ctx.stroke();
                ctx.fillStyle = actualTextColor;
                ctx.fillText(`${displayTemp}${this.getTempUnit()}`, x, bottomEdge + axisFont * 1.4);
            }
        }
        ctx.textAlign = 'left';

        // Draw relative humidity curves
        ctx.setLineDash(this._lineDash('curveLineStyle', scale));
        ctx.font = `${axisFont}px Arial`;

        // Use zoom bounds for humidity curves if configured
        const startRh = bounds.minHum > 10 ? Math.ceil(bounds.minHum / 10) * 10 : 10;
        const endRh = bounds.maxHum < 100 ? Math.floor(bounds.maxHum / 10) * 10 : 100;
        // Les courbes restent tracées tous les 10 % — ce sont les étiquettes qui se
        // télescopent quand la hauteur manque, pas les traits : on n'en garde qu'une
        // sur deux dès que l'écart vertical moyen tombe sous la hauteur d'une ligne.
        const rhSpacing = plotHeight / Math.max(1, (endRh - startRh) / 10);
        const rhLabelStep = rhSpacing < axisFont * 2.2 ? 20 : 10;
        for (let rh = startRh; rh <= endRh; rh += 10) {
            ctx.beginPath();
            ctx.strokeStyle = rh === 100 ? palette.saturation : actualCurveColor;
            ctx.lineWidth = (rh % 20 === 0 ? 1.5 : 0.8) * scale;

            let firstPoint = true;
            for (let t = bounds.minTemp; t <= bounds.maxTemp; t += 0.5) {
                const x = this.tempToX(t);
                const y = this.humidityToY(t, rh);

                // Clip to bounds
                if (y < topPadding || y > bottomEdge) continue;

                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Label
            // Dynamic positioning: find the rightmost visible point
            let labelX = -1;
            let labelY = -1;

            // Search from right to left (maxTemp to minTemp)
            for (let t = bounds.maxTemp; t >= bounds.minTemp; t -= 0.5) {
                const y = this.humidityToY(t, rh);
                // Check if y is within visible bounds (with some padding)
                if (y >= topPadding + 10 && y <= bottomEdge - 10) {
                    labelX = this.tempToX(t);
                    labelY = y;
                    break; // Found the rightmost visible point
                }
            }

            if (labelX !== -1 && labelY !== -1 && rh % rhLabelStep === 0) {
                ctx.fillStyle = actualTextColor;
                ctx.fillText(`${rh}%`, labelX + 5 * scaleX, labelY - 2 * scaleY);
            }
        }

        // Draw enthalpy curves
        if (showEnthalpy && !minimal) {
            ctx.setLineDash(this._lineDash('enthalpyLineStyle', scale));
            ctx.strokeStyle = actualEnthalpyColor;

            for (let h = 0; h <= 150; h += 10) {
                let enthalpy_points = [];
                for (let t = bounds.minTemp; t <= bounds.maxTemp; t += 0.5) {
                    const W = (h - 1.006 * t) / (2501 + 1.84 * t);
                    if (W < 0) continue;
                    const P_v = PsychrometricCalculations.waterContentToVaporPressure(W);
                    const rh = (P_v / PsychrometricCalculations.calculateSaturationPressure(t)) * 100;

                    const y = this.humidityToY(t, rh);
                    if (y >= topPadding && y <= bottomEdge) {
                        enthalpy_points.push({ x: this.tempToX(t), y });
                    }
                }

                if (enthalpy_points.length > 2) {
                    ctx.beginPath();
                    ctx.moveTo(enthalpy_points[0].x, enthalpy_points[0].y);
                    for (let i = 1; i < enthalpy_points.length - 1; i++) {
                        const xc = (enthalpy_points[i].x + enthalpy_points[i + 1].x) / 2;
                        const yc = (enthalpy_points[i].y + enthalpy_points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(enthalpy_points[i].x, enthalpy_points[i].y, xc, yc);
                    }
                    const last = enthalpy_points[enthalpy_points.length - 1];
                    const beforeLast = enthalpy_points[enthalpy_points.length - 2];
                    ctx.quadraticCurveTo(beforeLast.x, beforeLast.y, last.x, last.y);
                    ctx.stroke();
                }
            }
            ctx.setLineDash([]);
        }

        // Draw Wet Bulb lines
        if (showWetBulb && !minimal) {
            ctx.setLineDash(this._lineDash('wetBulbLineStyle', scale));
            ctx.strokeStyle = palette.wetBulb;

            for (const line of this._wetBulbLines(bounds)) {
                let started = false;
                ctx.beginPath();
                for (const { temp, rh } of line) {
                    const y = this.humidityToY(temp, rh);
                    if (y < topPadding || y > bottomEdge) {
                        started = false;
                        continue;
                    }
                    const x = this.tempToX(temp);
                    if (started) {
                        ctx.lineTo(x, y);
                    } else {
                        ctx.moveTo(x, y);
                        started = true;
                    }
                }
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        // Draw comfort zone
        // Le motif est posé explicitement : les blocs précédents sont conditionnels,
        // sans quoi le contour hériterait du pointillé du dernier tracé dessiné.
        ctx.setLineDash(this._lineDash('comfortLineStyle', scale));
        ctx.beginPath();
        const comfortPoints = [
            { temp: comfortRange.tempMin, rh: comfortRange.rhMin },
            { temp: comfortRange.tempMax, rh: comfortRange.rhMin },
            { temp: comfortRange.tempMax, rh: comfortRange.rhMax },
            { temp: comfortRange.tempMin, rh: comfortRange.rhMax },
        ];

        comfortPoints.forEach((point, index) => {
            const x = this.tempToX(point.temp);
            const y = this.humidityToY(point.temp, point.rh);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();

        const avgTemp = (comfortRange.tempMin + comfortRange.tempMax) / 2;
        const yTop = this.humidityToY(avgTemp, comfortRange.rhMax);
        const yBottom = this.humidityToY(avgTemp, comfortRange.rhMin);
        const gradient = ctx.createLinearGradient(0, yTop, 0, yBottom);

        let startColor = actualComfortColor;
        let endColor = actualComfortColor;
        const colorMatch = actualComfortColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (colorMatch) {
            const [, r, g, b, a = '0.5'] = colorMatch;
            const alpha = parseFloat(a);
            startColor = `rgba(${r}, ${g}, ${b}, ${Math.max(0, alpha - 0.2)})`;
            endColor = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha + 0.2)})`;
        }
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = actualComfortColor;
        ctx.stroke();

        // Draw points
        // Les pastilles et leur halo restent toujours pleins, quel que soit le style
        // choisi pour le contour de la zone de confort dessinée juste avant.
        ctx.setLineDash([]);
        points.forEach(point => {
            const x = this.tempToX(point.temp);
            const y = this.humidityToY(point.temp, point.humidity);

            // Only draw if within visible area (roughly)
            if (x < leftPadding - 20 || x > rightEdge + 20 || y < topPadding - 20 || y > bottomEdge + 20) return;

            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = palette.pointOutline;
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Halo
            ctx.beginPath();
            ctx.arc(x, y, 10 * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = point.color + '40';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();

            // Lines
            ctx.strokeStyle = point.color;
            ctx.setLineDash(this._lineDash('pointLineStyle', scale));
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(x, bottomEdge);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Dew point
            if (showDewPoint && !minimal) {
                const dewX = this.tempToX(point.dewPoint);
                const dewY = this.humidityToY(point.dewPoint, 100);

                if (dewX >= leftPadding && dewX <= rightEdge && dewY >= topPadding && dewY <= bottomEdge) {
                    ctx.beginPath();
                    ctx.arc(dewX, dewY, 4 * scale, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                    ctx.fill();
                    ctx.beginPath();
                    ctx.setLineDash(this._lineDash('pointLineStyle', scale));
                    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
                    ctx.moveTo(x, y);
                    ctx.lineTo(dewX, dewY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            if (showPointLabels !== false) {
                ctx.fillStyle = actualTextColor;
                ctx.font = `${Math.max(MIN_AXIS_FONT, 10 * scale)}px Arial`;
                ctx.fillText(point.label, x + 10 * scaleX, y - 10 * scaleY);
            }
        });
    }

    /**
     * Draw the psychrometric chart in perspective.
     *
     * Toute la géométrie vit dans `psychrometric-3d.js` ; cette méthode ne fait que
     * traduire la configuration de la carte en paramètres de scène. Les positions
     * écran renvoyées sont mémorisées dans `_plot3d`, d'où le test de survol les
     * relit : rejouer la projection à chaque mouvement de souris coûterait un
     * cadrage complet pour rien.
     * @param {CanvasRenderingContext2D} ctx - Contexte de dessin, en pixels CSS
     * @param {number} width - Largeur du canvas en pixels CSS
     * @param {number} height - Hauteur du canvas en pixels CSS
     */
    _draw3DChart(ctx, width, height) {
        const bounds = this._calculateChartBounds();
        // `tempToX`/`humidityToY` ne servent pas en 3D, mais `_currentBounds` reste lu
        // ailleurs : le laisser périmé ferait diverger les deux modes après bascule.
        this._currentBounds = bounds;

        const palette = this._palette();
        const comfortRange = this.config.comfortRange ? {
            tempMin: this.toInternalTemp(this.config.comfortRange.tempMin),
            tempMax: this.toInternalTemp(this.config.comfortRange.tempMax),
            rhMin: this.config.comfortRange.rhMin,
            rhMax: this.config.comfortRange.rhMax
        } : { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

        const scale = Math.max(0.5, Math.min(width / 800, height / 600));
        const axisFont = Math.max(MIN_AXIS_FONT, 12 * scale);
        // Même principe qu'en 2D : sous une certaine taille, c'est la densité qui cède,
        // jamais la police. En perspective les étiquettes se croisent d'autant plus vite
        // que le plan est vu de biais, d'où un encombrement estimé plus large.
        const minimal = this._displayMode() === 'minimal' || width < 340 || height < 260;
        const tempStep = pickAxisStep(
            bounds.maxTemp - bounds.minTemp, width, axisFont * 4.5, 5, [1, 2, 4, 10]
        );

        this._plot3d = drawScene3D(ctx, {
            width, height, bounds, palette, comfortRange, axisFont, tempStep, minimal,
            points: this._currentPoints || [],
            camera: this._cam3d,
            metric: this._heightMetric(),
            // La zone de confort porte déjà l'opacité choisie par l'utilisateur via
            // `comfortOpacity`, que `_palette()` a appliquée : on la relit plutôt que
            // d'ajouter une seconde option qui dirait la même chose.
            comfortOpacity: PsychrometricCalculations.colorToAlpha(palette.comfort),
            showEnthalpy: this.config.showEnthalpy !== false,
            showPointLabels: this.config.showPointLabels !== false,
            showPlane: this.config.show3dPlane !== true,
            comfortLabel: this.t('comfortZone'),
            // Le nom seul, comme les étiquettes du mode 2D : y ajouter température et
            // humidité donnait des vignettes si larges qu'à six capteurs elles recouvraient
            // le diagramme. Le détail reste dans l'infobulle et les cartes de données.
            chipText: (point) => point.label,
            formatTempAxis: (temp) =>
                `${Math.round(this.toDisplayTemp(temp))}${this.getTempUnit()}`,
        });
    }

    /**
     * Find the sensor drawn under the pointer in 3D.
     *
     * Le rayon de capture suit celui de la pastille dessinée — elle rétrécit avec la
     * distance — avec un plancher pour rester atteignable au doigt.
     * @param {number} x - Abscisse du pointeur, en pixels CSS du canvas
     * @param {number} y - Ordonnée du pointeur, en pixels CSS du canvas
     * @returns {Object|null} Point survolé, ou null
     */
    _pointAt3D(x, y) {
        const sensors = this._plot3d?.sensors;
        if (!sensors?.length) return null;

        let found = null;
        let best = Infinity;
        for (const sensor of sensors) {
            const distance = Math.hypot(x - sensor.x, y - sensor.y);
            // Deux pastilles peuvent se superposer : on garde la plus proche du
            // curseur plutôt que la dernière rencontrée.
            if (distance < Math.max(14, sensor.radius * 1.6) && distance < best) {
                best = distance;
                const point = this._currentPoints?.[sensor.index];
                if (point) found = { ...point, index: sensor.index };
            }
        }
        return found;
    }

    /**
     * Bascule la caméra sur une orientation prédéfinie.
     * @param {string} view - '3d' ou 'top'
     */
    _setView3d(view) {
        this._cam3d = { ...(VIEWS[view] || VIEWS['3d']), zoom: 1 };
        this._view3d = VIEWS[view] ? view : '3d';
        this._hoveredPoint = null;
        this._persistCam3d();
        this._drawChart();
    }

    /**
     * Début d'un glissement de caméra, ou d'un pincement au second doigt.
     * @param {PointerEvent} e - Événement pointeur
     */
    _handlePointerDown(e) {
        // Seul le bouton principal fait pivoter : un clic droit ouvre le menu
        // contextuel et ne rendrait jamais son `pointerup`, laissant un glissement
        // fantôme collé au curseur.
        if (e.button) return;
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas) return;
        // La capture garde le geste actif même si le pointeur sort du canvas.
        // Elle lève une exception si le pointeur n'est déjà plus actif (doigt levé
        // entre l'événement et son traitement) : ce n'est pas une raison d'abandonner
        // le geste, la rotation fonctionne sans capture tant qu'on reste sur le canvas.
        try { canvas.setPointerCapture?.(e.pointerId); } catch { /* pointeur déjà relâché */ }
        this._pointers3d.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._pointers3d.size >= 2) {
            // Deux doigts : on passe en pincement et on abandonne la rotation en
            // cours, sinon le déplacement du premier doigt ferait tourner la scène
            // pendant qu'on zoome.
            this._drag3d = null;
            this._pinch3d = { distance: this._pinchDistance(), zoom: this._cam3d.zoom };
            return;
        }
        this._pinch3d = null;
        this._drag3d = { x: e.clientX, y: e.clientY, moved: 0 };
        canvas.style.cursor = 'grabbing';
    }

    /**
     * Écart entre les deux premiers pointeurs actifs, en pixels.
     * @returns {number} Distance, ou 0 s'il y a moins de deux pointeurs
     */
    _pinchDistance() {
        const [a, b] = [...this._pointers3d.values()];
        if (!a || !b) return 0;
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    /**
     * Rotation au glissement, zoom au pincement, survol au simple déplacement.
     *
     * Le redessin est appelé directement plutôt que par un état réactif : passer par
     * le cycle de Lit recalculerait les points à chaque image du geste.
     * @param {PointerEvent} e - Événement pointeur
     */
    _handlePointerMove(e) {
        if (this._pointers3d.has(e.pointerId)) {
            this._pointers3d.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }

        // Pincement : l'écartement des doigts pilote la distance de caméra. C'est le
        // seul geste de zoom tactile — la molette n'existe pas sur mobile, et un
        // curseur à l'écran mangerait la place du graphique.
        if (this._pinch3d) {
            const distance = this._pinchDistance();
            if (distance > 0 && this._pinch3d.distance > 0) {
                // `zoom` multiplie la distance de cadrage : écarter les doigts
                // rapproche la caméra, donc diminue le facteur.
                this._setZoom3d(this._pinch3d.zoom * (this._pinch3d.distance / distance));
            }
            return;
        }

        if (!this._drag3d) {
            this._handleMouseMove(e);
            return;
        }
        const dx = e.clientX - this._drag3d.x;
        const dy = e.clientY - this._drag3d.y;
        this._drag3d.x = e.clientX;
        this._drag3d.y = e.clientY;
        this._drag3d.moved += Math.abs(dx) + Math.abs(dy);

        // Mêmes conventions qu'OrbitControls : glisser vers la droite fait tourner la
        // scène vers la droite, glisser vers le bas relève la caméra vers la verticale.
        this._cam3d.yaw -= dx * 0.008;
        this._cam3d.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, this._cam3d.pitch - dy * 0.006));
        // L'infobulle pointerait une pastille qui a bougé sous le curseur.
        this._hoveredPoint = null;
        this._markFreeView3d();
        this._persistCam3d();
        this._drawChart();
    }

    /**
     * Fin d'un geste. Un déplacement négligeable reste un clic.
     * @param {PointerEvent} e - Événement pointeur
     */
    _handlePointerUp(e) {
        const drag = this._drag3d;
        const wasPinching = Boolean(this._pinch3d);
        this._pointers3d.delete(e.pointerId);

        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (canvas) {
            try { canvas.releasePointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
            canvas.style.cursor = 'grab';
        }

        if (this._pointers3d.size >= 2) {
            // Un troisième doigt s'est levé : repartir de l'écart courant, sinon le
            // zoom sauterait d'un coup au prochain mouvement.
            this._pinch3d = { distance: this._pinchDistance(), zoom: this._cam3d.zoom };
            return;
        }

        this._pinch3d = null;
        this._drag3d = null;

        if (this._pointers3d.size === 1) {
            // Le doigt restant reprend la rotation depuis sa position actuelle : sans
            // cette réinitialisation, la scène ferait un bond à la fin du pincement.
            const [remaining] = [...this._pointers3d.values()];
            this._drag3d = { x: remaining.x, y: remaining.y, moved: 0 };
            return;
        }

        // Sans ce seuil, ouvrir l'historique deviendrait impossible : le moindre
        // frémissement de la souris pendant le clic compterait comme une rotation.
        // Un pincement, lui, n'ouvre jamais l'historique.
        if (!wasPinching && drag && drag.moved < 5) this._handleCanvasClick(e);
    }

    /**
     * Applique un facteur de zoom borné et redessine.
     *
     * Les bornes empêchent de traverser la scène ou de la réduire à un point : le
     * cadrage automatique ne sert plus de garde-fou dès que l'utilisateur zoome.
     * @param {number} zoom - Facteur multiplicatif de la distance de cadrage
     */
    _setZoom3d(zoom) {
        const clamped = Math.min(ZOOM3D_MAX, Math.max(ZOOM3D_MIN, zoom));
        if (clamped === this._cam3d.zoom) return;
        this._cam3d.zoom = clamped;
        this._markFreeView3d();
        this._persistCam3d();
        this._drawChart();
    }

    /**
     * Clé de stockage de la vue 3D, propre à cette carte.
     *
     * Deux cartes d'un même tableau de bord doivent garder des vues distinctes, mais
     * une carte doit retrouver la sienne d'une ouverture à l'autre : la clé dérive
     * donc de la configuration (titre et capteurs), et non d'un identifiant
     * d'instance, qui changerait à chaque montage.
     * @returns {string|null} Clé de stockage, ou null si la carte n'a aucun capteur
     */
    _cam3dStorageKey() {
        const ids = this._watchedEntityIds();
        if (!ids.length) return null;
        return CAM3D_STORAGE_PREFIX + [this.config?.title || '', ...ids].join('|');
    }

    /**
     * Restaure la vue 3D mémorisée pour cette configuration, si elle existe.
     *
     * Sans effet en mode 2D : la caméra n'y sert pas, et la vue reste mémorisée pour
     * un retour ultérieur en 3D.
     */
    _restoreCam3d() {
        const key = this._cam3dStorageKey();
        if (!key) return;
        // L'éditeur rappelle `setConfig()` à chaque frappe : si un enregistrement est
        // encore en attente, la vue affichée est plus récente que celle du stockage —
        // l'écrire plutôt que ramener la caméra en arrière.
        if (this._cam3dSaveTimer) {
            this._writeCam3d();
            return;
        }
        let stored = null;
        try {
            // Le stockage local peut être indisponible (navigation privée, cookies
            // bloqués) ou contenir une entrée corrompue : une vue non retrouvée n'est
            // pas une raison d'empêcher la carte de s'afficher.
            stored = JSON.parse(window.localStorage?.getItem(key) || 'null');
        } catch {
            stored = null;
        }
        if (!stored || typeof stored !== 'object') return;
        const yaw = Number(stored.yaw);
        const pitch = Number(stored.pitch);
        const zoom = Number(stored.zoom);
        if (!Number.isFinite(yaw) || !Number.isFinite(pitch) || !Number.isFinite(zoom)) return;
        // Les valeurs viennent du disque : les borner comme le font les gestes. Une
        // inclinaison hors bornes ferait passer la caméra sous le plan, ce qui casse
        // l'ordre de dessin par couches du mode 3D.
        this._cam3d = {
            yaw,
            pitch: Math.min(PITCH_MAX, Math.max(PITCH_MIN, pitch)),
            zoom: Math.min(ZOOM3D_MAX, Math.max(ZOOM3D_MIN, zoom)),
        };
        this._view3d = VIEWS[stored.view] ? stored.view : 'free';
        // La géométrie mémorisée décrit l'ancienne caméra.
        this._plot3d = null;
    }

    /**
     * Programme l'enregistrement de la vue courante.
     *
     * Une rotation émet des dizaines d'événements par seconde et le stockage local est
     * synchrone : n'écrire qu'une fois le geste retombé.
     */
    _persistCam3d() {
        clearTimeout(this._cam3dSaveTimer);
        this._cam3dSaveTimer = setTimeout(() => this._writeCam3d(), 400);
    }

    /** Écrit immédiatement la vue courante dans le stockage local. */
    _writeCam3d() {
        clearTimeout(this._cam3dSaveTimer);
        this._cam3dSaveTimer = null;
        const key = this._cam3dStorageKey();
        if (!key) return;
        try {
            window.localStorage?.setItem(key, JSON.stringify({ ...this._cam3d, view: this._view3d }));
        } catch {
            // Stockage indisponible ou saturé : la vue ne sera simplement pas mémorisée.
        }
    }

    /**
     * Signale que la caméra ne correspond plus à une vue prédéfinie.
     * Décoche le bouton de vue actif, sans redessiner : l'appelant s'en charge.
     */
    _markFreeView3d() {
        if (this._view3d !== 'free') this._view3d = 'free';
    }

    /**
     * Zoom à la molette autour du cadrage automatique.
     * @param {WheelEvent} e - Événement molette
     */
    _handleWheel(e) {
        // Sans cela, la molette ferait défiler le tableau de bord sous le graphique.
        e.preventDefault();
        this._setZoom3d(this._cam3d.zoom * Math.exp(e.deltaY * 0.0012));
    }
    /**
     * Build the constant-wet-bulb lines as (temp, rh) samples.
     *
     * These lines only depend on the temperature bounds, never on the entity states,
     * so they are cached: the previous implementation re-ran a nested search calling
     * `calculateWetBulbTemp` ~18 800 times on every redraw.
     * @param {Object} bounds - Chart bounds
     * @returns {Array<Array<{temp: number, rh: number}>>} One sample list per line
     */
    _wetBulbLines(bounds) {
        const key = `${bounds.minTemp}/${bounds.maxTemp}`;
        if (this._wetBulbCache?.key === key) return this._wetBulbCache.lines;

        const lines = [];
        const startTw = Math.ceil(bounds.minTemp / 5) * 5;
        const endTw = Math.floor(bounds.maxTemp / 5) * 5;

        for (let tw = startTw; tw <= endTw; tw += 5) {
            const samples = [];
            // La ligne part de la saturation (t = tw) et s'étend vers les températures
            // sèches croissantes ; la teneur en eau y est donnée en forme close.
            for (let t = tw; t <= bounds.maxTemp; t += 0.5) {
                const W = PsychrometricCalculations.calculateWaterContentFromWetBulb(t, tw);
                if (W <= 0) break;
                const P_v = PsychrometricCalculations.waterContentToVaporPressure(W);
                const rh = (P_v / PsychrometricCalculations.calculateSaturationPressure(t)) * 100;
                if (rh <= 0) break;
                samples.push({ temp: t, rh });
            }
            if (samples.length > 1) lines.push(samples);
        }

        this._wetBulbCache = { key, lines };
        return lines;
    }

    /**
     * Convert temperature to X coordinate.
     * @param {number} temp - Temperature in Celsius
     * @returns {number} X coordinate
     */
    tempToX(temp) {
        const bounds = this._currentBounds || this._calculateChartBounds();
        // `_drawChart()` renseigne `_currentLayout` avant tout tracé : la projection et
        // le dessin partagent ainsi exactement la même géométrie, y compris hors dessin
        // (test de survol) où la mise en page est simplement recalculée à l'identique.
        const { leftPadding, rightEdge } = this._currentLayout || this._chartLayout();
        const chartWidth = rightEdge - leftPadding;

        const tempRange = bounds.maxTemp - bounds.minTemp;
        return leftPadding + ((temp - bounds.minTemp) / tempRange) * chartWidth;
    }

    /**
     * Convert humidity to Y coordinate.
     * The Y axis carries vapor pressure: minPv sits on the bottom edge, maxPv on top.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Y coordinate
     */
    humidityToY(temp, humidity) {
        const bounds = this._currentBounds || this._calculateChartBounds();
        const { topPadding, bottomEdge } = this._currentLayout || this._chartLayout();
        const chartHeight = bottomEdge - topPadding;

        const P_v = PsychrometricCalculations.calculateVaporPressure(temp, humidity);
        const pvRange = bounds.maxPv - bounds.minPv;

        return bottomEdge - ((P_v - bounds.minPv) / pvRange) * chartHeight;
    }

    /**
     * Handle mouse move event on canvas.
     * @param {MouseEvent} e - Mouse event
     */
    _handleMouseMove(e) {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas) return;

        const point = this._pointAt(e);
        // Hors d'un point, le curseur annonce ce que fait un glissement : viser en 2D,
        // faire pivoter la scène en 3D.
        const idle = this._chartMode() === '3d' ? 'grab' : 'crosshair';
        canvas.style.cursor = point ? 'pointer' : idle;
        this._hoveredPoint = point;
        if (point) this._tooltipPos = { x: e.clientX + 15, y: e.clientY + 15 };
    }

    /**
     * Handle mouse leave event on canvas.
     */
    _handleMouseLeave() {
        this._hoveredPoint = null;
    }

    /**
     * Handle click on canvas: open the history of the point under the cursor.
     * @param {MouseEvent} e - Mouse event
     */
    _handleCanvasClick(e) {
        const point = this._pointAt(e);
        if (point) this._openHistory(point.tempEntityId, 'temperature');
    }

    /**
     * Find the point drawn under the pointer, if any.
     * @param {MouseEvent} e - Mouse event
     * @returns {Object|null} Point data, or null when the pointer is over empty space
     */
    _pointAt(e) {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas || !this._currentPoints?.length) return null;

        // Le contexte dessine en pixels CSS : ramener le pointeur dans ce repère.
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const x = (e.clientX - rect.left) * (this._canvasWidth / rect.width);
        const y = (e.clientY - rect.top) * (this._canvasHeight / rect.height);

        // En 3D la position d'une pastille ne se déduit pas de la température seule :
        // elle vient de la projection du dernier dessin, mémorisée dans `_plot3d`.
        if (this._chartMode() === '3d') return this._pointAt3D(x, y);

        let found = null;
        this._currentPoints.forEach((point, index) => {
            const dx = x - this.tempToX(point.temp);
            const dy = y - this.humidityToY(point.temp, point.humidity);
            if (Math.sqrt(dx * dx + dy * dy) < 15) found = { ...point, index };
        });
        return found;
    }

    /**
     * Render the hover tooltip.
     * Rendered through Lit inside the shadow root rather than injected into
     * document.body as HTML: labels stay plain text, no node is created per
     * mousemove, and the tooltip cannot outlive the card.
     * @returns {TemplateResult} HTML template
     */
    renderTooltip() {
        const point = this._hoveredPoint;
        if (!point) return '';
        return html`
            <div class="tooltip"
                 style="left: ${this._tooltipPos.x}px; top: ${this._tooltipPos.y}px; border-left-color: ${point.color}">
                <div class="tooltip-title" style="color: ${point.color}">${point.label}</div>
                <div>🌡️ ${this.t('temperature')}: <strong>${this.formatTemp(point.temp)}</strong></div>
                <div>💧 ${this.t('humidity')}: <strong>${point.humidity.toFixed(1)}%</strong></div>
                <div class="tooltip-hint">${this.t('clickToViewHistory')}</div>
            </div>
        `;
    }

    /**
     * Open history modal for an entity.
     * @param {string} entityId - Entity ID
     * @param {string} type - 'temperature' or 'humidity'
     */
    async _openHistory(entityId, type) {
        // Les deux entités du point sont récupérées ensemble : la modale superpose la
        // température et l'humidité sur le même axe de temps, et en déduit le point de
        // rosée. Le point est retrouvé depuis l'entité cliquée, les appelants (carte de
        // données, clic sur le graphique, clavier) ne transmettant qu'un identifiant.
        const point = (this._currentPoints || []).find(
            p => p.tempEntityId === entityId || p.humidityEntityId === entityId
        ) || null;

        this._selectedEntity = entityId;
        this._selectedType = type;
        this._historyPoint = point;
        this._modalOpen = true;
        this._historyData = null;
        this._historyCursor = null;
        this._historyHidden = [];
        // Échap ferme la modale : l'écouteur est posé sur la fenêtre, le focus pouvant
        // se trouver n'importe où dans le tableau de bord au moment du clic.
        window.addEventListener('keydown', this._onModalKeyDown);

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        this._historyEnd = endTime.getTime();

        const entityIds = point
            ? [point.tempEntityId, point.humidityEntityId]
            : [entityId];

        try {
            // minimal_response / no_attributes allègent nettement la réponse : seuls
            // `state` et `last_changed` sont exploités par le tracé.
            // significant_changes_only vaut 1 par défaut côté Home Assistant, et le filtre
            // « changement significatif » des capteurs écarte les variations inférieures à
            // 0.5 °C (1 % en humidité) : la courbe en ressortait quantifiée. On demande
            // donc explicitement la résolution complète.
            const url = `history/period/${startTime.toISOString()}`
                + `?filter_entity_id=${entityIds.map(encodeURIComponent).join(',')}`
                + `&end_time=${encodeURIComponent(endTime.toISOString())}`
                + `&significant_changes_only=0`
                + `&minimal_response&no_attributes`;
            const response = await this.hass.callApi('GET', url);
            // La requête a pu être doublée par des clics rapides : ignorer une réponse obsolète.
            if (this._selectedEntity !== entityId) return;
            this._historyData = this._parseHistory(response, point, type);
        } catch (error) {
            console.error('History error:', error);
            if (this._selectedEntity === entityId) this._historyData = { temperature: [], humidity: [], dewPoint: [] };
        }
    }

    /**
     * Parse the raw history response into the three drawable series.
     *
     * Entity states are already expressed in the display unit, so no temperature
     * conversion is applied to them. The dew point is the exception: it is computed
     * here, once, rather than at each draw — a 24 h window holds a few thousand samples.
     * @param {Array<Array<Object>>} response - Raw Home Assistant history response
     * @param {Object|null} point - Card point owning the entities, when known
     * @param {string} type - 'temperature' or 'humidity', the clicked series
     * @returns {Object} { temperature, humidity, dewPoint } sample lists
     */
    _parseHistory(response, point, type) {
        const byEntity = {};
        for (const list of response || []) {
            if (!Array.isArray(list) || list.length === 0) continue;
            // `minimal_response` ne conserve `entity_id` que sur le premier état : c'est
            // lui qui identifie la série, l'ordre des listes n'étant pas garanti.
            const id = list[0]?.entity_id;
            if (!id) continue;
            byEntity[id] = list
                .map(item => ({ time: new Date(item.last_changed).getTime(), value: parseFloat(item.state) }))
                .filter(sample => Number.isFinite(sample.value) && Number.isFinite(sample.time))
                .sort((a, b) => a.time - b.time);
        }

        // Sans point retrouvé, la seule série disponible est celle qui a été cliquée.
        const temperature = point ? (byEntity[point.tempEntityId] || []) : (type === 'temperature' ? byEntity[this._selectedEntity] || [] : []);
        const humidity = point ? (byEntity[point.humidityEntityId] || []) : (type === 'humidity' ? byEntity[this._selectedEntity] || [] : []);

        return { temperature, humidity, dewPoint: this._dewPointSeries(temperature, humidity) };
    }

    /**
     * Derive the dew point series from the temperature and humidity histories.
     *
     * Les deux capteurs n'enregistrent pas aux mêmes instants : `alignSeries` reporte la
     * dernière valeur connue de chacun avant de les apparier. Le calcul exige des
     * Celsius, alors que les états — et l'affichage — peuvent être en Fahrenheit.
     * @param {Array<{time: number, value: number}>} temperature - Temperature samples
     * @param {Array<{time: number, value: number}>} humidity - Humidity samples
     * @returns {Array<{time: number, value: number}>} Dew point samples, display unit
     */
    _dewPointSeries(temperature, humidity) {
        return alignSeries(temperature, humidity).map(({ time, a, b }) => {
            // Une humidité nulle rendrait le point de rosée infini (log(0)).
            const rh = Math.min(100, Math.max(0.01, b));
            const dewC = PsychrometricCalculations.calculateDewPoint(this.toInternalTemp(a), rh);
            return { time, value: this.toDisplayTemp(dewC) };
        });
    }

    /**
     * Describe every series the history modal can draw.
     * @returns {Array<Object>} Series descriptors, primary one first
     */
    _historySeries() {
        const data = this._historyData;
        if (!data) return [];

        const tempUnit = this.getTempUnit();
        const all = [
            { key: 'temperature', label: this.t('temperature'), color: '#ff9800', unit: tempUnit, axis: 'left', samples: data.temperature || [] },
            { key: 'humidity', label: this.t('humidity'), color: '#2196f3', unit: '%', axis: 'right', samples: data.humidity || [] },
            // Le point de rosée est une température : il partage l'axe de gauche, en
            // trait discontinu pour qu'on ne le confonde pas avec la mesure elle-même.
            { key: 'dewPoint', label: this.t('dewPoint'), color: '#4dd0e1', unit: tempUnit, axis: 'left', samples: data.dewPoint || [], dashed: true },
        ].filter(series => series.samples.length > 0);

        // La série cliquée passe devant : c'est elle que portent les tuiles de
        // statistiques, la bande de confort et les repères min/max.
        return all
            .map(series => ({ ...series, primary: series.key === this._selectedType }))
            .sort((a, b) => Number(b.primary) - Number(a.primary));
    }

    /**
     * Series actually drawn, once the legend toggles are applied.
     * @returns {Array<Object>} Visible series descriptors
     */
    _visibleHistorySeries() {
        const hidden = this._historyHidden || [];
        return this._historySeries().filter(series => !hidden.includes(series.key));
    }

    /**
     * Toggle one series from the history legend.
     * @param {string} key - Series key
     */
    _toggleHistorySeries(key) {
        const hidden = this._historyHidden || [];
        const next = hidden.includes(key) ? hidden.filter(k => k !== key) : [...hidden, key];
        // Tout masquer laisserait un graphique vide sans moyen évident de revenir :
        // la dernière série visible n'est pas décochable.
        if (next.length >= this._historySeries().length) return;
        this._historyHidden = next;
        this._historyCursor = null;
    }

    /**
     * Comfort band of the primary series, in display units.
     * @param {string} key - Series key
     * @returns {Object|null} { min, max } or null when the series has no comfort range
     */
    _historyComfortBand(key) {
        // `comfortRange` est déjà exprimé dans l'unité d'affichage, comme les états.
        const range = this.config?.comfortRange || {};
        if (key === 'temperature') {
            const min = parseFloat(range.tempMin ?? this.toDisplayTemp(20));
            const max = parseFloat(range.tempMax ?? this.toDisplayTemp(26));
            return Number.isFinite(min) && Number.isFinite(max) && max > min ? { min, max } : null;
        }
        if (key === 'humidity') {
            const min = parseFloat(range.rhMin ?? 40);
            const max = parseFloat(range.rhMax ?? 60);
            return Number.isFinite(min) && Number.isFinite(max) && max > min ? { min, max } : null;
        }
        return null;
    }

    /**
     * Compute the 24h statistics shown above the history chart.
     * @param {Array<{time: number, value: number}>} samples - History samples
     * @param {Object|null} band - Comfort band of the series, when it has one
     * @returns {Object|null} Statistics, or null when there is no data
     */
    _historyStats(samples, band = null) {
        if (!samples?.length) return null;

        // Un seul balayage : l'étalement `Math.min(...values)` dépasse la pile d'appels
        // sur les longues séries d'un enregistreur à pleine résolution.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (const sample of samples) {
            if (sample.value < min) min = sample.value;
            if (sample.value > max) max = sample.value;
            sum += sample.value;
        }

        return {
            min,
            max,
            avg: sum / samples.length,
            // Écart entre le premier et le dernier relevé de la période.
            trend: samples[samples.length - 1].value - samples[0].value,
            outside: band ? timeOutsideRange(samples, band.min, band.max, this._historyEnd) : null,
        };
    }

    /**
     * Close the history modal.
     */
    _closeModal() {
        this._modalOpen = false;
        this._historyData = null;
        this._historyCursor = null;
        this._historyPoint = null;
        this._historyPlot = null;
        window.removeEventListener('keydown', this._onModalKeyDown);
        this._historyResizeObserver?.disconnect();
        this._historyResizeObserver = null;
        this._historyResizeTarget = null;
    }

    /**
     * Close the modal on Escape.
     * @param {KeyboardEvent} e - Keyboard event
     */
    _handleModalKeyDown(e) {
        if (e.key === 'Escape' && this._modalOpen) this._closeModal();
    }

    /**
     * Draw the history chart in the modal.
     */
    _drawHistoryChart() {
        const canvas = this.shadowRoot.getElementById('historyChart');
        if (!canvas) return;

        const series = this._visibleHistorySeries();
        if (series.length === 0) return;

        const layout = this._historyLayout(canvas, series);
        if (!layout) return;
        this._historyPlot = layout;

        const { ctx, width, height, padding, textColor, gridColor, axes, toX, startTime, endTime } = layout;

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.font = '11px Arial';
        ctx.setLineDash([]);

        // Bande de confort de la série principale, tracée en premier : tout le reste se
        // pose dessus. C'est elle qui rend l'écart au confort lisible d'un coup d'œil.
        const primary = series.find(s => s.primary) || series[0];
        const band = this._historyComfortBand(primary.key);
        const primaryAxis = axes[primary.axis];
        // L'intersection est vérifiée **avant** l'écrêtage : une journée entièrement
        // au-dessus de la zone de confort verrait sinon ses bornes ramenées à celles de
        // l'axe, et la bande couvrirait tout le graphique au lieu de disparaître.
        if (band && primaryAxis && band.max > primaryAxis.min && band.min < primaryAxis.max) {
            const top = primaryAxis.toY(Math.min(band.max, primaryAxis.max));
            const bottom = primaryAxis.toY(Math.max(band.min, primaryAxis.min));
            ctx.fillStyle = this._palette().dark ? 'rgba(76, 175, 80, 0.14)' : 'rgba(76, 175, 80, 0.18)';
            ctx.fillRect(padding.left, top, width - padding.left - padding.right, bottom - top);
        }

        // Grille horizontale + libellés de l'axe de gauche
        const gridAxis = axes.left || axes.right;
        ctx.strokeStyle = gridColor;
        ctx.textBaseline = 'middle';
        for (let value = gridAxis.min; value <= gridAxis.max + gridAxis.step / 2; value += gridAxis.step) {
            const y = gridAxis.toY(value);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Chaque axe porte ses propres graduations, du côté de ses séries, et son unité
        // en tête : deux échelles sur un même cadre restaient sinon impossibles à lire.
        for (const [side, axis] of Object.entries(axes)) {
            ctx.fillStyle = axis.color;
            ctx.textAlign = side === 'left' ? 'right' : 'left';
            const x = side === 'left' ? padding.left - 6 : width - padding.right + 6;
            for (let value = axis.min; value <= axis.max + axis.step / 2; value += axis.step) {
                ctx.fillText(value.toFixed(axis.decimals), x, axis.toY(value));
            }
            ctx.textBaseline = 'bottom';
            ctx.fillText(axis.unit, x, padding.top - 6);
            ctx.textBaseline = 'middle';
        }

        // Grille verticale toutes les heures rondes, libellée toutes les 3 h
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const { time, labelled } of this._hourTicks(startTime, endTime)) {
            const x = toX(time);
            ctx.strokeStyle = gridColor;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
            if (labelled) {
                ctx.fillStyle = textColor;
                ctx.fillText(this._formatTime(new Date(time)), x, height - padding.bottom + 8);
            }
        }

        // Seule la série principale porte une aire dégradée, et elle est posée avant tous
        // les traits : peinte après, son voile teintait les autres courbes.
        if (primaryAxis) {
            const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            gradient.addColorStop(0, `${primary.color}40`);
            gradient.addColorStop(1, `${primary.color}00`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(toX(primary.samples[0].time), height - padding.bottom);
            for (const sample of primary.samples) ctx.lineTo(toX(sample.time), primaryAxis.toY(sample.value));
            ctx.lineTo(toX(primary.samples[primary.samples.length - 1].time), height - padding.bottom);
            ctx.closePath();
            ctx.fill();
        }

        // Séries : la principale est tracée en dernier, donc au-dessus des autres.
        for (const item of [...series].reverse()) {
            const axis = axes[item.axis];
            if (!axis) continue;
            const toY = axis.toY;

            ctx.setLineDash(item.dashed ? [4, 3] : []);
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.primary ? 1.8 : 1.3;
            ctx.globalAlpha = item.primary ? 1 : 0.8;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            item.samples.forEach((sample, index) => {
                const x = toX(sample.time);
                const y = toY(sample.value);
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;

            // Dernière valeur, mise en évidence
            const last = item.samples[item.samples.length - 1];
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(toX(last.time), toY(last.value), item.primary ? 3 : 2.5, 0, 2 * Math.PI);
            ctx.fill();
        }

        this._drawHistoryExtremes(layout, primary);
    }

    /**
     * Mark the lowest and highest samples of the primary series.
     *
     * Les tuiles donnent déjà les valeurs : les repères disent *quand* elles ont eu lieu,
     * ce que la courbe seule ne permet pas de situer précisément.
     * @param {Object} layout - History chart layout
     * @param {Object} series - Primary series descriptor
     */
    _drawHistoryExtremes(layout, series) {
        const { ctx, axes, toX, padding, width } = layout;
        const axis = axes[series.axis];
        if (!axis || series.samples.length < 2) return;

        let lowest = series.samples[0];
        let highest = series.samples[0];
        for (const sample of series.samples) {
            if (sample.value < lowest.value) lowest = sample;
            if (sample.value > highest.value) highest = sample;
        }
        if (lowest.value === highest.value) return;

        ctx.font = '10px Arial';
        ctx.textBaseline = 'middle';
        for (const [sample, above] of [[highest, true], [lowest, false]]) {
            const x = toX(sample.time);
            const y = axis.toY(sample.value);
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = layout.bgColor;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = series.color;
            ctx.stroke();

            const label = `${above ? '▲' : '▼'} ${sample.value.toFixed(1)}${series.unit}`;
            // L'étiquette bascule du côté où il reste de la place, sans quoi un extremum
            // survenu en début ou en fin de période sortirait du cadre.
            const textWidth = ctx.measureText(label).width;
            ctx.textAlign = x + textWidth + 10 > width - padding.right ? 'right' : 'left';
            const offset = ctx.textAlign === 'right' ? -8 : 8;
            ctx.fillStyle = series.color;
            ctx.fillText(label, x + offset, above ? y - 10 : y + 10);
        }
        ctx.textAlign = 'left';
    }

    /**
     * Geometry of the history chart: canvas sizing, axes and time projection.
     *
     * Mémorisée dans `_historyPlot` par `_drawHistoryChart()` : le curseur de survol s'en
     * sert pour retrouver l'instant sous le pointeur sans recalculer la mise en page.
     * @param {HTMLCanvasElement} canvas - Chart canvas
     * @param {Array<Object>} series - Visible series
     * @returns {Object|null} Layout, or null when the canvas has no usable size
     */
    _historyLayout(canvas, series) {
        const width = canvas.offsetWidth;
        // La hauteur vient du CSS (clamp responsive) et non plus d'un 300 px codé en dur.
        const height = canvas.offsetHeight || 300;
        if (!width || !height) return null;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const palette = this._palette();
        const hasRight = series.some(s => s.axis === 'right');
        const hasLeft = series.some(s => s.axis === 'left');
        const padding = { left: hasLeft ? 44 : 16, right: hasRight ? 44 : 16, top: 28, bottom: 30 };
        const plotHeight = height - padding.top - padding.bottom;
        const plotWidth = width - padding.left - padding.right;

        /**
         * Build one Y axis over the series that share it.
         * @param {string} side - 'left' or 'right'
         * @returns {Object|null} Axis with its projection, or null when unused
         */
        const buildAxis = (side) => {
            const sides = series.filter(s => s.axis === side);
            if (!sides.length) return null;
            // Balayage plutôt que `Math.min(...values)` : une fenêtre de 24 h à pleine
            // résolution porte des milliers d'échantillons, et l'étalement en arguments
            // finit par dépasser la pile d'appels.
            let min = Infinity;
            let max = -Infinity;
            for (const item of sides) {
                for (const sample of item.samples) {
                    if (sample.value < min) min = sample.value;
                    if (sample.value > max) max = sample.value;
                }
            }
            if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
            // Graduations sur des valeurs rondes : l'échelle se calait auparavant sur
            // `min + i/5 · plage`, d'où des repères illisibles du type 26.1 / 28.1 / 30.1.
            const scale = PsychrometricCalculations.niceScale(min, max, 6);
            const span = (scale.max - scale.min) || 1;
            return {
                ...scale,
                // Les séries d'un même axe partagent forcément l'unité : température et
                // point de rosée à gauche, humidité à droite.
                unit: sides[0].unit,
                // L'axe de droite reprend la couleur de sa série : deux échelles
                // différentes sur un même cadre seraient sinon impossibles à attribuer.
                color: side === 'right'
                    ? (series.find(s => s.axis === 'right')?.color ?? palette.text)
                    : palette.text,
                toY: value => height - padding.bottom - ((value - scale.min) / span) * plotHeight,
            };
        };

        const axes = {};
        const left = buildAxis('left');
        const right = buildAxis('right');
        if (left) axes.left = left;
        if (right) axes.right = right;

        // L'axe X porte le temps réel : un espacement par index déformerait la
        // chronologie, l'historique HA étant échantillonné irrégulièrement.
        const times = series.flatMap(s => [s.samples[0].time, s.samples[s.samples.length - 1].time]);
        const startTime = Math.min(...times);
        const endTime = Math.max(...times);
        const timeSpan = endTime - startTime || 1;

        return {
            ctx, width, height, padding, plotWidth, plotHeight, axes,
            startTime, endTime, timeSpan,
            textColor: palette.text,
            bgColor: palette.bg,
            gridColor: palette.dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            toX: time => padding.left + ((time - startTime) / timeSpan) * plotWidth,
        };
    }

    /**
     * Track the pointer over the history chart.
     *
     * Le curseur est un calque distinct : redessiner les courbes à chaque mouvement
     * coûterait un parcours complet des milliers d'échantillons de la période.
     * @param {PointerEvent} e - Pointer event
     */
    _handleHistoryPointer(e) {
        const layout = this._historyPlot;
        const canvas = this.shadowRoot?.getElementById('historyChart');
        if (!layout || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const x = (e.clientX - rect.left) * (layout.width / rect.width);
        if (x < layout.padding.left || x > layout.width - layout.padding.right) {
            this._historyCursor = null;
            return;
        }

        const time = layout.startTime
            + ((x - layout.padding.left) / layout.plotWidth) * layout.timeSpan;
        const readings = this._visibleHistorySeries()
            .map(item => {
                const sample = this._sampleNear(item.samples, time);
                return sample ? { key: item.key, label: item.label, color: item.color, unit: item.unit, value: sample.value, axis: item.axis } : null;
            })
            .filter(Boolean);

        this._historyCursor = readings.length ? { x, time, readings } : null;
    }

    /**
     * Sample closest to a given time, by binary search.
     * @param {Array<{time: number, value: number}>} samples - Chronological samples
     * @param {number} time - Target time, epoch ms
     * @returns {Object|null} Closest sample
     */
    _sampleNear(samples, time) {
        if (!samples?.length) return null;
        let low = 0;
        let high = samples.length - 1;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (samples[mid].time < time) low = mid + 1;
            else high = mid;
        }
        const after = samples[low];
        const before = samples[Math.max(0, low - 1)];
        return Math.abs(after.time - time) < Math.abs(time - before.time) ? after : before;
    }

    /**
     * Draw the hover crosshair on its own overlay canvas.
     */
    _drawHistoryCursor() {
        const canvas = this.shadowRoot?.getElementById('historyCursor');
        const layout = this._historyPlot;
        if (!canvas || !layout) return;

        const { width, height, padding } = layout;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const cursor = this._historyCursor;
        if (!cursor) return;

        ctx.strokeStyle = this._palette().dark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cursor.x, padding.top);
        ctx.lineTo(cursor.x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        for (const reading of cursor.readings) {
            const axis = layout.axes[reading.axis];
            if (!axis) continue;
            ctx.beginPath();
            ctx.arc(cursor.x, axis.toY(reading.value), 4, 0, 2 * Math.PI);
            ctx.fillStyle = reading.color;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = layout.bgColor;
            ctx.stroke();
        }
    }


    /**
     * Whole-hour gridline positions across a time span.
     * @param {number} startTime - Range start, epoch ms
     * @param {number} endTime - Range end, epoch ms
     * @returns {Array<{time: number, labelled: boolean}>} Tick positions
     */
    _hourTicks(startTime, endTime) {
        const hour = 3600 * 1000;
        const ticks = [];
        const first = new Date(startTime);
        first.setMinutes(0, 0, 0);
        let time = first.getTime();
        if (time < startTime) time += hour;

        // Sur 24 h, une graduation par heure et un libellé toutes les 3 h : au-delà,
        // les libellés se chevauchent sur une carte étroite.
        for (; time <= endTime; time += hour) {
            ticks.push({ time, labelled: new Date(time).getHours() % 3 === 0 });
        }
        return ticks;
    }

    /**
     * Format a time using the Home Assistant locale rather than a hardcoded one.
     * @param {Date} date - Date to format
     * @returns {string} Localized time
     */
    _formatTime(date) {
        const locale = this.hass?.locale?.language || this._language;
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Render the history modal.
     * @returns {TemplateResult} HTML template
     */
    renderHistoryModal() {
        const palette = this._palette();
        const textColor = palette.text;
        const bgColor = palette.bg;

        const series = this._historySeries();
        const visible = this._visibleHistorySeries();
        const primary = visible.find(s => s.primary) || visible[0] || null;
        const band = primary ? this._historyComfortBand(primary.key) : null;
        const stats = primary ? this._historyStats(primary.samples, band) : null;
        const unit = primary?.unit ?? '';

        // Le titre porte le nom du point dès qu'on a pu le retrouver : la modale montre
        // désormais ses deux capteurs, pas seulement la grandeur cliquée.
        const subject = this._historyPoint?.label
            ?? (this._selectedType === 'temperature' ? this.t('temperature') : this.t('humidity'));

        const hidden = this._historyHidden || [];
        const cursor = this._historyCursor;
        const plotWidth = this._historyPlot?.width || 0;
        const cursorRatio = cursor && plotWidth ? cursor.x / plotWidth : 0;

        return html`
            <div class="modal-overlay" @click="${(e) => e.target.classList.contains('modal-overlay') && this._closeModal()}">
                <div class="modal-content" style="background: ${bgColor}; color: ${textColor}">
                    <button class="modal-close" @click="${this._closeModal}" style="color: ${textColor}"
                            aria-label="${this.t('close')}">×</button>
                    <h2 style="margin-top: 0">${this.t('historyLast24h')} — ${subject}</h2>
                    ${this._historyData === null ? html`<div class="history-empty">${this.t('historyLoading')}</div>` : ''}
                    ${this._historyData !== null && series.length === 0 ? html`<div class="history-empty">${this.t('historyEmpty')}</div>` : ''}
                    ${series.length > 0 ? html`
                        ${stats ? html`
                            <div class="history-stats-caption">
                                <span class="history-legend-dot" style="background: ${primary.color}"></span>
                                <span>${primary.label}</span>
                            </div>
                            <div class="history-stats">
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statMin')}</span>
                                    <span class="history-stat-value">${stats.min.toFixed(1)}${unit}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statAvg')}</span>
                                    <span class="history-stat-value">${stats.avg.toFixed(1)}${unit}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statMax')}</span>
                                    <span class="history-stat-value">${stats.max.toFixed(1)}${unit}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statTrend')}</span>
                                    <span class="history-stat-value">${this._formatTrend(stats.trend, unit)}</span>
                                </div>
                                ${stats.outside !== null ? html`
                                    <div class="history-stat">
                                        <span class="history-stat-label">${this.t('statOutOfComfort')}</span>
                                        <span class="history-stat-value">${Math.round(stats.outside * 100)}%</span>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}

                        <div class="history-legend">
                            ${series.map(item => html`
                                <button class="history-legend-item ${hidden.includes(item.key) ? 'off' : ''}"
                                        @click="${() => this._toggleHistorySeries(item.key)}"
                                        aria-pressed="${!hidden.includes(item.key)}">
                                    <span class="history-legend-dot ${item.dashed ? 'dashed' : ''}"
                                          style="background: ${item.color}"></span>
                                    <span>${item.label}</span>
                                </button>
                            `)}
                        </div>

                        <div class="history-chart-wrap"
                             @pointermove="${this._onHistoryPointer}"
                             @pointerdown="${this._onHistoryPointer}"
                             @pointerleave="${this._onHistoryPointerLeave}">
                            <canvas id="historyChart" class="history-chart"></canvas>
                            <canvas id="historyCursor" class="history-cursor"></canvas>
                            ${cursor ? html`
                                <div class="history-tooltip ${cursorRatio > 0.5 ? 'at-left' : 'at-right'}"
                                     style="background: ${bgColor}">
                                    <div class="history-tooltip-time">${this._formatTime(new Date(cursor.time))}</div>
                                    ${cursor.readings.map(reading => html`
                                        <div class="history-tooltip-row">
                                            <span class="history-legend-dot" style="background: ${reading.color}"></span>
                                            <span class="history-tooltip-label">${reading.label}</span>
                                            <span class="history-tooltip-value">${reading.value.toFixed(1)}${reading.unit}</span>
                                        </div>
                                    `)}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Format the trend shown in the statistics tiles.
     * @param {number} trend - Difference between the last and first sample
     * @param {string} unit - Display unit
     * @returns {string} Signed, arrowed trend
     */
    _formatTrend(trend, unit) {
        // Sous un dixième d'unité, la flèche suggérerait une évolution que la précision
        // du capteur ne permet pas d'affirmer.
        if (Math.abs(trend) < 0.1) return `→ 0${unit}`;
        return `${trend > 0 ? '↑' : '↓'} ${Math.abs(trend).toFixed(1)}${unit}`;
    }

    /**
     * Handle key down event for accessibility.
     * @param {KeyboardEvent} e - Keyboard event
     * @param {string} entityId - Entity ID
     * @param {string} type - 'temperature' or 'humidity'
     */
    _handleKeyDown(e, entityId, type) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._openHistory(entityId, type);
        }
    }

    /**
     * Main render method.
     * @returns {TemplateResult} HTML template
     */
    /**
     * Determine if a field should be shown for a point.
     * @param {Object} point - Point data
     * @param {string} field - Field name
     * @returns {boolean}
     */
    _shouldShowField(point, field) {
        // Le niveau de détail est un interrupteur maître au-dessus du réglage par point :
        //   minimal  : la carte se réduit à température, humidité et badge de confort
        //   custom   : c'est `point.details` qui décide — les cases cochées sur le point
        //   detailed : tous les champs, quel que soit `point.details`
        const mode = this._displayMode();
        if (mode === 'minimal') return false;
        if (mode === 'detailed') return true;

        // If point has specific details configured, use them
        // Fix: check if details is an array, even if empty.
        // If it is an array, it means the user has explicitly configured this point.
        if (point.details && Array.isArray(point.details)) {
            return point.details.includes(field);
        }

        // Aucun `details` sur le point : repli sur les champs les plus courants.
        // Doit rester aligné avec DEFAULT_DETAILS dans l'éditeur.
        const defaultFields = ['dewPoint', 'wetBulb', 'apparentTemp', 'enthalpy', 'pmvIndex'];
        return defaultFields.includes(field);
    }

    /**
     * Current detail level.
     *
     * `standard` a été renommé `custom`, qui décrit ce que le mode fait réellement :
     * respecter les cases cochées sur chaque point. Les configurations existantes
     * portent encore l'ancienne valeur, d'où sa reconnaissance comme alias.
     * @returns {string} 'minimal', 'custom' or 'detailed'
     */
    _displayMode() {
        const mode = this.config?.displayMode;
        if (mode === 'standard') return 'custom';
        return ['minimal', 'custom', 'detailed'].includes(mode) ? mode : 'custom';
    }

    /**
     * Lignes de valeurs d'un point, dans l'ordre d'affichage.
     *
     * Source unique des champs : les thèmes en changent la présentation, jamais le
     * contenu ni l'ordre. Les décrire une fois ici évite qu'ajouter un champ calculé
     * n'oblige à le brancher dans chaque thème — et qu'on l'y oublie.
     * @param {Object} point - Point calculé
     * @returns {Array<Object>} Lignes { field, key, value, emoji, accent, span, color, entityId, type }
     */
    _pointRows(point) {
        const rows = [
            {
                field: 'temperature', emoji: '🌡️', key: this.t('temperature'),
                value: this.formatTemp(point.temp), accent: true,
                entityId: point.tempEntityId, type: 'temperature',
            },
            {
                field: 'humidity', emoji: '💧', key: this.t('humidity'),
                value: `${point.humidity.toFixed(1)}%`, accent: true,
                entityId: point.humidityEntityId, type: 'humidity',
            },
        ];

        // Les valeurs sont produites paresseusement : un champ masqué n'a pas à être
        // formaté, et `details` en cache couramment la moitié.
        const optional = [
            ['dewPoint', () => this.formatTemp(point.dewPoint)],
            ['wetBulb', () => this.formatTemp(point.wetBulbTemp)],
            ['apparentTemp', () => this.formatTemp(point.apparentTemp)],
            ['enthalpy', () => `${point.enthalpy.toFixed(1)} kJ/kg`],
            ['absHumidity', () => `${point.absoluteHumidity.toFixed(2)} g/m³`],
            ['waterContent', () => `${(point.waterContent * 1000).toFixed(1)} g/kg`],
            ['specificVolume', () => `${point.specificVolume.toFixed(3)} m³/kg`],
            ['pmvIndex', () => point.pmv.toFixed(2)],
        ];
        for (const [field, value] of optional) {
            if (this._shouldShowField(point, field)) {
                rows.push({
                    field,
                    key: this.t(field),
                    // Libellé abrégé pour le thème `mono` : dans sa grille à deux
                    // colonnes, « Volume spécifique » passe à la ligne et détruit
                    // l'alignement des valeurs, qui fait tout l'intérêt du thème.
                    shortKey: this.t(`short${field[0].toUpperCase()}${field.slice(1)}`),
                    value: value(),
                });
            }
        }

        if (this._shouldShowField(point, 'moldRisk')) {
            rows.push({
                field: 'moldRisk', emoji: '🍄', key: this.t('moldRisk'),
                value: this.getMoldRiskText(point.moldRisk),
                color: this.getMoldRiskColor(point.moldRisk, this._isDark()),
                span: true,
            });
        }
        return rows;
    }

    /**
     * Lignes d'action d'un point : consigne à appliquer, puissance, cible.
     * @param {Object} point - Point calculé
     * @returns {Array<Object>} Lignes, vide quand rien n'est à faire
     */
    _pointActionRows(point) {
        if (!this._shouldShowField(point, 'action')) return [];
        if (!point.action && !(point.power > 0)) return [];

        const rows = [];
        if (point.action) rows.push({ field: 'action', emoji: '⚡', key: this.t('action'), value: point.action });
        if (point.power > 0) {
            rows.push({
                field: 'power', emoji: '🔥', key: this.t('power'),
                value: `${point.power.toFixed(1)} W`, accent: true,
            });
        }
        rows.push({
            field: 'idealSetpoint', emoji: '🎯', key: this.t('idealSetpoint'),
            value: `${this.formatTemp(point.idealSetpoint.temp)}, ${point.idealSetpoint.humidity.toFixed(0)}%`,
        });
        return rows;
    }

    /**
     * Rendu d'une ligne dans les thèmes historiques : « label : valeur » en clair.
     * @param {Object} point - Point calculé
     * @param {Object} row - Ligne à rendre
     * @returns {TemplateResult} Fragment Lit
     */
    _renderRow(point, row) {
        if (row.entityId) {
            return html`
                <div class="data-row"
                     @click="${() => this._openHistory(row.entityId, row.type)}"
                     @keydown="${(e) => this._handleKeyDown(e, row.entityId, row.type)}"
                     tabindex="0"
                     role="button"
                     aria-label="${this.t('historyLast24h')} - ${row.key}"
                     style="cursor: pointer">
                    <span>${row.emoji} ${row.key}: <span style="color: ${point.color}; font-weight: 600;">${row.value}</span></span>
                </div>`;
        }
        if (row.span) {
            return html`
                <div style="grid-column: span 2; display: flex; align-items: center; gap: 5px;">
                    <span>${row.emoji} ${row.key}:</span>
                    <span style="color: ${row.color}; font-weight: bold">${row.value}</span>
                </div>`;
        }
        return html`<div>${row.key}: ${row.value}</div>`;
    }

    /**
     * Rendu d'une ligne du thème `mono` : label à gauche, valeur alignée à droite.
     *
     * C'est cet alignement qui fait toute la lisibilité du thème — les valeurs
     * forment une colonne qu'on parcourt d'un coup d'œil, ce qu'un « label : valeur »
     * au fil du texte ne permet pas.
     * @param {Object} point - Point calculé
     * @param {Object} row - Ligne à rendre
     * @returns {TemplateResult} Fragment Lit
     */
    _renderMonoRow(point, row) {
        const color = row.color || (row.accent ? point.color : '');
        const value = html`<span class="mono-v" style="${color ? `color: ${color}` : ''}">${row.value}</span>`;

        if (row.entityId) {
            return html`
                <div class="mono-row"
                     @click="${() => this._openHistory(row.entityId, row.type)}"
                     @keydown="${(e) => this._handleKeyDown(e, row.entityId, row.type)}"
                     tabindex="0"
                     role="button"
                     aria-label="${this.t('historyLast24h')} - ${row.key}"
                     style="cursor: pointer">
                    <span class="mono-k">${row.key}</span>${value}
                </div>`;
        }
        return html`<div class="mono-row"><span class="mono-k">${row.shortKey || row.key}</span>${value}</div>`;
    }

    render() {
        if (!this.config || !this.hass) return html``;

        const points = this._currentPoints || [];
        const {
            chartTitle = "Diagramme Psychrométrique",
            showChart = true,
            showLegend = true,
            showCalculatedData = true,
            theme = "modern"
        } = this.config;

        const palette = this._palette();
        const darkMode = palette.dark;
        const is3d = this._chartMode() === '3d';
        // Sans couleur explicitement configurée, on ne pose aucun style : ha-card et
        // ses descendants héritent alors du thème de Home Assistant, quel qu'il soit.
        // Exception : `themeMode` forcé, où l'héritage donnerait justement le thème
        // que l'utilisateur vient de refuser — on pose alors les couleurs résolues.
        const styled = (key) => this.config[key] || this.config[PsychrometricCalculations.opacityKey(key)] !== undefined;
        const cardStyle = [
            (styled('bgColor') || palette.forced) ? `background: ${palette.bg}` : '',
            (styled('textColor') || palette.forced) ? `color: ${palette.text}` : '',
        ].filter(Boolean).join('; ');

        // Les entités configurées sont toutes absentes ou invalides : le dire, plutôt
        // que d'afficher un diagramme vide sans explication.
        if (points.length === 0) {
            const message = this.config.points?.length ? this.t('noValidEntity') : this.t('noPointsConfigured');
            return html`
                <ha-card class="theme-${theme}" style="${cardStyle}">
                    <div class="card-header">${chartTitle}</div>
                    <div class="card-message">⚠️ ${message}</div>
                </ha-card>
            `;
        }

        const chartDescription = `Diagramme psychrométrique affichant ${points.length} points. ` + points.map(p =>
            `${p.label}: ${this.formatTemp(p.temp)}, ${p.humidity.toFixed(1)}% d'humidité relative.`
        ).join(" ");

        // Styles conditionnels selon le thème
        const isClassic = theme === 'classic';
        const isCompact = theme === 'compact';
        // Thème dense inspiré du design : valeurs en chasse fixe alignées à droite.
        const isMono = theme === 'mono';
        
        // Surfaces translucides plutôt que des blancs/gris opaques : elles se posent
        // correctement sur le fond du thème courant, quel qu'il soit.
        const dataBoxBg = isClassic
            ? (palette.forced ? palette.bg : 'var(--card-background-color, transparent)')
            // `mono` reste volontairement plat : le dégradé en diagonale des thèmes
            // modernes ferait concurrence à l'alignement des valeurs, qui est le seul
            // repère visuel du relevé.
            : isMono
                ? (darkMode ? 'rgba(127, 127, 127, 0.10)' : 'rgba(127, 127, 127, 0.06)')
                : (darkMode
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.07) 100%)');

        const dataBoxBoxShadow = isClassic
            ? 'none'
            : `0 4px 15px rgba(0, 0, 0, ${darkMode ? '0.3' : '0.1'})`;

        // La légende se pose sur le canvas : elle reprend la couleur de fond résolue
        // du graphique pour rester lisible sans jamais supposer un fond blanc.
        const legendBg = palette.bg;

        return html`
            <ha-card class="theme-${theme}" style="${cardStyle}">
                <div class="card-header">${chartTitle}</div>

                ${showChart && is3d ? html`
                    <div class="view3d-bar">
                        <button class="view3d-btn ${this._view3d === '3d' ? 'active' : ''}"
                                @click="${() => this._setView3d('3d')}">${this.t('view3dLabel')}</button>
                        <button class="view3d-btn ${this._view3d === 'top' ? 'active' : ''}"
                                @click="${() => this._setView3d('top')}">${this.t('viewTop')}</button>
                    </div>
                ` : ''}

                ${showChart ? html`
                <div class="chart-container" style="${this._chartContainerStyle()}">
                    <canvas id="psychroChart" role="img" aria-label="${chartDescription}"
                            style="${is3d ? 'cursor: grab; touch-action: none' : ''}"
                            @mousemove="${is3d ? undefined : this._onMouseMove}"
                            @mouseleave="${this._onMouseLeave}"
                            @click="${is3d ? undefined : this._onCanvasClick}"
                            @pointerdown="${is3d ? this._onPointerDown : undefined}"
                            @pointermove="${is3d ? this._onPointerMove : undefined}"
                            @pointerup="${is3d ? this._onPointerUp : undefined}"
                            @pointercancel="${is3d ? this._onPointerUp : undefined}"
                            @wheel="${is3d ? this._onWheel : undefined}">
                        ${chartDescription}
                    </canvas>
                    ${showLegend ? html`
                        <div class="legend-box" style="background: ${legendBg}">
                            <div class="legend-title">📍 ${this.t('legend')}</div>
                            ${points.map(p => html`
                                <div class="legend-item">
                                    <span class="legend-color" style="background-color: ${p.color}; box-shadow: 0 0 5px ${p.color}"></span>
                                    <span>${p.label}</span>
                                </div>
                            `)}
                            <div class="legend-item">
                                <span class="legend-color legend-comfort"
                                      style="background-color: ${palette.comfort}"></span>
                                <span>${this.t('comfortZone')}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                ` : ''}

                ${showCalculatedData ? html`
                    <div class="psychro-data">
                        ${points.map((point, index) => {
            const rows = this._pointRows(point);
            const actionRows = this._pointActionRows(point);
            const badgeColor = point.inComfortZone ? '#4CAF50' : '#FF9800';
            const badgeText = point.inComfortZone
                ? `✓ ${this.t('comfortOptimal')}`
                : `⚠ ${this.t(point.comfortStatus)}`;

            // Le thème `mono` reprend la hiérarchie du diagramme : le couple
            // température/humidité en gros, le reste en tableau de relevés.
            const headline = rows.filter(row => row.field === 'temperature' || row.field === 'humidity');
            const gridRows = rows.filter(row => !row.span && !headline.includes(row));
            const footRows = rows.filter(row => row.span).concat(actionRows);

            return html`
                            <div class="data-box"
                                 style="
                                    background: ${dataBoxBg};
                                    border-left-color: ${point.color};
                                    box-shadow: ${dataBoxBoxShadow};
                                    animation: ${isClassic ? 'none' : `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`};
                                 ">
                                ${!isClassic && !isCompact && !isMono ? html`<div style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: radial-gradient(circle at top right, ${point.color}15, transparent);
                                    pointer-events: none;"></div>` : ''}

                                ${isMono ? html`
                                    <div class="data-header">
                                        <span class="mono-name">
                                            <span class="mono-dot" style="background: ${point.color}; box-shadow: 0 0 10px ${point.color}"></span>
                                            ${point.label}
                                        </span>
                                        <span class="status-badge mono-badge"
                                              style="color: ${badgeColor}; border-color: ${badgeColor}">${badgeText}</span>
                                    </div>

                                    <div class="mono-headline">
                                        ${headline.map((row, position) => html`
                                            <span class="${position === 0 ? 'mono-temp' : 'mono-hum'}"
                                                  style="${position === 0 ? '' : `color: ${point.color}`}"
                                                  @click="${() => this._openHistory(row.entityId, row.type)}"
                                                  @keydown="${(e) => this._handleKeyDown(e, row.entityId, row.type)}"
                                                  tabindex="0"
                                                  role="button"
                                                  aria-label="${this.t('historyLast24h')} - ${row.key}">${row.value}</span>
                                        `)}
                                    </div>

                                    ${gridRows.length ? html`
                                        <div class="mono-grid">
                                            ${gridRows.map(row => this._renderMonoRow(point, row))}
                                        </div>
                                    ` : ''}

                                    ${footRows.length ? html`
                                        <div class="mono-foot">
                                            ${footRows.map(row => this._renderMonoRow(point, row))}
                                        </div>
                                    ` : ''}
                                ` : html`
                                <div style="position: relative; z-index: 1;">
                                    <div class="data-header" style="color: ${point.color}">
                                        <span>${point.icon ? html`<ha-icon icon="${point.icon}" style="margin-right: 8px;"></ha-icon>` : ''} ${point.label}</span>
                                        ${point.inComfortZone ?
                    html`<span class="status-badge" style="background: linear-gradient(135deg, #4CAF50, #45a049); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">✓ ${this.t('comfortOptimal')}</span>` :
                    html`<span class="status-badge" style="background: linear-gradient(135deg, #FF9800, #f57c00); box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);">⚠ ${this.t(point.comfortStatus)}</span>`
                }
                                    </div>

                                    <div class="data-grid">
                                        ${rows.map(row => this._renderRow(point, row))}
                                    </div>

                                    ${actionRows.length ? html`
                                        <div class="action-box" style="border-top-color: ${darkMode ? '#555' : '#ddd'}">
                                            ${actionRows.map(row => html`
                                                <div><span class="action-icon">${row.emoji}</span>${row.key}: ${row.accent
                        ? html`<span style="color: ${point.color}; font-weight: 600;">${row.value}</span>`
                        : row.value}</div>
                                            `)}
                                        </div>
                                    ` : ''}
                                </div>
                                `}
                            </div>
                        `;
        })}
                    </div>
                ` : ''}
            </ha-card>
            
            ${this.renderTooltip()}
            ${this._modalOpen ? this.renderHistoryModal() : ''}
        `;
    }
}

customElements.define("psychrometric-chart-enhanced", PsychrometricChartEnhanced);

// Enregistrement de la carte pour le picker de cartes Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: "psychrometric-chart-enhanced",
    name: "Psychrometric Chart Advanced",
    description: "Carte de diagramme psychrométrique interactif avec calculs scientifiques (point de rosée, enthalpie, PMV, etc.)",
    preview: true,
    documentationURL: "https://github.com/guiohm79/psychrometric-chart-advanced"
});
