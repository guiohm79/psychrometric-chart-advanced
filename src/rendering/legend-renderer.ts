/**
 * Legend Renderer Module
 * Generates HTML for the chart legend
 */

import type { ProcessedPoint } from '../types/config';
import { I18nHelper } from '../i18n/i18n-helper';

/**
 * Legend rendering options
 */
export interface LegendOptions {
    /** Text color */
    textColor: string;

    /** Dark mode enabled */
    darkMode: boolean;

    /** Whether this is the first render (for animations) */
    hasRendered: boolean;

    /** Translation helper */
    i18n: I18nHelper;
}

/**
 * Generate legend HTML
 * @param points - Data points to display in legend
 * @param options - Rendering options
 * @returns HTML string for legend
 */
export function generateLegendHTML(
    points: ProcessedPoint[],
    options: LegendOptions
): string {
    const { textColor, darkMode, hasRendered, i18n } = options;

    const legendClass = darkMode ? 'legend-container dark' : 'legend-container light';
    const animation = hasRendered ? 'none' : 'fadeInUp 0.5s ease 0.3s backwards';

    return `
        <div class="${legendClass}" style="animation: ${animation};">
            <div class="legend-title" style="color: ${textColor};">
                📍 ${i18n.t('legend')}
            </div>
            ${points.map((point, index) => generateLegendItem(point, index, textColor, hasRendered)).join('')}
        </div>
    `;
}

/**
 * Generate a single legend item
 * @param point - Data point
 * @param index - Item index (for staggered animation)
 * @param textColor - Text color
 * @param hasRendered - Whether this is the first render
 * @returns HTML string for legend item
 */
function generateLegendItem(
    point: ProcessedPoint,
    index: number,
    textColor: string,
    hasRendered: boolean
): string {
    const animation = hasRendered
        ? 'none'
        : `fadeInUp 0.3s ease ${0.4 + index * 0.1}s backwards`;

    return `
        <div class="legend-item" style="animation: ${animation};">
            <div class="legend-color" style="
                background-color: ${point.config.color};
                box-shadow: 0 2px 5px ${point.config.color}80;">
            </div>
            <span class="legend-label" style="color: ${textColor};">
                ${point.config.label}
            </span>
        </div>
    `;
}

/**
 * Generate simple text-only legend (fallback)
 * @param points - Data points
 * @param options - Rendering options
 * @returns Simple HTML legend
 */
export function generateSimpleLegend(
    points: ProcessedPoint[],
    options: LegendOptions
): string {
    const { textColor, i18n } = options;

    return `
        <div style="text-align: left; padding: 10px;">
            <strong style="color: ${textColor};">${i18n.t('legend')}:</strong>
            ${points.map(p => `
                <div style="color: ${textColor}; margin: 5px 0;">
                    <span style="color: ${p.config.color};">●</span> ${p.config.label}
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Legend renderer class (stateful alternative)
 */
export class LegendRenderer {
    private hasRendered: boolean = false;

    constructor() {}

    /**
     * Mark that a render has occurred (disables animations)
     */
    markRendered(): void {
        this.hasRendered = true;
    }

    /**
     * Reset render state
     */
    reset(): void {
        this.hasRendered = false;
    }

    /**
     * Render legend
     */
    render(points: ProcessedPoint[], options: Omit<LegendOptions, 'hasRendered'>): string {
        return generateLegendHTML(points, { ...options, hasRendered: this.hasRendered });
    }
}

/**
 * Create a new legend renderer instance
 */
export function createLegendRenderer(): LegendRenderer {
    return new LegendRenderer();
}
