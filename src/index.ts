/**
 * Psychrometric Chart Card - Entry Point
 * Version 2.0.0 - Modular TypeScript Architecture
 */

// Import styles (will be injected into the bundle)
import './styles/card-styles.css';
import './styles/data-cards.css';
import './styles/modal-styles.css';

// Import main component
import { PsychrometricCard } from './psychrometric-card';

// Import constants
import { CARD_VERSION, CARD_NAME } from './utils/constants';

// Export version info
export const VERSION = CARD_VERSION;
export const NAME = CARD_NAME;

// Register the custom element
customElements.define('psychrometric-chart-enhanced', PsychrometricCard);

// Log successful initialization
console.info(
    `%c🌡️ Psychrometric Chart Card v${VERSION} %c
Modular TypeScript architecture
Loaded successfully!`,
    'color: #4CAF50; font-weight: bold; font-size: 14px;',
    'color: #666; font-size: 12px;'
);

// Register with Home Assistant's custom card registry
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'psychrometric-chart-enhanced',
    name: 'Psychrometric Chart',
    description: 'Advanced psychrometric chart for HVAC monitoring',
    preview: false,
    documentationURL: 'https://github.com/guiohm79/diagram-psychro'
});

// Export the card class for potential external use
export { PsychrometricCard };
