/**
 * Chart Renderer Module
 * Main psychrometric chart drawing logic
 */

import type { ProcessedPoint, ComfortRangeConfig } from '../types/config';
import { CoordinateSystem } from './coordinate-system';
import { CHART_CONSTANTS } from '../utils/constants';

/**
 * Chart rendering options
 */
export interface ChartRenderOptions {
    /** Background color */
    bgColor: string;

    /** Grid color */
    gridColor: string;

    /** Humidity curve color */
    curveColor: string;

    /** Text color */
    textColor: string;

    /** Comfort zone configuration */
    comfortRange: ComfortRangeConfig;

    /** Comfort zone color */
    comfortColor: string;

    /** Show enthalpy curves */
    showEnthalpy?: boolean;

    /** Show wet bulb temperature curves */
    showWetBulb?: boolean;

    /** Show dew point lines */
    showDewPoint?: boolean;

    /** Dark mode enabled */
    darkMode?: boolean;

    /** Show point labels on chart */
    showPointLabels?: boolean;

    /** Display mode */
    displayMode?: string;
}

/**
 * Psychrometric chart renderer
 */
export class ChartRenderer {
    private coordinateSystem: CoordinateSystem;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    constructor(coordinateSystem: CoordinateSystem) {
        this.coordinateSystem = coordinateSystem;
    }

    /**
     * Set canvas element
     */
    setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Update coordinate system dimensions
        this.coordinateSystem.setDimensions(canvas.width, canvas.height);
    }

    /**
     * Draw complete psychrometric chart
     */
    draw(points: ProcessedPoint[], options: ChartRenderOptions): void {
        if (!this.canvas || !this.ctx) {
            console.error('Canvas not set');
            return;
        }

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Calculate scale factors for responsive design
        const scaleX = width / 800;
        const scaleY = height / 600;
        const scale = Math.min(scaleX, scaleY);

        // Clear canvas
        ctx.fillStyle = options.bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw chart elements in order
        this.drawGrid(ctx, options, scale);
        this.drawHumidityCurves(ctx, options, scale);

        if (options.showEnthalpy) {
            this.drawEnthalpyCurves(ctx, options, scale);
        }

        this.drawComfortZone(ctx, options);
        this.drawDataPoints(ctx, points, options, scale);

        if (options.showDewPoint) {
            this.drawDewPointLines(ctx, points, options, scale);
        }

        if (options.showPointLabels) {
            this.drawPointLabels(ctx, points, options, scale);
        }
    }

    /**
     * Draw grid and axes
     */
    private drawGrid(
        ctx: CanvasRenderingContext2D,
        options: ChartRenderOptions,
        scale: number
    ): void {
        const width = this.canvas!.width;
        const height = this.canvas!.height;
        const scaleX = width / 800;
        const scaleY = height / 600;

        ctx.strokeStyle = options.gridColor;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([5 * scale, 5 * scale]);
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;

        // Vapor pressure axis (vertical) - grid lines and labels
        for (let i = 0; i <= 4; i += 0.5) {
            // Convert vapor pressure to Y coordinate using reference temperature
            const refTemp = 20; // Reference temperature for vapor pressure axis
            const P_sat = 0.61078 * Math.exp((17.27 * refTemp) / (refTemp + 237.3));
            const rh = (i / P_sat) * 100;
            const y = this.coordinateSystem.humidityToY(refTemp, rh);

            ctx.beginPath();
            ctx.moveTo(50 * scaleX, y);
            ctx.lineTo(750 * scaleX, y);
            ctx.stroke();

            ctx.fillStyle = options.textColor;
            ctx.fillText(`${i.toFixed(1)} kPa`, 10 * scaleX, y + 5 * scaleY);
        }

        // Temperature axis (horizontal) - grid lines and labels
        for (let i = -10; i <= 50; i += 5) {
            const x = this.coordinateSystem.tempToX(i);
            ctx.beginPath();
            ctx.moveTo(x, 550 * scaleY);
            ctx.lineTo(x, 50 * scaleY);
            ctx.stroke();

            ctx.fillStyle = options.textColor;
            ctx.fillText(`${i}°C`, x - 10 * scaleX, 550 * scaleY + 20 * scaleY);
        }

        ctx.setLineDash([]);
    }

    /**
     * Draw relative humidity curves
     */
    private drawHumidityCurves(
        ctx: CanvasRenderingContext2D,
        options: ChartRenderOptions,
        scale: number
    ): void {
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;

        for (let rh = 10; rh <= 100; rh += 10) {
            ctx.beginPath();
            ctx.strokeStyle = rh === 100 ? 'rgba(30, 144, 255, 0.8)' : options.curveColor;
            ctx.lineWidth = (rh % 20 === 0 ? 1.5 : 0.8) * scale;

            let lastX = 0, lastY = 0;

            for (let t = -10; t <= 50; t++) {
                const x = this.coordinateSystem.tempToX(t);
                const y = this.coordinateSystem.humidityToY(t, rh);

                if (t === -10) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                lastX = x;
                lastY = y;
            }

            ctx.stroke();

            // Label every 20% humidity line
            if (rh % 20 === 0 && lastY > 0) {
                ctx.fillStyle = options.textColor;
                ctx.fillText(`${rh}%`, lastX + 5 * scale, lastY);
            }
        }
    }

    /**
     * Draw enthalpy curves (optional)
     */
    private drawEnthalpyCurves(
        ctx: CanvasRenderingContext2D,
        options: ChartRenderOptions,
        scale: number
    ): void {
        ctx.strokeStyle = options.darkMode
            ? 'rgba(255, 165, 0, 0.4)'
            : 'rgba(255, 140, 0, 0.3)';
        ctx.lineWidth = 0.8 * scale;
        ctx.setLineDash([3 * scale, 3 * scale]);

        // Draw enthalpy curves for specific values (e.g., 20, 40, 60, 80 kJ/kg)
        for (let h = 20; h <= 100; h += 20) {
            ctx.beginPath();
            let pointsDrawn = 0;

            for (let t = -10; t <= 50; t += 1) {
                for (let rh = 10; rh <= 100; rh += 5) {
                    // Calculate enthalpy for this point
                    const P_sat = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
                    const P_v = (rh / 100) * P_sat;
                    const W = 0.622 * (P_v / (101.325 - P_v));
                    const enthalpy = 1.006 * t + W * (2501 + 1.84 * t);

                    if (Math.abs(enthalpy - h) < 2) {
                        const x = this.coordinateSystem.tempToX(t);
                        const y = this.coordinateSystem.humidityToY(t, rh);

                        if (pointsDrawn === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                        pointsDrawn++;
                    }
                }
            }

            if (pointsDrawn > 0) {
                ctx.stroke();
            }
        }

        ctx.setLineDash([]);
    }

    /**
     * Draw comfort zone
     */
    private drawComfortZone(
        ctx: CanvasRenderingContext2D,
        options: ChartRenderOptions
    ): void {
        const { comfortRange, comfortColor } = options;

        ctx.fillStyle = comfortColor;
        ctx.strokeStyle = options.darkMode
            ? 'rgba(76, 175, 80, 0.6)'
            : 'rgba(76, 175, 80, 0.4)';
        ctx.lineWidth = 2;

        ctx.beginPath();

        // Top-left corner
        let x = this.coordinateSystem.tempToX(comfortRange.tempMin);
        let y = this.coordinateSystem.humidityToY(comfortRange.tempMin, comfortRange.rhMax);
        ctx.moveTo(x, y);

        // Top edge
        for (let t = comfortRange.tempMin; t <= comfortRange.tempMax; t += 0.5) {
            x = this.coordinateSystem.tempToX(t);
            y = this.coordinateSystem.humidityToY(t, comfortRange.rhMax);
            ctx.lineTo(x, y);
        }

        // Right edge down
        for (let rh = comfortRange.rhMax; rh >= comfortRange.rhMin; rh -= 1) {
            x = this.coordinateSystem.tempToX(comfortRange.tempMax);
            y = this.coordinateSystem.humidityToY(comfortRange.tempMax, rh);
            ctx.lineTo(x, y);
        }

        // Bottom edge
        for (let t = comfortRange.tempMax; t >= comfortRange.tempMin; t -= 0.5) {
            x = this.coordinateSystem.tempToX(t);
            y = this.coordinateSystem.humidityToY(t, comfortRange.rhMin);
            ctx.lineTo(x, y);
        }

        // Left edge up
        for (let rh = comfortRange.rhMin; rh <= comfortRange.rhMax; rh += 1) {
            x = this.coordinateSystem.tempToX(comfortRange.tempMin);
            y = this.coordinateSystem.humidityToY(comfortRange.tempMin, rh);
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    /**
     * Draw data points
     */
    private drawDataPoints(
        ctx: CanvasRenderingContext2D,
        points: ProcessedPoint[],
        options: ChartRenderOptions,
        scale: number
    ): void {
        points.forEach((point) => {
            const x = this.coordinateSystem.tempToX(point.temp);
            const y = this.coordinateSystem.humidityToY(point.temp, point.humidity);

            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
            ctx.fillStyle = point.config.color;
            ctx.fill();
            ctx.strokeStyle = options.darkMode ? '#fff' : '#000';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Add glow effect
            ctx.shadowColor = point.config.color;
            ctx.shadowBlur = 10 * scale;
            ctx.beginPath();
            ctx.arc(x, y, 4 * scale, 0, 2 * Math.PI);
            ctx.fillStyle = point.config.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    /**
     * Draw dew point lines from data points
     */
    private drawDewPointLines(
        ctx: CanvasRenderingContext2D,
        points: ProcessedPoint[],
        options: ChartRenderOptions,
        scale: number
    ): void {
        points.forEach((point) => {
            const x1 = this.coordinateSystem.tempToX(point.temp);
            const y1 = this.coordinateSystem.humidityToY(point.temp, point.humidity);

            const x2 = this.coordinateSystem.tempToX(point.dewPoint);
            const y2 = this.coordinateSystem.humidityToY(point.dewPoint, 100);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = point.config.color;
            ctx.lineWidth = 1 * scale;
            ctx.setLineDash([3 * scale, 3 * scale]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    }

    /**
     * Draw point labels
     */
    private drawPointLabels(
        ctx: CanvasRenderingContext2D,
        points: ProcessedPoint[],
        options: ChartRenderOptions,
        scale: number
    ): void {
        ctx.font = `bold ${Math.max(10, 12 * scale)}px Arial`;
        ctx.textAlign = 'center';

        points.forEach((point) => {
            const x = this.coordinateSystem.tempToX(point.temp);
            const y = this.coordinateSystem.humidityToY(point.temp, point.humidity);

            // Background for label
            const label = point.config.label;
            const metrics = ctx.measureText(label);
            const padding = 4 * scale;

            ctx.fillStyle = options.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
                x - metrics.width / 2 - padding,
                y - 20 * scale - padding,
                metrics.width + 2 * padding,
                14 * scale + 2 * padding
            );

            // Label text
            ctx.fillStyle = point.config.color;
            ctx.fillText(label, x, y - 12 * scale);
        });

        ctx.textAlign = 'left';
    }

    /**
     * Get coordinate system
     */
    getCoordinateSystem(): CoordinateSystem {
        return this.coordinateSystem;
    }
}

/**
 * Create a new chart renderer instance
 */
export function createChartRenderer(coordinateSystem: CoordinateSystem): ChartRenderer {
    return new ChartRenderer(coordinateSystem);
}
