/**
 * TypeScript Type Definitions
 * Complete type definitions for the Psychrometric Chart card
 */

import { SupportedLanguage } from '../i18n/translations';

/**
 * Data point configuration
 */
export interface PointConfig {
    /** Temperature sensor entity ID */
    temp: string;

    /** Humidity sensor entity ID */
    humidity: string;

    /** Point color (hex or rgba) */
    color: string;

    /** Display label for the point */
    label: string;

    /** Optional icon (mdi:icon-name) */
    icon?: string;
}

/**
 * Comfort zone range configuration
 */
export interface ComfortRangeConfig {
    /** Minimum comfortable temperature (°C) */
    tempMin: number;

    /** Maximum comfortable temperature (°C) */
    tempMax: number;

    /** Minimum comfortable relative humidity (%) */
    rhMin: number;

    /** Maximum comfortable relative humidity (%) */
    rhMax: number;
}

/**
 * Display mode options
 */
export type DisplayMode = 'standard' | 'compact' | 'detailed';

/**
 * Main card configuration
 */
export interface PsychrometricCardConfig {
    /** Card type (must be 'custom:psychrometric-chart-enhanced') */
    type: string;

    /** Language for the UI (default: 'fr') */
    language?: SupportedLanguage;

    /** Array of data points to display */
    points: PointConfig[];

    /** Background color (default: '#000000') */
    bgColor?: string;

    /** Text color (default: '#ffffff') */
    textColor?: string;

    /** Grid color (default: 'rgba(0, 238, 254, 0.15)') */
    gridColor?: string;

    /** Humidity curve color (default: '#3B58DD') */
    curveColor?: string;

    /** Show calculated data cards (default: true) */
    showCalculatedData?: boolean;

    /** Comfort zone range configuration */
    comfortRange?: ComfortRangeConfig;

    /** Comfort zone color (default: 'rgba(144, 238, 144, 0.3)') */
    comfortColor?: string;

    /** Mass flow rate for HVAC power calculations in kg/s (default: 0.5) */
    massFlowRate?: number;

    /** Chart title */
    chartTitle?: string;

    /** Enable dark mode (default: false) */
    darkMode?: boolean;

    /** Show mold risk indicator (default: true) */
    showMoldRisk?: boolean;

    /** Display mode: standard, compact, or detailed (default: 'standard') */
    displayMode?: DisplayMode;

    /** Show enthalpy curves on the chart (default: false) */
    showEnthalpy?: boolean;

    /** Show legend (default: true) */
    showLegend?: boolean;

    /** Show point labels on chart (default: false) */
    showPointLabels?: boolean;

    /** Zoom range - minimum temperature (°C) */
    zoom_temp_min?: number;

    /** Zoom range - maximum temperature (°C) */
    zoom_temp_max?: number;

    /** Zoom range - minimum humidity (%) */
    zoom_humidity_min?: number;

    /** Zoom range - maximum humidity (%) */
    zoom_humidity_max?: number;
}

/**
 * Processed data point (with calculated values)
 */
export interface ProcessedPoint {
    /** Original point configuration */
    config: PointConfig;

    /** Temperature value (°C) */
    temp: number;

    /** Relative humidity value (%) */
    humidity: number;

    /** Dew point temperature (°C) */
    dewPoint: number;

    /** Wet-bulb temperature (°C) */
    wetBulbTemp: number;

    /** Specific enthalpy (kJ/kg) */
    enthalpy: number;

    /** Water content / moisture ratio (kg/kg) */
    waterContent: number;

    /** Absolute humidity (g/m³) */
    absoluteHumidity: number;

    /** Specific volume (m³/kg) */
    specificVolume: number;

    /** PMV (Predicted Mean Vote) thermal comfort index */
    pmv: number;

    /** Mold risk score (0-6) */
    moldRisk: number;

    /** Whether point is in comfort zone */
    inComfortZone: boolean;
}

/**
 * Home Assistant entity state
 */
export interface HassEntity {
    /** Entity ID */
    entity_id: string;

    /** Current state value */
    state: string;

    /** Entity attributes */
    attributes: Record<string, any>;

    /** Last changed timestamp */
    last_changed: string;

    /** Last updated timestamp */
    last_updated: string;

    /** Context */
    context: {
        id: string;
        parent_id: string | null;
        user_id: string | null;
    };
}

/**
 * Home Assistant states object
 */
export interface HassStates {
    [entity_id: string]: HassEntity;
}

/**
 * Home Assistant interface
 */
export interface Hass {
    /** All entity states */
    states: HassStates;

    /** Call service method */
    callService: (domain: string, service: string, serviceData?: any) => Promise<void>;

    /** Connection */
    connection: any;

    /** User information */
    user?: {
        id: string;
        name: string;
        is_admin: boolean;
        is_owner: boolean;
    };

    /** Current language */
    language?: string;

    /** Theme information */
    themes?: any;

    /** Panel URL */
    panelUrl?: string;
}

/**
 * History data point from Home Assistant API
 */
export interface HistoryDataPoint {
    /** Entity ID */
    entity_id: string;

    /** State value */
    state: string;

    /** Timestamp */
    last_changed: string;

    /** Attributes */
    attributes?: Record<string, any>;
}

/**
 * Zoom range configuration (from YAML)
 */
export interface ZoomRange {
    /** Minimum temperature (°C) */
    tempMin: number;

    /** Maximum temperature (°C) */
    tempMax: number;

    /** Minimum humidity (%) */
    humidityMin: number;

    /** Maximum humidity (%) */
    humidityMax: number;
}

/**
 * Canvas rendering context with required properties
 */
export interface ChartRenderContext {
    /** Canvas 2D context */
    ctx: CanvasRenderingContext2D;

    /** Canvas width */
    width: number;

    /** Canvas height */
    height: number;

    /** Configuration */
    config: PsychrometricCardConfig;

    /** Data points to render */
    points: ProcessedPoint[];

    /** Zoom range (if configured) */
    zoomRange: ZoomRange | null;
}

/**
 * Coordinate transformation functions
 */
export interface CoordinateTransform {
    /** Convert temperature to X coordinate */
    tempToX: (temp: number) => number;

    /** Convert humidity to Y coordinate */
    humidityToY: (humidity: number) => number;

    /** Convert X coordinate to temperature */
    xToTemp: (x: number) => number;

    /** Convert Y coordinate to humidity */
    yToHumidity: (y: number) => number;
}

/**
 * Modal state
 */
export interface ModalState {
    /** Whether modal is open */
    isOpen: boolean;

    /** Point configuration being displayed */
    point: PointConfig | null;

    /** History data */
    historyData: HistoryDataPoint[] | null;
}

/**
 * Tooltip information
 */
export interface TooltipInfo {
    /** X position */
    x: number;

    /** Y position */
    y: number;

    /** Content to display */
    content: string;

    /** Whether tooltip is visible */
    visible: boolean;
}

/**
 * Card state (for rendering optimization)
 */
export interface CardState {
    /** Whether the card has been rendered at least once */
    hasRendered: boolean;

    /** Previous sensor values (for change detection) */
    previousValues: Map<string, string>;

    /** Last render timestamp */
    lastRenderTime: number;

    /** Currently hovered point index */
    hoveredPointIndex: number | null;

    /** Modal state */
    modal: ModalState;

    /** Tooltip state */
    tooltip: TooltipInfo;
}

/**
 * Action recommendation for HVAC control
 */
export interface ActionRecommendation {
    /** Action type */
    action: 'heat' | 'cool' | 'humidify' | 'dehumidify' | 'none';

    /** Combined action description */
    description: string;

    /** Required heating power (W) */
    heatingPower?: number;

    /** Required cooling power (W) */
    coolingPower?: number;

    /** Required humidification power (W) */
    humidificationPower?: number;

    /** Required dehumidification power (W) */
    dehumidificationPower?: number;

    /** Total power required (W) */
    totalPower: number;

    /** Ideal temperature setpoint (°C) */
    idealTemp: number;

    /** Ideal humidity setpoint (%) */
    idealHumidity: number;
}
