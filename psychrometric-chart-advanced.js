import { PsychrometricCalculations } from "./psychrometric-helpers.js";
import "./psychrometric-chart-editor.js";

class PsychrometricChartEnhanced extends HTMLElement {
    constructor() {
        super();
        this._hass = null;
        this.resizeObserver = null;
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.hoveredPoint = null;
        this.modalOpen = false;
        this._hasRendered = false;
        this._previousValues = new Map();
        this._resizeDebounceTimer = null;
        this._lastRenderTime = 0;
        this._language = 'fr'; // Default language
        this._temperatureUnit = null; // Will be auto-detected or set from config

        // Zoom and pan properties
        this.zoomLevel = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;

        // Configured zoom range (from YAML)
        this.configuredZoomRange = null;

        // Internationalization (i18n) translations
        this.translations = {
            fr: {
                // Error messages
                noPointsConfigured: 'Aucun point ou entité configuré dans la carte !',
                noValidEntity: 'Aucune entité valide trouvée !',
                noDataAvailable: 'Aucune donnée disponible',

                // Main labels
                temperature: 'Température',
                humidity: 'Humidité',
                dewPoint: 'Point de rosée',
                wetBulbTemp: 'Temp. humide',
                enthalpy: 'Enthalpie',
                waterContent: 'Teneur eau',
                absoluteHumidity: 'Humidité abs.',
                specificVolume: 'Vol. spécifique',
                pmvIndex: 'Indice PMV',
                moldRisk: 'Moisissure',

                // Actions
                action: 'Action',
                totalPower: 'Puissance totale',
                heating: 'Chauffage',
                cooling: 'Refroidissement',
                humidification: 'Humidification',
                dehumidification: 'Déshumidification',
                idealSetpoint: 'Consigne idéale',

                // Comfort
                optimalComfort: 'Confort optimal',
                outsideComfort: 'Hors confort',
                comfortZone: 'Zone de confort',

                // Legend and UI
                legend: 'Légende',
                minimum: 'Minimum',
                average: 'Moyenne',
                maximum: 'Maximum',
                clickToViewHistory: 'Cliquer pour voir l\'historique',

                // Action texts
                warm: 'Réchauffer',
                cool: 'Refroidir',
                andHumidify: 'et Humidifier',
                andDehumidify: 'et Déshumidifier',
                historyLast24h: 'Historique des dernières 24 heures',
                dataPoints: 'points de données',

                // Mold risk levels
                moldRiskNone: 'Aucun risque',
                moldRiskVeryLow: 'Très faible',
                moldRiskLow: 'Faible',
                moldRiskModerate: 'Modéré',
                moldRiskHigh: 'Élevé',
                moldRiskVeryHigh: 'Très élevé',
                moldRiskCritical: 'Critique'
            },
            en: {
                // Error messages
                noPointsConfigured: 'No points or entities configured in the card!',
                noValidEntity: 'No valid entities found!',
                noDataAvailable: 'No data available',

                // Main labels
                temperature: 'Temperature',
                humidity: 'Humidity',
                dewPoint: 'Dew point',
                wetBulbTemp: 'Wet bulb temp.',
                enthalpy: 'Enthalpy',
                waterContent: 'Water content',
                absoluteHumidity: 'Absolute humidity',
                specificVolume: 'Specific volume',
                pmvIndex: 'PMV Index',
                moldRisk: 'Mold risk',

                // Actions
                action: 'Action',
                totalPower: 'Total power',
                heating: 'Heating',
                cooling: 'Cooling',
                humidification: 'Humidification',
                dehumidification: 'Dehumidification',
                idealSetpoint: 'Ideal setpoint',

                // Comfort
                optimalComfort: 'Optimal comfort',
                outsideComfort: 'Outside comfort',
                comfortZone: 'Comfort zone',

                // Legend and UI
                legend: 'Legend',
                minimum: 'Minimum',
                average: 'Average',
                maximum: 'Maximum',
                clickToViewHistory: 'Click to view history',

                // Action texts
                warm: 'Warm up',
                cool: 'Cool down',
                andHumidify: 'and Humidify',
                andDehumidify: 'and Dehumidify',
                historyLast24h: 'History of the last 24 hours',
                dataPoints: 'data points',

                // Mold risk levels
                moldRiskNone: 'No risk',
                moldRiskVeryLow: 'Very low',
                moldRiskLow: 'Low',
                moldRiskModerate: 'Moderate',
                moldRiskHigh: 'High',
                moldRiskVeryHigh: 'Very high',
                moldRiskCritical: 'Critical'
            },
            es: {
                // Error messages
                noPointsConfigured: '¡No hay puntos o entidades configuradas en la tarjeta!',
                noValidEntity: '¡No se encontraron entidades válidas!',
                noDataAvailable: 'No hay datos disponibles',

                // Main labels
                temperature: 'Temperatura',
                humidity: 'Humedad',
                dewPoint: 'Punto de rocío',
                wetBulbTemp: 'Temp. húmeda',
                enthalpy: 'Entalpía',
                waterContent: 'Contenido agua',
                absoluteHumidity: 'Humedad abs.',
                specificVolume: 'Vol. específico',
                pmvIndex: 'Índice PMV',
                moldRisk: 'Moho',

                // Actions
                action: 'Acción',
                totalPower: 'Potencia total',
                heating: 'Calefacción',
                cooling: 'Refrigeración',
                humidification: 'Humidificación',
                dehumidification: 'Deshumidificación',
                idealSetpoint: 'Consigna ideal',

                // Comfort
                optimalComfort: 'Confort óptimo',
                outsideComfort: 'Fuera de confort',
                comfortZone: 'Zona de confort',

                // Legend and UI
                legend: 'Leyenda',
                minimum: 'Mínimo',
                average: 'Promedio',
                maximum: 'Máximo',
                clickToViewHistory: 'Haz clic para ver el historial',

                // Action texts
                warm: 'Calentar',
                cool: 'Enfriar',
                andHumidify: 'y Humidificar',
                andDehumidify: 'y Deshumidificar',
                historyLast24h: 'Historial de las últimas 24 horas',
                dataPoints: 'puntos de datos',

                // Mold risk levels
                moldRiskNone: 'Sin riesgo',
                moldRiskVeryLow: 'Muy bajo',
                moldRiskLow: 'Bajo',
                moldRiskModerate: 'Moderado',
                moldRiskHigh: 'Alto',
                moldRiskVeryHigh: 'Muy alto',
                moldRiskCritical: 'Crítico'
            },
            de: {
                // Error messages
                noPointsConfigured: 'Keine Punkte oder Entitäten in der Karte konfiguriert!',
                noValidEntity: 'Keine gültigen Entitäten gefunden!',
                noDataAvailable: 'Keine Daten verfügbar',

                // Main labels
                temperature: 'Temperatur',
                humidity: 'Luftfeuchtigkeit',
                dewPoint: 'Taupunkt',
                wetBulbTemp: 'Feuchtkugeltemp.',
                enthalpy: 'Enthalpie',
                waterContent: 'Wassergehalt',
                absoluteHumidity: 'Abs. Feuchtigkeit',
                specificVolume: 'Spez. Volumen',
                pmvIndex: 'PMV-Index',
                moldRisk: 'Schimmel',

                // Actions
                action: 'Aktion',
                totalPower: 'Gesamtleistung',
                heating: 'Heizung',
                cooling: 'Kühlung',
                humidification: 'Befeuchtung',
                dehumidification: 'Entfeuchtung',
                idealSetpoint: 'Idealer Sollwert',

                // Comfort
                optimalComfort: 'Optimaler Komfort',
                outsideComfort: 'Außerhalb Komfort',
                comfortZone: 'Komfortzone',

                // Legend and UI
                legend: 'Legende',
                minimum: 'Minimum',
                average: 'Durchschnitt',
                maximum: 'Maximum',
                clickToViewHistory: 'Klicken Sie, um den Verlauf anzuzeigen',

                // Action texts
                warm: 'Erwärmen',
                cool: 'Abkühlen',
                andHumidify: 'und Befeuchten',
                andDehumidify: 'und Entfeuchten',
                historyLast24h: 'Verlauf der letzten 24 Stunden',
                dataPoints: 'Datenpunkte',

                // Mold risk levels
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
     * Get the temperature unit symbol
     */
    getTempUnit() {
        return this._temperatureUnit === '°F' ? '°F' : '°C';
    }

    /**
     * Format temperature for display (with proper unit)
     */
    formatTemp(tempC, decimals = 1) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.celsiusToFahrenheit(tempC).toFixed(decimals) + '°F';
        }
        return tempC.toFixed(decimals) + '°C';
    }

    /**
     * Convert user-provided temperature to Celsius (internal format)
     * Handles both config values and sensor readings
     */
    toInternalTemp(temp) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.fahrenheitToCelsius(temp);
        }
        return temp;
    }

    /**
     * Convert internal Celsius temperature to display unit
     */
    toDisplayTemp(tempC) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.celsiusToFahrenheit(tempC);
        }
        return tempC;
    }

    /**
     * Detect temperature unit from Home Assistant or config
     */
    detectTemperatureUnit(hass) {
        // 1. Check if manually set in config
        if (this.config && this.config.temperatureUnit) {
            const configUnit = this.config.temperatureUnit.toLowerCase();
            if (configUnit === 'f' || configUnit === 'fahrenheit' || configUnit === '°f') {
                return '°F';
            }
            if (configUnit === 'c' || configUnit === 'celsius' || configUnit === '°c') {
                return '°C';
            }
        }

        // 2. Auto-detect from Home Assistant unit system
        if (hass && hass.config && hass.config.unit_system) {
            const tempUnit = hass.config.unit_system.temperature;
            if (tempUnit === '°F') {
                return '°F';
            }
        }

        // 3. Default to Celsius
        return '°C';
    }

    // Translation helper method
    t(key) {
        return this.translations[this._language][key] || this.translations['fr'][key] || key;
    }

    // Get language from config or use default
    getLanguage() {
        return this.config && this.config.language ? this.config.language : 'fr';
    }

    set hass(hass) {
        this._hass = hass;

        // Detect temperature unit on first run
        if (this._temperatureUnit === null) {
            this._temperatureUnit = this.detectTemperatureUnit(hass);
            console.log(`Psychrometric Chart: Using temperature unit ${this._temperatureUnit}`);
        }

        if (!this.config || !this.config.points || this.config.points.length === 0) {
            this.innerHTML = `<p style="color: red;">${this.t('noPointsConfigured')}</p>`;
            return;
        }

        // Check if values have changed significantly before rendering
        if (this._hasRendered && !this.shouldUpdate(hass)) {
            return;
        }

        this.render(hass);
    }

    shouldUpdate(hass) {
        // Always update on first render
        if (!this._hasRendered) {
            return true;
        }

        // Check if any sensor value has changed significantly
        for (const point of this.config.points) {
            const tempState = hass.states[point.temp];
            const humState = hass.states[point.humidity];

            if (!tempState || !humState) continue;

            const newTemp = parseFloat(tempState.state);
            const newHum = parseFloat(humState.state);

            const key = `${point.temp}_${point.humidity}`;
            const previous = this._previousValues.get(key);

            if (!previous) {
                // New sensor, need to update
                return true;
            }

            // Check for significant changes
            const tempDiff = Math.abs(newTemp - previous.temp);
            const humDiff = Math.abs(newHum - previous.humidity);

            // Thresholds: 0.1 for temperature (in sensor units), 1% for humidity
            if (tempDiff > 0.1 || humDiff > 1) {
                return true;
            }
        }

        // No significant changes
        return false;
    }

    storeSensorValues(hass) {
        // Store current values for next comparison
        for (const point of this.config.points) {
            const tempState = hass.states[point.temp];
            const humState = hass.states[point.humidity];

            if (!tempState || !humState) continue;

            const key = `${point.temp}_${point.humidity}`;
            this._previousValues.set(key, {
                temp: parseFloat(tempState.state),
                humidity: parseFloat(humState.state)
            });
        }
    }

    connectedCallback() {
        // Setup resize observer for responsive design
        this.setupResizeObserver();
    }

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            // Debounce resize events to avoid excessive re-renders
            if (this._resizeDebounceTimer) {
                clearTimeout(this._resizeDebounceTimer);
            }

            this._resizeDebounceTimer = setTimeout(() => {
                if (this._hass) {
                    this.updateCanvasSize();
                    this.render(this._hass);
                }
            }, 150); // 150ms debounce
        });
        this.resizeObserver.observe(this);
    }

    updateCanvasSize() {
        const container = this.querySelector('.chart-container');
        if (container) {
            const width = container.offsetWidth;
            // Maintain aspect ratio
            this.canvasWidth = Math.max(300, Math.min(width - 40, 1200));
            this.canvasHeight = Math.floor(this.canvasWidth * 0.75);
        }
    }

    render(hass) {
        // Traiter les points et les capteurs
        const points = this.config.points.map((point) => {
            const tempState = hass.states[point.temp];
            const humState = hass.states[point.humidity];

            if (!tempState || !humState) {
                console.warn(`Entités non disponibles : ${point.temp} ou ${point.humidity}`);
                return null;
            }

            // Get temperature and convert to Celsius for internal calculations
            const tempRaw = parseFloat(tempState.state);
            const temp = this.toInternalTemp(tempRaw); // Convert to Celsius
            const humidity = parseFloat(humState.state);

            // Convert comfort range to Celsius if needed
            const rawComfortRange = this.config.comfortRange || { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };
            const comfortRange = {
                tempMin: this.toInternalTemp(rawComfortRange.tempMin),
                tempMax: this.toInternalTemp(rawComfortRange.tempMax),
                rhMin: rawComfortRange.rhMin,
                rhMax: rawComfortRange.rhMax
            };

            const { massFlowRate = 0.5 } = this.config;

            // Calculs des actions et puissances (all in Celsius)
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

            // Calculs supplémentaires (all in Celsius internally)
            const dewPoint = PsychrometricCalculations.calculateDewPoint(temp, humidity);
            const waterContent = PsychrometricCalculations.calculateWaterContent(temp, humidity);
            const enthalpy = PsychrometricCalculations.calculateEnthalpy(temp, waterContent);
            const absoluteHumidity = PsychrometricCalculations.calculateAbsoluteHumidity(temp, humidity);
            const wetBulbTemp = PsychrometricCalculations.calculateWetBulbTemp(temp, humidity);
            const vaporPressure = PsychrometricCalculations.calculateVaporPressure(temp, humidity);
            const specificVolume = PsychrometricCalculations.calculateSpecificVolume(temp, humidity);

            // Calcul du risque de moisissure
            const moldRisk = PsychrometricCalculations.calculateMoldRisk(temp, humidity);

            // Calcul de l'indice de confort thermique PMV
            const pmv = PsychrometricCalculations.calculatePMV(temp, humidity);

            // Calcul du point de consigne idéal pour économie d'énergie
            const idealSetpoint = PsychrometricCalculations.calculateIdealSetpoint(temp, humidity, comfortRange);

            return {
                temp, // Internal (Celsius)
                humidity,
                action,
                power,
                heatingPower,
                coolingPower,
                humidificationPower,
                dehumidificationPower,
                dewPoint,
                waterContent,
                enthalpy,
                absoluteHumidity,
                wetBulbTemp,
                vaporPressure,
                specificVolume,
                moldRisk,
                pmv,
                idealSetpoint,
                color: point.color || PsychrometricCalculations.generateRandomBrightColor(),
                label: point.label || `${point.temp} & ${point.humidity}`,
                icon: point.icon || "mdi:thermometer",
                inComfortZone: this.isInComfortZone(temp, humidity, comfortRange),
                tempEntityId: point.temp,
                humidityEntityId: point.humidity
            };
        });

        const validPoints = points.filter((p) => p !== null);

        if (validPoints.length === 0) {
            this.innerHTML = `<p style="color: red;">${this.t('noValidEntity')}</p>`;
            return;
        }

        // Configuration et options
        const {
            bgColor = "#ffffff",
            gridColor = "#cccccc",
            curveColor = "#1f77b4",
            textColor = "#333333",
            chartTitle = "Diagramme Psychrométrique",
            showCalculatedData = true,
            comfortColor = "rgba(144, 238, 144, 0.5)",
            showEnthalpy = true,
            showWetBulb = true,
            showDewPoint = true,
            showLegend = true,
            showHistoryData = false,
            historyHours = 24,
            darkMode = false,
            showMoldRisk = true,
            displayMode = "standard",
            language = "fr",
            // Zoom configuration (in user's temperature unit)
            zoom_temp_min = null,
            zoom_temp_max = null,
            zoom_humidity_min = null,
            zoom_humidity_max = null,
        } = this.config;

        // Mettre à jour la langue
        this._language = language;

        // Calculate zoom and pan from configured range (convert to Celsius first)
        if (zoom_temp_min !== null && zoom_temp_max !== null) {
            this.configuredZoomRange = {
                tempMin: this.toInternalTemp(zoom_temp_min),
                tempMax: this.toInternalTemp(zoom_temp_max),
                humidityMin: zoom_humidity_min,
                humidityMax: zoom_humidity_max
            };
            this.calculateZoomFromRange();
        } else {
            // Reset to default if no zoom configuration
            this.zoomLevel = 1.0;
            this.panX = 0;
            this.panY = 0;
            this.configuredZoomRange = null;
        }

        // Get internal comfort range (already converted above)
        const rawComfortRange = this.config.comfortRange || { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };
        const comfortRange = {
            tempMin: this.toInternalTemp(rawComfortRange.tempMin),
            tempMax: this.toInternalTemp(rawComfortRange.tempMax),
            rhMin: rawComfortRange.rhMin,
            rhMax: rawComfortRange.rhMax
        };

        // Appliquer le thème sombre si activé
        const actualBgColor = darkMode ? "#121212" : bgColor;
        const actualTextColor = darkMode ? "#ffffff" : textColor;
        const actualGridColor = darkMode ? "#333333" : gridColor;

        // Construction du HTML pour les données calculées avec design amélioré
        const calculatedDataHTML = showCalculatedData
            ? `
            <div class="psychro-data" style="
                margin-top: 20px;
                text-align: left;
                font-size: 14px;
                max-width: 100%;
                padding: 0 20px;
                margin-left: auto;
                margin-right: auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
                gap: 20px;">
                ${validPoints
                .map(
                    (p, index) => `
                    <div class="psychro-point-data"
                         data-point-index="${index}"
                         style="
                            padding: 15px;
                            border-radius: 15px;
                            background: ${darkMode ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'};
                            border-left: 5px solid ${p.color};
                            box-shadow: 0 4px 15px rgba(0, 0, 0, ${darkMode ? '0.3' : '0.1'});
                            backdrop-filter: blur(10px);
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            cursor: pointer;
                            position: relative;
                            overflow: hidden;
                            animation: ${this._hasRendered ? 'none' : `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`};">
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: radial-gradient(circle at top right, ${p.color}15, transparent);
                            pointer-events: none;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <ha-icon icon="${p.icon}" style="margin-right: 8px; color: ${p.color};"></ha-icon>
                                <span style="color: ${p.color}; font-weight: bold; font-size: 16px;">
                                    ${p.label}
                                </span>
                                ${p.inComfortZone ?
                            `<span style="margin-left: auto; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 4px 10px; border-radius: 15px; font-size: 11px; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">✓ ${this.t('optimalComfort')}</span>` :
                            `<span style="margin-left: auto; background: linear-gradient(135deg, #FF9800, #f57c00); color: white; padding: 4px 10px; border-radius: 15px; font-size: 11px; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);">⚠ ${this.t('outsideComfort')}</span>`
                        }
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <div class="clickable-value" data-entity="${p.tempEntityId}" data-type="temperature" style="margin-bottom: 5px; padding: 5px; border-radius: 5px; transition: background 0.2s; cursor: pointer;">
                                        <strong>🌡️ ${this.t('temperature')}:</strong> <span style="color: ${p.color}; font-weight: 600;">${this.formatTemp(p.temp)}</span>
                                    </div>
                                    <div class="clickable-value" data-entity="${p.humidityEntityId}" data-type="humidity" style="margin-bottom: 5px; padding: 5px; border-radius: 5px; transition: background 0.2s; cursor: pointer;">
                                        <strong>💧 ${this.t('humidity')}:</strong> <span style="color: ${p.color}; font-weight: 600;">${p.humidity.toFixed(1)}%</span>
                                    </div>
                                    ${displayMode === "standard" || displayMode === "advanced" ? `
                                    <div style="margin-bottom: 5px;"><strong>${this.t('dewPoint')}:</strong> ${this.formatTemp(p.dewPoint)}</div>
                                    <div style="margin-bottom: 5px;"><strong>${this.t('wetBulbTemp')}:</strong> ${this.formatTemp(p.wetBulbTemp)}</div>
                                    <div style="margin-bottom: 5px;"><strong>${this.t('enthalpy')}:</strong> ${p.enthalpy.toFixed(1)} kJ/kg</div>
                                    ` : ''}
                                </div>
                                <div>
                                    ${displayMode === "standard" || displayMode === "advanced" ? `
                                    <div style="margin-bottom: 5px;"><strong>${this.t('pmvIndex')}:</strong> ${p.pmv.toFixed(2)}</div>
                                    ` : ''}
                                    ${displayMode === "advanced" ? `
                                    <div style="margin-bottom: 5px;"><strong>${this.t('waterContent')}:</strong> ${p.waterContent.toFixed(4)} kg/kg</div>
                                    <div style="margin-bottom: 5px;"><strong>${this.t('absoluteHumidity')}:</strong> ${p.absoluteHumidity.toFixed(2)} g/m³</div>
                                    <div style="margin-bottom: 5px;"><strong>${this.t('specificVolume')}:</strong> ${p.specificVolume.toFixed(3)} m³/kg</div>
                                    ${showMoldRisk ? `<div style="margin-bottom: 5px;"><strong>🦠 ${this.t('moldRisk')}:</strong> <span style="color: ${this.getMoldRiskColor(p.moldRisk, darkMode)}; font-weight: 600;">${this.getMoldRiskText(p.moldRisk)}</span></div>` : ''}
                                    ` : ''}
                                </div>
                            </div>

                            ${displayMode === "advanced" && p.action ? `
                            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid ${darkMode ? '#555' : '#ddd'};">
                                <div style="margin-bottom: 5px;"><strong>⚡ ${this.t('action')}:</strong> ${p.action}</div>
                                <div style="margin-bottom: 5px;"><strong>${this.t('totalPower')}:</strong> <span style="color: ${p.color}; font-weight: 600;">${p.power.toFixed(1)} W</span></div>
                                ${p.heatingPower > 0 ? `<div style="margin-bottom: 5px;"><strong>🔥 ${this.t('heating')}:</strong> ${p.heatingPower.toFixed(1)} W</div>` : ''}
                                ${p.coolingPower > 0 ? `<div style="margin-bottom: 5px;"><strong>❄️ ${this.t('cooling')}:</strong> ${p.coolingPower.toFixed(1)} W</div>` : ''}
                                ${p.humidificationPower > 0 ? `<div style="margin-bottom: 5px;"><strong>💦 ${this.t('humidification')}:</strong> ${p.humidificationPower.toFixed(1)} W</div>` : ''}
                                ${p.dehumidificationPower > 0 ? `<div style="margin-bottom: 5px;"><strong>🌬️ ${this.t('dehumidification')}:</strong> ${p.dehumidificationPower.toFixed(1)} W</div>` : ''}
                                <div style="margin-bottom: 5px;"><strong>🎯 ${this.t('idealSetpoint')}:</strong> ${this.formatTemp(p.idealSetpoint.temp)}, ${p.idealSetpoint.humidity.toFixed(0)}%</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `
                )
                .join("")}
            </div>`
            : "";

        // Construction du HTML principal avec styles et modal
        this.innerHTML = `
            <style>
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

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .psychro-point-data:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, ${darkMode ? '0.5' : '0.15'}) !important;
                }

                .clickable-value:hover {
                    background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'} !important;
                    transform: scale(1.02);
                }

                .chart-container {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                #psychroChart {
                    max-width: 100%;
                    height: auto;
                    cursor: crosshair;
                    transition: all 0.3s ease;
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
                    background: ${darkMode ? 'linear-gradient(135deg, #2d2d2d, #1a1a1a)' : 'linear-gradient(135deg, #ffffff, #f8f9fa)'};
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .modal-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: ${actualTextColor};
                }

                .modal-close:hover {
                    background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
                    transform: rotate(90deg);
                }

                .history-chart {
                    width: 100%;
                    height: 300px;
                    margin-top: 20px;
                }

                @media (max-width: 768px) {
                    .psychro-data {
                        grid-template-columns: 1fr !important;
                    }

                    .modal-content {
                        padding: 20px;
                        max-width: 95%;
                    }
                }
            </style>
            <ha-card>
                <div style="text-align: center; padding: 16px; background-color: ${actualBgColor}; color: ${actualTextColor};">
                    <h2 style="margin-top: 0; margin-bottom: 16px; color: ${actualTextColor}; animation: ${this._hasRendered ? 'none' : 'fadeInUp 0.5s ease'};">${chartTitle}</h2>
                    <div class="chart-container" style="position: relative;">
                        <canvas id="psychroChart" width="${this.canvasWidth}" height="${this.canvasHeight}"></canvas>
                        ${showLegend ? this.generateLegendHTML(validPoints, actualTextColor, darkMode) : ''}
                    </div>
                    ${calculatedDataHTML}
                </div>
            </ha-card>
            <div id="historyModal" style="display: none;"></div>
        `;

        // Store points for later use
        this.validPoints = validPoints;

        // Store current sensor values for next comparison
        this.storeSensorValues(hass);

        // Mark as rendered
        this._hasRendered = true;

        // Dessiner le graphique
        this.drawFullPsychrometricChart(validPoints, {
            bgColor: actualBgColor,
            gridColor: actualGridColor,
            curveColor,
            textColor: actualTextColor,
            comfortRange,
            comfortColor,
            showEnthalpy,
            showWetBulb,
            showDewPoint,
            darkMode,
            displayMode,
            showPointLabels: this.config.showPointLabels
        });

        // Setup event listeners for history modal
        this.setupHistoryEventListeners(hass, darkMode, actualTextColor, actualBgColor);

        // Setup canvas interactivity
        this.setupCanvasInteractivity(validPoints);
    }

    generateLegendHTML(points, textColor, darkMode) {
        return `
            <div style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: ${darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)'};
                backdrop-filter: blur(10px);
                padding: 12px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, ${darkMode ? '0.5' : '0.2'});
                text-align: left;
                animation: ${this._hasRendered ? 'none' : 'fadeInUp 0.5s ease 0.3s backwards'};">
                <div style="margin-bottom: 8px; font-weight: bold; color: ${textColor}; font-size: 13px;">📍 ${this.t('legend')}</div>
                ${points.map((p, index) => `
                    <div style="
                        display: flex;
                        align-items: center;
                        margin-bottom: 5px;
                        animation: ${this._hasRendered ? 'none' : `fadeInUp 0.3s ease ${0.4 + index * 0.1}s backwards`};">
                        <span style="
                            width: 12px;
                            height: 12px;
                            background-color: ${p.color};
                            display: inline-block;
                            margin-right: 8px;
                            border-radius: 50%;
                            box-shadow: 0 2px 5px ${p.color}80;"></span>
                        <span style="color: ${textColor}; font-size: 12px;">${p.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupHistoryEventListeners(hass, darkMode, textColor, bgColor) {
        // Add click listeners to temperature and humidity values
        setTimeout(() => {
            const clickableElements = this.querySelectorAll('.clickable-value');
            clickableElements.forEach(element => {
                element.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const entityId = element.getAttribute('data-entity');
                    const type = element.getAttribute('data-type');
                    await this.showHistoryModal(entityId, type, hass, darkMode, textColor, bgColor);
                });
            });
        }, 100);
    }

    async showHistoryModal(entityId, type, hass, darkMode, textColor, bgColor) {
        if (this.modalOpen) return;
        this.modalOpen = true;

        const entity = hass.states[entityId];
        if (!entity) return;

        // Get history data (24 hours)
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

        try {
            const historyData = await this.fetchHistory(hass, entityId, startTime, endTime);
            this.renderHistoryModal(historyData, entity, type, darkMode, textColor, bgColor);
        } catch (error) {
            console.error('Error fetching history:', error);
            this.renderHistoryModal([], entity, type, darkMode, textColor, bgColor);
        }
    }

    async fetchHistory(hass, entityId, startTime, endTime) {
        try {
            // Use Home Assistant history API
            const url = `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`;
            const response = await hass.callApi('GET', url);

            if (response && response[0]) {
                return response[0];
            }
            return [];
        } catch (error) {
            console.error('History API error:', error);
            return [];
        }
    }

    renderHistoryModal(historyData, entity, type, darkMode, textColor, bgColor) {
        const modalContainer = this.querySelector('#historyModal');
        const unit = type === 'temperature' ? this.getTempUnit() : '%';
        const icon = type === 'temperature' ? '🌡️' : '💧';
        const label = type === 'temperature' ? this.t('temperature') : this.t('humidity');

        // Calculate statistics
        let min = Infinity, max = -Infinity, sum = 0, count = 0;
        historyData.forEach(item => {
            let value = parseFloat(item.state);
            if (!isNaN(value)) {
                // Convert temperature to display unit
                if (type === 'temperature') {
                    value = this.toDisplayTemp(this.toInternalTemp(value));
                }
                min = Math.min(min, value);
                max = Math.max(max, value);
                sum += value;
                count++;
            }
        });
        const avg = count > 0 ? (sum / count).toFixed(1) : 'N/A';
        min = count > 0 ? min.toFixed(1) : 'N/A';
        max = count > 0 ? max.toFixed(1) : 'N/A';

        modalContainer.style.display = 'block';
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content" style="color: ${textColor}; min-width: 500px;">
                    <button class="modal-close">&times;</button>
                    <h2 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">
                        ${icon} ${label} - ${entity.attributes.friendly_name || entity.entity_id}
                    </h2>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin: 20px 0;
                        padding: 15px;
                        background: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
                        border-radius: 10px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${min}${unit}</div>
                            <div style="font-size: 12px; opacity: 0.7;">${this.t('minimum')}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #2196F3;">${avg}${unit}</div>
                            <div style="font-size: 12px; opacity: 0.7;">${this.t('average')}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #FF5722;">${max}${unit}</div>
                            <div style="font-size: 12px; opacity: 0.7;">${this.t('maximum')}</div>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <canvas id="historyChart" class="history-chart"></canvas>
                    </div>

                    <div style="margin-top: 15px; font-size: 12px; opacity: 0.6; text-align: center;">
                        📅 ${this.t('historyLast24h')} (${count} ${this.t('dataPoints')})
                    </div>
                </div>
            </div>
        `;

        // Draw history chart
        setTimeout(() => {
            this.drawHistoryChart(historyData, type, darkMode, textColor, unit);
        }, 50);

        // Setup close handlers
        const closeBtn = modalContainer.querySelector('.modal-close');
        const overlay = modalContainer.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => this.closeHistoryModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeHistoryModal();
            }
        });
    }

    drawHistoryChart(historyData, type, darkMode, textColor, unit) {
        const canvas = this.querySelector('#historyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = 300;
        canvas.width = width;
        canvas.height = height;

        // Prepare data
        const dataPoints = historyData
            .map(item => {
                let value = parseFloat(item.state);
                // Convert temperature to display unit
                if (type === 'temperature' && !isNaN(value)) {
                    value = this.toDisplayTemp(this.toInternalTemp(value));
                }
                return {
                    time: new Date(item.last_changed || item.last_updated),
                    value: value
                };
            })
            .filter(item => !isNaN(item.value))
            .sort((a, b) => a.time - b.time);

        if (dataPoints.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.t('noDataAvailable'), width / 2, height / 2);
            return;
        }

        // Calculate scales
        const minValue = Math.min(...dataPoints.map(d => d.value));
        const maxValue = Math.max(...dataPoints.map(d => d.value));
        const valueRange = maxValue - minValue || 1;
        const padding = 50;

        // Clear canvas
        ctx.fillStyle = darkMode ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = darkMode ? '#333' : '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * i / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxValue - (valueRange * i / 5);
            ctx.fillStyle = textColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1) + unit, padding - 10, y + 4);
        }

        // Draw line
        ctx.setLineDash([]);
        ctx.strokeStyle = type === 'temperature' ? '#FF5722' : '#2196F3';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (dataPoints.length - 1);
            const y = padding + (height - 2 * padding) * (1 - (point.value - minValue) / valueRange);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = type === 'temperature' ? '#FF5722' : '#2196F3';
        dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (dataPoints.length - 1);
            const y = padding + (height - 2 * padding) * (1 - (point.value - minValue) / valueRange);

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw time labels
        ctx.fillStyle = textColor;
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        [0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].forEach(index => {
            if (dataPoints[index]) {
                const x = padding + (width - 2 * padding) * index / (dataPoints.length - 1);
                const time = dataPoints[index].time;
                ctx.fillText(
                    time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    x,
                    height - padding + 20
                );
            }
        });
    }

    closeHistoryModal() {
        const modalContainer = this.querySelector('#historyModal');
        if (modalContainer) {
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
        }
        this.modalOpen = false;
    }

    setupCanvasInteractivity(points) {
        const canvas = this.querySelector('#psychroChart');
        if (!canvas) return;

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            // Check if hovering over a point
            let hoveredPoint = null;
            points.forEach((point, index) => {
                const pointX = this.tempToX(point.temp);
                const pointY = this.humidityToY(point.temp, point.humidity);

                const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
                if (distance < 15) {
                    hoveredPoint = { ...point, index };
                }
            });

            if (hoveredPoint) {
                canvas.style.cursor = 'pointer';
                this.showTooltip(e, hoveredPoint, rect);
            } else {
                canvas.style.cursor = 'crosshair';
                this.hideTooltip();
            }
        });

        canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    calculateZoomFromRange() {
        if (!this.configuredZoomRange) return;

        const { tempMin, tempMax } = this.configuredZoomRange;

        // Full chart temperature range: -10°C to 50°C (60° total)
        const fullTempRange = 60;
        const desiredTempRange = tempMax - tempMin;

        // Calculate zoom level based on temperature range
        this.zoomLevel = Math.min(this.maxZoom, Math.max(this.minZoom, fullTempRange / desiredTempRange));

        // Calculate pan to center the desired range
        const fullChartCenter = 20;
        const desiredCenter = (tempMin + tempMax) / 2;

        // Pan offset in temperature units, then convert to pixels
        const tempOffset = fullChartCenter - desiredCenter;
        this.panX = tempOffset * 12 * (this.canvasWidth / 800) * this.zoomLevel;

        // For humidity
        if (this.configuredZoomRange.humidityMin !== null && this.configuredZoomRange.humidityMax !== null) {
            const humMin = this.configuredZoomRange.humidityMin;
            const humMax = this.configuredZoomRange.humidityMax;
            const humCenter = (humMin + humMax) / 2;

            const centerTemp = desiredCenter;
            const P_sat = 0.61078 * Math.exp((17.27 * centerTemp) / (centerTemp + 237.3));
            const P_v_center = (humCenter / 100) * P_sat;
            const P_v_50 = (50 / 100) * P_sat;

            const humOffset = (P_v_center - P_v_50) / 4 * 500 * (this.canvasHeight / 600);
            this.panY = humOffset * this.zoomLevel;
        } else {
            this.panY = 0;
        }
    }

    tempToX(temp) {
        // temp is in Celsius (internal format)
        const scaleX = this.canvasWidth / 800;
        const baseX = 50 * scaleX + (temp + 10) * 12 * scaleX;

        if (this.zoomLevel !== 1.0 || this.panX !== 0) {
            const centerX = this.canvasWidth / 2;
            return (baseX - centerX) * this.zoomLevel + centerX + this.panX;
        }

        return baseX;
    }

    humidityToY(temp, humidity) {
        // temp is in Celsius (internal format)
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

    showTooltip(event, point, canvasRect) {
        this.hideTooltip();

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

    hideTooltip() {
        const tooltip = document.getElementById('psychro-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    isInComfortZone(temp, humidity, comfortRange) {
        // temp and comfortRange are in Celsius (internal format)
        return (
            temp >= comfortRange.tempMin &&
            temp <= comfortRange.tempMax &&
            humidity >= comfortRange.rhMin &&
            humidity <= comfortRange.rhMax
        );
    }

    getMoldRiskColor(riskLevel, darkMode = false) {
        const lightModeColors = {
            0: "#2E7D32",
            1: "#558B2F",
            2: "#9E9D24",
            3: "#F9A825",
            4: "#EF6C00",
            5: "#E65100",
            6: "#C62828"
        };

        const darkModeColors = {
            0: "#4CAF50",
            1: "#8BC34A",
            2: "#CDDC39",
            3: "#FFEB3B",
            4: "#FFC107",
            5: "#FF9800",
            6: "#FF5722"
        };

        const colors = darkMode ? darkModeColors : lightModeColors;
        return colors[Math.min(Math.floor(riskLevel), 6)];
    }

    getMoldRiskText(riskLevel) {
        const keys = [
            'moldRiskNone',
            'moldRiskVeryLow',
            'moldRiskLow',
            'moldRiskModerate',
            'moldRiskHigh',
            'moldRiskVeryHigh',
            'moldRiskCritical'
        ];
        return this.t(keys[Math.min(Math.floor(riskLevel), 6)]);
    }

    drawFullPsychrometricChart(points, options) {
        const canvas = this.querySelector("#psychroChart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const {
            bgColor,
            gridColor,
            curveColor,
            textColor,
            comfortRange, // Already in Celsius
            comfortColor,
            showEnthalpy = true,
            showWetBulb = true,
            showDewPoint = true,
            darkMode = false,
            showPointLabels = true,
            displayMode = "standard"
        } = options;

        // Scale factors for responsive design
        const scaleX = width / 800;
        const scaleY = height / 600;
        const scale = Math.min(scaleX, scaleY);

        // Clear canvas
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Responsive padding and dimensions
        const leftPadding = 50 * scaleX;
        const rightEdge = 750 * scaleX;
        const topPadding = 50 * scaleY;
        const bottomEdge = 550 * scaleY;

        // Draw axes and grid
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([5 * scale, 5 * scale]);

        // Vertical grid (vapor pressure)
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
            ctx.fillStyle = textColor;
            ctx.fillText(`${i.toFixed(1)} kPa`, 10 * scaleX, y + 5 * scaleY);
        }

        // Horizontal grid (temperature) - Labels in display unit
        const tempStep = this._temperatureUnit === '°F' ? 9 : 5; // 9°F ≈ 5°C
        const tempStart = this._temperatureUnit === '°F' ? 14 : -10; // 14°F ≈ -10°C
        const tempEnd = this._temperatureUnit === '°F' ? 122 : 50; // 122°F ≈ 50°C

        for (let displayTemp = tempStart; displayTemp <= tempEnd; displayTemp += tempStep) {
            const tempC = this.toInternalTemp(displayTemp);
            const x = this.tempToX(tempC);
            ctx.beginPath();
            ctx.moveTo(x, bottomEdge);
            ctx.lineTo(x, topPadding);
            ctx.stroke();
            ctx.fillStyle = textColor;
            ctx.fillText(`${displayTemp}${this.getTempUnit()}`, x - 15 * scaleX, bottomEdge + 20 * scaleY);
        }

        // Draw relative humidity curves
        ctx.setLineDash([]);
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;

        for (let rh = 10; rh <= 100; rh += 10) {
            ctx.beginPath();
            ctx.strokeStyle = rh === 100 ? "rgba(30, 144, 255, 0.8)" : curveColor;
            ctx.lineWidth = (rh % 20 === 0 ? 1.5 : 0.8) * scale;

            for (let t = -10; t <= 50; t++) {
                const x = this.tempToX(t);
                const y = this.humidityToY(t, rh);

                if (t === -10) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // Label at center temperature
            const labelTemp = 25;
            const labelX = this.tempToX(labelTemp);
            const labelY = this.humidityToY(labelTemp, rh);
            ctx.fillStyle = textColor;
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
                        const x = this.tempToX(t);
                        const y = this.humidityToY(t, rh);
                        enthalpy_points.push({ x, y, t, rh });
                    }
                }

                // Draw smooth curve
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

                // Label enthalpy curves
                if (enthalpy_points.length > 0) {
                    ctx.fillStyle = darkMode ? "rgba(255, 165, 0, 0.9)" : "rgba(255, 99, 71, 0.9)";
                    enthalpy_points.sort((a, b) => b.x - a.x);

                    let labelPoint = enthalpy_points.find(p =>
                        p.y > 70 * scaleY && p.y < 500 * scaleY && p.x > 400 * scaleX
                    ) || enthalpy_points.find(p => p.y > 70 * scaleY && p.y < 500 * scaleY);

                    if (labelPoint) {
                        ctx.save();
                        const neighborIndex = enthalpy_points.indexOf(labelPoint);
                        const neighborPoint = enthalpy_points[Math.max(0, neighborIndex - 5)];

                        if (neighborPoint) {
                            const angleRad = Math.atan2(neighborPoint.y - labelPoint.y, neighborPoint.x - labelPoint.x);
                            ctx.translate(labelPoint.x, labelPoint.y);
                            ctx.rotate(angleRad);
                            ctx.fillText(`${h} kJ/kg`, 5 * scale, -5 * scale);
                        } else {
                            ctx.fillText(`${h} kJ/kg`, labelPoint.x + 5 * scaleX, labelPoint.y - 5 * scaleY);
                        }
                        ctx.restore();
                    }
                }
            }
            ctx.setLineDash([]);
        }

        // Draw Wet Bulb lines
        if (showWetBulb && displayMode !== "minimal") {
            ctx.setLineDash([1 * scale, 4 * scale]);
            ctx.strokeStyle = darkMode ? "rgba(0, 255, 255, 0.4)" : "rgba(0, 100, 255, 0.4)";

            for (let tw = -5; tw <= 35; tw += 5) {
                let wet_bulb_points = [];

                // Iterate through dry bulb temperatures to find corresponding humidity for constant wet bulb
                for (let t = tw; t <= 50; t += 0.5) {
                    // This is an approximation or requires an inverse function.
                    // For simplicity and performance, we can iterate to find the RH that gives this Tw
                    // Or we can use the property that lines of constant wet bulb are nearly straight lines
                    // connecting saturation point (t=Tw, rh=100%) with specific enthalpy.
                    // A better approach for visualization:
                    // Start at saturation curve where T_dry = T_wet

                    // Inverse calculation is complex. Let's use a simplified approach:
                    // Wet bulb lines are lines of constant enthalpy (approximately).
                    // Actually, they are lines of constant adiabatic saturation temperature.
                    // Let's use the helper to find points.

                    // We need to find RH for a given T_dry and T_wet.
                    // Since we don't have an inverse function in the helper yet, let's skip complex calculation
                    // and just draw lines from saturation curve with a fixed slope? No, that's inaccurate.

                    // Let's iterate RH and check Tw
                    // This is expensive.

                    // Alternative: Use the fact that at saturation, Tw = Tdry.
                    // So we start at (Tw, 100%).
                    // Then we can trace down.
                }

                // Let's use a simpler approach: Draw lines from saturation curve
                // At saturation: T_dry = T_wet
                const startX = this.tempToX(tw);
                const startY = this.humidityToY(tw, 100);

                ctx.beginPath();
                ctx.moveTo(startX, startY);

                // Slope of wet bulb lines is roughly -0.4 to -0.5 °C/g/kg (very roughly)
                // Let's use a few points to draw a straight-ish line
                // We know that at 0% RH, the wet bulb depression is max.

                // Let's try to find the point at RH=10% that has this wet bulb temp
                // We can binary search or just scan.
                // Scanning is safer.

                let foundEnd = false;
                for (let t_search = tw; t_search < 60; t_search += 0.5) {
                    for (let rh_search = 100; rh_search > 0; rh_search -= 5) {
                        const calculatedTw = PsychrometricCalculations.calculateWetBulbTemp(t_search, rh_search);
                        if (Math.abs(calculatedTw - tw) < 0.2) {
                            const x = this.tempToX(t_search);
                            const y = this.humidityToY(t_search, rh_search);
                            ctx.lineTo(x, y);
                            break; // Move to next temp step
                        }
                    }
                }
                ctx.stroke();

                // Label
                ctx.fillStyle = darkMode ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 100, 255, 0.6)";
                ctx.fillText(`${tw}°wb`, startX - 15 * scaleX, startY - 5 * scaleY);
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

        // Gradient for comfort zone
        const avgTemp = (comfortRange.tempMin + comfortRange.tempMax) / 2;
        const yTop = this.humidityToY(avgTemp, comfortRange.rhMax);
        const yBottom = this.humidityToY(avgTemp, comfortRange.rhMin);

        const gradient = ctx.createLinearGradient(0, yTop, 0, yBottom);
        const colorMatch = comfortColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (colorMatch) {
            const [, r, g, b, a = '0.5'] = colorMatch;
            const alpha = parseFloat(a);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.max(0, alpha - 0.2)})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha + 0.2)})`);
        } else {
            gradient.addColorStop(0, comfortColor);
            gradient.addColorStop(1, comfortColor);
        }

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = colorMatch
            ? `rgba(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]}, ${Math.min(1, parseFloat(colorMatch[4] || '0.5') + 0.3)})`
            : 'rgba(100, 180, 100, 0.6)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Comfort zone label
        ctx.fillStyle = darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
        ctx.font = `${Math.max(12, 14 * scale)}px Arial`;
        const avgRh = (comfortRange.rhMin + comfortRange.rhMax) / 2;
        const comfortLabelX = this.tempToX(avgTemp);
        const comfortLabelY = this.humidityToY(avgTemp, avgRh);
        ctx.fillText(this.t('comfortZone'), comfortLabelX - 45 * scale, comfortLabelY);

        // Draw measurement points
        points.forEach((point, index) => {
            const { temp, humidity, color, dewPoint } = point;

            const x = this.tempToX(temp);
            const y = this.humidityToY(temp, humidity);

            // Draw point
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = darkMode ? "#ffffff" : "#000000";
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Halo
            ctx.beginPath();
            ctx.arc(x, y, 10 * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = color + '40';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();

            // Dotted lines
            ctx.strokeStyle = color;
            ctx.setLineDash([5 * scale, 5 * scale]);
            ctx.lineWidth = 1 * scale;

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(x, bottomEdge);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw dew point
            if (showDewPoint && displayMode !== "minimal") {
                const dewX = this.tempToX(dewPoint);
                const dewY = this.humidityToY(dewPoint, 100);

                ctx.beginPath();
                ctx.arc(dewX, dewY, 4 * scale, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                ctx.fill();

                ctx.beginPath();
                ctx.setLineDash([3 * scale, 3 * scale]);
                ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
                ctx.lineWidth = 1 * scale;
                ctx.moveTo(x, y);
                ctx.lineTo(dewX, dewY);
                ctx.stroke();

                ctx.setLineDash([]);
            }

            // Point label
            if (showPointLabels !== false) {
                ctx.fillStyle = textColor;
                ctx.font = `${Math.max(10, 10 * scale)}px Arial`;
                ctx.fillText(point.label, x + 10 * scaleX, y - 10 * scaleY);
            }
        });
    }



    setConfig(config) {
        if (!config.points || config.points.length === 0) {
            throw new Error("La configuration doit contenir des points !");
        }
        this.config = config;
        this._language = this.getLanguage();
        // Temperature unit will be detected when hass is set
    }

    static getConfigElement() {
        return document.createElement("psychrometric-chart-editor");
    }

    static getStubConfig() {
        return {
            chartTitle: "Diagramme Psychrométrique",
            points: [],
            showEnthalpy: true,
            showDewPoint: true,
            showWetBulb: true,
            darkMode: false,
            textColor: "#333333"
        };
    }

    getCardSize() {
        return 3;
    }
}

customElements.define("psychrometric-chart-enhanced", PsychrometricChartEnhanced);
