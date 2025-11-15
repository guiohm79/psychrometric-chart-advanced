/**
 * Card Template Module
 * HTML templates for the psychrometric chart card
 */

import type { ProcessedPoint, PsychrometricCardConfig } from '../types/config';
import { I18nHelper } from '../i18n/i18n-helper';

/**
 * Template rendering options
 */
export interface CardTemplateOptions {
    /** Card title */
    title: string;

    /** Background color */
    bgColor: string;

    /** Text color */
    textColor: string;

    /** Canvas width */
    canvasWidth: number;

    /** Canvas height */
    canvasHeight: number;

    /** Legend HTML */
    legendHTML: string;

    /** Calculated data HTML */
    calculatedDataHTML: string;

    /** Whether this is first render */
    hasRendered: boolean;
}

/**
 * Generate main card template
 */
export function generateCardTemplate(options: CardTemplateOptions): string {
    const animation = options.hasRendered ? 'none' : 'fadeInUp 0.5s ease';

    return `
        <ha-card>
            <div class="psychro-card" style="background-color: ${options.bgColor}; color: ${options.textColor};">
                <h2 style="animation: ${animation};">${options.title}</h2>
                <div class="chart-container">
                    <canvas id="psychroChart" width="${options.canvasWidth}" height="${options.canvasHeight}"></canvas>
                    ${options.legendHTML}
                </div>
                ${options.calculatedDataHTML}
            </div>
        </ha-card>
        <div id="historyModal" style="display: none;"></div>
    `;
}

/**
 * Data cards template options
 */
export interface DataCardsOptions {
    /** Data points */
    points: ProcessedPoint[];

    /** Dark mode enabled */
    darkMode: boolean;

    /** Display mode */
    displayMode: string;

    /** Show mold risk */
    showMoldRisk: boolean;

    /** Translation helper */
    i18n: I18nHelper;

    /** Whether this is first render */
    hasRendered: boolean;
}

/**
 * Generate calculated data cards HTML
 */
export function generateCalculatedDataHTML(options: DataCardsOptions): string {
    const { points, darkMode, displayMode, showMoldRisk, i18n, hasRendered } = options;

    const modeClass = darkMode ? 'dark' : 'light';

    return `
        <div class="psychro-data">
            ${points.map((point, index) => generateDataCard(point, index, modeClass, displayMode, showMoldRisk, i18n, hasRendered)).join('')}
        </div>
    `;
}

/**
 * Generate single data card
 */
function generateDataCard(
    point: ProcessedPoint,
    index: number,
    modeClass: string,
    displayMode: string,
    showMoldRisk: boolean,
    i18n: I18nHelper,
    hasRendered: boolean
): string {
    const animation = hasRendered ? 'none' : `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`;
    const comfortBadge = point.inComfortZone
        ? `<span class="psychro-comfort-badge optimal">✓ ${i18n.t('optimalComfort')}</span>`
        : `<span class="psychro-comfort-badge outside">⚠ ${i18n.t('outsideComfort')}</span>`;

    return `
        <div class="psychro-point-data ${modeClass}"
             data-point-index="${index}"
             style="border-left-color: ${point.config.color}; animation: ${animation};">
            <div class="psychro-point-header">
                <ha-icon icon="${point.config.icon || 'mdi:thermometer'}"></ha-icon>
                <span class="psychro-point-label" style="color: ${point.config.color};">
                    ${point.config.label}
                </span>
                ${comfortBadge}
            </div>
            <div class="psychro-point-content">
                <div class="psychro-data-grid">
                    <div>
                        ${generateDataItem(i18n.t('temperature'), `${point.temp.toFixed(1)}°C`, point.config.color, modeClass, true, point.config.temp, 'temperature')}
                        ${generateDataItem(i18n.t('humidity'), `${point.humidity.toFixed(1)}%`, point.config.color, modeClass, true, point.config.humidity, 'humidity')}
                        ${(displayMode === 'standard' || displayMode === 'advanced') ? `
                            ${generateDataItem(i18n.t('dewPoint'), `${point.dewPoint.toFixed(1)}°C`, '', modeClass, false)}
                            ${generateDataItem(i18n.t('wetBulbTemp'), `${point.wetBulbTemp.toFixed(1)}°C`, '', modeClass, false)}
                            ${generateDataItem(i18n.t('enthalpy'), `${point.enthalpy.toFixed(1)} kJ/kg`, '', modeClass, false)}
                        ` : ''}
                    </div>
                    <div>
                        ${(displayMode === 'standard' || displayMode === 'advanced') ? `
                            ${generateDataItem(i18n.t('pmvIndex'), point.pmv.toFixed(2), '', modeClass, false)}
                        ` : ''}
                        ${displayMode === 'advanced' ? `
                            ${generateDataItem(i18n.t('waterContent'), `${point.waterContent.toFixed(4)} kg/kg`, '', modeClass, false)}
                            ${generateDataItem(i18n.t('absoluteHumidity'), `${point.absoluteHumidity.toFixed(2)} g/m³`, '', modeClass, false)}
                            ${generateDataItem(i18n.t('specificVolume'), `${point.specificVolume.toFixed(3)} m³/kg`, '', modeClass, false)}
                            ${showMoldRisk ? generateMoldRiskItem(point.moldRisk, i18n, modeClass) : ''}
                        ` : ''}
                    </div>
                </div>
                ${displayMode === 'advanced' ? generateActionSection(point, i18n, modeClass) : ''}
            </div>
        </div>
    `;
}

/**
 * Generate data item
 */
function generateDataItem(
    label: string,
    value: string,
    valueColor: string,
    modeClass: string,
    clickable: boolean,
    entity?: string,
    type?: string
): string {
    const clickableClass = clickable ? `psychro-data-item clickable ${modeClass}` : 'psychro-data-item';
    const dataAttrs = clickable && entity && type
        ? `data-entity="${entity}" data-type="${type}"`
        : '';
    const valueStyle = valueColor ? `style="color: ${valueColor};"` : '';

    return `
        <div class="${clickableClass}" ${dataAttrs}>
            <strong>🌡️ ${label}:</strong>
            <span class="psychro-data-value" ${valueStyle}>${value}</span>
        </div>
    `;
}

/**
 * Generate mold risk item
 */
function generateMoldRiskItem(moldRisk: number, i18n: I18nHelper, modeClass: string): string {
    const keys = [
        'moldRiskNone',
        'moldRiskVeryLow',
        'moldRiskLow',
        'moldRiskModerate',
        'moldRiskHigh',
        'moldRiskVeryHigh',
        'moldRiskCritical'
    ];

    const level = Math.min(Math.floor(moldRisk), 6);
    const text = i18n.t(keys[level] as any);

    // Colors (will be handled by CSS or inline)
    const colors = modeClass === 'dark'
        ? ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
        : ['#2E7D32', '#558B2F', '#9E9D24', '#F9A825', '#EF6C00', '#E65100', '#C62828'];

    return `
        <div class="psychro-data-item">
            <strong>🦠 ${i18n.t('moldRisk')}:</strong>
            <span class="psychro-data-value" style="color: ${colors[level]}; font-weight: 600;">${text}</span>
        </div>
    `;
}

/**
 * Generate action section (for advanced mode)
 */
function generateActionSection(point: ProcessedPoint, i18n: I18nHelper, modeClass: string): string {
    // This would need action data from the point
    // For now, returning empty as action calculations are done in the main class
    return '';
}
