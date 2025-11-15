/**
 * Psychrometric Chart Card - Entry Point
 * Version 2.0.0 - Modular TypeScript Architecture
 */

// Import styles
import './styles/card-styles.css';
import './styles/data-cards.css';
import './styles/modal-styles.css';

// Import calculations (to verify they compile)
import * as calculations from './calculations/psychrometrics';

// Import i18n
import { createI18nHelper } from './i18n/i18n-helper';

// Import constants
import * as constants from './utils/constants';

// Import helpers
import * as helpers from './utils/helpers';

// Import coordinate system
import { createCoordinateSystem } from './rendering/coordinate-system';

// Import types
import type {
    PsychrometricCardConfig,
    Hass,
    ProcessedPoint
} from './types/config';

console.log('Psychrometric Chart Card v2.0.0 - Modular architecture loaded');
console.log('Modules available:', {
    calculations,
    i18n: createI18nHelper,
    constants,
    helpers,
    coordinateSystem: createCoordinateSystem
});

// Export version info
export const VERSION = constants.CARD_VERSION;
export const CARD_NAME = constants.CARD_NAME;

// NOTE: This is a minimal entry point for testing compilation
// The full implementation will include the main PsychrometricCard class
// and web component registration
