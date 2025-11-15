/**
 * Constants and Default Values
 * Physical constants and default configuration values
 */

/**
 * Physical constants for psychrometric calculations
 */
export const PHYSICAL_CONSTANTS = {
    // Atmospheric pressure at sea level (kPa)
    ATMOSPHERIC_PRESSURE: 101.325,

    // Specific gas constant for dry air (J/(kg·K))
    DRY_AIR_GAS_CONSTANT: 287.058,

    // Specific gas constant for water vapor (J/(kg·K))
    WATER_VAPOR_GAS_CONSTANT: 461.5,

    // Specific heat capacity of air (kJ/(kg·°C))
    AIR_SPECIFIC_HEAT: 1.006,

    // Latent heat of vaporization (kJ/kg)
    LATENT_HEAT_VAPORIZATION: 2501,

    // Specific heat capacity of water vapor (kJ/(kg·°C))
    WATER_VAPOR_SPECIFIC_HEAT: 1.84,

    // Magnus-Tetens formula constants
    MAGNUS_A: 17.27,
    MAGNUS_B: 237.3,

    // Ratio of molecular weights (water vapor / dry air)
    MOLECULAR_WEIGHT_RATIO: 0.622
};

/**
 * Default comfort zone parameters
 */
export const DEFAULT_COMFORT_ZONE = {
    tempMin: 20,
    tempMax: 24,
    rhMin: 40,
    rhMax: 60
};

/**
 * Default thermal comfort parameters (Fanger model)
 */
export const DEFAULT_THERMAL_COMFORT = {
    // Clothing insulation (clo)
    CLOTHING_INSULATION: 0.7,

    // Metabolic activity level (met)
    METABOLIC_RATE: 1.2,

    // Air velocity (m/s)
    AIR_VELOCITY: 0.1,

    // Metabolic rate in W/m²
    METABOLIC_RATE_W: 58.15
};

/**
 * Rendering and chart constants
 */
export const CHART_CONSTANTS = {
    // Default canvas dimensions
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,

    // Margins
    MARGIN_LEFT: 60,
    MARGIN_RIGHT: 40,
    MARGIN_TOP: 30,
    MARGIN_BOTTOM: 50,

    // Grid and line styles
    GRID_LINE_WIDTH: 0.5,
    CURVE_LINE_WIDTH: 1,
    COMFORT_ZONE_ALPHA: 0.1,

    // Point rendering
    POINT_RADIUS: 5,
    POINT_HOVER_RADIUS: 7,

    // Font sizes
    FONT_SIZE_SMALL: 10,
    FONT_SIZE_NORMAL: 12,
    FONT_SIZE_LARGE: 14,

    // Colors
    GRID_COLOR: '#e0e0e0',
    AXIS_COLOR: '#333',
    COMFORT_ZONE_COLOR: 'rgba(76, 175, 80, 0.1)',
    COMFORT_ZONE_BORDER: '#4CAF50',

    // Humidity curve steps
    HUMIDITY_CURVE_STEPS: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],

    // Temperature range (default)
    TEMP_MIN: -10,
    TEMP_MAX: 50,

    // Humidity range
    RH_MIN: 0,
    RH_MAX: 100
};

/**
 * Mold risk threshold values
 */
export const MOLD_RISK_THRESHOLDS = {
    NONE: 0,
    VERY_LOW: 1,
    LOW: 2,
    MODERATE: 3,
    HIGH: 4,
    VERY_HIGH: 5,
    CRITICAL: 6
};

/**
 * Mold risk colors
 */
export const MOLD_RISK_COLORS = {
    NONE: '#4CAF50',        // Green
    VERY_LOW: '#8BC34A',    // Light Green
    LOW: '#CDDC39',         // Lime
    MODERATE: '#FFEB3B',    // Yellow
    HIGH: '#FF9800',        // Orange
    VERY_HIGH: '#FF5722',   // Deep Orange
    CRITICAL: '#F44336'     // Red
};

/**
 * PMV (Predicted Mean Vote) comfort ranges
 */
export const PMV_RANGES = {
    VERY_COLD: -3,
    COLD: -2,
    COOL: -1,
    NEUTRAL: 0,
    WARM: 1,
    HOT: 2,
    VERY_HOT: 3
};

/**
 * History chart constants
 */
export const HISTORY_CONSTANTS = {
    // Time range (24 hours in milliseconds)
    TIME_RANGE_MS: 24 * 60 * 60 * 1000,

    // Maximum data points to display
    MAX_DATA_POINTS: 288, // 24h * 12 points/hour (5 min intervals)

    // Chart dimensions
    CHART_HEIGHT: 400,
    CHART_MARGIN: 40
};

/**
 * Debounce delays (milliseconds)
 */
export const DEBOUNCE_DELAYS = {
    RESIZE: 150,
    RENDER: 100
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = 'fr';

/**
 * Card version
 */
export const CARD_VERSION = '2.0.0';

/**
 * Card name for registration
 */
export const CARD_NAME = 'psychrometric-chart-enhanced';
