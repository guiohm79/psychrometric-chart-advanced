/**
 * Coordinate System Module
 * Handles coordinate transformations between psychrometric values and canvas pixels
 * Supports zoom and pan transformations
 */

import { ZoomRange } from '../types/config';

/**
 * Coordinate system class for psychrometric chart
 */
export class CoordinateSystem {
    private canvasWidth: number;
    private canvasHeight: number;
    private zoomLevel: number = 1.0;
    private panX: number = 0;
    private panY: number = 0;
    private configuredZoomRange: ZoomRange | null = null;

    // Zoom limits
    private readonly minZoom = 0.5;
    private readonly maxZoom = 3.0;

    constructor(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    /**
     * Update canvas dimensions
     */
    setDimensions(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // Recalculate zoom if range is configured
        if (this.configuredZoomRange) {
            this.calculateZoomFromRange();
        }
    }

    /**
     * Set zoom range from configuration
     */
    setZoomRange(range: ZoomRange | null): void {
        this.configuredZoomRange = range;

        if (range) {
            this.calculateZoomFromRange();
        } else {
            // Reset to default
            this.zoomLevel = 1.0;
            this.panX = 0;
            this.panY = 0;
        }
    }

    /**
     * Calculate zoom level and pan from configured range
     */
    private calculateZoomFromRange(): void {
        if (!this.configuredZoomRange) return;

        const { tempMin, tempMax, humidityMin, humidityMax } = this.configuredZoomRange;

        // Full chart temperature range: -10°C to 50°C (60° total)
        const fullTempRange = 60;
        const desiredTempRange = tempMax - tempMin;

        // Calculate zoom level based on temperature range
        // Zoom level = full range / desired range
        this.zoomLevel = Math.min(
            this.maxZoom,
            Math.max(this.minZoom, fullTempRange / desiredTempRange)
        );

        // Calculate pan to center the desired range
        // Full chart center is at 20°C (middle of -10 to 50)
        const fullChartCenter = 20;
        const desiredCenter = (tempMin + tempMax) / 2;

        // Pan offset in temperature units, then convert to pixels
        const tempOffset = fullChartCenter - desiredCenter;
        // Convert temperature offset to pixel offset (12 pixels per degree at scale 1.0)
        this.panX = tempOffset * 12 * (this.canvasWidth / 800) * this.zoomLevel;

        // For humidity, center vertically if min/max specified
        if (humidityMin !== null && humidityMax !== null) {
            // Humidity zoom is more complex due to non-linear vapor pressure scale
            // Apply a vertical pan to center the desired humidity range
            const humCenter = (humidityMin + humidityMax) / 2;

            // Calculate Y position of center humidity at center temperature
            const centerTemp = desiredCenter;
            const P_sat = 0.61078 * Math.exp((17.27 * centerTemp) / (centerTemp + 237.3));
            const P_v_center = (humCenter / 100) * P_sat;
            const P_v_50 = (50 / 100) * P_sat; // 50% is roughly middle of chart

            // Pan offset to center the desired humidity
            const humOffset = (P_v_center - P_v_50) / 4 * 500 * (this.canvasHeight / 600);
            this.panY = humOffset * this.zoomLevel;
        } else {
            this.panY = 0;
        }
    }

    /**
     * Convert temperature to X coordinate
     * @param temp - Temperature in °C
     * @returns X coordinate in pixels
     */
    tempToX(temp: number): number {
        // Convert temperature to X coordinate with zoom and pan applied
        const scaleX = this.canvasWidth / 800;
        const baseX = 50 * scaleX + (temp + 10) * 12 * scaleX;

        // Apply zoom and pan transformation
        if (this.zoomLevel !== 1.0 || this.panX !== 0) {
            const centerX = this.canvasWidth / 2;
            return (baseX - centerX) * this.zoomLevel + centerX + this.panX;
        }

        return baseX;
    }

    /**
     * Convert humidity to Y coordinate (depends on temperature due to vapor pressure)
     * @param temp - Temperature in °C
     * @param humidity - Relative humidity in %
     * @returns Y coordinate in pixels
     */
    humidityToY(temp: number, humidity: number): number {
        // Convert temperature and humidity to Y coordinate with zoom and pan applied
        const scaleY = this.canvasHeight / 600;
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (humidity / 100) * P_sat;
        const baseY = 550 * scaleY - (P_v / 4) * 500 * scaleY;

        // Apply zoom and pan transformation
        if (this.zoomLevel !== 1.0 || this.panY !== 0) {
            const centerY = this.canvasHeight / 2;
            return (baseY - centerY) * this.zoomLevel + centerY + this.panY;
        }

        return baseY;
    }

    /**
     * Convert X coordinate to temperature (inverse transformation)
     * @param x - X coordinate in pixels
     * @returns Temperature in °C
     */
    xToTemp(x: number): number {
        const scaleX = this.canvasWidth / 800;
        const centerX = this.canvasWidth / 2;

        // Reverse zoom and pan transformation
        let baseX = x;
        if (this.zoomLevel !== 1.0 || this.panX !== 0) {
            baseX = (x - centerX - this.panX) / this.zoomLevel + centerX;
        }

        // Convert back to temperature
        return (baseX / scaleX - 50) / 12 - 10;
    }

    /**
     * Convert Y coordinate to humidity (approximate - requires temperature)
     * @param y - Y coordinate in pixels
     * @param temp - Temperature in °C (needed for vapor pressure calculation)
     * @returns Relative humidity in %
     */
    yToHumidity(y: number, temp: number): number {
        const scaleY = this.canvasHeight / 600;
        const centerY = this.canvasHeight / 2;

        // Reverse zoom and pan transformation
        let baseY = y;
        if (this.zoomLevel !== 1.0 || this.panY !== 0) {
            baseY = (y - centerY - this.panY) / this.zoomLevel + centerY;
        }

        // Convert back to vapor pressure
        const P_v = (550 * scaleY - baseY) / (500 * scaleY) * 4;

        // Convert vapor pressure to relative humidity
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        return (P_v / P_sat) * 100;
    }

    /**
     * Get current zoom level
     */
    getZoomLevel(): number {
        return this.zoomLevel;
    }

    /**
     * Get current pan offset
     */
    getPan(): { x: number; y: number } {
        return { x: this.panX, y: this.panY };
    }

    /**
     * Set zoom level manually
     * @param zoom - Zoom level (will be clamped to min/max)
     */
    setZoomLevel(zoom: number): void {
        this.zoomLevel = Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
    }

    /**
     * Set pan offset manually
     */
    setPan(x: number, y: number): void {
        this.panX = x;
        this.panY = y;
    }

    /**
     * Get canvas dimensions
     */
    getDimensions(): { width: number; height: number } {
        return { width: this.canvasWidth, height: this.canvasHeight };
    }

    /**
     * Check if a point is within the visible canvas area
     */
    isPointVisible(x: number, y: number): boolean {
        return x >= 0 && x <= this.canvasWidth && y >= 0 && y <= this.canvasHeight;
    }

    /**
     * Get the visible temperature range based on current zoom/pan
     */
    getVisibleTempRange(): { min: number; max: number } {
        const minTemp = this.xToTemp(0);
        const maxTemp = this.xToTemp(this.canvasWidth);
        return { min: minTemp, max: maxTemp };
    }

    /**
     * Get the visible humidity range (approximate, at a given temperature)
     */
    getVisibleHumidityRange(temp: number): { min: number; max: number } {
        const maxHum = this.yToHumidity(0, temp);
        const minHum = this.yToHumidity(this.canvasHeight, temp);
        return { min: Math.max(0, minHum), max: Math.min(100, maxHum) };
    }
}

/**
 * Create a new coordinate system instance
 */
export function createCoordinateSystem(width: number, height: number): CoordinateSystem {
    return new CoordinateSystem(width, height);
}
