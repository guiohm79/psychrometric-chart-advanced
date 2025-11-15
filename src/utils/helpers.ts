/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

import { ComfortRangeConfig } from '../types/config';

/**
 * Get color for mold risk level (with dark mode support)
 * @param riskLevel - Risk level from 0-6
 * @param darkMode - Whether dark mode is active
 * @returns Color hex code
 */
export function getMoldRiskColor(riskLevel: number, darkMode: boolean = false): string {
    const lightModeColors: Record<number, string> = {
        0: "#2E7D32", // Dark green - No risk
        1: "#558B2F", // Light dark green - Very low
        2: "#9E9D24", // Yellow-green dark - Low
        3: "#F9A825", // Dark gold - Moderate (better contrast on light background)
        4: "#EF6C00", // Dark amber - High
        5: "#E65100", // Dark orange - Very high
        6: "#C62828"  // Dark red - Critical
    };

    const darkModeColors: Record<number, string> = {
        0: "#4CAF50", // Green - No risk
        1: "#8BC34A", // Light green - Very low
        2: "#CDDC39", // Yellow-green - Low
        3: "#FFEB3B", // Yellow - Moderate
        4: "#FFC107", // Amber - High
        5: "#FF9800", // Orange - Very high
        6: "#FF5722"  // Red - Critical
    };

    const colors = darkMode ? darkModeColors : lightModeColors;
    const level = Math.min(Math.floor(riskLevel), 6);
    return colors[level] || colors[0];
}

/**
 * Check if a point is within the comfort zone
 * @param temp - Temperature in °C
 * @param humidity - Relative humidity in %
 * @param comfortRange - Comfort zone configuration
 * @returns True if point is in comfort zone
 */
export function isInComfortZone(
    temp: number,
    humidity: number,
    comfortRange: ComfortRangeConfig
): boolean {
    return (
        temp >= comfortRange.tempMin &&
        temp <= comfortRange.tempMax &&
        humidity >= comfortRange.rhMin &&
        humidity <= comfortRange.rhMax
    );
}

/**
 * Debounce function to limit execution rate
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number | null = null;

    return function(this: any, ...args: Parameters<T>): void {
        const context = this;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func.apply(context, args);
            timeout = null;
        }, wait);
    };
}

/**
 * Format a number to a fixed number of decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export function formatNumber(value: number, decimals: number = 1): string {
    return value.toFixed(decimals);
}

/**
 * Clamp a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Parse a color string to rgba components
 * @param color - Color string (hex or rgba)
 * @returns RGBA object
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } {
    // Handle hex colors
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    }

    // Handle rgba colors
    if (color.startsWith('rgba')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: match[4] ? parseFloat(match[4]) : 1
            };
        }
    }

    // Default to black
    return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Convert rgba object to css color string
 * @param color - RGBA object
 * @returns CSS color string
 */
export function rgbaToString(color: { r: number; g: number; b: number; a: number }): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

/**
 * Get a contrasting text color (black or white) for a given background color
 * @param bgColor - Background color (hex or rgba)
 * @returns 'black' or 'white'
 */
export function getContrastTextColor(bgColor: string): string {
    const { r, g, b } = parseColor(bgColor);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two objects are deep equal
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if objects are equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Generate a unique ID
 * @returns Unique ID string
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe parse float with fallback
 * @param value - Value to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed number or fallback
 */
export function safeParseFloat(value: any, fallback: number = 0): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

/**
 * Check if a value is a valid number
 * @param value - Value to check
 * @returns True if value is a valid number
 */
export function isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
