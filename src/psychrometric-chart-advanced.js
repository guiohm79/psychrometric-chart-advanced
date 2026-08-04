import { LitElement, html, css } from 'lit';
import { PsychrometricCalculations, LINE_STYLES, DEFAULT_LINE_STYLES } from "./psychrometric-helpers.js";
import "./psychrometric-chart-editor.js";

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
            /** Point currently hovered on the canvas, if any */
            _hoveredPoint: { state: true },
            /** Viewport position of the tooltip */
            _tooltipPos: { state: true },
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
            .chart-container {
                position: relative;
                width: 100%;
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }
            canvas {
                max-width: 100%;
                cursor: crosshair;
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
            .history-chart {
                width: 100%;
                height: 300px;
                margin-top: 20px;
            }
            .history-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-top: 15px;
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
        `;
    }

    constructor() {
        super();
        this._canvasWidth = 800;
        this._canvasHeight = 600;
        this.resizeObserver = null;
        this._resizeDebounceTimer = null;
        this._language = 'fr';
        this._temperatureUnit = null;
        this._currentPoints = [];
        this._hoveredPoint = null;
        this._tooltipPos = { x: 0, y: 0 };
        // Références stables pour pouvoir retirer les écouteurs au démontage.
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseLeave = this._handleMouseLeave.bind(this);
        this._onCanvasClick = this._handleCanvasClick.bind(this);

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
                moldRiskNone: 'Aucun',
                moldRiskVeryLow: 'Très faible',
                moldRiskLow: 'Faible',
                moldRiskModerate: 'Modéré',
                moldRiskHigh: 'Élevé',
                moldRiskVeryHigh: 'Très élevé',
                moldRiskCritical: 'Critique'
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
                moldRiskNone: 'No risk',
                moldRiskVeryLow: 'Very low',
                moldRiskLow: 'Low',
                moldRiskModerate: 'Moderate',
                moldRiskHigh: 'High',
                moldRiskVeryHigh: 'Very high',
                moldRiskCritical: 'Critical'
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
                moldRiskNone: 'Sin riesgo',
                moldRiskVeryLow: 'Muy bajo',
                moldRiskLow: 'Bajo',
                moldRiskModerate: 'Moderado',
                moldRiskHigh: 'Alto',
                moldRiskVeryHigh: 'Muy alto',
                moldRiskCritical: 'Crítico'
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
                moldRiskNone: 'Kein Risiko',
                moldRiskVeryLow: 'Sehr niedrig',
                moldRiskLow: 'Niedrig',
                moldRiskModerate: 'Mäßig',
                moldRiskHigh: 'Hoch',
                moldRiskVeryHigh: 'Sehr hoch',
                moldRiskCritical: 'Kritisch'
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

        this.config = config;
        // L'unité peut changer avec la config : forcer une nouvelle détection.
        this._temperatureUnit = null;
        this._wetBulbCache = null;
    }

    /**
     * Get the card size (height in rows).
     * @returns {number} The size of the card
     */
    getCardSize() {
        // Sans le graphique, la carte se réduit aux cartes de données : annoncer la
        // même hauteur laisserait un grand vide dans les mises en page en colonnes.
        return this.config?.showChart === false ? 1 : 3;
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
        if (this.shadowRoot?.querySelector('ha-card')) this._observeResize();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        clearTimeout(this._resizeDebounceTimer);
        this._resizeDebounceTimer = null;
        this._hoveredPoint = null;
    }

    /**
     * Observe the card width and keep the canvas at a 4:3 ratio.
     */
    _observeResize() {
        if (this.resizeObserver) return;
        const card = this.shadowRoot?.querySelector('ha-card');
        if (!card) return;

        this.resizeObserver = new ResizeObserver(entries => {
            clearTimeout(this._resizeDebounceTimer);
            this._resizeDebounceTimer = setTimeout(() => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    if (width > 0) {
                        this._canvasWidth = width;
                        this._canvasHeight = width * 0.75; // 4:3 aspect ratio
                    }
                }
            }, 100);
        });
        this.resizeObserver.observe(card);
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
        if (changedProperties.has('hass') || changedProperties.has('config')
            || changedProperties.has('_canvasWidth') || changedProperties.has('_canvasHeight')) {
            this._drawChart();
        }

        if ((changedProperties.has('_modalOpen') || changedProperties.has('_historyData'))
            && this._modalOpen && this._historyData) {
            // Une frame d'attente pour que la modale soit mise en page et que
            // offsetWidth soit exploitable (remplace un setTimeout arbitraire).
            requestAnimationFrame(() => this._drawHistoryChart());
        }
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

        const points = this._currentPoints || [];

        const {
            showEnthalpy = true,
            showWetBulb = true,
            showDewPoint = true,
            showVaporPressure = true,
            showPointLabels = true,
        } = this.config;

        const minimal = this._displayMode() === 'minimal';
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

        // Scale factors
        const scaleX = width / 800;
        const scaleY = height / 600;
        const scale = Math.min(scaleX, scaleY);

        // Clear canvas
        ctx.fillStyle = actualBgColor;
        ctx.fillRect(0, 0, width, height);

        const leftPadding = 50 * scaleX;
        const rightEdge = 750 * scaleX;
        const topPadding = 50 * scaleY;
        const bottomEdge = 550 * scaleY;

        // Draw axes and grid
        ctx.strokeStyle = actualGridColor;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash(this._lineDash('gridLineStyle', scale));

        // Vertical grid (vapor pressure)
        if (showVaporPressure !== false) {
            ctx.font = `${Math.max(10, 12 * scale)}px Arial`;
            // Determine step size based on maxPv
            let pvStep = 0.5;
            if (bounds.maxPv < 1) pvStep = 0.1;
            else if (bounds.maxPv > 5) pvStep = 1;

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
                    ctx.fillText(`${i.toFixed(1)} kPa`, 10 * scaleX, y + 5 * scaleY);
                }
            }
        }

        // Horizontal grid (temperature)
        const tempStep = this._temperatureUnit === '°F' ? 9 : 5;
        // Adjust start/end to be multiples of step
        const startT = Math.ceil(bounds.minTemp / tempStep) * tempStep;
        const endT = Math.floor(bounds.maxTemp / tempStep) * tempStep;

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

        for (let displayTemp = startT; displayTemp <= endT; displayTemp += tempStep) {
            const tempC = this.toInternalTemp(displayTemp);
            const x = this.tempToX(tempC);
            if (x >= leftPadding && x <= rightEdge) {
                ctx.beginPath();
                ctx.moveTo(x, bottomEdge);
                ctx.lineTo(x, topPadding);
                ctx.stroke();
                ctx.fillStyle = actualTextColor;
                ctx.fillText(`${displayTemp}${this.getTempUnit()}`, x - 15 * scaleX, bottomEdge + 20 * scaleY);
            }
        }

        // Draw relative humidity curves
        ctx.setLineDash(this._lineDash('curveLineStyle', scale));
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;

        // Use zoom bounds for humidity curves if configured
        const startRh = bounds.minHum > 10 ? Math.ceil(bounds.minHum / 10) * 10 : 10;
        const endRh = bounds.maxHum < 100 ? Math.floor(bounds.maxHum / 10) * 10 : 100;
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

            if (labelX !== -1 && labelY !== -1) {
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
                ctx.font = `${Math.max(10, 10 * scale)}px Arial`;
                ctx.fillText(point.label, x + 10 * scaleX, y - 10 * scaleY);
            }
        });
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
        const scaleX = this._canvasWidth / 800;

        const leftPadding = 50 * scaleX;
        const rightEdge = 750 * scaleX;
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
        const scaleY = this._canvasHeight / 600;

        const topPadding = 50 * scaleY;
        const bottomEdge = 550 * scaleY;
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
        canvas.style.cursor = point ? 'pointer' : 'crosshair';
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
        this._selectedEntity = entityId;
        this._selectedType = type;
        this._modalOpen = true;
        this._historyData = null;

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

        try {
            // minimal_response / no_attributes allègent nettement la réponse : seuls
            // `state` et `last_changed` sont exploités par le tracé.
            // significant_changes_only vaut 1 par défaut côté Home Assistant, et le filtre
            // « changement significatif » des capteurs écarte les variations inférieures à
            // 0.5 °C (1 % en humidité) : la courbe en ressortait quantifiée. On demande
            // donc explicitement la résolution complète.
            const url = `history/period/${startTime.toISOString()}`
                + `?filter_entity_id=${encodeURIComponent(entityId)}`
                + `&end_time=${encodeURIComponent(endTime.toISOString())}`
                + `&significant_changes_only=0`
                + `&minimal_response&no_attributes`;
            const response = await this.hass.callApi('GET', url);
            // La requête a pu être doublée par des clics rapides : ignorer une réponse obsolète.
            if (this._selectedEntity !== entityId) return;
            this._historyData = response && response[0] ? response[0] : [];
        } catch (error) {
            console.error('History error:', error);
            if (this._selectedEntity === entityId) this._historyData = [];
        }
    }

    /**
     * Parse the raw history response into usable samples.
     * Entity states are already expressed in the display unit, so no temperature
     * conversion is applied here.
     * @returns {Array<{time: Date, value: number}>} Chronological samples
     */
    _historySamples() {
        if (!Array.isArray(this._historyData)) return [];
        return this._historyData
            .map(item => ({ time: new Date(item.last_changed), value: parseFloat(item.state) }))
            .filter(sample => Number.isFinite(sample.value) && !Number.isNaN(sample.time.getTime()))
            .sort((a, b) => a.time - b.time);
    }

    /**
     * Compute the 24h statistics shown above the history chart.
     * @param {Array<{value: number}>} samples - History samples
     * @returns {Object|null} { min, max, avg } or null when there is no data
     */
    _historyStats(samples) {
        if (!samples.length) return null;
        const values = samples.map(s => s.value);
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        };
    }

    /**
     * Close the history modal.
     */
    _closeModal() {
        this._modalOpen = false;
        this._historyData = null;
    }

    /**
     * Draw the history chart in the modal.
     */
    _drawHistoryChart() {
        const canvas = this.shadowRoot.getElementById('historyChart');
        if (!canvas) return;

        const samples = this._historySamples();
        if (samples.length === 0) return;

        const width = canvas.offsetWidth;
        const height = 300;
        if (!width) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const type = this._selectedType;
        const palette = this._palette();
        const textColor = palette.text;
        const gridColor = palette.dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
        const lineColor = type === 'temperature' ? '#ff9800' : '#2196f3';

        const values = samples.map(s => s.value);
        const padding = 44;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;

        // Graduations sur des valeurs rondes : l'échelle se calait auparavant sur
        // `min + i/5 · plage`, d'où des repères illisibles du type 26.1 / 28.1 / 30.1.
        const axis = PsychrometricCalculations.niceScale(Math.min(...values), Math.max(...values), 6);

        // L'axe X porte le temps réel : un espacement par index déformerait la
        // chronologie, l'historique HA étant échantillonné irrégulièrement.
        const startTime = samples[0].time.getTime();
        const endTime = samples[samples.length - 1].time.getTime();
        const timeSpan = endTime - startTime || 1;
        const toX = time => padding + ((time - startTime) / timeSpan) * plotWidth;
        const toY = value => height - padding - ((value - axis.min) / (axis.max - axis.min)) * plotHeight;

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.font = '11px Arial';

        // Grille horizontale + libellés de l'axe Y
        ctx.strokeStyle = gridColor;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let value = axis.min; value <= axis.max + axis.step / 2; value += axis.step) {
            const y = toY(value);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            ctx.fillText(value.toFixed(axis.decimals), padding - 6, y);
        }

        // Grille verticale toutes les heures rondes, libellée toutes les 3 h
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const hourTicks = this._hourTicks(startTime, endTime);
        for (const { time, labelled } of hourTicks) {
            const x = toX(time);
            ctx.strokeStyle = gridColor;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            if (labelled) {
                ctx.fillStyle = textColor;
                ctx.fillText(this._formatTime(new Date(time)), x, height - padding + 8);
            }
        }

        // Aire sous la courbe, pour donner du corps au tracé
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, `${lineColor}40`);
        gradient.addColorStop(1, `${lineColor}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(toX(startTime), height - padding);
        for (const sample of samples) ctx.lineTo(toX(sample.time.getTime()), toY(sample.value));
        ctx.lineTo(toX(endTime), height - padding);
        ctx.closePath();
        ctx.fill();

        // Courbe
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.8;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        samples.forEach((sample, index) => {
            const x = toX(sample.time.getTime());
            const y = toY(sample.value);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dernière valeur, mise en évidence
        const last = samples[samples.length - 1];
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(toX(last.time.getTime()), toY(last.value), 3, 0, 2 * Math.PI);
        ctx.fill();
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
        const type = this._selectedType;
        const unit = type === 'temperature' ? this.getTempUnit() : '%';
        const label = type === 'temperature' ? this.t('temperature') : this.t('humidity');
        const palette = this._palette();
        const textColor = palette.text;
        const bgColor = palette.bg;

        const samples = this._historySamples();
        const stats = this._historyStats(samples);

        return html`
            <div class="modal-overlay" @click="${(e) => e.target.classList.contains('modal-overlay') && this._closeModal()}">
                <div class="modal-content" style="background: ${bgColor}; color: ${textColor}">
                    <button class="modal-close" @click="${this._closeModal}" style="color: ${textColor}">×</button>
                    <h2 style="margin-top: 0">${this.t('historyLast24h')} - ${label}</h2>
                    ${this._historyData === null ? html`<div class="history-empty">${this.t('historyLoading')}</div>` : ''}
                    ${this._historyData !== null && !stats ? html`<div class="history-empty">${this.t('historyEmpty')}</div>` : ''}
                    ${stats ? html`
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
                        </div>
                        <canvas id="historyChart" class="history-chart"></canvas>
                    ` : ''}
                </div>
            </div>
        `;
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
        
        // Surfaces translucides plutôt que des blancs/gris opaques : elles se posent
        // correctement sur le fond du thème courant, quel qu'il soit.
        const dataBoxBg = isClassic
            ? (palette.forced ? palette.bg : 'var(--card-background-color, transparent)')
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

                ${showChart ? html`
                <div class="chart-container">
                    <canvas id="psychroChart" role="img" aria-label="${chartDescription}"
                            @mousemove="${this._onMouseMove}"
                            @mouseleave="${this._onMouseLeave}"
                            @click="${this._onCanvasClick}">
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
                        ${points.map((point, index) => html`
                            <div class="data-box" 
                                 style="
                                    background: ${dataBoxBg};
                                    border-left-color: ${point.color};
                                    box-shadow: ${dataBoxBoxShadow};
                                    animation: ${isClassic ? 'none' : `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`};
                                 ">
                                ${!isClassic && !isCompact ? html`<div style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: radial-gradient(circle at top right, ${point.color}15, transparent);
                                    pointer-events: none;"></div>` : ''}
                                
                                <div style="position: relative; z-index: 1;">
                                    <div class="data-header" style="color: ${point.color}">
                                        <span>${point.icon ? html`<ha-icon icon="${point.icon}" style="margin-right: 8px;"></ha-icon>` : ''} ${point.label}</span>
                                        ${point.inComfortZone ?
                html`<span class="status-badge" style="background: linear-gradient(135deg, #4CAF50, #45a049); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">✓ ${this.t('comfortOptimal')}</span>` :
                html`<span class="status-badge" style="background: linear-gradient(135deg, #FF9800, #f57c00); box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);">⚠ ${this.t(point.comfortStatus)}</span>`
            }
                                    </div>
                                    
                                    <div class="data-grid">
                                        <div class="data-row" 
                                             @click="${() => this._openHistory(point.tempEntityId, 'temperature')}" 
                                             @keydown="${(e) => this._handleKeyDown(e, point.tempEntityId, 'temperature')}"
                                             tabindex="0" 
                                             role="button" 
                                             aria-label="${this.t('historyLast24h')} - ${this.t('temperature')}"
                                             style="cursor: pointer">
                                            <span>🌡️ ${this.t('temperature')}: <span style="color: ${point.color}; font-weight: 600;">${this.formatTemp(point.temp)}</span></span>
                                        </div>
                                        <div class="data-row" 
                                             @click="${() => this._openHistory(point.humidityEntityId, 'humidity')}" 
                                             @keydown="${(e) => this._handleKeyDown(e, point.humidityEntityId, 'humidity')}"
                                             tabindex="0" 
                                             role="button" 
                                             aria-label="${this.t('historyLast24h')} - ${this.t('humidity')}"
                                             style="cursor: pointer">
                                            <span>💧 ${this.t('humidity')}: <span style="color: ${point.color}; font-weight: 600;">${point.humidity.toFixed(1)}%</span></span>
                                        </div>
                                        
                                        ${this._shouldShowField(point, 'dewPoint') ? html`<div>${this.t('dewPoint')}: ${this.formatTemp(point.dewPoint)}</div>` : ''}
                                        ${this._shouldShowField(point, 'wetBulb') ? html`<div>${this.t('wetBulb')}: ${this.formatTemp(point.wetBulbTemp)}</div>` : ''}
                                        ${this._shouldShowField(point, 'apparentTemp') ? html`<div>${this.t('apparentTemp')}: ${this.formatTemp(point.apparentTemp)}</div>` : ''}
                                        ${this._shouldShowField(point, 'enthalpy') ? html`<div>${this.t('enthalpy')}: ${point.enthalpy.toFixed(1)} kJ/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'absHumidity') ? html`<div>${this.t('absHumidity')}: ${point.absoluteHumidity.toFixed(2)} g/m³</div>` : ''}
                                        ${this._shouldShowField(point, 'waterContent') ? html`<div>${this.t('waterContent')}: ${(point.waterContent * 1000).toFixed(1)} g/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'specificVolume') ? html`<div>${this.t('specificVolume')}: ${point.specificVolume.toFixed(3)} m³/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'pmvIndex') ? html`<div>${this.t('pmvIndex')}: ${point.pmv.toFixed(2)}</div>` : ''}
                                        
                                        ${this._shouldShowField(point, 'moldRisk') ? html`
                                            <div style="grid-column: span 2; display: flex; align-items: center; gap: 5px;">
                                                <span>🍄 ${this.t('moldRisk')}:</span>
                                                <span style="color: ${this.getMoldRiskColor(point.moldRisk, darkMode)}; font-weight: bold">
                                                    ${this.getMoldRiskText(point.moldRisk)}
                                                </span>
                                            </div>
                                        ` : ''}
                                    </div>

                                    ${(point.action || point.power > 0) && this._shouldShowField(point, 'action') ? html`
                                        <div class="action-box" style="border-top-color: ${darkMode ? '#555' : '#ddd'}">
                                            ${point.action ? html`<div><span class="action-icon">⚡</span>${this.t('action')}: ${point.action}</div>` : ''}
                                            ${point.power > 0 ? html`<div><span class="action-icon">🔥</span>${this.t('power')}: <span style="color: ${point.color}; font-weight: 600;">${point.power.toFixed(1)} W</span></div>` : ''}
                                            <div><span class="action-icon">🎯</span>${this.t('idealSetpoint')}: ${this.formatTemp(point.idealSetpoint.temp)}, ${point.idealSetpoint.humidity.toFixed(0)}%</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `)}
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
