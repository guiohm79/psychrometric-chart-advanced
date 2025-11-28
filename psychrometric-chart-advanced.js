import { LitElement, html, css } from 'https://unpkg.com/lit?module';
import { PsychrometricCalculations } from "./psychrometric-helpers.js";
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
            /** Current zoom level */
            zoomLevel: { state: true },
            /** Current pan X offset */
            panX: { state: true },
            /** Current pan Y offset */
            panY: { state: true },
        };
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }
            ha-card {
                overflow: hidden;
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .card-header {
                padding: 16px;
                font-size: 1.5rem;
                font-weight: 500;
                text-align: center;
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
                height: auto;
                cursor: crosshair;
                transition: transform 0.2s;
                border-left: 4px solid transparent;
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
                background: rgba(0, 0, 0, 0.05);
            }

            .action-box {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
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
                background: rgba(0, 0, 0, 0.1);
            }
            .modal-close:hover {
                transform: rotate(90deg);
                background: rgba(0, 0, 0, 0.2);
            }
            .history-chart {
                width: 100%;
                height: 300px;
                margin-top: 20px;
            }
            .legend-box {
                position: absolute;
                top: 10px;
                right: 10px;
                backdrop-filter: blur(10px);
                padding: 12px;
                border-radius: 10px;
                text-align: left;
                pointer-events: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @media (max-width: 768px) {
                .psychro-data { grid-template-columns: 1fr !important; }
                .modal-content { padding: 20px; max-width: 95%; }
            }
        `;
    }

    constructor() {
        super();
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.resizeObserver = null;
        this._resizeDebounceTimer = null;
        this._language = 'fr';
        this._temperatureUnit = null;

        // Zoom defaults
        this.zoomLevel = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;

        this.translations = {
            fr: {
                noPointsConfigured: 'Aucun point ou entité configuré dans la carte !',
                noValidEntity: 'Aucune entité valide trouvée. Vérifiez votre configuration.',
                temperature: 'Température',
                humidity: 'Humidité',
                dewPoint: 'Point de rosée',
                enthalpy: 'Enthalpie',
                absHumidity: 'Humidité abs.',
                wetBulb: 'Temp. humide',
                moldRisk: 'Moisissure',
                action: 'Action',
                power: 'Puissance totale',
                heating: 'Chauffage',
                cooling: 'Refroidissement',
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
                clickToViewHistory: 'Cliquer pour voir l\'historique',
                warm: 'Réchauffer',
                cool: 'Refroidir',
                andHumidify: 'et Humidifier',
                andDehumidify: 'et Déshumidifier',
                historyLast24h: 'Historique des dernières 24h',
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
                wetBulb: 'Wet bulb',
                moldRisk: 'Mold risk',
                action: 'Action',
                power: 'Total power',
                heating: 'Heating',
                cooling: 'Cooling',
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
                wetBulb: 'Temp. húmeda',
                moldRisk: 'Moho',
                action: 'Acción',
                power: 'Potencia total',
                heating: 'Calefacción',
                cooling: 'Refrigeración',
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
                clickToViewHistory: 'Haz clic para ver el historial',
                warm: 'Calentar',
                cool: 'Enfriar',
                andHumidify: 'y Humidificar',
                andDehumidify: 'y Deshumidificar',
                historyLast24h: 'Historial de las últimas 24 horas',
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
                wetBulb: 'Feuchtkugeltemp.',
                moldRisk: 'Schimmel',
                action: 'Aktion',
                power: 'Gesamtleistung',
                heating: 'Heizung',
                cooling: 'Kühlung',
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
                clickToViewHistory: 'Klicken Sie, um den Verlauf anzuzeigen',
                warm: 'Erwärmen',
                cool: 'Abkühlen',
                andHumidify: 'und Befeuchten',
                andDehumidify: 'und Entfeuchten',
                historyLast24h: 'Verlauf der letzten 24 Stunden',
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
        if (!config.points || config.points.length === 0) {
            throw new Error("La configuration doit contenir des points !");
        }
        this.config = config;
        this._language = config.language || 'fr';

        if (config.zoom_temp_min !== undefined && config.zoom_temp_max !== undefined) {
            this.configuredZoomRange = {
                tempMin: config.zoom_temp_min,
                tempMax: config.zoom_temp_max,
                humidityMin: config.zoom_humidity_min,
                humidityMax: config.zoom_humidity_max
            };
        }
    }

    /**
     * Get the card size (height in rows).
     * @returns {number} The size of the card
     */
    getCardSize() {
        return 3;
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
            darkMode: false,
            textColor: "#333333"
        };
    }

    /**
     * Lifecycle method called after the first update.
     * Initializes the resize observer and canvas listeners.
     */
    firstUpdated() {
        this.resizeObserver = new ResizeObserver(entries => {
            if (this._resizeDebounceTimer) clearTimeout(this._resizeDebounceTimer);
            this._resizeDebounceTimer = setTimeout(() => {
                for (let entry of entries) {
                    const width = entry.contentRect.width;
                    if (width > 0) {
                        this.canvasWidth = width;
                        this.canvasHeight = width * 0.75; // 4:3 aspect ratio
                        this.requestUpdate();
                    }
                }
            }, 100);
        });
        this.resizeObserver.observe(this.shadowRoot.querySelector('ha-card'));

        // Setup canvas interactions
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (canvas) {
            canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
            canvas.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
        }
    }

    /**
     * Lifecycle method called when properties change.
     * Triggers chart redraw if relevant properties change.
     * @param {Map} changedProperties - Map of changed properties
     */
    updated(changedProperties) {
        if (changedProperties.has('hass') || changedProperties.has('config') || changedProperties.has('zoomLevel') || changedProperties.has('panX') || changedProperties.has('panY')) {
            this._drawChart();
        }

        if ((changedProperties.has('_modalOpen') || changedProperties.has('_historyData')) && this._modalOpen && this._historyData) {
            // Wait for modal render
            setTimeout(() => this._drawHistoryChart(), 50);
        }
    }

    /**
     * Translate a key to the current language.
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    t(key) {
        return this.translations[this._language][key] || this.translations['fr'][key] || key;
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
            const temp = this.toInternalTemp(tempRaw);
            const humidity = parseFloat(humState.state);

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
            const idealSetpoint = PsychrometricCalculations.calculateIdealSetpoint(temp, humidity, comfortRange);

            return {
                temp, humidity, action, power, heatingPower, coolingPower, humidificationPower, dehumidificationPower,
                dewPoint, waterContent, enthalpy, absoluteHumidity, wetBulbTemp, specificVolume, moldRisk, pmv, idealSetpoint,
                color: point.color || PsychrometricCalculations.generateRandomBrightColor(),
                label: point.label || `${point.temp} & ${point.humidity}`,
                icon: point.icon || "mdi:thermometer",
                inComfortZone: this.isInComfortZone(temp, humidity, comfortRange),
                tempEntityId: point.temp,
                humidityEntityId: point.humidity
            };
        }).filter(p => p !== null);
    }

    /**
     * Draw the psychrometric chart on the canvas.
     */
    _drawChart() {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = this.canvasWidth;
        const height = this.canvasHeight;

        canvas.width = width;
        canvas.height = height;

        const points = this._calculatePoints();
        this._currentPoints = points; // Store for tooltip

        const {
            bgColor = "#ffffff",
            gridColor = "#cccccc",
            curveColor = "#1f77b4",
            textColor = "#333333",
            comfortColor = "rgba(144, 238, 144, 0.5)",
            showEnthalpy = true,
            showWetBulb = true,
            showDewPoint = true,
            showVaporPressure = true,
            darkMode = false,
            showPointLabels = true,
            displayMode = "standard"
        } = this.config;

        // Use configured colors or defaults based on mode
        const actualBgColor = this.config.bgColor || (darkMode ? "#1c1c1c" : "#ffffff");
        const actualGridColor = this.config.gridColor || (darkMode ? "#444444" : "#cccccc");
        const actualCurveColor = this.config.curveColor || (darkMode ? "#4fc3f7" : "#1f77b4");
        const actualTextColor = this.config.textColor || (darkMode ? "#e0e0e0" : "#333333");
        const actualComfortColor = this.config.comfortColor || (darkMode ? "rgba(100, 200, 100, 0.3)" : "rgba(144, 238, 144, 0.5)");

        const comfortRange = this.config.comfortRange ? {
            tempMin: this.toInternalTemp(this.config.comfortRange.tempMin),
            tempMax: this.toInternalTemp(this.config.comfortRange.tempMax),
            rhMin: this.config.comfortRange.rhMin,
            rhMax: this.config.comfortRange.rhMax
        } : { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

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
        ctx.setLineDash([5 * scale, 5 * scale]);

        // Vertical grid (vapor pressure)
        if (showVaporPressure !== false) {
            ctx.font = `${Math.max(10, 12 * scale)}px Arial`;
            for (let i = 0; i <= 4; i += 0.5) {
                const refTemp = 20;
                const P_sat = 0.61078 * Math.exp((17.27 * refTemp) / (refTemp + 237.3));
                const rh = (i / P_sat) * 100;
                const y = this.humidityToY(refTemp, rh);

                ctx.beginPath();
                ctx.moveTo(leftPadding, y);
                ctx.lineTo(rightEdge, y);
                ctx.stroke();
                ctx.fillStyle = actualTextColor;
                ctx.fillText(`${i.toFixed(1)} kPa`, 10 * scaleX, y + 5 * scaleY);
            }
        }

        // Horizontal grid (temperature)
        const tempStep = this._temperatureUnit === '°F' ? 9 : 5;
        const tempStart = this._temperatureUnit === '°F' ? 14 : -10;
        const tempEnd = this._temperatureUnit === '°F' ? 122 : 50;

        for (let displayTemp = tempStart; displayTemp <= tempEnd; displayTemp += tempStep) {
            const tempC = this.toInternalTemp(displayTemp);
            const x = this.tempToX(tempC);
            ctx.beginPath();
            ctx.moveTo(x, bottomEdge);
            ctx.lineTo(x, topPadding);
            ctx.stroke();
            ctx.fillStyle = actualTextColor;
            ctx.fillText(`${displayTemp}${this.getTempUnit()}`, x - 15 * scaleX, bottomEdge + 20 * scaleY);
        }

        // Draw relative humidity curves
        ctx.setLineDash([]);
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;

        for (let rh = 10; rh <= 100; rh += 10) {
            ctx.beginPath();
            ctx.strokeStyle = rh === 100 ? "rgba(30, 144, 255, 0.8)" : actualCurveColor;
            ctx.lineWidth = (rh % 20 === 0 ? 1.5 : 0.8) * scale;

            for (let t = -10; t <= 50; t++) {
                const x = this.tempToX(t);
                const y = this.humidityToY(t, rh);
                if (t === -10) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Label
            const labelTemp = 25;
            const labelX = this.tempToX(labelTemp);
            const labelY = this.humidityToY(labelTemp, rh);
            ctx.fillStyle = actualTextColor;
            ctx.fillText(`${rh}%`, labelX + 10 * scaleX, labelY - 5 * scaleY);
        }

        // Draw enthalpy curves
        if (showEnthalpy && displayMode !== "minimal") {
            ctx.setLineDash([2 * scale, 3 * scale]);
            ctx.strokeStyle = darkMode ? "rgba(255, 165, 0, 0.7)" : "rgba(255, 99, 71, 0.7)";

            for (let h = 0; h <= 100; h += 10) {
                let enthalpy_points = [];
                for (let t = -10; t <= 50; t += 0.5) {
                    const W = (h - 1.006 * t) / (2501 + 1.84 * t);
                    if (W < 0 || W > 0.05) continue;
                    const P_v = (W * 101.325) / (0.622 + W);
                    const P_sat = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
                    const rh = (P_v / P_sat) * 100;
                    if (rh >= 10 && rh <= 100) {
                        enthalpy_points.push({ x: this.tempToX(t), y: this.humidityToY(t, rh) });
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
        if (showWetBulb && displayMode !== "minimal") {
            ctx.setLineDash([1 * scale, 4 * scale]);
            ctx.strokeStyle = darkMode ? "rgba(0, 255, 255, 0.4)" : "rgba(0, 100, 255, 0.4)";
            for (let tw = -5; tw <= 35; tw += 5) {
                // Simplified drawing: straight lines from saturation curve
                // This is an approximation for visualization
                const startX = this.tempToX(tw);
                const startY = this.humidityToY(tw, 100);
                ctx.beginPath();
                ctx.moveTo(startX, startY);

                // Find end point (approximate)
                let endX = startX, endY = startY;
                for (let t_search = tw; t_search < 60; t_search += 0.5) {
                    for (let rh_search = 100; rh_search > 0; rh_search -= 5) {
                        const calculatedTw = PsychrometricCalculations.calculateWetBulbTemp(t_search, rh_search);
                        if (Math.abs(calculatedTw - tw) < 0.2) {
                            endX = this.tempToX(t_search);
                            endY = this.humidityToY(t_search, rh_search);
                            break;
                        }
                    }
                }
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        // Draw comfort zone
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

        // Parse comfort color for gradient
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
        points.forEach(point => {
            const x = this.tempToX(point.temp);
            const y = this.humidityToY(point.temp, point.humidity);

            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = darkMode ? "#ffffff" : "#000000";
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
            ctx.setLineDash([5 * scale, 5 * scale]);
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
            if (showDewPoint && displayMode !== "minimal") {
                const dewX = this.tempToX(point.dewPoint);
                const dewY = this.humidityToY(point.dewPoint, 100);
                ctx.beginPath();
                ctx.arc(dewX, dewY, 4 * scale, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                ctx.fill();
                ctx.beginPath();
                ctx.setLineDash([3 * scale, 3 * scale]);
                ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
                ctx.moveTo(x, y);
                ctx.lineTo(dewX, dewY);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            if (showPointLabels !== false) {
                ctx.fillStyle = actualTextColor;
                ctx.font = `${Math.max(10, 10 * scale)}px Arial`;
                ctx.fillText(point.label, x + 10 * scaleX, y - 10 * scaleY);
            }
        });
    }

    /**
     * Convert temperature to X coordinate.
     * @param {number} temp - Temperature in Celsius
     * @returns {number} X coordinate
     */
    tempToX(temp) {
        const scaleX = this.canvasWidth / 800;
        const baseX = 50 * scaleX + (temp + 10) * 12 * scaleX;
        if (this.zoomLevel !== 1.0 || this.panX !== 0) {
            const centerX = this.canvasWidth / 2;
            return (baseX - centerX) * this.zoomLevel + centerX + this.panX;
        }
        return baseX;
    }

    /**
     * Convert humidity to Y coordinate.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Y coordinate
     */
    humidityToY(temp, humidity) {
        const scaleY = this.canvasHeight / 600;
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (humidity / 100) * P_sat;
        const baseY = 550 * scaleY - (P_v / 4) * 500 * scaleY;
        if (this.zoomLevel !== 1.0 || this.panY !== 0) {
            const centerY = this.canvasHeight / 2;
            return (baseY - centerY) * this.zoomLevel + centerY + this.panY;
        }
        return baseY;
    }

    /**
     * Handle mouse move event on canvas.
     * @param {MouseEvent} e - Mouse event
     */
    _handleMouseMove(e) {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas || !this._currentPoints) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        let hoveredPoint = null;
        this._currentPoints.forEach((point, index) => {
            const pointX = this.tempToX(point.temp);
            const pointY = this.humidityToY(point.temp, point.humidity);
            const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
            if (distance < 15) {
                hoveredPoint = { ...point, index };
            }
        });

        if (hoveredPoint) {
            canvas.style.cursor = 'pointer';
            this._showTooltip(e, hoveredPoint);
        } else {
            canvas.style.cursor = 'crosshair';
            this._hideTooltip();
        }
    }

    /**
     * Handle mouse leave event on canvas.
     */
    _handleMouseLeave() {
        this._hideTooltip();
    }

    /**
     * Show tooltip for a point.
     * @param {MouseEvent} event - Mouse event
     * @param {Object} point - Point data
     */
    _showTooltip(event, point) {
        this._hideTooltip();
        const tooltip = document.createElement('div');
        tooltip.id = 'psychro-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            left: ${event.clientX + 15}px;
            top: ${event.clientY + 15}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 13px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.2s ease;
            border-left: 3px solid ${point.color};
        `;
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: ${point.color};">${point.label}</div>
            <div>🌡️ ${this.t('temperature')}: <strong>${this.formatTemp(point.temp)}</strong></div>
            <div>💧 ${this.t('humidity')}: <strong>${point.humidity.toFixed(1)}%</strong></div>
            <div style="margin-top: 5px; font-size: 11px; opacity: 0.8;">${this.t('clickToViewHistory')}</div>
        `;
        document.body.appendChild(tooltip);
    }

    /**
     * Hide the tooltip.
     */
    _hideTooltip() {
        const tooltip = document.getElementById('psychro-tooltip');
        if (tooltip) tooltip.remove();
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

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

        try {
            const url = `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`;
            const response = await this.hass.callApi('GET', url);
            this._historyData = response && response[0] ? response[0] : [];
        } catch (error) {
            console.error('History error:', error);
            this._historyData = [];
        }
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
        if (!canvas || !this._historyData) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = 300;
        canvas.width = width;
        canvas.height = height;

        const type = this._selectedType;
        const darkMode = this.config.darkMode;
        const textColor = this.config.textColor || (darkMode ? "#e0e0e0" : "#333333");

        const dataPoints = this._historyData.map(item => {
            let value = parseFloat(item.state);
            if (type === 'temperature' && !isNaN(value)) {
                if (this._temperatureUnit === '°F') value = PsychrometricCalculations.celsiusToFahrenheit(value);
            }
            return {
                time: new Date(item.last_changed),
                value: value
            };
        }).filter(p => !isNaN(p.value));

        if (dataPoints.length === 0) return;

        const values = dataPoints.map(p => p.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || 1;
        const padding = 40;

        ctx.clearRect(0, 0, width, height);

        // Draw grid and Y-axis labels
        ctx.strokeStyle = darkMode ? "#444444" : "#e0e0e0";
        ctx.lineWidth = 1;
        ctx.fillStyle = textColor;
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const y = height - padding - (i / steps) * (height - 2 * padding);
            const val = minVal + (i / steps) * range;

            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Label
            ctx.fillText(val.toFixed(1), padding - 5, y);
        }

        // Draw curve
        ctx.strokeStyle = type === 'temperature' ? '#ff9800' : '#2196f3';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * (index / (dataPoints.length - 1));
            const y = height - padding - ((point.value - minVal) / range) * (height - 2 * padding);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // X-axis Labels (Time)
        ctx.fillStyle = textColor;
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        [0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].forEach(index => {
            if (dataPoints[index]) {
                const x = padding + (width - 2 * padding) * index / (dataPoints.length - 1);
                ctx.fillText(
                    dataPoints[index].time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    x, height - padding + 10
                );
            }
        });
    }

    /**
     * Render the history modal.
     * @returns {TemplateResult} HTML template
     */
    renderHistoryModal() {
        if (!this._historyData) return html`<div class="modal-overlay"><div class="modal-content">Chargement...</div></div>`;

        const type = this._selectedType;
        const unit = type === 'temperature' ? this.getTempUnit() : '%';
        const label = type === 'temperature' ? this.t('temperature') : this.t('humidity');
        const darkMode = this.config.darkMode;
        const textColor = this.config.textColor || (darkMode ? "#e0e0e0" : "#333333");
        const bgColor = this.config.bgColor || (darkMode ? "#1c1c1c" : "#ffffff");

        return html`
            <div class="modal-overlay" @click="${(e) => e.target.classList.contains('modal-overlay') && this._closeModal()}">
                <div class="modal-content" style="background: ${bgColor}; color: ${textColor}">
                    <button class="modal-close" @click="${this._closeModal}" style="color: ${textColor}">×</button>
                    <h2 style="margin-top: 0">${this.t('historyLast24h')} - ${label}</h2>
                    <canvas id="historyChart" class="history-chart"></canvas>
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
    render() {
        if (!this.config || !this.hass) return html``;

        const points = this._calculatePoints();
        const {
            chartTitle = "Diagramme Psychrométrique",
            showLegend = true,
            showCalculatedData = true,
            darkMode = false,
            textColor = "#333333",
            bgColor = "#ffffff",
            displayMode = "standard"
        } = this.config;

        const actualTextColor = this.config.textColor || (darkMode ? "#e0e0e0" : "#333333");
        const actualBgColor = this.config.bgColor || (darkMode ? "#1c1c1c" : "#ffffff");

        const chartDescription = `Diagramme psychrométrique affichant ${points.length} points. ` + points.map(p =>
            `${p.label}: ${this.formatTemp(p.temp)}, ${p.humidity.toFixed(1)}% d'humidité relative.`
        ).join(" ");

        return html`
            <ha-card style="background: ${actualBgColor}; color: ${actualTextColor}">
                <div class="card-header" style="color: ${actualTextColor}">${chartTitle}</div>
                
                <div class="chart-container">
                    <canvas id="psychroChart" role="img" aria-label="${chartDescription}">
                        ${chartDescription}
                    </canvas>
                    ${showLegend ? html`
                        <div class="legend-box" style="background: ${darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)'}; color: ${actualTextColor}">
                            <div style="margin-bottom: 8px; font-weight: bold; color: ${actualTextColor}; font-size: 13px;">📍 ${this.t('legend')}</div>
                            ${points.map(p => html`
                                <div class="legend-item">
                                    <span class="legend-color" style="background-color: ${p.color}; box-shadow: 0 0 5px ${p.color}"></span>
                                    <span>${p.label}</span>
                                </div>
                            `)}
                        </div>
                    ` : ''}
                </div>

                ${showCalculatedData && displayMode !== 'minimal' ? html`
                    <div class="psychro-data">
                        ${points.map((point, index) => html`
                            <div class="data-box" 
                                 style="
                                    background: ${darkMode ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'};
                                    border-left-color: ${point.color};
                                    box-shadow: 0 4px 15px rgba(0, 0, 0, ${darkMode ? '0.3' : '0.1'});
                                    animation: fadeInUp 0.5s ease-out ${index * 0.1}s backwards;
                                 ">
                                <div style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: radial-gradient(circle at top right, ${point.color}15, transparent);
                                    pointer-events: none;"></div>
                                
                                <div style="position: relative; z-index: 1;">
                                    <div class="data-header" style="color: ${point.color}">
                                        <span>${point.icon ? html`<ha-icon icon="${point.icon}" style="margin-right: 8px;"></ha-icon>` : ''} ${point.label}</span>
                                        ${point.inComfortZone ?
                html`<span class="status-badge" style="background: linear-gradient(135deg, #4CAF50, #45a049); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">✓ ${this.t('comfortOptimal')}</span>` :
                html`<span class="status-badge" style="background: linear-gradient(135deg, #FF9800, #f57c00); box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);">⚠ ${this.t('outOfComfort')}</span>`
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
                                        
                                        ${displayMode === "standard" || displayMode === "advanced" ? html`
                                            <div>${this.t('dewPoint')}: ${this.formatTemp(point.dewPoint)}</div>
                                            <div>${this.t('wetBulb')}: ${this.formatTemp(point.wetBulbTemp)}</div>
                                            <div>${this.t('enthalpy')}: ${point.enthalpy.toFixed(1)} kJ/kg</div>
                                        ` : ''}

                                        ${displayMode === "advanced" ? html`
                                            <div>${this.t('absHumidity')}: ${point.absoluteHumidity.toFixed(2)} g/m³</div>
                                            <div style="grid-column: span 2; display: flex; align-items: center; gap: 5px;">
                                                <span>🍄 ${this.t('moldRisk')}:</span>
                                                <span style="color: ${this.getMoldRiskColor(point.moldRisk, darkMode)}; font-weight: bold">
                                                    ${this.getMoldRiskText(point.moldRisk)}
                                                </span>
                                            </div>
                                        ` : ''}
                                    </div>

                                    ${(point.action || point.power > 0) && displayMode === 'advanced' ? html`
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
            
            ${this._modalOpen ? this.renderHistoryModal() : ''}
        `;
    }
}

customElements.define("psychrometric-chart-enhanced", PsychrometricChartEnhanced);
