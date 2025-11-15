# Guide du Développeur - Architecture Modulaire

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Build
```bash
# Développement (avec sourcemaps)
npm run build

# Production (minifié)
npm run build:prod

# Watch mode (auto-rebuild)
npm run dev
```

### Nettoyage
```bash
npm run clean
```

## 📐 Architecture

### Principe de Modularité
Chaque module a **une seule responsabilité** :
- ✅ **Calculs** : Fonctions pures sans effets de bord
- ✅ **I18n** : Traductions et helper
- ✅ **Utils** : Constantes et fonctions utilitaires
- ✅ **Types** : Interfaces TypeScript complètes
- ✅ **Rendering** : Logique de dessin séparée
- ✅ **Styles** : CSS modulaire par fonctionnalité

### Dépendances Entre Modules

```
index.ts
├── styles/*.css
├── calculations/psychrometrics.ts (pure)
├── i18n/
│   ├── translations.ts (data)
│   └── i18n-helper.ts
├── utils/
│   ├── constants.ts (data)
│   └── helpers.ts
├── types/config.ts (types only)
└── rendering/coordinate-system.ts
```

### Pas de Dépendances Circulaires
- ✅ Les modules de base (calculations, constants, translations) sont **autonomes**
- ✅ Les helpers peuvent importer des types
- ✅ Le rendering utilise types + helpers + calculations
- ✅ L'index importe tout mais n'est importé par personne

## 🎯 Modules Créés

### 1. Calculations (`src/calculations/psychrometrics.ts`)
**Fonctions pures de calcul thermodynamique**

```typescript
import { calculateDewPoint, calculateWaterContent } from './calculations/psychrometrics';

const dewPoint = calculateDewPoint(22, 60); // °C, %
const waterContent = calculateWaterContent(22, 60); // kg/kg
```

**Fonctions disponibles :**
- `calculateDewPoint(temp, humidity)` - Point de rosée
- `calculateWaterContent(temp, humidity)` - Teneur en eau
- `calculateEnthalpy(temp, waterContent)` - Enthalpie
- `calculateAbsoluteHumidity(temp, rh)` - Humidité absolue
- `calculateWetBulbTemp(temp, rh)` - Température humide
- `calculateVaporPressure(temp, rh)` - Pression de vapeur
- `calculateSpecificVolume(temp, rh)` - Volume spécifique
- `calculateMoldRisk(temp, humidity)` - Risque de moisissure
- `calculatePMV(temp, humidity)` - Indice de confort PMV
- `calculateIdealSetpoint(temp, humidity, comfortRange)` - Consigne idéale
- `calculateHeatingPower(...)` - Puissance de chauffage
- `calculateCoolingPower(...)` - Puissance de refroidissement
- `calculateHumidityPower(...)` - Puissance humidification

### 2. I18n (`src/i18n/`)

```typescript
import { createI18nHelper } from './i18n/i18n-helper';

const i18n = createI18nHelper('fr');
const translated = i18n.t('temperature'); // "Température"
```

**Langues supportées :** `fr`, `en`, `es`, `de`

### 3. Constants (`src/utils/constants.ts`)

```typescript
import { PHYSICAL_CONSTANTS, DEFAULT_COMFORT_ZONE } from './utils/constants';

const airPressure = PHYSICAL_CONSTANTS.ATMOSPHERIC_PRESSURE; // 101.325 kPa
const comfortTemp = DEFAULT_COMFORT_ZONE.tempMin; // 20°C
```

### 4. Helpers (`src/utils/helpers.ts`)

```typescript
import { getMoldRiskColor, isInComfortZone, debounce } from './utils/helpers';

const color = getMoldRiskColor(3.5, true); // Dark mode
const isComfortable = isInComfortZone(22, 50, comfortRange);
const debouncedFn = debounce(() => console.log('Hello'), 300);
```

### 5. Types (`src/types/config.ts`)

```typescript
import type { PsychrometricCardConfig, ProcessedPoint } from './types/config';

const config: PsychrometricCardConfig = {
    type: 'custom:psychrometric-chart-enhanced',
    language: 'fr',
    points: [/* ... */],
    // ...
};
```

### 6. Coordinate System (`src/rendering/coordinate-system.ts`)

```typescript
import { createCoordinateSystem } from './rendering/coordinate-system';

const coords = createCoordinateSystem(800, 600);
coords.setZoomRange({ tempMin: 15, tempMax: 30, humidityMin: 20, humidityMax: 80 });

const x = coords.tempToX(22); // Convert temp to X coordinate
const y = coords.humidityToY(22, 60); // Convert humidity to Y coordinate
```

## 🎨 Styles CSS

### Structure
```
src/styles/
├── card-styles.css       # Styles principaux + animations
├── data-cards.css        # Cartes de données calculées
└── modal-styles.css      # Modal historique
```

### Import dans TypeScript
```typescript
import './styles/card-styles.css';
import './styles/data-cards.css';
import './styles/modal-styles.css';
```

Rollup + PostCSS les injectera automatiquement dans le bundle final.

## 🧪 Tests (À implémenter)

### Structure Recommandée
```
src/
├── calculations/
│   ├── psychrometrics.ts
│   └── psychrometrics.test.ts  // Tests unitaires
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
└── ...
```

### Framework Recommandé
- **Vitest** (rapide, compatible Vite)
- **Jest** (plus mature, large écosystème)

### Exemple de Test
```typescript
import { calculateDewPoint } from './psychrometrics';

describe('calculateDewPoint', () => {
    it('should calculate dew point correctly', () => {
        const result = calculateDewPoint(22, 60);
        expect(result).toBeCloseTo(13.9, 1);
    });
});
```

## 📝 Conventions de Code

### TypeScript
- ✅ **Mode strict** activé (`strict: true`)
- ✅ **Pas de `any`** sauf justification
- ✅ **Interfaces** pour tous les objets complexes
- ✅ **Export nommé** préféré aux exports default
- ✅ **JSDoc** pour documenter les fonctions publiques

### Nommage
- ✅ **camelCase** : variables, fonctions (`calculateDewPoint`)
- ✅ **PascalCase** : classes, interfaces, types (`CoordinateSystem`)
- ✅ **UPPER_SNAKE_CASE** : constantes (`ATMOSPHERIC_PRESSURE`)
- ✅ **kebab-case** : fichiers CSS (`card-styles.css`)

### Fichiers
- ✅ **Un module = Un fichier**
- ✅ **Nom de fichier = Nom principal exporté**
  - `coordinate-system.ts` → `class CoordinateSystem`
  - `psychrometrics.ts` → fonctions de calcul psychro
- ✅ **Index.ts** = Point d'entrée uniquement

### Commentaires
```typescript
/**
 * Calculate dew point using Magnus-Tetens formula
 * @param temp - Air temperature in °C
 * @param humidity - Relative humidity in %
 * @returns Dew point temperature in °C
 */
export function calculateDewPoint(temp: number, humidity: number): number {
    // Implementation...
}
```

## 🔧 Configuration Build

### Rollup (`rollup.config.js`)
- **Input** : `src/index.ts`
- **Output** : `psychrometric-chart-advanced.js` (IIFE)
- **Plugins** :
  - `@rollup/plugin-typescript` - Compile TS
  - `@rollup/plugin-node-resolve` - Résout node_modules
  - `@rollup/plugin-commonjs` - Support CommonJS
  - `rollup-plugin-postcss` - Traite CSS
  - `@rollup/plugin-terser` - Minifie en production

### TypeScript (`tsconfig.json`)
- **Target** : ES2017
- **Module** : ESNext
- **Strict** : true
- **Output** : `.` (même répertoire que Rollup)

## 🐛 Debugging

### Sourcemaps
En mode développement, les sourcemaps sont générés :
```bash
npm run build  # Génère .js.map
```

### Console Logs
Le bundle inclut un log de version :
```
Psychrometric Chart Card v2.0.0 - Modular architecture loaded
```

### Vérifier le Bundle
```bash
# Taille non minifiée
npm run build && ls -lh psychrometric-chart-advanced.js

# Taille minifiée
npm run build:prod && ls -lh psychrometric-chart-advanced.js
```

## 🚧 Prochaines Étapes

### Modules à Créer

#### 1. Chart Renderer (`src/rendering/chart-renderer.ts`)
- Dessiner le diagramme psychrométrique complet
- Courbes d'humidité
- Courbes d'enthalpie (optionnel)
- Zone de confort
- Points de données

#### 2. Legend Renderer (`src/rendering/legend-renderer.ts`)
- Générer HTML de la légende
- Liste des points avec couleurs
- Support dark mode

#### 3. History Chart (`src/rendering/history-chart.ts`)
- Dessiner graphique temporel 24h
- Température et humidité sur canvas
- Axes et grille

#### 4. Templates (`src/templates/`)
- `main-template.ts` - Structure HTML principale
- `data-cards.ts` - Cartes de données calculées
- `modal-template.ts` - Modal historique

#### 5. Features (`src/features/`)
- `history-modal.ts` - Gestion modal + fetch API
- `interactivity.ts` - Hover, tooltips, clicks
- `responsive-sizing.ts` - ResizeObserver

#### 6. Main Component (`src/psychrometric-card.ts`)
- Classe `PsychrometricChartEnhanced extends HTMLElement`
- Orchestration de tous les modules
- Lifecycle Web Component
- State management

## 📚 Ressources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Rollup Documentation](https://rollupjs.org/)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Home Assistant Developer Docs](https://developers.home-assistant.io/)

### Audit des Calculs
Voir `AUDIT_CALCULS.md` pour la validation scientifique des formules.

---

**Version actuelle : 2.0.0**
**Architecture : Modulaire TypeScript**
**Build : Rollup + PostCSS + Terser**
**Compatibilité : HACS ✅**
