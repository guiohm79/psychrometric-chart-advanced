import { LitElement, css, html } from 'https://unpkg.com/lit?module';

/**
 * Psychrometric Calculations Helper
 * Contains pure functions for psychrometric conversions and calculations.
 * All temperatures are in Celsius internally.
 */
class PsychrometricCalculations {

    // ========================================
    // RANDOM COLOR GENERATION
    // ========================================

    /**
     * Generate a random bright color for points without specified colors.
     * Uses HSL color space to ensure vibrant, saturated colors.
     * @returns {string} Hex color code (e.g., "#ff0000")
     */
    static generateRandomBrightColor() {
        // Generate bright, vibrant colors using HSL
        const hue = Math.floor(Math.random() * 360); // Random hue (0-360)
        const saturation = 80 + Math.floor(Math.random() * 20); // 80-100% saturation
        const lightness = 50 + Math.floor(Math.random() * 15); // 50-65% lightness

        // Convert HSL to hex
        const h = hue / 360;
        const s = saturation / 100;
        const l = lightness / 100;

        const hslToRgb = (h, s, l) => {
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        };

        const [r, g, b] = hslToRgb(h, s, l);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Generate a deterministic color based on a string hash.
     * Ensures the same input string always produces the same color.
     * @param {string} str - Input string (e.g., entity ID)
     * @returns {string} Hex color code
     */
    static generateColorFromHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate HSL from hash
        const hue = Math.abs(hash % 360);
        const saturation = 70 + (Math.abs(hash) % 30); // 70-100%
        const lightness = 45 + (Math.abs(hash) % 20); // 45-65%

        // Convert HSL to RGB then Hex (reusing similar logic or simplified)
        // Simplified HSL to RGB conversion for brevity
        const h = hue / 360;
        const s = saturation / 100;
        const l = lightness / 100;

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // ========================================
    // TEMPERATURE CONVERSION UTILITIES
    // ========================================

    /**
     * Convert Fahrenheit to Celsius
     * @param {number} tempF - Temperature in Fahrenheit
     * @returns {number} Temperature in Celsius
     */
    static fahrenheitToCelsius(tempF) {
        return (tempF - 32) * 5 / 9;
    }

    /**
     * Convert Celsius to Fahrenheit
     * @param {number} tempC - Temperature in Celsius
     * @returns {number} Temperature in Fahrenheit
     */
    static celsiusToFahrenheit(tempC) {
        return (tempC * 9 / 5) + 32;
    }

    // ========================================
    // PSYCHROMETRIC CALCULATION METHODS
    // All calculations work in Celsius internally
    // ========================================

    /**
     * Calculate Dew Point temperature.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Dew point temperature in Celsius
     */
    static calculateDewPoint(temp, humidity) {
        const A = 17.27;
        const B = 237.3;
        const alpha = ((A * temp) / (B + temp)) + Math.log(humidity / 100);
        return (B * alpha) / (A - alpha);
    }

    /**
     * Calculate Water Content (Mixing Ratio).
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Water content in kg/kg (dry air)
     */
    static calculateWaterContent(temp, humidity) {
        const P = 101.325;
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (humidity / 100) * P_sat;
        return 0.622 * (P_v / (P - P_v));
    }

    /**
     * Calculate Enthalpy.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} waterContent - Water content in kg/kg
     * @returns {number} Enthalpy in kJ/kg
     */
    static calculateEnthalpy(temp, waterContent) {
        return 1.006 * temp + waterContent * (2501 + 1.84 * temp);
    }

    /**
     * Calculate Absolute Humidity.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Absolute humidity in g/m³
     */
    static calculateAbsoluteHumidity(temp, rh) {
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (rh / 100) * P_sat;
        const P_v_Pa = P_v * 1000;
        const absHumidity_kg = P_v_Pa / (461.5 * (temp + 273.15));
        return absHumidity_kg * 1000;
    }

    /**
     * Calculate Wet Bulb Temperature (Stull's formula).
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Wet bulb temperature in Celsius
     */
    static calculateWetBulbTemp(temp, rh) {
        const tw = temp * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5))
            + Math.atan(temp + rh) - Math.atan(rh - 1.676331)
            + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
        return tw;
    }

    /**
     * Calculate Vapor Pressure.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Vapor pressure in kPa
     */
    static calculateVaporPressure(temp, rh) {
        return 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3)) * (rh / 100);
    }

    /**
     * Calculate Specific Volume.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Specific volume in m³/kg
     */
    static calculateSpecificVolume(temp, rh) {
        const P = 101.325;
        const Rd = 287.058;
        const T = temp + 273.15;
        const P_v = this.calculateVaporPressure(temp, rh);
        const W = this.calculateWaterContent(temp, rh);
        return (Rd * T) / (P - P_v) * (1 + 1.608 * W);
    }

    /**
     * Calculate Mold Risk based on temperature and humidity.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Risk level (0-6)
     */
    static calculateMoldRisk(temp, humidity) {
        let risk = 0;

        if (temp < 5) {
            risk += 0;
        } else if (temp >= 5 && temp < 15) {
            risk += 1;
        } else if (temp >= 15 && temp < 20) {
            risk += 2;
        } else if (temp >= 20 && temp < 25) {
            risk += 3;
        } else if (temp >= 25) {
            risk += 2.5;
        }

        if (humidity < 60) {
            risk += 0;
        } else if (humidity >= 60 && humidity < 70) {
            risk += 1;
        } else if (humidity >= 70 && humidity < 80) {
            risk += 2;
        } else if (humidity >= 80 && humidity < 90) {
            risk += 2.5;
        } else if (humidity >= 90) {
            risk += 3;
        }

        const dewPoint = this.calculateDewPoint(temp, humidity);
        if (dewPoint > 12) {
            risk += 0.5;
        }

        return Math.min(risk, 6);
    }

    /**
     * Calculate PMV (Predicted Mean Vote) thermal comfort index.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} PMV index (-3 to +3)
     */
    static calculatePMV(temp, humidity) {
        const ta = temp;
        const tr = temp;
        const rh_fraction = humidity / 100;
        const met = 1.2;
        const M = met * 58.15;

        const pa = rh_fraction * 10 * Math.exp(16.6536 - 4030.183 / (ta + 235));

        let pmv = 0.303 * Math.exp(-0.036 * M) + 0.028;
        pmv *= (M - 58.15) - 0.42 * (M - 50) - 0.0173 * M * (5.87 - pa)
            - 0.0014 * M * (34 - ta) - 3.96 * Math.pow(10, -8) * 0.7 * (Math.pow(tr + 273, 4) - Math.pow(ta + 273, 4))
            - 0.072 * 0.7 * (34 - ta) - 0.054 * (5.87 - pa);

        return Math.max(-3, Math.min(3, pmv));
    }

    /**
     * Calculate ideal setpoint to reach comfort zone with minimal energy.
     * @param {number} temp - Current temperature in Celsius
     * @param {number} humidity - Current humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {Object} Ideal setpoint {temp, humidity}
     */
    static calculateIdealSetpoint(temp, humidity, comfortRange) {
        let idealTemp = temp;
        let idealHumidity = humidity;

        if (temp < comfortRange.tempMin) {
            idealTemp = comfortRange.tempMin;
        } else if (temp > comfortRange.tempMax) {
            idealTemp = comfortRange.tempMax;
        }

        if (humidity < comfortRange.rhMin) {
            idealHumidity = comfortRange.rhMin;
        } else if (humidity > comfortRange.rhMax) {
            idealHumidity = comfortRange.rhMax;
        }

        const isSummer = temp > 23;

        if (idealTemp === temp && idealHumidity === humidity) {
            if (isSummer) {
                idealTemp = Math.min(temp, comfortRange.tempMax);
                idealHumidity = Math.max(comfortRange.rhMin, Math.min(humidity, comfortRange.rhMin + 5));
            } else {
                idealTemp = Math.max(temp, comfortRange.tempMin);
                idealHumidity = Math.min(comfortRange.rhMax, Math.max(humidity, comfortRange.rhMax - 5));
            }
        }

        return { temp: idealTemp, humidity: idealHumidity };
    }

    /**
     * Calculate heating power required.
     * @param {number} temp - Current temperature
     * @param {number} targetTemp - Target temperature
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateHeatingPower(temp, targetTemp, massFlowRate) {
        const cp = 1.006;
        return massFlowRate * cp * (targetTemp - temp) * 1000;
    }

    /**
     * Calculate cooling power required.
     * @param {number} temp - Current temperature
     * @param {number} targetTemp - Target temperature
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateCoolingPower(temp, targetTemp, massFlowRate) {
        return Math.abs(this.calculateHeatingPower(temp, targetTemp, massFlowRate));
    }

    /**
     * Calculate power required for humidification/dehumidification.
     * @param {number} temp - Current temperature
     * @param {number} humidity - Current humidity
     * @param {number} targetHumidity - Target humidity
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateHumidityPower(temp, humidity, targetHumidity, massFlowRate) {
        const P = 101.325;
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v_actual = (humidity / 100) * P_sat;
        const W_actual = 0.622 * (P_v_actual / (P - P_v_actual));

        const P_v_target = (targetHumidity / 100) * P_sat;
        const W_target = 0.622 * (P_v_target / (P - P_v_target));

        const deltaW = W_target - W_actual;
        const latentHeat = 2501;

        return Math.abs(deltaW * massFlowRate * latentHeat * 1000);
    }
}

/**
 * Fire a custom event.
 * @param {HTMLElement} node - The element to dispatch the event from
 * @param {string} type - The event type
 * @param {Object} detail - The event detail
 * @param {Object} options - Event options
 * @returns {Event} The dispatched event
 */
const fireEvent = (node, type, detail, options) => {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new CustomEvent(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
        detail: detail,
    });
    node.dispatchEvent(event);
    return event;
};

const editorTranslations = {
    fr: {
        general: "Général",
        title: "Titre",
        language: "Langue",
        measurementPoints: "Points de mesure",
        point: "Point",
        delete: "Supprimer",
        label: "Label",
        tempEntity: "Température (Entity ID)",
        humEntity: "Humidité (Entity ID)",
        color: "Couleur",
        icon: "Icône",
        customDisplay: "Affichage personnalisé",
        dewPoint: "Point de rosée",
        wetBulb: "Temp. humide",
        enthalpy: "Enthalpie",
        absHumidity: "Humidité abs.",
        waterContent: "Teneur en eau",
        specificVolume: "Vol. spécifique",
        pmvIndex: "Indice PMV",
        moldRisk: "Moisissure",
        action: "Action/Puissance",
        addPoint: "Ajouter un point",
        appearance: "Apparence",
        displayMode: "Mode d'affichage",
        standard: "Standard",
        minimal: "Minimal",
        advanced: "Avancé",
        bgColor: "Couleur de fond",
        textColor: "Couleur du texte",
        gridColor: "Couleur de la grille",
        curveColor: "Couleur des courbes",
        curveColor: "Couleur des courbes",
        enthalpyColor: "Couleur des enthalpies",
        comfortColor: "Couleur zone confort",
        displayOptions: "Options d'affichage",
        showEnthalpy: "Afficher Enthalpie",
        showVaporPressure: "Afficher Pression Vapeur",
        showDewPoint: "Afficher Point de Rosée",
        showWetBulb: "Afficher Temp. Humide",
        showMoldRisk: "Afficher Risque Moisissure",
        showLegend: "Afficher Légende",
        showCalculatedData: "Afficher Données Calculées",
        forceDarkMode: "Mode Sombre Forcé",
        darkModeHelp: "Si décoché, suit le thème de Home Assistant.",
        zoomPan: "Zoom & Panoramique (Optionnel)",
        minTemp: "Température Min",
        maxTemp: "Température Max",
        minHum: "Humidité Min",
        maxHum: "Humidité Max"
    },
    en: {
        general: "General",
        title: "Title",
        language: "Language",
        measurementPoints: "Measurement Points",
        point: "Point",
        delete: "Delete",
        label: "Label",
        tempEntity: "Temperature (Entity ID)",
        humEntity: "Humidity (Entity ID)",
        color: "Color",
        icon: "Icon",
        customDisplay: "Custom Display",
        dewPoint: "Dew Point",
        wetBulb: "Wet Bulb",
        enthalpy: "Enthalpy",
        absHumidity: "Abs. Humidity",
        waterContent: "Water Content",
        specificVolume: "Specific Vol.",
        pmvIndex: "PMV Index",
        moldRisk: "Mold Risk",
        action: "Action/Power",
        addPoint: "Add Point",
        appearance: "Appearance",
        displayMode: "Display Mode",
        standard: "Standard",
        minimal: "Minimal",
        advanced: "Advanced",
        bgColor: "Background Color",
        textColor: "Text Color",
        gridColor: "Grid Color",
        curveColor: "Curve Color",
        curveColor: "Curve Color",
        enthalpyColor: "Enthalpy Color",
        comfortColor: "Comfort Zone Color",
        displayOptions: "Display Options",
        showEnthalpy: "Show Enthalpy",
        showVaporPressure: "Show Vapor Pressure",
        showDewPoint: "Show Dew Point",
        showWetBulb: "Show Wet Bulb",
        showMoldRisk: "Show Mold Risk",
        showLegend: "Show Legend",
        showCalculatedData: "Show Calculated Data",
        forceDarkMode: "Force Dark Mode",
        darkModeHelp: "If unchecked, follows Home Assistant theme.",
        zoomPan: "Zoom & Pan (Optional)",
        minTemp: "Min Temperature",
        maxTemp: "Max Temperature",
        minHum: "Min Humidity",
        maxHum: "Max Humidity"
    },
    es: {
        general: "General",
        title: "Título",
        language: "Idioma",
        measurementPoints: "Puntos de medición",
        point: "Punto",
        delete: "Eliminar",
        label: "Etiqueta",
        tempEntity: "Temperatura (Entity ID)",
        humEntity: "Humedad (Entity ID)",
        color: "Color",
        icon: "Icono",
        customDisplay: "Visualización personalizada",
        dewPoint: "Punto de rocío",
        wetBulb: "Temp. húmeda",
        enthalpy: "Entalpía",
        absHumidity: "Humedad abs.",
        waterContent: "Contenido de agua",
        specificVolume: "Vol. específico",
        pmvIndex: "Índice PMV",
        moldRisk: "Riesgo de moho",
        action: "Acción/Potencia",
        addPoint: "Añadir punto",
        appearance: "Apariencia",
        displayMode: "Modo de visualización",
        standard: "Estándar",
        minimal: "Mínimo",
        advanced: "Avanzado",
        bgColor: "Color de fondo",
        textColor: "Color del texto",
        gridColor: "Color de la cuadrícula",
        curveColor: "Color de las curvas",
        curveColor: "Color de las curvas",
        enthalpyColor: "Color de las entalpías",
        comfortColor: "Color zona confort",
        displayOptions: "Opciones de visualización",
        showEnthalpy: "Mostrar Entalpía",
        showVaporPressure: "Mostrar Presión de Vapor",
        showDewPoint: "Mostrar Punto de Rocío",
        showWetBulb: "Mostrar Temp. Húmeda",
        showMoldRisk: "Mostrar Riesgo Moho",
        showLegend: "Mostrar Leyenda",
        showCalculatedData: "Mostrar Datos Calculados",
        forceDarkMode: "Modo Oscuro Forzado",
        darkModeHelp: "Si está desmarcado, sigue el tema de Home Assistant.",
        zoomPan: "Zoom y Panorámica (Opcional)",
        minTemp: "Temp. Mín",
        maxTemp: "Temp. Máx",
        minHum: "Humedad Mín",
        maxHum: "Humedad Máx"
    },
    de: {
        general: "Allgemein",
        title: "Titel",
        language: "Sprache",
        measurementPoints: "Messpunkte",
        point: "Punkt",
        delete: "Löschen",
        label: "Beschriftung",
        tempEntity: "Temperatur (Entity ID)",
        humEntity: "Feuchtigkeit (Entity ID)",
        color: "Farbe",
        icon: "Symbol",
        customDisplay: "Benutzerdefinierte Anzeige",
        dewPoint: "Taupunkt",
        wetBulb: "Feuchtkugeltemp.",
        enthalpy: "Enthalpie",
        absHumidity: "Abs. Feuchtigkeit",
        waterContent: "Wassergehalt",
        specificVolume: "Spezifisches Vol.",
        pmvIndex: "PMV-Index",
        moldRisk: "Schimmelrisiko",
        action: "Aktion/Leistung",
        addPoint: "Punkt hinzufügen",
        appearance: "Aussehen",
        displayMode: "Anzeigemodus",
        standard: "Standard",
        minimal: "Minimal",
        advanced: "Erweitert",
        bgColor: "Hintergrundfarbe",
        textColor: "Textfarbe",
        gridColor: "Gitterfarbe",
        curveColor: "Kurvenfarbe",
        curveColor: "Kurvenfarbe",
        enthalpyColor: "Enthalpiefarbe",
        comfortColor: "Komfortzonenfarbe",
        displayOptions: "Anzeigeoptionen",
        showEnthalpy: "Enthalpie anzeigen",
        showVaporPressure: "Dampfdruck anzeigen",
        showDewPoint: "Taupunkt anzeigen",
        showWetBulb: "Feuchtkugeltemp. anzeigen",
        showMoldRisk: "Schimmelrisiko anzeigen",
        showLegend: "Legende anzeigen",
        showCalculatedData: "Berechnete Daten anzeigen",
        forceDarkMode: "Dunkelmodus erzwingen",
        darkModeHelp: "Wenn deaktiviert, folgt dem Home Assistant Thema.",
        zoomPan: "Zoom & Schwenken (Optional)",
        minTemp: "Min Temperatur",
        maxTemp: "Max Temperatur",
        minHum: "Min Feuchtigkeit",
        maxHum: "Max Feuchtigkeit"
    }
};

/**
 * Psychrometric Chart Editor
 * Visual editor for the Psychrometric Chart card.
 */
class PsychrometricChartEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /**
     * Set the configuration for the editor.
     * @param {Object} config - The configuration object
     */
    setConfig(config) {
        this._config = config;
        this.render();
    }

    /**
     * Get the chart title from config.
     * @returns {string} The chart title
     */
    get _title() {
        return this._config?.chartTitle || 'Diagramme Psychrométrique';
    }

    /**
     * Get the points from config.
     * @returns {Array} List of points
     */
    get _points() {
        return this._config?.points || [];
    }

    /**
     * Get translation for key
     * @param {string} key 
     * @returns {string}
     */
    t(key) {
        const lang = this._config?.language || 'fr';
        return editorTranslations[lang]?.[key] || editorTranslations['fr'][key] || key;
    }

    _getHexFromColor(color) {
        if (!color) return '#000000';
        if (color.startsWith('#')) {
            return color.substring(0, 7);
        }
        if (color.startsWith('rgb')) {
            const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                const [_, r, g, b] = match;
                return "#" +
                    (1 << 24 | parseInt(r) << 16 | parseInt(g) << 8 | parseInt(b))
                        .toString(16).slice(1);
            }
        }
        return '#000000';
    }

    _getAlphaFromColor(color) {
        if (!color) return 1;
        if (color.startsWith('#') && color.length > 7) {
            return parseInt(color.substring(7, 9), 16) / 255;
        }
        if (color.startsWith('rgba')) {
            const match = color.match(/[\d.]+\)$/); // Match last number before )
            if (match) {
                // This is a bit weak, let's do better regex
                const parts = color.split(',');
                if (parts.length === 4) {
                    return parseFloat(parts[3]);
                }
            }
        }
        return 1;
    }

    _combineColor(hex, alpha) {
        if (alpha >= 1) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    _renderColorInput(label, id, value) {
        const hex = this._getHexFromColor(value);
        const alpha = Math.round(this._getAlphaFromColor(value) * 100);
        return `
            <div class="form-row">
                <label>${label}</label>
                <div style="display: flex; gap: 8px; flex: 2; align-items: center;">
                    <input type="color" id="${id}_hex" value="${hex}" data-base-id="${id}" class="color-hex-input" style="flex: 1; height: 30px; padding: 0;">
                    <input type="range" id="${id}_alpha" min="0" max="100" value="${alpha}" data-base-id="${id}" class="color-alpha-input" style="flex: 1;" title="Opacité: ${alpha}%">
                    <span style="width: 35px; text-align: right; font-size: 0.8em;" id="${id}_alpha_display">${alpha}%</span>
                </div>
            </div>
        `;
    }

    /**
     * Render the editor UI.
     */
    render() {
        if (!this._config) return;

        this.shadowRoot.innerHTML = `
            <style>
                .card-config {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    color: var(--primary-text-color);
                    background-color: var(--card-background-color);
                }
                .section {
                    border: 1px solid var(--divider-color, #e0e0e0);
                    padding: 16px;
                    border-radius: 8px;
                    background-color: var(--card-background-color);
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 12px;
                    display: block;
                    font-size: 1.1em;
                    color: var(--primary-text-color);
                }
                .form-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                    gap: 8px;
                }
                .form-row label {
                    flex: 1;
                    color: var(--primary-text-color);
                }
                .form-row input[type="text"],
                .form-row input[type="number"],
                .select-input {
                    flex: 2;
                    padding: 8px;
                    border: 1px solid var(--divider-color, #ccc);
                    border-radius: 4px;
                    background-color: var(--card-background-color);
                    color: var(--primary-text-color);
                }
                .form-row input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                }
                .point-row {
                    background: var(--secondary-background-color, #f5f5f5);
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 8px;
                    border-left: 4px solid var(--primary-color, #2196F3);
                }
                .point-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    color: var(--primary-text-color);
                }
                button {
                    cursor: pointer;
                    padding: 8px 16px;
                    background-color: var(--primary-color, #2196F3);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-weight: 500;
                }
                button.delete {
                    background-color: var(--error-color, #F44336);
                    padding: 4px 8px;
                    font-size: 12px;
                }
                button.add {
                    background-color: var(--success-color, #4CAF50);
                    width: 100%;
                    margin-top: 8px;
                }
                .help-text {
                    font-size: 0.8em;
                    color: var(--secondary-text-color);
                    margin-top: -8px;
                    margin-bottom: 12px;
                }
            </style>
            <div class="card-config">
                <div class="section">
                    <span class="section-title">${this.t('general')}</span>
                    <div class="form-row">
                        <label>${this.t('title')}</label>
                        <input type="text" id="chartTitle" value="${this._title}">
                    </div>
                    <div class="form-row">
                        <label>${this.t('language')}</label>
                        <select id="language" class="select-input">
                            <option value="fr" ${this._config.language === 'fr' ? 'selected' : ''}>Français</option>
                            <option value="en" ${this._config.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="es" ${this._config.language === 'es' ? 'selected' : ''}>Español</option>
                            <option value="de" ${this._config.language === 'de' ? 'selected' : ''}>Deutsch</option>
                        </select>
                    </div>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('measurementPoints')}</span>
                    <div id="points-container">
                        ${this._points.map((point, index) => `
                            <div class="point-row">
                                <div class="point-header">
                                    <strong>${this.t('point')} ${index + 1}</strong>
                                    <button class="delete" data-index="${index}">${this.t('delete')}</button>
                                </div>
                                <div class="form-row">
                                    <label>${this.t('label')}</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="label" value="${point.label || ''}" placeholder="Ex: Salon">
                                </div>
                                <div class="form-row">
                                    <label>${this.t('tempEntity')}</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="temp" value="${point.temp || ''}" placeholder="sensor.temp_salon">
                                </div>
                                <div class="form-row">
                                    <label>${this.t('humEntity')}</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="humidity" value="${point.humidity || ''}" placeholder="sensor.hum_salon">
                                </div>
                                <div class="form-row">
                                    <label>${this.t('color')}</label>
                                    <div style="display: flex; gap: 8px; flex: 2; align-items: center;">
                                        <input type="color" 
                                               class="point-color-hex" 
                                               data-index="${index}" 
                                               value="${this._getHexFromColor(point.color || '#000000')}"
                                               style="flex: 1; height: 30px; padding: 0;">
                                        <input type="range" 
                                               class="point-color-alpha" 
                                               data-index="${index}" 
                                               min="0" max="100" 
                                               value="${Math.round(this._getAlphaFromColor(point.color || '#000000') * 100)}"
                                               style="flex: 1;">
                                        <span style="width: 35px; text-align: right; font-size: 0.8em;">
                                            ${Math.round(this._getAlphaFromColor(point.color || '#000000') * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label>${this.t('icon')}</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="icon" value="${point.icon || 'mdi:thermometer'}" placeholder="mdi:thermometer">
                                </div>

                                <details>
                                    <summary>${this.t('customDisplay')}</summary>
                                    <div class="checkbox-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 10px; background: rgba(0,0,0,0.05);">
                                        ${this._renderDetailCheckbox(index, point, 'dewPoint', this.t('dewPoint'))}
                                        ${this._renderDetailCheckbox(index, point, 'wetBulb', this.t('wetBulb'))}
                                        ${this._renderDetailCheckbox(index, point, 'enthalpy', this.t('enthalpy'))}
                                        ${this._renderDetailCheckbox(index, point, 'absHumidity', this.t('absHumidity'))}
                                        ${this._renderDetailCheckbox(index, point, 'waterContent', this.t('waterContent'))}
                                        ${this._renderDetailCheckbox(index, point, 'specificVolume', this.t('specificVolume'))}
                                        ${this._renderDetailCheckbox(index, point, 'pmvIndex', this.t('pmvIndex'))}
                                        ${this._renderDetailCheckbox(index, point, 'moldRisk', this.t('moldRisk'))}
                                        ${this._renderDetailCheckbox(index, point, 'action', this.t('action'))}
                                    </div>
                                </details>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add" id="addPoint">${this.t('addPoint')}</button>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('appearance')}</span>
                    <div class="form-row">
                        <label>${this.t('displayMode')}</label>
                        <select id="displayMode" class="select-input">
                            <option value="standard" ${this._config.displayMode === 'standard' ? 'selected' : ''}>${this.t('standard')}</option>
                            <option value="minimal" ${this._config.displayMode === 'minimal' ? 'selected' : ''}>${this.t('minimal')}</option>
                            <option value="advanced" ${this._config.displayMode === 'advanced' ? 'selected' : ''}>${this.t('advanced')}</option>
                        </select>
                    </div>
                    ${this._renderColorInput(this.t('bgColor'), 'bgColor', this._config.bgColor || '#ffffff')}
                    ${this._renderColorInput(this.t('textColor'), 'textColor', this._config.textColor || '#333333')}
                    ${this._renderColorInput(this.t('gridColor'), 'gridColor', this._config.gridColor || '#e0e0e0')}
                    ${this._renderColorInput(this.t('curveColor'), 'curveColor', this._config.curveColor || '#e0e0e0')}
                    ${this._renderColorInput(this.t('enthalpyColor'), 'enthalpyColor', this._config.enthalpyColor || '')}
                    ${this._renderColorInput(this.t('comfortColor'), 'comfortColor', this._config.comfortColor || 'rgba(100, 180, 100, 0.3)')}
                </div>

                <div class="section">
                    <span class="section-title">${this.t('displayOptions')}</span>
                    <div class="form-row">
                        <label>${this.t('showEnthalpy')}</label>
                        <input type="checkbox" id="showEnthalpy" ${this._config.showEnthalpy !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>${this.t('showVaporPressure')}</label>
                        <input type="checkbox" id="showVaporPressure" ${this._config.showVaporPressure !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>${this.t('showDewPoint')}</label>
                        <input type="checkbox" id="showDewPoint" ${this._config.showDewPoint !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>${this.t('showWetBulb')}</label>
                        <input type="checkbox" id="showWetBulb" ${this._config.showWetBulb !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>${this.t('showMoldRisk')}</label>
                        <input type="checkbox" id="showMoldRisk" ${this._config.showMoldRisk !== false ? 'checked' : ''}>
                    </div>
                     <div class="form-row">
                        <label>${this.t('showLegend')}</label>
                        <input type="checkbox" id="showLegend" ${this._config.showLegend !== false ? 'checked' : ''}>
                    </div>
                     <div class="form-row">
                        <label>${this.t('showCalculatedData')}</label>
                        <input type="checkbox" id="showCalculatedData" ${this._config.showCalculatedData !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>${this.t('forceDarkMode')}</label>
                        <input type="checkbox" id="darkMode" ${this._config.darkMode ? 'checked' : ''}>
                    </div>
                    <div class="help-text">${this.t('darkModeHelp')}</div>
                </div>

                 <div class="section">
                    <span class="section-title">${this.t('zoomPan')}</span>
                    <div class="form-row">
                        <label>${this.t('minTemp')}</label>
                        <input type="number" id="zoom_temp_min" value="${this._config.zoom_temp_min || ''}" placeholder="Ex: 15">
                    </div>
                    <div class="form-row">
                        <label>${this.t('maxTemp')}</label>
                        <input type="number" id="zoom_temp_max" value="${this._config.zoom_temp_max || ''}" placeholder="Ex: 30">
                    </div>
                    <div class="form-row">
                        <label>${this.t('minHum')}</label>
                        <input type="number" id="zoom_humidity_min" value="${this._config.zoom_humidity_min || ''}" placeholder="Ex: 30">
                    </div>
                    <div class="form-row">
                        <label>${this.t('maxHum')}</label>
                        <input type="number" id="zoom_humidity_max" value="${this._config.zoom_humidity_max || ''}" placeholder="Ex: 70">
                    </div>
                </div>
            </div>
        `;

        this._addEventListeners();

        // Delete buttons
        this.shadowRoot.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', this._deletePoint.bind(this));
        });
    }

    _renderDetailCheckbox(index, point, field, label) {
        const isChecked = point.details && point.details.includes(field);
        return `
            <label style="display: flex; align-items: center; font-size: 0.9em;">
                <input type="checkbox" 
                       class="point-detail-checkbox" 
                       data-index="${index}" 
                       data-value="${field}" 
                       ${isChecked ? 'checked' : ''}>
                ${label}
            </label>
        `;
    }

    /**
     * Add event listeners to form elements.
     */
    _addEventListeners() {
        // Global inputs
        this.shadowRoot.getElementById('chartTitle').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('language').addEventListener('change', this._valueChanged.bind(this));

        // Appearance
        this.shadowRoot.getElementById('displayMode').addEventListener('change', this._valueChanged.bind(this));
        // Appearance - Colors
        this.shadowRoot.querySelectorAll('.color-hex-input').forEach(input => {
            input.addEventListener('input', this._colorChanged.bind(this));
        });
        this.shadowRoot.querySelectorAll('.color-alpha-input').forEach(input => {
            input.addEventListener('input', this._colorChanged.bind(this));
        });

        this.shadowRoot.getElementById('showEnthalpy').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showVaporPressure').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showDewPoint').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showWetBulb').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showMoldRisk').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showLegend').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showCalculatedData').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('darkMode').addEventListener('change', this._valueChanged.bind(this));

        // Zoom inputs
        this.shadowRoot.getElementById('zoom_temp_min').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('zoom_temp_max').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('zoom_humidity_min').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('zoom_humidity_max').addEventListener('change', this._valueChanged.bind(this));

        // Add point button
        this.shadowRoot.getElementById('addPoint').addEventListener('click', this._addPoint.bind(this));

        // Point inputs
        this.shadowRoot.querySelectorAll('.point-input').forEach(input => {
            input.addEventListener('change', this._pointChanged.bind(this));
        });

        // Point colors
        this.shadowRoot.querySelectorAll('.point-color-hex, .point-color-alpha').forEach(input => {
            input.addEventListener('input', this._pointColorChanged.bind(this));
        });

        // Point details checkboxes
        this.shadowRoot.querySelectorAll('.point-detail-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this._pointDetailChanged.bind(this));
        });

        // Delete buttons
        this.shadowRoot.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', this._deletePoint.bind(this));
        });
    }

    _pointDetailChanged(e) {
        const index = parseInt(e.target.dataset.index);
        const value = e.target.dataset.value;
        const checked = e.target.checked;

        // Deep clone points array to ensure immutability
        const points = this._points.map(p => ({ ...p }));

        if (!points[index].details) {
            points[index].details = [];
        } else {
            // Clone details array
            points[index].details = [...points[index].details];
        }

        if (checked) {
            if (!points[index].details.includes(value)) {
                points[index].details.push(value);
            }
        } else {
            points[index].details = points[index].details.filter(v => v !== value);
        }

        this._config = { ...this._config, points };
        fireEvent(this, 'config-changed', { config: this._config });
    }

    _colorChanged(e) {
        if (!this._config) return;
        const target = e.target;
        const baseId = target.dataset.baseId;

        const hexInput = this.shadowRoot.getElementById(`${baseId}_hex`);
        const alphaInput = this.shadowRoot.getElementById(`${baseId}_alpha`);
        const alphaDisplay = this.shadowRoot.getElementById(`${baseId}_alpha_display`);

        if (alphaDisplay) {
            alphaDisplay.textContent = `${alphaInput.value}%`;
        }

        const color = this._combineColor(hexInput.value, parseInt(alphaInput.value) / 100);

        this._config = {
            ...this._config,
            [baseId]: color
        };

        fireEvent(this, 'config-changed', { config: this._config });
    }

    _pointColorChanged(e) {
        if (!this._config) return;
        const target = e.target;
        const index = parseInt(target.dataset.index);
        const row = target.closest('.form-row');

        const hexInput = row.querySelector('.point-color-hex');
        const alphaInput = row.querySelector('.point-color-alpha');
        const alphaDisplay = row.querySelector('span');

        if (alphaDisplay) {
            alphaDisplay.textContent = `${alphaInput.value}%`;
        }

        const color = this._combineColor(hexInput.value, parseInt(alphaInput.value) / 100);

        const newPoints = [...(this._config.points || [])];
        if (!newPoints[index]) newPoints[index] = {};

        newPoints[index] = {
            ...newPoints[index],
            color: color
        };

        this._config = {
            ...this._config,
            points: newPoints
        };

        fireEvent(this, 'config-changed', { config: this._config });
    }

    _valueChanged(e) {
        if (!this._config) return;
        const target = e.target;
        const key = target.id;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this._config = {
            ...this._config,
            [key]: value
        };

        fireEvent(this, 'config-changed', { config: this._config });
    }

    /**
     * Handle point config value changes.
     * @param {Event} e - Change event
     */
    _pointChanged(e) {
        if (!this._config) return;
        const target = e.target;
        const index = parseInt(target.dataset.index);
        const field = target.dataset.field;
        const value = target.value;

        const newPoints = [...(this._config.points || [])];
        if (!newPoints[index]) newPoints[index] = {};

        newPoints[index] = {
            ...newPoints[index],
            [field]: value
        };

        this._config = {
            ...this._config,
            points: newPoints
        };

        fireEvent(this, 'config-changed', { config: this._config });
    }

    /**
     * Add a new point to the configuration.
     */
    _addPoint() {
        const newPoints = [...(this._config.points || [])];
        newPoints.push({
            temp: '',
            humidity: '',
            label: 'Nouveau point',
            color: '#FF0000'
        });

        this._config = {
            ...this._config,
            points: newPoints
        };

        fireEvent(this, 'config-changed', { config: this._config });
    }

    /**
     * Delete a point from the configuration.
     * @param {Event} e - Click event
     */
    _deletePoint(e) {
        const index = parseInt(e.target.dataset.index);
        const newPoints = [...(this._config.points || [])];
        newPoints.splice(index, 1);

        this._config = {
            ...this._config,
            points: newPoints
        };

        fireEvent(this, 'config-changed', { config: this._config });
    }
}

customElements.define("psychrometric-chart-editor", PsychrometricChartEditor);

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
                waterContent: 'Teneur en eau',
                specificVolume: 'Volume spécifique',
                pmvIndex: 'Indice PMV',
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
                clickToViewHistory: '.',
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
                waterContent: 'Water content',
                specificVolume: 'Specific volume',
                pmvIndex: 'PMV Index',
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
                clickToViewHistory: '.',
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
                waterContent: 'Contenido de agua',
                specificVolume: 'Volumen específico',
                pmvIndex: 'Índice PMV',
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
                clickToViewHistory: '.',
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
                waterContent: 'Wassergehalt',
                specificVolume: 'Spezifisches Volumen',
                pmvIndex: 'PMV-Index',
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
                clickToViewHistory: '.',
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
                color: point.color || PsychrometricCalculations.generateColorFromHash(`${point.temp}_${point.humidity}`),
                label: point.label || `${point.temp} & ${point.humidity}`,
                icon: point.icon || "mdi:thermometer",
                inComfortZone: this.isInComfortZone(temp, humidity, comfortRange),
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
    _calculateChartBounds() {
        const defaultMinTemp = -10;
        const defaultMaxTemp = 50;
        const defaultMinHum = 0;
        const defaultMaxHum = 100;

        let minTemp = defaultMinTemp;
        let maxTemp = defaultMaxTemp;
        let minHum = defaultMinHum;
        let maxHum = defaultMaxHum;

        if (this.config) {
            if (this.config.zoom_temp_min !== undefined && this.config.zoom_temp_min !== '') minTemp = parseFloat(this.config.zoom_temp_min);
            if (this.config.zoom_temp_max !== undefined && this.config.zoom_temp_max !== '') maxTemp = parseFloat(this.config.zoom_temp_max);
            if (this.config.zoom_humidity_min !== undefined && this.config.zoom_humidity_min !== '') minHum = parseFloat(this.config.zoom_humidity_min);
            if (this.config.zoom_humidity_max !== undefined && this.config.zoom_humidity_max !== '') maxHum = parseFloat(this.config.zoom_humidity_max);
        }

        // Calculate max Vapor Pressure based on max Temp and max Humidity
        // Saturation pressure at maxTemp
        const P_sat_max = 0.61078 * Math.exp((17.27 * maxTemp) / (maxTemp + 237.3));
        // Max vapor pressure to display
        const maxPv = (maxHum / 100) * P_sat_max;

        return { minTemp, maxTemp, minHum, maxHum, maxPv };
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
            displayMode = "standard",
            enthalpyColor
        } = this.config;

        // Use configured colors or defaults based on mode
        const actualBgColor = this.config.bgColor || (darkMode ? "#1c1c1c" : "#ffffff");
        const actualGridColor = this.config.gridColor || (darkMode ? "#444444" : "#cccccc");
        const actualCurveColor = this.config.curveColor || (darkMode ? "#4fc3f7" : "#1f77b4");
        const actualTextColor = this.config.textColor || (darkMode ? "#e0e0e0" : "#333333");
        const actualComfortColor = this.config.comfortColor || (darkMode ? "rgba(100, 200, 100, 0.3)" : "rgba(144, 238, 144, 0.5)");
        const actualEnthalpyColor = enthalpyColor || (darkMode ? "rgba(255, 165, 0, 0.7)" : "rgba(255, 99, 71, 0.7)");

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
        ctx.setLineDash([5 * scale, 5 * scale]);

        // Vertical grid (vapor pressure)
        if (showVaporPressure !== false) {
            ctx.font = `${Math.max(10, 12 * scale)}px Arial`;
            // Determine step size based on maxPv
            let pvStep = 0.5;
            if (bounds.maxPv < 1) pvStep = 0.1;
            else if (bounds.maxPv > 5) pvStep = 1;

            for (let i = 0; i <= bounds.maxPv + pvStep; i += pvStep) {
                // We need to find a Y coordinate for this Vapor Pressure
                // Since Y is linear with Pv (mostly, in this simplified chart projection),
                // we can map Pv directly to Y.
                // However, humidityToY takes (temp, rh).
                // Pv = rh * Psat(temp). So rh = Pv / Psat(temp).
                // Let's pick a reference temp, say maxTemp.

                const P_sat_ref = 0.61078 * Math.exp((17.27 * bounds.maxTemp) / (bounds.maxTemp + 237.3));
                const rh = (i / P_sat_ref) * 100;

                // If rh > 100, we might be off chart, but humidityToY handles scaling.
                // Actually, humidityToY logic:
                // const P_v = (humidity / 100) * P_sat;
                // const baseY = 550 * scaleY - (P_v / 4) * 500 * scaleY;
                // It seems the original chart hardcoded max Pv to ~4kPa (550 - 4/4*500 = 50).
                // We need to adjust humidityToY to be dynamic first.

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
        ctx.setLineDash([]);
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;

        for (let rh = 10; rh <= 100; rh += 10) {
            ctx.beginPath();
            ctx.strokeStyle = rh === 100 ? "rgba(30, 144, 255, 0.8)" : actualCurveColor;
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
        if (showEnthalpy && displayMode !== "minimal") {
            ctx.setLineDash([2 * scale, 3 * scale]);
            ctx.strokeStyle = actualEnthalpyColor;

            for (let h = 0; h <= 150; h += 10) {
                let enthalpy_points = [];
                for (let t = bounds.minTemp; t <= bounds.maxTemp; t += 0.5) {
                    const W = (h - 1.006 * t) / (2501 + 1.84 * t);
                    if (W < 0) continue;
                    const P_v = (W * 101.325) / (0.622 + W);
                    const P_sat = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
                    const rh = (P_v / P_sat) * 100;

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
        if (showWetBulb && displayMode !== "minimal") {
            ctx.setLineDash([1 * scale, 4 * scale]);
            ctx.strokeStyle = darkMode ? "rgba(0, 255, 255, 0.4)" : "rgba(0, 100, 255, 0.4)";

            const startTw = Math.floor(bounds.minTemp / 5) * 5;
            const endTw = Math.ceil(bounds.maxTemp / 5) * 5;

            for (let tw = startTw; tw <= endTw; tw += 5) {
                const startX = this.tempToX(tw);
                const startY = this.humidityToY(tw, 100);

                if (startY < topPadding || startY > bottomEdge) continue;

                ctx.beginPath();
                ctx.moveTo(startX, startY);

                let endX = startX, endY = startY;
                for (let t_search = tw; t_search < bounds.maxTemp + 10; t_search += 0.5) {
                    for (let rh_search = 100; rh_search > 0; rh_search -= 5) {
                        const calculatedTw = PsychrometricCalculations.calculateWetBulbTemp(t_search, rh_search);
                        if (Math.abs(calculatedTw - tw) < 0.2) {
                            endX = this.tempToX(t_search);
                            endY = this.humidityToY(t_search, rh_search);
                            break;
                        }
                    }
                }
                if (endY > bottomEdge) endY = bottomEdge;

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

            // Only draw if within visible area (roughly)
            if (x < leftPadding - 20 || x > rightEdge + 20 || y < topPadding - 20 || y > bottomEdge + 20) return;

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

                if (dewX >= leftPadding && dewX <= rightEdge && dewY >= topPadding && dewY <= bottomEdge) {
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
        const bounds = this._currentBounds || this._calculateChartBounds();
        const scaleX = this.canvasWidth / 800;

        const leftPadding = 50 * scaleX;
        const rightEdge = 750 * scaleX;
        const chartWidth = rightEdge - leftPadding;

        const tempRange = bounds.maxTemp - bounds.minTemp;
        const x = leftPadding + ((temp - bounds.minTemp) / tempRange) * chartWidth;

        if (this.zoomLevel !== 1.0 || this.panX !== 0) {
            const centerX = this.canvasWidth / 2;
            return (x - centerX) * this.zoomLevel + centerX + this.panX;
        }
        return x;
    }

    /**
     * Convert humidity to Y coordinate.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Y coordinate
     */
    humidityToY(temp, humidity) {
        const bounds = this._currentBounds || this._calculateChartBounds();
        const scaleY = this.canvasHeight / 600;

        const topPadding = 50 * scaleY;
        const bottomEdge = 550 * scaleY;
        const chartHeight = bottomEdge - topPadding;

        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (humidity / 100) * P_sat;

        // Map P_v to Y using maxPv from bounds
        // 0 Pv -> bottomEdge
        // maxPv -> topPadding

        const y = bottomEdge - (P_v / bounds.maxPv) * chartHeight;

        if (this.zoomLevel !== 1.0 || this.panY !== 0) {
            const centerY = this.canvasHeight / 2;
            return (y - centerY) * this.zoomLevel + centerY + this.panY;
        }
        return y;
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
        type === 'temperature' ? this.getTempUnit() : '%';
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
    /**
     * Determine if a field should be shown for a point.
     * @param {Object} point - Point data
     * @param {string} field - Field name
     * @param {string} displayMode - Global display mode
     * @returns {boolean}
     */
    _shouldShowField(point, field, displayMode) {
        // If point has specific details configured, use them
        // Fix: check if details is an array, even if empty. 
        // If it is an array, it means the user has explicitly configured this point.
        if (point.details && Array.isArray(point.details)) {
            return point.details.includes(field);
        }

        // Otherwise fallback to global displayMode
        if (displayMode === 'minimal') return false;

        if (displayMode === 'standard') {
            const standardFields = ['dewPoint', 'wetBulb', 'enthalpy', 'pmvIndex'];
            return standardFields.includes(field);
        }

        // Advanced shows everything
        return true;
    }

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
                                        
                                        ${this._shouldShowField(point, 'dewPoint', displayMode) ? html`<div>${this.t('dewPoint')}: ${this.formatTemp(point.dewPoint)}</div>` : ''}
                                        ${this._shouldShowField(point, 'wetBulb', displayMode) ? html`<div>${this.t('wetBulb')}: ${this.formatTemp(point.wetBulbTemp)}</div>` : ''}
                                        ${this._shouldShowField(point, 'enthalpy', displayMode) ? html`<div>${this.t('enthalpy')}: ${point.enthalpy.toFixed(1)} kJ/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'absHumidity', displayMode) ? html`<div>${this.t('absHumidity')}: ${point.absoluteHumidity.toFixed(2)} g/m³</div>` : ''}
                                        ${this._shouldShowField(point, 'waterContent', displayMode) ? html`<div>${this.t('waterContent')}: ${(point.waterContent * 1000).toFixed(1)} g/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'specificVolume', displayMode) ? html`<div>${this.t('specificVolume')}: ${point.specificVolume.toFixed(3)} m³/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'pmvIndex', displayMode) ? html`<div>${this.t('pmvIndex')}: ${point.pmv.toFixed(2)}</div>` : ''}
                                        
                                        ${this._shouldShowField(point, 'moldRisk', displayMode) ? html`
                                            <div style="grid-column: span 2; display: flex; align-items: center; gap: 5px;">
                                                <span>🍄 ${this.t('moldRisk')}:</span>
                                                <span style="color: ${this.getMoldRiskColor(point.moldRisk, darkMode)}; font-weight: bold">
                                                    ${this.getMoldRiskText(point.moldRisk)}
                                                </span>
                                            </div>
                                        ` : ''}
                                    </div>

                                    ${(point.action || point.power > 0) && this._shouldShowField(point, 'action', displayMode) ? html`
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
