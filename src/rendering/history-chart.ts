/**
 * History Chart Renderer Module
 * Renders time-series chart for 24-hour history data
 */

import type { HistoryDataPoint } from '../types/config';
import { I18nHelper } from '../i18n/i18n-helper';

/**
 * History chart rendering options
 */
export interface HistoryChartOptions {
    /** Chart type (temperature or humidity) */
    type: 'temperature' | 'humidity';

    /** Dark mode enabled */
    darkMode: boolean;

    /** Text color */
    textColor: string;

    /** Unit symbol */
    unit: string;

    /** Translation helper */
    i18n: I18nHelper;
}

/**
 * Processed history data point
 */
interface ProcessedHistoryPoint {
    time: Date;
    value: number;
}

/**
 * History chart renderer
 */
export class HistoryChartRenderer {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    constructor() {}

    /**
     * Set canvas element
     */
    setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Draw history chart
     */
    draw(historyData: HistoryDataPoint[], options: HistoryChartOptions): void {
        if (!this.canvas || !this.ctx) {
            console.error('Canvas not set for history chart');
            return;
        }

        const ctx = this.ctx;
        const width = this.canvas.offsetWidth;
        const height = 300;

        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Process and sort data
        const dataPoints = this.processHistoryData(historyData);

        if (dataPoints.length === 0) {
            this.drawNoData(ctx, width, height, options);
            return;
        }

        // Calculate scales
        const { minValue, maxValue, valueRange } = this.calculateScales(dataPoints);
        const padding = 50;

        // Clear canvas
        ctx.fillStyle = options.darkMode ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw grid and axes
        this.drawGrid(ctx, width, height, padding, minValue, maxValue, valueRange, options);

        // Draw data line
        this.drawDataLine(ctx, dataPoints, width, height, padding, minValue, valueRange, options);

        // Draw data points
        this.drawDataPoints(ctx, dataPoints, width, height, padding, minValue, valueRange, options);

        // Draw time labels
        this.drawTimeLabels(ctx, dataPoints, width, height, padding, options);
    }

    /**
     * Process raw history data
     */
    private processHistoryData(historyData: HistoryDataPoint[]): ProcessedHistoryPoint[] {
        return historyData
            .map(item => ({
                time: new Date(item.last_changed),
                value: parseFloat(item.state)
            }))
            .filter(item => !isNaN(item.value))
            .sort((a, b) => a.time.getTime() - b.time.getTime());
    }

    /**
     * Calculate value scales
     */
    private calculateScales(dataPoints: ProcessedHistoryPoint[]): {
        minValue: number;
        maxValue: number;
        valueRange: number;
    } {
        const values = dataPoints.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue || 1;

        return { minValue, maxValue, valueRange };
    }

    /**
     * Draw "no data" message
     */
    private drawNoData(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        options: HistoryChartOptions
    ): void {
        ctx.fillStyle = options.textColor;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.i18n.t('noDataAvailable'), width / 2, height / 2);
    }

    /**
     * Draw grid and Y-axis
     */
    private drawGrid(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        padding: number,
        minValue: number,
        maxValue: number,
        valueRange: number,
        options: HistoryChartOptions
    ): void {
        ctx.strokeStyle = options.darkMode ? '#333' : '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * i / 5;

            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Y-axis label
            const value = maxValue - (valueRange * i / 5);
            ctx.fillStyle = options.textColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1) + options.unit, padding - 10, y + 4);
        }

        ctx.setLineDash([]);
    }

    /**
     * Draw data line
     */
    private drawDataLine(
        ctx: CanvasRenderingContext2D,
        dataPoints: ProcessedHistoryPoint[],
        width: number,
        height: number,
        padding: number,
        minValue: number,
        valueRange: number,
        options: HistoryChartOptions
    ): void {
        ctx.strokeStyle = options.type === 'temperature' ? '#FF5722' : '#2196F3';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (dataPoints.length - 1);
            const y = padding + (height - 2 * padding) * (1 - (point.value - minValue) / valueRange);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    /**
     * Draw data points
     */
    private drawDataPoints(
        ctx: CanvasRenderingContext2D,
        dataPoints: ProcessedHistoryPoint[],
        width: number,
        height: number,
        padding: number,
        minValue: number,
        valueRange: number,
        options: HistoryChartOptions
    ): void {
        ctx.fillStyle = options.type === 'temperature' ? '#FF5722' : '#2196F3';

        dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (dataPoints.length - 1);
            const y = padding + (height - 2 * padding) * (1 - (point.value - minValue) / valueRange);

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * Draw time labels on X-axis
     */
    private drawTimeLabels(
        ctx: CanvasRenderingContext2D,
        dataPoints: ProcessedHistoryPoint[],
        width: number,
        height: number,
        padding: number,
        options: HistoryChartOptions
    ): void {
        if (dataPoints.length === 0) return;

        ctx.fillStyle = options.textColor;
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';

        // Show time labels at regular intervals
        const labelInterval = Math.max(1, Math.floor(dataPoints.length / 6));

        for (let i = 0; i < dataPoints.length; i += labelInterval) {
            const point = dataPoints[i];
            const x = padding + (width - 2 * padding) * i / (dataPoints.length - 1);
            const y = height - padding + 20;

            const timeLabel = point.time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

            ctx.fillText(timeLabel, x, y);
        }
    }

    /**
     * Get canvas element
     */
    getCanvas(): HTMLCanvasElement | null {
        return this.canvas;
    }
}

/**
 * Create a new history chart renderer instance
 */
export function createHistoryChartRenderer(): HistoryChartRenderer {
    return new HistoryChartRenderer();
}
