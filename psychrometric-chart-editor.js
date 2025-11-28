const fireEvent = (node, type, detail, options) => {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

export class PsychrometricChartEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        this._config = config;
        this.render();
    }

    get _title() {
        return this._config?.chartTitle || 'Diagramme Psychrométrique';
    }

    get _points() {
        return this._config?.points || [];
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
            </style>
            <div class="card-config">
                <div class="section">
                    <span class="section-title">Général</span>
                    <div class="form-row">
                        <label>Titre</label>
                        <input type="text" id="chartTitle" value="${this._title}">
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
    }

    _addEventListeners() {
        // Global inputs
        this.shadowRoot.getElementById('chartTitle').addEventListener('change', this._valueChanged.bind(this));

        // Appearance
        this.shadowRoot.getElementById('displayMode').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('bgColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('textColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('gridColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('curveColor').addEventListener('change', this._valueChanged.bind(this));
        this.shadowRoot.getElementById('comfortColor').addEventListener('change', this._valueChanged.bind(this));

        this.shadowRoot.getElementById('showEnthalpy').addEventListener('change', this._valueChanged.bind(this));
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

        // Delete buttons
        this.shadowRoot.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', this._deletePoint.bind(this));
        });
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
