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
export class PsychrometricChartEditor extends HTMLElement {
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
                                    <input type="color" class="point-input" data-index="${index}" data-field="color" value="${point.color || '#000000'}">
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
                    <div class="form-row">
                        <label>${this.t('bgColor')}</label>
                        <input type="color" id="bgColor" value="${this._config.bgColor || '#ffffff'}">
                    </div>
                    <div class="form-row">
                        <label>${this.t('textColor')}</label>
                        <input type="color" id="textColor" value="${this._config.textColor || '#333333'}">
                    </div>
                    <div class="form-row">
                        <label>${this.t('gridColor')}</label>
                        <input type="color" id="gridColor" value="${this._config.gridColor || '#e0e0e0'}">
                    </div>
                    <div class="form-row">
                        <label>${this.t('curveColor')}</label>
                        <input type="color" id="curveColor" value="${this._config.curveColor || '#e0e0e0'}">
                    </div>
                    <div class="form-row">
                        <label>${this.t('comfortColor')}</label>
                        <input type="color" id="comfortColor" value="${this._config.comfortColor || 'rgba(100, 180, 100, 0.3)'}">
                    </div>
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
        this.shadowRoot.getElementById('bgColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('textColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('gridColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('curveColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('comfortColor').addEventListener('change', this._valueChanged.bind(this));

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
