/**
 * Psychrometric Card - Main Web Component
 * Orchestrates all modules to create the complete card
 */

import type {
    PsychrometricCardConfig,
    Hass,
    ProcessedPoint,
    PointConfig,
    ComfortRangeConfig,
    ZoomRange
} from './types/config';

import { createI18nHelper, I18nHelper } from './i18n/i18n-helper';
import { createCoordinateSystem, CoordinateSystem } from './rendering/coordinate-system';
import { createChartRenderer, ChartRenderer } from './rendering/chart-renderer';
import { createLegendRenderer, LegendRenderer } from './rendering/legend-renderer';
import { generateCardTemplate, generateCalculatedDataHTML } from './templates/card-template';
import * as calc from './calculations/psychrometrics';
import { DEFAULT_COMFORT_ZONE, DEFAULT_LANGUAGE, CARD_VERSION } from './utils/constants';
import { isInComfortZone, debounce, safeParseFloat } from './utils/helpers';

/**
 * Psychrometric Chart Enhanced - Main Card Class
 */
export class PsychrometricCard extends HTMLElement {
    // Configuration and state
    private config!: PsychrometricCardConfig;
    private _hass: Hass | null = null;
    private _hasRendered: boolean = false;
    private _previousValues: Map<string, string> = new Map();

    // Canvas dimensions
    private canvasWidth: number = 800;
    private canvasHeight: number = 600;

    // Module instances
    private i18n: I18nHelper;
    private coordinateSystem: CoordinateSystem;
    private chartRenderer: ChartRenderer;
    private legendRenderer: LegendRenderer;

    // ResizeObserver
    private resizeObserver: ResizeObserver | null = null;
    private resizeDebounceTimer: number | null = null;

    // Processed data
    private validPoints: ProcessedPoint[] = [];

    constructor() {
        super();

        // Initialize modules
        this.i18n = createI18nHelper(DEFAULT_LANGUAGE);
        this.coordinateSystem = createCoordinateSystem(this.canvasWidth, this.canvasHeight);
        this.chartRenderer = createChartRenderer(this.coordinateSystem);
        this.legendRenderer = createLegendRenderer();
    }

    /**
     * Set configuration from YAML
     */
    setConfig(config: PsychrometricCardConfig): void {
        if (!config.points || config.points.length === 0) {
            throw new Error(this.i18n.t('noPointsConfigured'));
        }

        this.config = config;

        // Update language
        if (config.language) {
            this.i18n.setLanguage(config.language);
        }

        // Configure zoom range if specified
        if (config.zoom_temp_min !== undefined && config.zoom_temp_max !== undefined) {
            const zoomRange: ZoomRange = {
                tempMin: config.zoom_temp_min,
                tempMax: config.zoom_temp_max,
                humidityMin: config.zoom_humidity_min || 0,
                humidityMax: config.zoom_humidity_max || 100
            };
            this.coordinateSystem.setZoomRange(zoomRange);
        }
    }

    /**
     * Home Assistant will set this property
     */
    set hass(hass: Hass) {
        const oldHass = this._hass;
        this._hass = hass;

        // Only re-render if sensor values have changed
        if (oldHass && this.shouldUpdate(hass)) {
            this.render(hass);
        } else if (!oldHass) {
            // First render
            this.render(hass);
        }
    }

    get hass(): Hass | null {
        return this._hass;
    }

    /**
     * Check if component should update
     */
    private shouldUpdate(hass: Hass): boolean {
        if (!this.config || !this.config.points) return false;

        // Check if any sensor values have changed
        for (const point of this.config.points) {
            const tempState = hass.states[point.temp];
            const humState = hass.states[point.humidity];

            if (!tempState || !humState) continue;

            const oldTempValue = this._previousValues.get(point.temp);
            const oldHumValue = this._previousValues.get(point.humidity);

            if (tempState.state !== oldTempValue || humState.state !== oldHumValue) {
                return true;
            }
        }

        return false;
    }

    /**
     * Store current sensor values for next comparison
     */
    private storeSensorValues(hass: Hass): void {
        if (!this.config || !this.config.points) return;

        for (const point of this.config.points) {
            const tempState = hass.states[point.temp];
            const humState = hass.states[point.humidity];

            if (tempState) this._previousValues.set(point.temp, tempState.state);
            if (humState) this._previousValues.set(point.humidity, humState.state);
        }
    }

    /**
     * Main render method
     */
    private render(hass: Hass): void {
        // Process points and calculate values
        this.validPoints = this.processPoints(hass);

        if (this.validPoints.length === 0) {
            this.innerHTML = `<p style="color: red;">${this.i18n.t('noValidEntity')}</p>`;
            return;
        }

        // Get configuration with defaults
        const {
            bgColor = '#ffffff',
            gridColor = '#cccccc',
            curveColor = '#1f77b4',
            textColor = '#333333',
            chartTitle = 'Diagramme Psychrométrique',
            showCalculatedData = true,
            comfortRange = DEFAULT_COMFORT_ZONE,
            comfortColor = 'rgba(144, 238, 144, 0.5)',
            showEnthalpy = false,
            showLegend = true,
            darkMode = false,
            showMoldRisk = true,
            displayMode = 'standard',
            showPointLabels = false
        } = this.config;

        // Apply dark mode colors
        const actualBgColor = darkMode ? '#121212' : bgColor;
        const actualTextColor = darkMode ? '#ffffff' : textColor;
        const actualGridColor = darkMode ? '#333333' : gridColor;

        // Generate legend HTML
        const legendHTML = showLegend
            ? this.legendRenderer.render(this.validPoints, {
                textColor: actualTextColor,
                darkMode,
                i18n: this.i18n
            })
            : '';

        // Generate calculated data HTML
        const calculatedDataHTML = showCalculatedData
            ? generateCalculatedDataHTML({
                points: this.validPoints,
                darkMode,
                displayMode,
                showMoldRisk,
                i18n: this.i18n,
                hasRendered: this._hasRendered
            })
            : '';

        // Generate main template
        this.innerHTML = generateCardTemplate({
            title: chartTitle,
            bgColor: actualBgColor,
            textColor: actualTextColor,
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            legendHTML,
            calculatedDataHTML,
            hasRendered: this._hasRendered
        });

        // Store sensor values
        this.storeSensorValues(hass);

        // Mark as rendered
        if (!this._hasRendered) {
            this._hasRendered = true;
            this.legendRenderer.markRendered();
        }

        // Draw chart on canvas
        this.drawChart({
            bgColor: actualBgColor,
            gridColor: actualGridColor,
            curveColor,
            textColor: actualTextColor,
            comfortRange,
            comfortColor,
            showEnthalpy,
            darkMode,
            showPointLabels
        });

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Process points from Home Assistant states
     */
    private processPoints(hass: Hass): ProcessedPoint[] {
        const comfortRange = this.config.comfortRange || DEFAULT_COMFORT_ZONE;

        return this.config.points
            .map(point => this.processPoint(point, hass, comfortRange))
            .filter((p): p is ProcessedPoint => p !== null);
    }

    /**
     * Process single point
     */
    private processPoint(
        point: PointConfig,
        hass: Hass,
        comfortRange: ComfortRangeConfig
    ): ProcessedPoint | null {
        const tempState = hass.states[point.temp];
        const humState = hass.states[point.humidity];

        if (!tempState || !humState) {
            console.warn(`Entities not available: ${point.temp} or ${point.humidity}`);
            return null;
        }

        const temp = safeParseFloat(tempState.state);
        const humidity = safeParseFloat(humState.state);

        // Calculate all psychrometric values
        const dewPoint = calc.calculateDewPoint(temp, humidity);
        const waterContent = calc.calculateWaterContent(temp, humidity);
        const enthalpy = calc.calculateEnthalpy(temp, waterContent);
        const absoluteHumidity = calc.calculateAbsoluteHumidity(temp, humidity);
        const wetBulbTemp = calc.calculateWetBulbTemp(temp, humidity);
        const vaporPressure = calc.calculateVaporPressure(temp, humidity);
        const specificVolume = calc.calculateSpecificVolume(temp, humidity);
        const moldRisk = calc.calculateMoldRisk(temp, humidity);
        const pmv = calc.calculatePMV(temp, humidity);

        return {
            config: point,
            temp,
            humidity,
            dewPoint,
            wetBulbTemp,
            enthalpy,
            waterContent,
            absoluteHumidity,
            specificVolume,
            pmv,
            moldRisk,
            inComfortZone: isInComfortZone(temp, humidity, comfortRange)
        };
    }

    /**
     * Draw chart on canvas
     */
    private drawChart(options: any): void {
        const canvas = this.querySelector<HTMLCanvasElement>('#psychroChart');
        if (!canvas) return;

        this.chartRenderer.setCanvas(canvas);
        this.chartRenderer.draw(this.validPoints, options);
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Click listeners for data cards (to show history)
        const clickableValues = this.querySelectorAll('.clickable-value');
        clickableValues.forEach(element => {
            element.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const entityId = target.dataset.entity;
                const type = target.dataset.type;

                if (entityId && type && this._hass) {
                    this.showHistoryModal(entityId, type);
                }
            });
        });

        // Setup canvas interactivity (hover effects, tooltips)
        this.setupCanvasInteractivity();
    }

    /**
     * Setup canvas hover effects
     */
    private setupCanvasInteractivity(): void {
        const canvas = this.querySelector<HTMLCanvasElement>('#psychroChart');
        if (!canvas) return;

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if hovering over a point
            let hovering = false;
            for (const point of this.validPoints) {
                const px = this.coordinateSystem.tempToX(point.temp);
                const py = this.coordinateSystem.humidityToY(point.temp, point.humidity);

                const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));

                if (distance < 10) {
                    canvas.style.cursor = 'pointer';
                    hovering = true;
                    break;
                }
            }

            if (!hovering) {
                canvas.style.cursor = 'crosshair';
            }
        });
    }

    /**
     * Show history modal (placeholder)
     */
    private showHistoryModal(entityId: string, type: string): void {
        console.log(`Show history for ${entityId} (${type})`);
        // TODO: Implement history modal
        // This would use the history-chart renderer
    }

    /**
     * Setup resize observer
     */
    private setupResizeObserver(): void {
        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(
                debounce(() => {
                    this.updateCanvasSize();
                }, 150)
            );

            this.resizeObserver.observe(this);
        }
    }

    /**
     * Update canvas size on resize
     */
    private updateCanvasSize(): void {
        const container = this.querySelector('.chart-container');
        if (!container) return;

        const width = container.clientWidth;
        const height = Math.min(width * 0.75, 600);

        this.canvasWidth = width;
        this.canvasHeight = height;

        this.coordinateSystem.setDimensions(width, height);

        if (this._hass) {
            this.render(this._hass);
        }
    }

    /**
     * Component connected to DOM
     */
    connectedCallback(): void {
        this.setupResizeObserver();
    }

    /**
     * Component disconnected from DOM
     */
    disconnectedCallback(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        if (this.resizeDebounceTimer !== null) {
            clearTimeout(this.resizeDebounceTimer);
            this.resizeDebounceTimer = null;
        }
    }

    /**
     * Get card size for Home Assistant layout
     */
    getCardSize(): number {
        return 3; // Height in grid rows
    }

    /**
     * Get stub config for card picker
     */
    static getStubConfig(): Partial<PsychrometricCardConfig> {
        return {
            type: 'custom:psychrometric-chart-enhanced',
            points: [
                {
                    temp: 'sensor.temperature',
                    humidity: 'sensor.humidity',
                    color: '#ff0000',
                    label: 'Room'
                }
            ]
        };
    }
}
