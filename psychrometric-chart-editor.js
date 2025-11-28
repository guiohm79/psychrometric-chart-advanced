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
                    <span class="section-title">Général</span>
                    <div class="form-row">
                        <label>Titre</label>
                        <input type="text" id="chartTitle" value="${this._title}">
                    </div>
                    <div class="form-row">
                        <label>Langue</label>
                        <select id="language" class="select-input">
                            <option value="fr" ${this._config.language === 'fr' ? 'selected' : ''}>Français</option>
                            <option value="en" ${this._config.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="es" ${this._config.language === 'es' ? 'selected' : ''}>Español</option>
                            <option value="de" ${this._config.language === 'de' ? 'selected' : ''}>Deutsch</option>
                        </select>
                    </div>
                </div>

                <div class="section">
                    <span class="section-title">Points de mesure</span>
                    <div id="points-container">
                        ${this._points.map((point, index) => `
                            <div class="point-row">
                                <div class="point-header">
                                    <strong>Point ${index + 1}</strong>
                                    <button class="delete" data-index="${index}">Supprimer</button>
                                </div>
                                <div class="form-row">
                                    <label>Label</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="label" value="${point.label || ''}" placeholder="Ex: Salon">
                                </div>
                                <div class="form-row">
                                    <label>Température (Entity ID)</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="temp" value="${point.temp || ''}" placeholder="sensor.temp_salon">
                                </div>
                                <div class="form-row">
                                    <label>Humidité (Entity ID)</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="humidity" value="${point.humidity || ''}" placeholder="sensor.hum_salon">
                                </div>
                                <div class="form-row">
                                    <label>Couleur</label>
                                    <input type="color" class="point-input" data-index="${index}" data-field="color" value="${point.color || '#000000'}">
                                </div>
                                <div class="form-row">
                                    <label>Icône</label>
                                    <input type="text" class="point-input" data-index="${index}" data-field="icon" value="${point.icon || 'mdi:thermometer'}" placeholder="mdi:thermometer">
                                </div>

                                <details>
                                    <summary>Affichage personnalisé</summary>
                                    <div class="checkbox-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 10px; background: rgba(0,0,0,0.05);">
                                        ${this._renderDetailCheckbox(index, point, 'dewPoint', 'Point de rosée')}
                                        ${this._renderDetailCheckbox(index, point, 'wetBulb', 'Temp. humide')}
                                        ${this._renderDetailCheckbox(index, point, 'enthalpy', 'Enthalpie')}
                                        ${this._renderDetailCheckbox(index, point, 'absHumidity', 'Humidité abs.')}
                                        ${this._renderDetailCheckbox(index, point, 'waterContent', 'Teneur en eau')}
                                        ${this._renderDetailCheckbox(index, point, 'specificVolume', 'Vol. spécifique')}
                                        ${this._renderDetailCheckbox(index, point, 'pmvIndex', 'Indice PMV')}
                                        ${this._renderDetailCheckbox(index, point, 'moldRisk', 'Moisissure')}
                                        ${this._renderDetailCheckbox(index, point, 'action', 'Action/Puissance')}
                                    </div>
                                </details>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add" id="addPoint">Ajouter un point</button>
                </div>

                <div class="section">
                    <span class="section-title">Apparence</span>
                    <div class="form-row">
                        <label>Mode d'affichage</label>
                        <select id="displayMode" class="select-input">
                            <option value="standard" ${this._config.displayMode === 'standard' ? 'selected' : ''}>Standard</option>
                            <option value="minimal" ${this._config.displayMode === 'minimal' ? 'selected' : ''}>Minimal</option>
                            <option value="advanced" ${this._config.displayMode === 'advanced' ? 'selected' : ''}>Avancé</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Couleur de fond</label>
                        <input type="color" id="bgColor" value="${this._config.bgColor || '#ffffff'}">
                    </div>
                    <div class="form-row">
                        <label>Couleur du texte</label>
                        <input type="color" id="textColor" value="${this._config.textColor || '#333333'}">
                    </div>
                    <div class="form-row">
                        <label>Couleur de la grille</label>
                        <input type="color" id="gridColor" value="${this._config.gridColor || '#e0e0e0'}">
                    </div>
                    <div class="form-row">
                        <label>Couleur des courbes</label>
                        <input type="color" id="curveColor" value="${this._config.curveColor || '#e0e0e0'}">
                    </div>
                    <div class="form-row">
                        <label>Couleur zone confort</label>
                        <input type="color" id="comfortColor" value="${this._config.comfortColor || 'rgba(100, 180, 100, 0.3)'}">
                    </div>
                </div>

                <div class="section">
                    <span class="section-title">Options d'affichage</span>
                    <div class="form-row">
                        <label>Afficher Enthalpie</label>
                        <input type="checkbox" id="showEnthalpy" ${this._config.showEnthalpy !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>Afficher Pression Vapeur</label>
                        <input type="checkbox" id="showVaporPressure" ${this._config.showVaporPressure !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>Afficher Point de Rosée</label>
                        <input type="checkbox" id="showDewPoint" ${this._config.showDewPoint !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>Afficher Temp. Humide</label>
                        <input type="checkbox" id="showWetBulb" ${this._config.showWetBulb !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>Afficher Risque Moisissure</label>
                        <input type="checkbox" id="showMoldRisk" ${this._config.showMoldRisk !== false ? 'checked' : ''}>
                    </div>
                     <div class="form-row">
                        <label>Afficher Légende</label>
                        <input type="checkbox" id="showLegend" ${this._config.showLegend !== false ? 'checked' : ''}>
                    </div>
                     <div class="form-row">
                        <label>Afficher Données Calculées</label>
                        <input type="checkbox" id="showCalculatedData" ${this._config.showCalculatedData !== false ? 'checked' : ''}>
                    </div>
                    <div class="form-row">
                        <label>Mode Sombre Forcé</label>
                        <input type="checkbox" id="darkMode" ${this._config.darkMode ? 'checked' : ''}>
                    </div>
                    <div class="help-text">Si décoché, suit le thème de Home Assistant.</div>
                </div>

                 <div class="section">
                    <span class="section-title">Zoom & Panoramique (Optionnel)</span>
                    <div class="form-row">
                        <label>Température Min</label>
                        <input type="number" id="zoom_temp_min" value="${this._config.zoom_temp_min || ''}" placeholder="Ex: 15">
                    </div>
                    <div class="form-row">
                        <label>Température Max</label>
                        <input type="number" id="zoom_temp_max" value="${this._config.zoom_temp_max || ''}" placeholder="Ex: 30">
                    </div>
                    <div class="form-row">
                        <label>Humidité Min</label>
                        <input type="number" id="zoom_humidity_min" value="${this._config.zoom_humidity_min || ''}" placeholder="Ex: 30">
                    </div>
                    <div class="form-row">
                        <label>Humidité Max</label>
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
