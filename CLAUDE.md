# CLAUDE.md 

Ce fichier fournit des indications à Claude Code (claude.ai/code) pour travailler sur le code de ce dépôt.

## Aperçu du projet

**Psychrometric Chart Advanced** est une carte Lovelace personnalisée pour Home Assistant (un composant web basé sur Lit) qui affiche les données de température/humidité des capteurs sur un diagramme psychrométrique interactif. Elle calcule le point de rosée, l'enthalpie, la température humide, l'indice de confort PMV, le risque de moisissure, et estime la puissance CVC nécessaire pour atteindre une zone de confort configurée.

Ce dépôt contient également un `AGENTS.md` détaillé avec une référence complète du schéma de configuration (toutes les options YAML, zone de confort, zoom, champs d'affichage par point) — s'y référer pour tout ce qui n'est pas couvert ici.

## Commandes

```bash
npm run build   # rollup -c — regroupe src/psychrometric-chart-advanced.js dans le fichier psychrometric-chart-advanced.js à la racine
npm test        # node --test — suite d'assertions sur src/psychrometric-helpers.js
```

Il n'y a pas de linter. Le fichier distribué (`psychrometric-chart-advanced.js` à la racine du dépôt, ~145 Ko) est le résultat compilé et doit être committé en même temps que les changements de source — il n'est pas dans le `.gitignore` et c'est lui que HACS/les utilisateurs chargent réellement.

**Toute formule ajoutée ou modifiée dans `PsychrometricCalculations` doit être couverte par `test/psychrometric-helpers.test.js`.** C'est la seule vérification automatisée du dépôt, et son absence a laissé passer deux formules fausses en production (volume spécifique à un facteur 1000, PMV jamais négatif) : les valeurs de référence viennent de tables psychrométriques, pas d'une exécution du code. Le reste de la carte (rendu Canvas, interactions, éditeur) n'est **pas** testable ici — il n'y a pas d'instance Home Assistant dans cet environnement. Pour ces parties, la vérification consiste à relire attentivement le diff et à raisonner sur les cas limites (bornes de zoom, capteur `unavailable`, changement de langue, mode sombre, écran HiDPI) plutôt qu'affirmer avoir « testé » la carte.

## Architecture

Trois fichiers source sous `src/`, une classe par fichier, tous en Lit simple. **Lit est embarqué dans le bundle** (dépendance npm, résolue par `@rollup/plugin-node-resolve`) et non chargé depuis un CDN : beaucoup d'installations Home Assistant sont hors-ligne ou sur réseau restreint, où un import distant empêcherait la carte de se charger. Ne pas réintroduire d'`external` dans `rollup.config.js` — le bundle doit rester sans aucun import externe.

- **`src/psychrometric-chart-advanced.js`** — `PsychrometricChartEnhanced extends LitElement` (enregistrée sous `psychrometric-chart-enhanced`). C'est la carte elle-même, et de loin le plus gros fichier (~1600 lignes). Flux interne clé :
  - **`shouldUpdate()` est critique pour les performances** : Home Assistant remplace `hass` à chaque changement d'état de *n'importe quelle* entité de l'installation. La carte ne se met à jour que si l'un des capteurs réellement configurés a changé (`_watchedEntityIds()`). Ne jamais retirer cette garde. Elle surveille aussi `hass.themes` et `hass.locale` : tout nouvel élément de `hass` dont dépend le rendu doit y être ajouté, sinon son changement passera inaperçu.
  - **Le thème suit Home Assistant par défaut.** `_isDark()` lit `hass.themes.darkMode` sauf si `themeMode` vaut `light`/`dark`. `_palette()` est la **source unique** de toutes les couleurs dessinées : elle résout les défauts depuis les variables CSS du thème (`--ha-card-background`, `--primary-text-color`) parce que le canvas exige des couleurs concrètes. Ne jamais coder une couleur en dur dans `_drawChart()` ni supposer un fond blanc en CSS — utiliser des surfaces translucides (`rgba(127, 127, 127, …)`) ou les variables HA.
  - `willUpdate()` calcule `_currentPoints` **une seule fois par cycle** ; `render()` et `_drawChart()` consomment ce tableau et ne doivent pas rappeler `_calculatePoints()`.
  - `updated(changedProperties)` déclenche `_drawChart()` sur changement de `hass`, `config` ou taille du canvas (`_canvasWidth`/`_canvasHeight`, alimentées par le `ResizeObserver`). Le survol du tooltip ne redessine pas le canvas.
  - `_calculatePoints()` lit les états d'entités courants depuis `hass` et calcule toutes les valeurs dérivées par point via `PsychrometricCalculations`. Il **écarte** les points dont l'entité est absente ou dont l'état n'est pas un nombre fini (`unavailable`, `unknown`) — sans quoi des `NaN` se propagent jusqu'à l'affichage.
  - `_drawChart()` effectue tout le dessin Canvas HTML5 : courbes d'humidité, grille, zone de confort, points, étiquettes. Le canvas est dimensionné en pixels physiques (`devicePixelRatio`) mais toutes les coordonnées de dessin sont en **pixels CSS** via `ctx.setTransform` — `tempToX`/`humidityToY` et le hit-test de la souris travaillent dans ce repère.
  - `_wetBulbLines()` est **mis en cache** par bornes de température : ces lignes ne dépendent pas des entités.
  - L'axe Y porte la **pression de vapeur**, bornée par `minPv`/`maxPv` issues de `zoom_humidity_min`/`max` évaluées à `maxTemp`.
  - `this.translations` (défini dans le constructeur) contient les chaînes fr/en/es/de ; `t(key)` résout via `_language` courant, avec repli sur `fr`, puis sur la clé brute. `setConfig()` ramène toute langue inconnue à `fr`.
  - Cliquer sur une valeur d'une carte de données — ou sur un point du graphique — ouvre une modale d'historique alimentée par l'API History de Home Assistant, avec les statistiques min/max/moyenne sur 24 h. Les états d'entités sont **déjà dans l'unité d'affichage** : ne pas y appliquer de conversion de température.
- **`src/psychrometric-helpers.js`** — `PsychrometricCalculations`, une classe sans état composée de méthodes statiques (pression de saturation, point de rosée, teneur en eau, enthalpie, humidité absolue, température humide, pression de vapeur, volume spécifique, risque de moisissure, PMV selon ISO 7730, consigne idéale, puissances de chauffage/refroidissement/humidification), plus les utilitaires de couleur partagés avec l'éditeur. Toutes les formules psychrométriques doivent rester ici, pas inline dans la carte — en particulier, passer par `calculateSaturationPressure()` et ne jamais recopier `0.61078 * exp(17.27 t / (t + 237.3))`.
  - Les unités sont homogènes : **pressions en kPa, températures en Celsius, teneur en eau en kg/kg**. Les deux bugs historiques venaient tous deux d'un mélange d'unités (J vs kJ, Pa vs kPa) — vérifier la dimension avant d'ajouter une formule.
  - `calculateWetBulbTemp()` inverse la relation ASHRAE par bissection ; elle doit rester cohérente avec `calculateWaterContentFromWetBulb()`, qui trace les lignes iso-humides. Un test verrouille cet accord.
- **`src/psychrometric-chart-editor.js`** — `PsychrometricChartEditor extends LitElement` (enregistrée sous `psychrometric-chart-editor`), l'éditeur de configuration visuel HA (`getConfigElement` de Lovelace). Possède son propre objet `editorTranslations` qui reflète les langues de la carte.
  - Il suit le **standard des éditeurs HA** : `ha-form` alimenté par des schémas déclaratifs de selectors (`_generalSchema()`, `_pointSchema()`, `_comfortSchema()`, `_displaySchema()`, `_zoomSchema()`), plus `ha-selector` / `ha-expansion-panel` / `ha-icon-button` pour les parties que `ha-form` ne couvre pas (liste dynamique de points, couple couleur+opacité). **Ne pas réintroduire de HTML brut** (`<input>`, `<select>`, `innerHTML`) : les composants natifs chargent leurs propres dépendances, d'où l'absence de tout `customElements.whenDefined` ou de préchargement manuel.
  - `_formData()` pré-remplit les valeurs par défaut **de la carte** pour que l'éditeur montre ce qui est réellement affiché ; toute nouvelle option ayant un défaut côté carte doit y être ajoutée, sinon l'éditeur affichera une case décochée pour une option active.
  - L'interface de l'éditeur suit la langue de **Home Assistant** (`_lang`), pas `config.language` qui ne pilote que les textes de la carte.

Tous les calculs se font en **Celsius en interne** ; le Fahrenheit n'est qu'une conversion d'affichage (`toInternalTemp()` / `toDisplayTemp()` / `formatTemp()`), pilotée par `config.temperatureUnit` ou le système d'unités de HA.

### Ajouter une nouvelle langue
Mettre à jour trois emplacements : `translations` dans le composant principal, `editorTranslations` dans l'éditeur, et les `options` du selector `language` dans `_generalSchema()` de l'éditeur.

### Niveaux de détail
`displayMode` est un interrupteur maître au-dessus du `details` par point, appliqué dans `_shouldShowField()` : `minimal` réduit chaque carte à température/humidité/badge et retire les couches auxiliaires du graphique, `standard` laisse `point.details` décider, `detailed` affiche tout. Il ne doit pas redevenir un simple doublon des cases `showEnthalpy`/`showWetBulb`/`showDewPoint`, ce qu'il était quand il ne touchait que le canvas.

### Ajouter un champ calculé
Ajouter la méthode statique à `PsychrometricCalculations` → ajouter les clés de traduction dans les 4 langues → la brancher dans `_calculatePoints()` → ajouter la clé à `DETAIL_FIELDS` dans l'éditeur (elle apparaît automatiquement dans le selector `details`) → conditionner son affichage par `displayMode` dans `render()`.

### Ajouter une option de configuration
Valider dans `setConfig()` si elle est requise → ajouter une entrée au schéma `ha-form` correspondant dans l'éditeur → ajouter son défaut à `_formData()` s'il en existe un côté carte → ajouter les traductions (la clé de traduction doit porter **le nom exact de l'option**, `computeLabel` la résout par `schema.name` ; une clé `<option>Help` optionnelle devient le texte d'aide) → la lire via `this.config.optionName`.

## Conventions

- Les commentaires de code sont écrits en **français** ; JSDoc sur les méthodes publiques ; camelCase pour variables/fonctions, PascalCase pour les classes ; guillemets simples pour les chaînes, backticks pour les templates.
- Aucune surface XSS : les identifiants d'entités et les labels sont rendus via les templates Lit, qui les traitent comme du texte. **Ne jamais construire de DOM par `innerHTML`** en y interpolant une valeur de configuration — c'est ce que faisaient l'ancien tooltip et l'ancien éditeur.
- Pas de code mort : une clé de traduction, une option de configuration ou un état réactif qui n'est lu nulle part doit être supprimé ou branché. Le zoom/pan interactif a été retiré pour cette raison — seules subsistent les bornes statiques `zoom_*`. Si le zoom interactif est réintroduit un jour, il lui faut de vrais gestionnaires (`wheel`, tactile), pas seulement un état.
