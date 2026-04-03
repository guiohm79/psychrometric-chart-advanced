/**
 * Fire a custom event.
 * @param {HTMLElement} node - The element to dispatch the event from
 * @param {string} type - The event type
 * @param {Object} detail - Event detail
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
 * 
 * SOLUTION ROBUSTE basée sur les patterns de Mushroom et card-tools :
 * 1. Pre-chargement des composants HA dans connectedCallback
 * 2. Attente explicite de la définition des custom elements
 * 3. Utilisation de provideHass pour propager hass aux enfants
 * 4. Événement ll-rebuild pour forcer le re-rendu si nécessaire
 */
export class PsychrometricChartEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this._hass = null;
        this._config = null;
        this._initialized = false;
        this._pendingValue = new Map();
    }

    /**
     * Pre-charge les composants HA nécessaires
     * Pattern utilisé par Mushroom et autres cartes modernes
     */
    connectedCallback() {
        // Force le chargement des composants HA en appelant getConfigElement sur des cartes connues
        if (!customElements.get('ha-entity-picker')) {
            // Déclenche le chargement via une carte qui utilise ha-entity-picker
            const entitiesCard = customElements.get('hui-entities-card');
            if (entitiesCard && entitiesCard.getConfigElement) {
                try {
                    entitiesCard.getConfigElement();
                } catch (e) {
                    // Ignore les erreurs de chargement
                }
            }
        }

        // Attend que les composants soient définis puis initialise
        this._waitForComponents();
    }

    /**
     * Attend que les composants HA nécessaires soient chargés
     */
    async _waitForComponents() {
        // Attend ha-entity-picker
        if (!customElements.get('ha-entity-picker')) {
            await customElements.whenDefined('ha-entity-picker');
        }
        
        // Attend ha-form si besoin
        if (!customElements.get('ha-form')) {
            await customElements.whenDefined('ha-form');
        }

        this._initialized = true;
        
        // Si on a déjà une config, on rend
        if (this._config) {
            this.render();
            // Applique les valeurs en attente
            this._applyPendingValues();
        }
    }

    /**
     * Set the hass object for the editor.
     * @param {Object} hass - The Home Assistant hass object
     */
    set hass(hass) {
        const oldHass = this._hass;
        this._hass = hass;
        
        // Si hass change et qu'on a une config et un shadowRoot
        if (hass && this.shadowRoot && this._config && oldHass !== hass) {
            // Met à jour tous les pickers avec le nouveau hass
            this._updateEntityPickers();
        }
    }

    get hass() {
        return this._hass;
    }

    /**
     * Set the configuration for the editor.
     * @param {Object} config - The configuration object
     */
    setConfig(config) {
        this._config = JSON.parse(JSON.stringify(config || {}));
        
        // Stocke les valeurs pour les pickers
        this._pendingValue.clear();
        (this._config.points || []).forEach((point, index) => {
            if (point.temp) this._pendingValue.set(`${index}-temp`, point.temp);
            if (point.humidity) this._pendingValue.set(`${index}-humidity`, point.humidity);
        });
        
        // Ne rend que si les composants sont prêts
        if (this._initialized) {
            this.render();
            this._applyPendingValues();
        }
        // Sinon, le rendu sera fait dans _waitForComponents quand les composants seront prêts
    }

    get _title() {
        return this._config?.chartTitle || 'Diagramme Psychrométrique';
    }

    get _points() {
        return this._config?.points || [];
    }

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
            const parts = color.split(',');
            if (parts.length === 4) {
                return parseFloat(parts[3]);
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
     * Met à jour tous les pickers avec hass
     */
    _updateEntityPickers() {
        if (!this._hass || !this.shadowRoot) return;
        
        const pickers = this.shadowRoot.querySelectorAll('ha-entity-picker');
        pickers.forEach(picker => {
            if (picker.hass !== this._hass) {
                picker.hass = this._hass;
            }
        });
    }

    /**
     * Applique les valeurs en attente aux pickers
     */
    _applyPendingValues() {
        if (!this.shadowRoot || !this._hass) return;
        
        const pickers = this.shadowRoot.querySelectorAll('ha-entity-picker');
        pickers.forEach(picker => {
            const index = picker.dataset.index;
            const field = picker.dataset.field;
            const value = this._pendingValue.get(`${index}-${field}`);
            
            if (value && picker.value !== value) {
                picker.value = value;
            }
            
            // Assure que hass est assigné
            if (this._hass && picker.hass !== this._hass) {
                picker.hass = this._hass;
            }
        });
    }

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
                ha-entity-picker {
                    flex: 2;
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
                                    <input type="text" class="point-input point-label" data-index="${index}" data-field="label" value="${point.label || ''}" placeholder="Ex: Salon">
                                </div>
                                <div class="form-row">
                                    <label>${this.t('tempEntity')}</label>
                                    <ha-entity-picker
                                        class="entity-picker"
                                        data-index="${index}"
                                        data-field="temp"
                                        allow-custom-entity
                                    ></ha-entity-picker>
                                </div>
                                <div class="form-row">
                                    <label>${this.t('humEntity')}</label>
                                    <ha-entity-picker
                                        class="entity-picker"
                                        data-index="${index}"
                                        data-field="humidity"
                                        allow-custom-entity
                                    ></ha-entity-picker>
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
                                    <input type="text" class="point-input point-icon" data-index="${index}" data-field="icon" value="${point.icon || 'mdi:thermometer'}" placeholder="mdi:thermometer">
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
        
        // Applique hass et les valeurs si disponibles
        if (this._hass) {
            this._updateEntityPickers();
            this._applyPendingValues();
        }
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

    _addEventListeners() {
        // Global inputs
        this.shadowRoot.getElementById('chartTitle')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('language')?.addEventListener('change', this._valueChanged.bind(this));

        // Appearance
        this.shadowRoot.getElementById('displayMode')?.addEventListener('change', this._valueChanged.bind(this));
        
        // Appearance - Colors
        this.shadowRoot.querySelectorAll('.color-hex-input').forEach(input => {
            input.addEventListener('input', this._colorChanged.bind(this));
        });
        this.shadowRoot.querySelectorAll('.color-alpha-input').forEach(input => {
            input.addEventListener('input', this._colorChanged.bind(this));
        });

        this.shadowRoot.getElementById('showEnthalpy')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showVaporPressure')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showDewPoint')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showWetBulb')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showMoldRisk')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showLegend')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('showCalculatedData')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('darkMode')?.addEventListener('change', this._valueChanged.bind(this));

        // Zoom inputs
        this.shadowRoot.getElementById('zoom_temp_min')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('zoom_temp_max')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('zoom_humidity_min')?.addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('zoom_humidity_max')?.addEventListener('change', this._valueChanged.bind(this));

        // Add point button
        this.shadowRoot.getElementById('addPoint')?.addEventListener('click', this._addPoint.bind(this));

        // Point inputs (label and icon only - temp/humidity use ha-entity-picker)
        this.shadowRoot.querySelectorAll('.point-label, .point-icon').forEach(input => {
            input.addEventListener('change', this._pointChanged.bind(this));
        });

        // Entity pickers - add event listeners for value-changed
        this.shadowRoot.querySelectorAll('.entity-picker').forEach(picker => {
            picker.addEventListener('value-changed', this._entityPickerChanged.bind(this));
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

        const points = this._points.map(p => ({ ...p, details: p.details ? [...p.details] : [] }));

        if (!points[index].details) {
            points[index].details = [];
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

    _entityPickerChanged(e) {
        if (!this._config) return;
        const target = e.target;
        const index = parseInt(target.dataset.index);
        const field = target.dataset.field;
        const value = e.detail?.value || '';

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
