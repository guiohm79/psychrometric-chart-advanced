import { LitElement, html, css } from 'lit';
import { PsychrometricCalculations, LINE_STYLES, DEFAULT_LINE_STYLES } from './psychrometric-helpers.js';

/**
 * Éditeur visuel de la carte Psychrometric Chart Advanced.
 *
 * Suit le standard des éditeurs de cartes Home Assistant :
 * LitElement + `ha-form` alimenté par un schéma déclaratif de selectors.
 * Les composants natifs de HA (ha-form, ha-selector, ha-expansion-panel,
 * ha-icon-button) chargent leurs propres dépendances : aucune attente
 * manuelle de `customElements.whenDefined` n'est nécessaire.
 */

/**
 * Déclenche un événement personnalisé (helper standard des cartes HA).
 * @param {HTMLElement} node - Élément émetteur
 * @param {string} type - Type d'événement
 * @param {Object} detail - Charge utile
 * @param {Object} options - Options de l'événement
 * @returns {Event} L'événement émis
 */
const fireEvent = (node, type, detail = {}, options = {}) => {
    const event = new CustomEvent(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
        detail,
    });
    node.dispatchEvent(event);
    return event;
};

/** Champs affichables par point, dans l'ordre de la carte. */
const DETAIL_FIELDS = [
    'dewPoint', 'wetBulb', 'apparentTemp', 'enthalpy', 'absHumidity', 'waterContent',
    'specificVolume', 'pmvIndex', 'moldRisk', 'action',
];

/** Champs affichés par défaut quand `details` n'est pas configuré (cf. _shouldShowField). */
const DEFAULT_DETAILS = ['dewPoint', 'wetBulb', 'apparentTemp', 'enthalpy', 'pmvIndex'];

/** Zone de confort par défaut (identique à celle de la carte). */
const DEFAULT_COMFORT_RANGE = { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

/** Clés de couleur globales exposées, avec alpha. */
const COLOR_KEYS = ['bgColor', 'textColor', 'gridColor', 'curveColor', 'enthalpyColor', 'comfortColor'];

/** Options de style de trait, dans l'ordre du selector. Tirées de la table de la carte. */
const LINE_STYLE_KEYS = Object.keys(LINE_STYLES);

/** Familles de tracés dont le style est configurable, dans l'ordre d'affichage. */
const LINE_STYLE_OPTIONS = Object.keys(DEFAULT_LINE_STYLES);

/** Domaines proposés dans les sélecteurs d'entités. */
const SENSOR_DOMAINS = ['sensor', 'input_number', 'number'];

const editorTranslations = {
    fr: {
        general: "Général",
        chartTitle: "Titre",
        language: "Langue de la carte",
        languageHelp: "Langue des textes affichés sur la carte (l'éditeur suit la langue de Home Assistant).",
        measurementPoints: "Points de mesure",
        point: "Point",
        newPoint: "Nouveau point",
        noPoints: "Aucun point configuré. Ajoutez-en un pour commencer.",
        delete: "Supprimer le point",
        moveUp: "Déplacer vers le haut",
        moveDown: "Déplacer vers le bas",
        label: "Label",
        temp: "Température (entité)",
        humidity: "Humidité (entité)",
        color: "Couleur",
        icon: "Icône",
        details: "Champs affichés",
        dewPoint: "Point de rosée",
        wetBulb: "Temp. humide",
        apparentTemp: "Temp. ressentie",
        enthalpy: "Enthalpie",
        absHumidity: "Humidité abs.",
        waterContent: "Teneur en eau",
        specificVolume: "Vol. spécifique",
        pmvIndex: "Indice PMV",
        moldRisk: "Moisissure",
        action: "Action/Puissance",
        addPoint: "Ajouter un point",
        comfort: "Zone de confort",
        comfortRange: "Bornes de confort",
        tempMin: "Température min",
        tempMax: "Température max",
        rhMin: "Humidité min",
        rhMax: "Humidité max",
        massFlowRate: "Débit massique d'air",
        massFlowRateHelp: "Sert au calcul des puissances de chauffage, refroidissement et humidification.",
        appearance: "Apparence",
        theme: "Thème visuel",
        themeModern: "Moderne",
        themeClassic: "Classique",
        themeCompact: "Compact",
        bgColor: "Couleur de fond",
        textColor: "Couleur du texte",
        gridColor: "Couleur de la grille",
        curveColor: "Couleur des courbes",
        enthalpyColor: "Couleur des enthalpies",
        comfortColor: "Couleur zone confort",
        opacity: "Opacité",
        resetColor: "Suivre le thème",
        lineStyles: "Styles de trait",
        gridLineStyle: "Trait de la grille",
        curveLineStyle: "Trait des courbes d'humidité",
        enthalpyLineStyle: "Trait des enthalpies",
        wetBulbLineStyle: "Trait des temp. humides",
        comfortLineStyle: "Trait de la zone de confort",
        pointLineStyle: "Trait des projections de points",
        lineSolid: "Continu",
        lineDashed: "Tirets",
        lineDotted: "Pointillés",
        lineDashdot: "Tiret-point",
        tempSubdivisions: "Sous-multiples des températures sèches",
        tempSubdivisionsHelp: "Traits intermédiaires entre deux graduations de l'axe des températures. 1 n'en ajoute aucun ; 5 découpe chaque pas de 5 °C en degrés.",
        displayOptions: "Options d'affichage",
        displayMode: "Niveau de détail",
        displayModeHelp: "Personnalisé applique les champs cochés sur chaque point. Minimal n'affiche que température, humidité et confort ; Détaillé affiche tous les champs.",
        displayCustom: "Personnalisé",
        displayMinimal: "Minimal",
        temperatureUnit: "Unité de température",
        unitAuto: "Automatique (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showEnthalpy: "Afficher Enthalpie",
        showVaporPressure: "Afficher Pression Vapeur",
        showDewPoint: "Afficher Point de Rosée",
        showWetBulb: "Afficher Temp. Humide",
        showPointLabels: "Afficher les labels des points",
        showLegend: "Afficher Légende",
        showCalculatedData: "Afficher Données Calculées",
        themeMode: "Thème de couleurs",
        themeModeHelp: "Automatique suit le thème clair/sombre de Home Assistant.",
        themeAuto: "Automatique (Home Assistant)",
        themeLight: "Clair",
        themeDark: "Sombre",
        displayDetailed: "Détaillé",
        zoomPan: "Bornes du graphique (optionnel)",
        zoom_temp_min: "Température min",
        zoom_temp_max: "Température max",
        zoom_humidity_min: "Humidité min",
        zoom_humidity_max: "Humidité max",
    },
    en: {
        general: "General",
        chartTitle: "Title",
        language: "Card language",
        languageHelp: "Language of the texts shown on the card (the editor follows the Home Assistant language).",
        measurementPoints: "Measurement points",
        point: "Point",
        newPoint: "New point",
        noPoints: "No point configured. Add one to get started.",
        delete: "Delete point",
        moveUp: "Move up",
        moveDown: "Move down",
        label: "Label",
        temp: "Temperature (entity)",
        humidity: "Humidity (entity)",
        color: "Color",
        icon: "Icon",
        details: "Displayed fields",
        dewPoint: "Dew point",
        wetBulb: "Wet bulb",
        apparentTemp: "Feels like",
        enthalpy: "Enthalpy",
        absHumidity: "Abs. humidity",
        waterContent: "Water content",
        specificVolume: "Specific vol.",
        pmvIndex: "PMV index",
        moldRisk: "Mold risk",
        action: "Action/Power",
        addPoint: "Add point",
        comfort: "Comfort zone",
        comfortRange: "Comfort bounds",
        tempMin: "Min temperature",
        tempMax: "Max temperature",
        rhMin: "Min humidity",
        rhMax: "Max humidity",
        massFlowRate: "Air mass flow rate",
        massFlowRateHelp: "Used to compute heating, cooling and humidification power.",
        appearance: "Appearance",
        theme: "Visual theme",
        themeModern: "Modern",
        themeClassic: "Classic",
        themeCompact: "Compact",
        bgColor: "Background color",
        textColor: "Text color",
        gridColor: "Grid color",
        curveColor: "Curve color",
        enthalpyColor: "Enthalpy color",
        comfortColor: "Comfort zone color",
        opacity: "Opacity",
        resetColor: "Follow the theme",
        lineStyles: "Line styles",
        gridLineStyle: "Grid line",
        curveLineStyle: "Humidity curve line",
        enthalpyLineStyle: "Enthalpy line",
        wetBulbLineStyle: "Wet bulb line",
        comfortLineStyle: "Comfort zone outline",
        pointLineStyle: "Point projection line",
        lineSolid: "Solid",
        lineDashed: "Dashed",
        lineDotted: "Dotted",
        lineDashdot: "Dash-dot",
        tempSubdivisions: "Dry-bulb temperature subdivisions",
        tempSubdivisionsHelp: "Minor lines drawn between two graduations of the temperature axis. 1 adds none; 5 splits each 5 °C step into degrees.",
        displayOptions: "Display options",
        displayMode: "Detail level",
        displayModeHelp: "Custom applies the fields ticked on each point. Minimal only shows temperature, humidity and comfort; Detailed shows every field.",
        displayCustom: "Custom",
        displayMinimal: "Minimal",
        temperatureUnit: "Temperature unit",
        unitAuto: "Automatic (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showEnthalpy: "Show enthalpy",
        showVaporPressure: "Show vapor pressure",
        showDewPoint: "Show dew point",
        showWetBulb: "Show wet bulb",
        showPointLabels: "Show point labels",
        showLegend: "Show legend",
        showCalculatedData: "Show calculated data",
        themeMode: "Colour theme",
        themeModeHelp: "Automatic follows the Home Assistant light/dark theme.",
        themeAuto: "Automatic (Home Assistant)",
        themeLight: "Light",
        themeDark: "Dark",
        displayDetailed: "Detailed",
        zoomPan: "Chart bounds (optional)",
        zoom_temp_min: "Min temperature",
        zoom_temp_max: "Max temperature",
        zoom_humidity_min: "Min humidity",
        zoom_humidity_max: "Max humidity",
    },
    es: {
        general: "General",
        chartTitle: "Título",
        language: "Idioma de la tarjeta",
        languageHelp: "Idioma de los textos de la tarjeta (el editor sigue el idioma de Home Assistant).",
        measurementPoints: "Puntos de medición",
        point: "Punto",
        newPoint: "Nuevo punto",
        noPoints: "No hay puntos configurados. Añade uno para empezar.",
        delete: "Eliminar punto",
        moveUp: "Mover arriba",
        moveDown: "Mover abajo",
        label: "Etiqueta",
        temp: "Temperatura (entidad)",
        humidity: "Humedad (entidad)",
        color: "Color",
        icon: "Icono",
        details: "Campos mostrados",
        dewPoint: "Punto de rocío",
        wetBulb: "Temp. húmeda",
        apparentTemp: "Sensación térmica",
        enthalpy: "Entalpía",
        absHumidity: "Humedad abs.",
        waterContent: "Contenido de agua",
        specificVolume: "Vol. específico",
        pmvIndex: "Índice PMV",
        moldRisk: "Riesgo de moho",
        action: "Acción/Potencia",
        addPoint: "Añadir punto",
        comfort: "Zona de confort",
        comfortRange: "Límites de confort",
        tempMin: "Temp. mín",
        tempMax: "Temp. máx",
        rhMin: "Humedad mín",
        rhMax: "Humedad máx",
        massFlowRate: "Caudal másico de aire",
        massFlowRateHelp: "Se usa para calcular las potencias de calefacción, refrigeración y humidificación.",
        appearance: "Apariencia",
        theme: "Tema visual",
        themeModern: "Moderno",
        themeClassic: "Clásico",
        themeCompact: "Compacto",
        bgColor: "Color de fondo",
        textColor: "Color del texto",
        gridColor: "Color de la cuadrícula",
        curveColor: "Color de las curvas",
        enthalpyColor: "Color de las entalpías",
        comfortColor: "Color zona confort",
        opacity: "Opacidad",
        resetColor: "Seguir el tema",
        lineStyles: "Estilos de línea",
        gridLineStyle: "Línea de la cuadrícula",
        curveLineStyle: "Línea de las curvas de humedad",
        enthalpyLineStyle: "Línea de las entalpías",
        wetBulbLineStyle: "Línea de temp. húmedas",
        comfortLineStyle: "Contorno de la zona de confort",
        pointLineStyle: "Línea de proyección de los puntos",
        lineSolid: "Continua",
        lineDashed: "Discontinua",
        lineDotted: "Punteada",
        lineDashdot: "Raya-punto",
        tempSubdivisions: "Subdivisiones de las temperaturas secas",
        tempSubdivisionsHelp: "Líneas intermedias entre dos graduaciones del eje de temperaturas. 1 no añade ninguna; 5 divide cada paso de 5 °C en grados.",
        displayOptions: "Opciones de visualización",
        displayMode: "Nivel de detalle",
        displayModeHelp: "Personalizado aplica los campos marcados en cada punto. Mínimo solo muestra temperatura, humedad y confort; Detallado muestra todos los campos.",
        displayCustom: "Personalizado",
        displayMinimal: "Mínimo",
        temperatureUnit: "Unidad de temperatura",
        unitAuto: "Automática (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showEnthalpy: "Mostrar entalpía",
        showVaporPressure: "Mostrar presión de vapor",
        showDewPoint: "Mostrar punto de rocío",
        showWetBulb: "Mostrar temp. húmeda",
        showPointLabels: "Mostrar etiquetas de los puntos",
        showLegend: "Mostrar leyenda",
        showCalculatedData: "Mostrar datos calculados",
        themeMode: "Tema de colores",
        themeModeHelp: "Automático sigue el tema claro/oscuro de Home Assistant.",
        themeAuto: "Automático (Home Assistant)",
        themeLight: "Claro",
        themeDark: "Oscuro",
        displayDetailed: "Detallado",
        zoomPan: "Límites del gráfico (opcional)",
        zoom_temp_min: "Temp. mín",
        zoom_temp_max: "Temp. máx",
        zoom_humidity_min: "Humedad mín",
        zoom_humidity_max: "Humedad máx",
    },
    de: {
        general: "Allgemein",
        chartTitle: "Titel",
        language: "Sprache der Karte",
        languageHelp: "Sprache der Texte auf der Karte (der Editor folgt der Home-Assistant-Sprache).",
        measurementPoints: "Messpunkte",
        point: "Punkt",
        newPoint: "Neuer Punkt",
        noPoints: "Keine Punkte konfiguriert. Fügen Sie einen hinzu.",
        delete: "Punkt löschen",
        moveUp: "Nach oben verschieben",
        moveDown: "Nach unten verschieben",
        label: "Beschriftung",
        temp: "Temperatur (Entität)",
        humidity: "Feuchtigkeit (Entität)",
        color: "Farbe",
        icon: "Symbol",
        details: "Angezeigte Felder",
        dewPoint: "Taupunkt",
        wetBulb: "Feuchtkugeltemp.",
        apparentTemp: "Gefühlte Temp.",
        enthalpy: "Enthalpie",
        absHumidity: "Abs. Feuchtigkeit",
        waterContent: "Wassergehalt",
        specificVolume: "Spezifisches Vol.",
        pmvIndex: "PMV-Index",
        moldRisk: "Schimmelrisiko",
        action: "Aktion/Leistung",
        addPoint: "Punkt hinzufügen",
        comfort: "Komfortzone",
        comfortRange: "Komfortgrenzen",
        tempMin: "Min. Temperatur",
        tempMax: "Max. Temperatur",
        rhMin: "Min. Feuchtigkeit",
        rhMax: "Max. Feuchtigkeit",
        massFlowRate: "Luftmassenstrom",
        massFlowRateHelp: "Dient zur Berechnung der Heiz-, Kühl- und Befeuchtungsleistung.",
        appearance: "Aussehen",
        theme: "Visuelles Thema",
        themeModern: "Modern",
        themeClassic: "Klassisch",
        themeCompact: "Kompakt",
        bgColor: "Hintergrundfarbe",
        textColor: "Textfarbe",
        gridColor: "Gitterfarbe",
        curveColor: "Kurvenfarbe",
        enthalpyColor: "Enthalpiefarbe",
        comfortColor: "Komfortzonenfarbe",
        opacity: "Deckkraft",
        resetColor: "Dem Thema folgen",
        lineStyles: "Linienstile",
        gridLineStyle: "Gitterlinie",
        curveLineStyle: "Feuchtekurvenlinie",
        enthalpyLineStyle: "Enthalpielinie",
        wetBulbLineStyle: "Feuchtkugellinie",
        comfortLineStyle: "Umriss der Komfortzone",
        pointLineStyle: "Projektionslinie der Punkte",
        lineSolid: "Durchgezogen",
        lineDashed: "Gestrichelt",
        lineDotted: "Gepunktet",
        lineDashdot: "Strichpunkt",
        tempSubdivisions: "Unterteilungen der Trockentemperaturen",
        tempSubdivisionsHelp: "Zwischenlinien zwischen zwei Graduierungen der Temperaturachse. 1 fügt keine hinzu; 5 unterteilt jeden 5-°C-Schritt in Grad.",
        displayOptions: "Anzeigeoptionen",
        displayMode: "Detailgrad",
        displayModeHelp: "Benutzerdefiniert wendet die pro Punkt angehakten Felder an. Minimal zeigt nur Temperatur, Luftfeuchte und Komfort; Detailliert zeigt alle Felder.",
        displayCustom: "Benutzerdefiniert",
        displayMinimal: "Minimal",
        temperatureUnit: "Temperatureinheit",
        unitAuto: "Automatisch (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showEnthalpy: "Enthalpie anzeigen",
        showVaporPressure: "Dampfdruck anzeigen",
        showDewPoint: "Taupunkt anzeigen",
        showWetBulb: "Feuchtkugeltemp. anzeigen",
        showPointLabels: "Punktbeschriftungen anzeigen",
        showLegend: "Legende anzeigen",
        showCalculatedData: "Berechnete Daten anzeigen",
        themeMode: "Farbschema",
        themeModeHelp: "Automatisch folgt dem hellen/dunklen Thema von Home Assistant.",
        themeAuto: "Automatisch (Home Assistant)",
        themeLight: "Hell",
        themeDark: "Dunkel",
        displayDetailed: "Detailliert",
        zoomPan: "Diagrammgrenzen (optional)",
        zoom_temp_min: "Min. Temperatur",
        zoom_temp_max: "Max. Temperatur",
        zoom_humidity_min: "Min. Feuchtigkeit",
        zoom_humidity_max: "Max. Feuchtigkeit",
    },
};

export class PsychrometricChartEditor extends LitElement {
    static get properties() {
        return {
            hass: { attribute: false },
            _config: { state: true },
        };
    }

    constructor() {
        super();
        this._config = null;
        // Références stables : évite que Lit ne recrée les sous-arbres de ha-form à chaque rendu.
        this._computeLabel = (schema) => this.t(schema.name);
        this._computeHelper = (schema) => this.t(`${schema.name}Help`, '');
    }

    /**
     * Applique la configuration fournie par Lovelace.
     * La config est traitée comme immuable : aucune copie profonde n'est nécessaire.
     * @param {Object} config - Configuration de la carte
     */
    setConfig(config) {
        this._config = config || {};
    }

    /**
     * Langue de l'interface de l'éditeur.
     * Suit la langue de Home Assistant (standard), avec repli sur la langue de la carte puis le français.
     * @returns {string} Code de langue supporté
     */
    get _lang() {
        const haLang = this.hass?.locale?.language || this.hass?.language;
        if (haLang && editorTranslations[haLang]) return haLang;
        const cfgLang = this._config?.language;
        if (cfgLang && editorTranslations[cfgLang]) return cfgLang;
        return 'fr';
    }

    /**
     * Traduit une clé dans la langue de l'éditeur.
     * @param {string} key - Clé de traduction
     * @param {string} [fallback] - Valeur si la clé est absente (défaut : la clé elle-même)
     * @returns {string} Texte traduit
     */
    t(key, fallback) {
        return editorTranslations[this._lang]?.[key]
            ?? editorTranslations.fr[key]
            ?? (fallback !== undefined ? fallback : key);
    }

    get _points() {
        return this._config?.points || [];
    }

    // ========================================
    // COULEURS
    // ========================================

    /**
     * Couleur par défaut affichée quand la config ne définit pas la clé.
     * Reproduit exactement les valeurs de repli de la carte, mode sombre inclus.
     * @param {string} key - Clé de couleur
     * @returns {string} Couleur CSS
     */
    _colorFallback(key) {
        // L'aperçu doit refléter le mode réellement rendu par la carte : même règle
        // que son _isDark(), où `darkMode` n'est plus lu.
        const mode = this._config?.themeMode ?? 'auto';
        const dark = mode === 'dark'
            || (mode !== 'light' && Boolean(this.hass?.themes?.darkMode));
        switch (key) {
            case 'bgColor': return dark ? '#1c1c1c' : '#ffffff';
            case 'textColor': return dark ? '#e0e0e0' : '#333333';
            case 'gridColor': return dark ? '#444444' : '#cccccc';
            case 'curveColor': return dark ? '#4fc3f7' : '#1f77b4';
            case 'comfortColor': return dark ? 'rgba(100, 200, 100, 0.3)' : 'rgba(144, 238, 144, 0.5)';
            case 'enthalpyColor': return dark ? 'rgba(255, 165, 0, 0.7)' : 'rgba(255, 99, 71, 0.7)';
            default: return '#000000';
        }
    }

    // ========================================
    // SCHÉMAS ha-form
    // ========================================

    _generalSchema() {
        return [
            { name: 'chartTitle', selector: { text: {} } },
            {
                name: 'language',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'fr', label: 'Français' },
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                            { value: 'de', label: 'Deutsch' },
                        ],
                    },
                },
            },
            {
                name: 'temperatureUnit',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'auto', label: this.t('unitAuto') },
                            { value: 'celsius', label: this.t('unitCelsius') },
                            { value: 'fahrenheit', label: this.t('unitFahrenheit') },
                        ],
                    },
                },
            },
        ];
    }

    _pointSchema() {
        return [
            { name: 'label', selector: { text: {} } },
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'temp', selector: { entity: { filter: { domain: SENSOR_DOMAINS } } } },
                    { name: 'humidity', selector: { entity: { filter: { domain: SENSOR_DOMAINS } } } },
                ],
            },
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'icon', selector: { icon: {} } },
                    { name: 'color', selector: { color_rgb: {} } },
                ],
            },
            {
                name: 'details',
                selector: {
                    select: {
                        multiple: true,
                        mode: 'list',
                        options: DETAIL_FIELDS.map(field => ({ value: field, label: this.t(field) })),
                    },
                },
            },
        ];
    }

    _comfortSchema() {
        const pct = { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' };
        return [
            {
                type: 'expandable',
                name: 'comfortRange',
                title: this.t('comfortRange'),
                schema: [
                    {
                        type: 'grid',
                        name: '',
                        schema: [
                            { name: 'tempMin', selector: { number: { min: 0, max: 40, step: 0.5, mode: 'box' } } },
                            { name: 'tempMax', selector: { number: { min: 0, max: 40, step: 0.5, mode: 'box' } } },
                            { name: 'rhMin', selector: { number: pct } },
                            { name: 'rhMax', selector: { number: pct } },
                        ],
                    },
                ],
            },
            {
                name: 'massFlowRate',
                selector: { number: { min: 0.01, max: 20, step: 0.01, mode: 'box', unit_of_measurement: 'kg/s' } },
            },
        ];
    }

    _displaySchema() {
        return [
            {
                name: 'theme',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'modern', label: this.t('themeModern') },
                            { value: 'classic', label: this.t('themeClassic') },
                            { value: 'compact', label: this.t('themeCompact') },
                        ],
                    },
                },
            },
            {
                name: 'themeMode',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'auto', label: this.t('themeAuto') },
                            { value: 'light', label: this.t('themeLight') },
                            { value: 'dark', label: this.t('themeDark') },
                        ],
                    },
                },
            },
            {
                name: 'displayMode',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'minimal', label: this.t('displayMinimal') },
                            { value: 'custom', label: this.t('displayCustom') },
                            { value: 'detailed', label: this.t('displayDetailed') },
                        ],
                    },
                },
            },
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'showEnthalpy', selector: { boolean: {} } },
                    { name: 'showVaporPressure', selector: { boolean: {} } },
                    { name: 'showDewPoint', selector: { boolean: {} } },
                    { name: 'showWetBulb', selector: { boolean: {} } },
                    { name: 'showPointLabels', selector: { boolean: {} } },
                    { name: 'showLegend', selector: { boolean: {} } },
                    { name: 'showCalculatedData', selector: { boolean: {} } },
                ],
            },
        ];
    }

    /**
     * Styles de trait, une ligne par famille de tracés.
     * Les options viennent de LINE_STYLES : un style proposé ici est forcément
     * connu de la carte.
     * @returns {Array<Object>} Schéma ha-form
     */
    _lineStyleSchema() {
        const options = LINE_STYLE_KEYS.map(style => ({
            value: style,
            label: this.t(`line${style.charAt(0).toUpperCase()}${style.slice(1)}`),
        }));
        return [
            {
                type: 'grid',
                name: '',
                schema: LINE_STYLE_OPTIONS.map(name => ({
                    name,
                    selector: { select: { mode: 'dropdown', options } },
                })),
            },
            {
                name: 'tempSubdivisions',
                selector: { number: { min: 1, max: 10, step: 1, mode: 'box' } },
            },
        ];
    }

    _zoomSchema() {
        return [
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'zoom_temp_min', selector: { number: { step: 'any', mode: 'box' } } },
                    { name: 'zoom_temp_max', selector: { number: { step: 'any', mode: 'box' } } },
                    { name: 'zoom_humidity_min', selector: { number: { min: 0, max: 100, step: 'any', mode: 'box' } } },
                    { name: 'zoom_humidity_max', selector: { number: { min: 0, max: 100, step: 'any', mode: 'box' } } },
                ],
            },
        ];
    }

    // ========================================
    // DONNÉES DE FORMULAIRE
    // ========================================

    /**
     * Construit les données passées à ha-form.
     * Les valeurs par défaut de la carte y sont pré-remplies afin que l'éditeur
     * montre ce que la carte affiche réellement, et non des champs vides ou décochés.
     * @returns {Object} Données du formulaire
     */
    _formData() {
        const config = this._config || {};
        // Styles de trait : le défaut de la carte, sinon les selectors s'ouvriraient
        // vides alors qu'un style est bien appliqué au graphique.
        const lineStyles = {};
        for (const [name, fallback] of Object.entries(DEFAULT_LINE_STYLES)) {
            lineStyles[name] = config[name] ?? fallback;
        }
        return {
            ...config,
            ...lineStyles,
            tempSubdivisions: config.tempSubdivisions ?? 1,
            chartTitle: config.chartTitle ?? 'Diagramme Psychrométrique',
            language: config.language ?? 'fr',
            temperatureUnit: config.temperatureUnit ?? 'auto',
            theme: config.theme ?? 'modern',
            themeMode: config.themeMode ?? 'auto',
            // `standard` est l'ancien nom de `custom` : le normaliser ici évite un
            // sélecteur vide sur une config existante, et fait disparaître la valeur
            // périmée du YAML dès la première modification dans l'éditeur.
            displayMode: config.displayMode === 'standard' ? 'custom' : (config.displayMode ?? 'custom'),
            massFlowRate: config.massFlowRate ?? 0.5,
            comfortRange: { ...DEFAULT_COMFORT_RANGE, ...(config.comfortRange || {}) },
            showEnthalpy: config.showEnthalpy !== false,
            showVaporPressure: config.showVaporPressure !== false,
            showDewPoint: config.showDewPoint !== false,
            showWetBulb: config.showWetBulb !== false,
            showPointLabels: config.showPointLabels !== false,
            showLegend: config.showLegend !== false,
            showCalculatedData: config.showCalculatedData !== false,
        };
    }

    /**
     * Construit les données de formulaire d'un point.
     * `details` et `color` sont pré-remplis avec ce que la carte utilise réellement,
     * pour que l'édition d'un point n'altère jamais implicitement les autres.
     * @param {Object} point - Point de configuration
     * @returns {Object} Données du formulaire
     */
    _pointFormData(point) {
        const fallbackColor = PsychrometricCalculations.generateColorFromHash(`${point.temp}_${point.humidity}`);
        return {
            ...point,
            label: point.label ?? '',
            icon: point.icon || 'mdi:thermometer',
            color: PsychrometricCalculations.colorToRgb(point.color || fallbackColor),
            details: Array.isArray(point.details) ? point.details : [...DEFAULT_DETAILS],
        };
    }

    // ========================================
    // ÉMISSION DE LA CONFIGURATION
    // ========================================

    /**
     * Retire les valeurs vides de la configuration afin de ne pas polluer le YAML
     * avec des clés comme `zoom_temp_min: ""`.
     * @param {Object} config - Configuration brute
     * @returns {Object} Configuration nettoyée
     */
    _clean(config) {
        const cleaned = {};
        for (const [key, value] of Object.entries(config)) {
            if (value === '' || value === null || value === undefined) continue;
            // `darkMode` est remplacé par `themeMode` et n'est plus lu par la carte :
            // le laisser dans le YAML ferait croire qu'il pilote encore le thème.
            if (key === 'darkMode') continue;
            cleaned[key] = value;
        }
        return cleaned;
    }

    /**
     * Publie une nouvelle configuration vers Lovelace.
     * @param {Object} rawConfig - Configuration à publier
     */
    _emit(rawConfig) {
        const config = this._clean(rawConfig);
        this._config = config;
        fireEvent(this, 'config-changed', { config });
    }

    _valueChanged(ev) {
        ev.stopPropagation();
        if (!this._config) return;
        this._emit(ev.detail.value);
    }

    _pointChanged(index, ev) {
        ev.stopPropagation();
        if (!this._config) return;
        const value = { ...ev.detail.value };
        value.color = PsychrometricCalculations.rgbToHex(value.color);
        const points = [...this._points];
        points[index] = value;
        this._emit({ ...this._formData(), points });
    }

    /**
     * Opacité affichée pour une couleur, en pourcentage.
     * L'option dédiée prime ; à défaut on lit l'alpha éventuellement intégré à la
     * couleur, ce qui couvre les configurations écrites avant leur séparation.
     * @param {string} key - Option de couleur
     * @returns {number} Opacité entre 0 et 100
     */
    _opacityOf(key) {
        const stored = this._config?.[PsychrometricCalculations.opacityKey(key)];
        if (stored !== undefined && stored !== null && stored !== '') {
            const percent = parseFloat(stored);
            if (Number.isFinite(percent)) return Math.min(100, Math.max(0, percent));
        }
        const color = this._config?.[key] || this._colorFallback(key);
        return Math.round(PsychrometricCalculations.colorToAlpha(color) * 100);
    }

    /**
     * Écrit la teinte seule, sans alpha.
     * L'opacité éventuellement portée par l'ancienne valeur `rgba()` est reportée
     * dans l'option dédiée, pour que l'aspect ne saute pas au premier réglage.
     * @param {string} key - Option de couleur
     * @param {CustomEvent} ev - Événement du sélecteur
     */
    _colorChanged(key, ev) {
        ev.stopPropagation();
        const current = this._config?.[key] || this._colorFallback(key);
        const rgb = ev.detail.value ?? PsychrometricCalculations.colorToRgb(current);
        this._emit({
            ...this._formData(),
            [key]: PsychrometricCalculations.rgbToHex(rgb),
            [PsychrometricCalculations.opacityKey(key)]: this._opacityOf(key),
        });
    }

    /**
     * Écrit l'opacité seule, sans jamais figer la teinte.
     * C'est la raison d'être de l'option séparée : régler la transparence ne doit pas
     * enregistrer la couleur du mode courant, sinon la bascule clair/sombre se trouve
     * neutralisée et il faut passer par l'éditeur YAML pour s'en sortir.
     * @param {string} key - Option de couleur
     * @param {CustomEvent} ev - Événement du sélecteur
     */
    _opacityChanged(key, ev) {
        ev.stopPropagation();
        this._emit({
            ...this._formData(),
            [PsychrometricCalculations.opacityKey(key)]: ev.detail.value ?? 100,
        });
    }

    /**
     * Rend une couleur au thème : les deux options sont retirées de la configuration.
     * @param {string} key - Option de couleur
     */
    _resetColor(key) {
        this._emit({
            ...this._formData(),
            [key]: undefined,
            [PsychrometricCalculations.opacityKey(key)]: undefined,
        });
    }

    _addPoint() {
        const points = [...this._points, { temp: '', humidity: '', label: this.t('newPoint') }];
        this._emit({ ...this._formData(), points });
    }

    _deletePoint(index) {
        const points = [...this._points];
        points.splice(index, 1);
        this._emit({ ...this._formData(), points });
    }

    _movePoint(index, offset) {
        const target = index + offset;
        const points = [...this._points];
        if (target < 0 || target >= points.length) return;
        [points[index], points[target]] = [points[target], points[index]];
        this._emit({ ...this._formData(), points });
    }

    // ========================================
    // RENDU
    // ========================================

    _renderColorRow(key) {
        const value = this._config?.[key] || this._colorFallback(key);
        // Une couleur « suit le thème » tant qu'aucune des deux options n'est posée.
        const overridden = Boolean(this._config?.[key])
            || this._config?.[PsychrometricCalculations.opacityKey(key)] !== undefined;
        return html`
            <div class="color-row">
                <span class="color-label">${this.t(key)}</span>
                <ha-selector
                    class="color-picker"
                    .hass=${this.hass}
                    .selector=${{ color_rgb: {} }}
                    .value=${PsychrometricCalculations.colorToRgb(value)}
                    @value-changed=${(ev) => this._colorChanged(key, ev)}
                ></ha-selector>
                <ha-selector
                    class="color-opacity"
                    .hass=${this.hass}
                    .selector=${{ number: { min: 0, max: 100, step: 1, mode: 'slider', unit_of_measurement: '%' } }}
                    .label=${this.t('opacity')}
                    .value=${this._opacityOf(key)}
                    @value-changed=${(ev) => this._opacityChanged(key, ev)}
                ></ha-selector>
                <ha-icon-button
                    class="color-reset"
                    .label=${this.t('resetColor')}
                    title=${this.t('resetColor')}
                    ?disabled=${!overridden}
                    @click=${() => this._resetColor(key)}
                ><ha-icon icon="mdi:restore"></ha-icon></ha-icon-button>
            </div>
        `;
    }

    _renderPoint(point, index) {
        const title = point.label || `${this.t('point')} ${index + 1}`;
        return html`
            <ha-expansion-panel outlined>
                <div slot="header" class="point-header">
                    <ha-icon .icon=${point.icon || 'mdi:thermometer'}></ha-icon>
                    <span>${title}</span>
                </div>
                <div class="point-content">
                    <ha-form
                        .hass=${this.hass}
                        .data=${this._pointFormData(point)}
                        .schema=${this._pointSchema()}
                        .computeLabel=${this._computeLabel}
                        @value-changed=${(ev) => this._pointChanged(index, ev)}
                    ></ha-form>
                    <div class="point-actions">
                        <ha-icon-button
                            .label=${this.t('moveUp')}
                            .disabled=${index === 0}
                            @click=${() => this._movePoint(index, -1)}
                        ><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button>
                        <ha-icon-button
                            .label=${this.t('moveDown')}
                            .disabled=${index === this._points.length - 1}
                            @click=${() => this._movePoint(index, 1)}
                        ><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button>
                        <ha-icon-button
                            class="delete"
                            .label=${this.t('delete')}
                            @click=${() => this._deletePoint(index)}
                        ><ha-icon icon="mdi:delete"></ha-icon></ha-icon-button>
                    </div>
                </div>
            </ha-expansion-panel>
        `;
    }

    render() {
        if (!this._config || !this.hass) return html``;
        const data = this._formData();

        return html`
            <div class="card-config">
                <div class="section">
                    <span class="section-title">${this.t('general')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._generalSchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('measurementPoints')}</span>
                    ${this._points.length
                ? this._points.map((point, index) => this._renderPoint(point, index))
                : html`<div class="empty">${this.t('noPoints')}</div>`}
                    <div class="actions">
                        <ha-button @click=${this._addPoint}>
                            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
                            ${this.t('addPoint')}
                        </ha-button>
                    </div>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('comfort')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._comfortSchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('displayOptions')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._displaySchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('appearance')}</span>
                    ${COLOR_KEYS.map(key => this._renderColorRow(key))}
                    <span class="subsection-title">${this.t('lineStyles')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._lineStyleSchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('zoomPan')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._zoomSchema()}
                        .computeLabel=${this._computeLabel}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>
            </div>
        `;
    }

    static get styles() {
        return css`
            .card-config {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .section {
                border: 1px solid var(--divider-color, #e0e0e0);
                border-radius: 8px;
                padding: 16px;
            }
            .section-title {
                display: block;
                margin-bottom: 12px;
                font-weight: 500;
                font-size: 1.05em;
                color: var(--primary-text-color);
            }
            .subsection-title {
                display: block;
                margin: 20px 0 8px;
                font-weight: 500;
                color: var(--secondary-text-color);
            }
            ha-form {
                display: block;
            }
            ha-expansion-panel {
                margin-bottom: 8px;
            }
            .point-header {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                color: var(--primary-text-color);
            }
            .point-content {
                padding: 8px 4px 4px;
            }
            .point-actions {
                display: flex;
                justify-content: flex-end;
                gap: 4px;
                margin-top: 8px;
            }
            .point-actions .delete {
                color: var(--error-color, #f44336);
            }
            .actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 8px;
            }
            .color-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }
            .color-label {
                flex: 1;
                color: var(--primary-text-color);
            }
            .color-picker {
                width: 80px;
            }
            .color-opacity {
                flex: 1;
                min-width: 140px;
            }
            .color-reset {
                flex: 0 0 auto;
                color: var(--secondary-text-color);
            }
            .color-reset[disabled] {
                opacity: 0.3;
                pointer-events: none;
            }
            .empty {
                padding: 8px 0;
                color: var(--secondary-text-color);
                font-style: italic;
            }
        `;
    }
}

customElements.define("psychrometric-chart-editor", PsychrometricChartEditor);
