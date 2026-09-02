<div align="center">
  <img src="icon.svg" alt="Psychrometric Chart Logo" width="200"/>

  # Psychrometric Chart for Home Assistant

  [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
  [![GitHub release](https://img.shields.io/github/release/guiohm79/psychrometric-chart-advanced.svg)](https://github.com/guiohm79/psychrometric-chart-advanced/releases)
  [![License](https://img.shields.io/github/license/guiohm79/psychrometric-chart-advanced.svg)](LICENSE)
  [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/guiohm79)

  **Langue :** [🇬🇧 English](README.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇩🇪 Deutsch](README.de.md)
</div>

<img width="589" alt="image" src="https://github.com/guiohm79/psychrometric-chart-advanced/blob/main/Capture.png">
<img width="589" alt="image" src="https://github.com/guiohm79/psychrometric-chart-advanced/blob/main/Capture2.png">


## Description

Ce projet propose une carte personnalisée pour **Home Assistant**, permettant de visualiser un **diagramme psychrométrique** basé sur les données de température et d'humidité des capteurs. La carte calcule également des valeurs clés comme l'enthalpie, la teneur en eau et la température de rosée. Elle indique si des actions sont nécessaires pour réchauffer, refroidir, humidifier ou déshumidifier, tout en estimant les puissances nécessaires pour atteindre la **zone de confort**.

## Fonctionnalités

### 📊 Visualisation avancée
- **Diagramme psychrométrique interactif** entièrement responsive
- **Design moderne** avec effets glassmorphism et animations fluides
- **Graphique adaptatif** qui s'ajuste automatiquement à la taille de l'écran (mobile, tablette, desktop)
- **Tooltips au survol** des points avec informations détaillées

### 📈 Historique des données
- **Modal popup élégant** affichant l'historique sur 24 heures
- **Température, humidité et point de rosée superposés** : les deux capteurs du point sur un double axe (°C à gauche, % à droite), plus le point de rosée recalculé à partir des deux séries
- **Curseur de lecture** : au survol (ou au toucher), une ligne verticale donne l'heure exacte et la valeur de chaque courbe
- **Bande de confort en fond** du graphique, avec la part du temps passée hors confort
- **Statistiques détaillées** : min, max, moyenne, tendance sur la période
- **Repères ▲ / ▼** sur le maximum et le minimum, pour situer *quand* ils sont survenus
- **Légende cliquable** pour masquer une courbe
- **Clic sur les valeurs** de température ou humidité pour voir l'historique ; `Échap` referme la fenêtre
- Intégration native avec l'API History de Home Assistant

### 🎨 Interface utilisateur améliorée
- **Cartes modernes** avec dégradés, ombres portées et effets de profondeur
- **Animations fluides** lors du chargement et des interactions
- **Badges de statut** indiquant si les valeurs sont dans la zone de confort
- **Icônes émojis** pour une meilleure lisibilité
- **Mode sombre** optimisé avec contraste amélioré

### 📐 Zone de confort personnalisable
- Température min/max ajustable
- Humidité relative min/max configurable
- Couleur personnalisable pour la zone
- Indicateurs visuels clairs

### 🔬 Calculs scientifiques affichés
- Température de rosée
- Teneur en eau
- Enthalpie
- Humidité absolue
- Température de bulbe humide
- Volume spécifique
- Indice PMV (confort thermique)
- Risque de moisissure avec code couleur
- Puissances estimées pour chauffer/refroidir/humidifier/déshumidifier

### ⚙️ Options graphiques avancées
- Courbes d'humidité relative (10 % à 100 %)
- Courbes d'enthalpie optionnelles
- Points de rosée visualisés
- Lignes pointillées vers les axes
- Légende animée et personnalisable
- Débit massique ajustable pour calculs de puissance précis

### 🌍 Multilingue
- Interface en **français**, **anglais**, **espagnol** et **allemand**
- Configurable via le paramètre `language`
- Tous les labels et messages traduits

### 🔍 Zoom et navigation
- **Zoom configurable par YAML** : définissez une plage de température spécifique à afficher
- **Zoom centré** : la plage configurée est automatiquement centrée dans le diagramme
- Idéal pour se concentrer sur une zone de température spécifique (ex: 15°C-30°C)

---

## Installation

### Via HACS (recommandé)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=guiohm79&repository=psychrometric-chart-advanced&category=plugin)

1. Assurez-vous d'avoir [HACS](https://hacs.xyz/) installé dans Home Assistant
2. Ouvrez HACS dans Home Assistant
3. Allez dans "Frontend"
4. Cliquez sur le bouton "+" en bas à droite
5. Recherchez "Psychrometric Chart"
6. Cliquez sur "Installer"
7. Redémarrez Home Assistant

### Installation manuelle

1. **Téléchargez les fichiers** de ce dépôt
2. Placez le fichier **`psychrometric-chart-advanced.js`** dans le dossier **`www/custom-lovelace/psychrometric/`** de votre installation Home Assistant
3. Ajoutez le fichier à votre tableau de bord via **Configuration > Tableaux de bord > Ressources** :
   - URL : `/local/custom-lovelace/psychrometric/psychrometric-chart-advanced.js`
   - Type : **Module JavaScript**
4. Rechargez l'interface Lovelace dans Home Assistant (CTRL+F5 ou vider le cache)

### Prérequis

- Home Assistant 2024.1.0 ou supérieur
- L'**historique** doit être activé dans votre configuration Home Assistant pour profiter de la fonctionnalité d'historique

---

## Utilisation

Ajoutez cette configuration YAML à votre tableau de bord dans **Home Assistant** :

```yaml
type: custom:psychrometric-chart-enhanced
language: fr  # 'fr' pour français, 'en' pour anglais, 'es' pour espagnol, 'de' pour allemand (défaut: 'fr')
points:
  - temp: sensor.bme680_temperature
    humidity: sensor.bme680_humidite
    color: "#ff0000"
    label: Chambre parents
    icon: mdi:bed
  - temp: sensor.module_interieur_branche_chambre_noah_temperature
    humidity: sensor.module_interieur_branche_chambre_noah_humidite
    color: "#0000ff"
    label: Chambre Noah
    icon: mdi:bed
  - temp: sensor.module_interieur_branche_module_exterieur_asco_temperature
    humidity: sensor.module_interieur_branche_module_exterieur_asco_humidite
    color: "#00ff00"
    label: Exterieur
  - temp: sensor.module_interieur_branche_temperature
    humidity: sensor.module_interieur_branche_humidite
    color: "#8B4513"
    label: Salon
    icon: mdi:sofa
bgColor: "#000000"
textColor: "#ffffff"
gridColor: rgba(0, 238, 254, 0.15)
curveColor: "#3B58DD"
showChart: true
chartAspectRatio: 1.33      # Rapport largeur/hauteur du graphique
# chartHeight: 400         # Hauteur fixe en pixels (optionnel)
showCalculatedData: true
comfortRange:
  tempMin: 18
  tempMax: 22
  rhMin: 40
  rhMax: 60
comfortColor: rgba(144, 238, 144, 0.3)
massFlowRate: 0.5
chartTitle: Diagramme Psychrométrique
themeMode: auto
theme: modern               # modern, classic, compact, mono (relevé technique)
chartMode: 2d               # 2d (classique) ou 3d (perspective)
heightMetric: pmv           # en 3d : pmv, enthalpy ou flat
displayMode: custom
showEnthalpy: true
showLegend: false
showPointLabels: true

# Options de zoom (optionnel)
zoom_temp_min: 15      # Température minimale à afficher (°C)
zoom_temp_max: 30      # Température maximale à afficher (°C)
zoom_humidity_min: 30  # Humidité minimale à afficher (%) - optionnel
zoom_humidity_max: 70  # Humidité maximale à afficher (%) - optionnel
```

---

## Opacité, styles de trait et grille

Sans réglage, chaque couleur (`bgColor`, `textColor`, `gridColor`, `curveColor`, `enthalpyColor`, `comfortColor`) suit automatiquement le thème clair/sombre de Home Assistant. L'opacité se règle indépendamment de la couleur via `<option>Opacity` (0-100), ce qui évite de figer la teinte du thème quand on ajuste juste la transparence.

Le style de trait de chaque famille de courbes se choisit séparément (`solid`, `dashed`, `dotted` ou `dashdot`), et le nombre de sous-graduations de température (`tempSubdivisions`, 1 à 10) contrôle la finesse de la grille.

```yaml
# Opacité indépendante de la couleur (0-100)
gridOpacity: 40
curveOpacity: 80
comfortOpacity: 50

# Style de trait par famille de courbes
gridLineStyle: dashed       # solid, dashed, dotted, dashdot
curveLineStyle: solid
enthalpyLineStyle: dotted
wetBulbLineStyle: dotted
comfortLineStyle: solid
pointLineStyle: dashed

# Sous-graduations de température (1 = aucun trait intermédiaire)
tempSubdivisions: 4
```

---

## Modes d'affichage

Le paramètre `displayMode` est un interrupteur maître au-dessus du `details` de chaque point. Trois modes sont disponibles :

### 🔹 minimal
Affiche uniquement les mesures de base, et retire les couches auxiliaires du graphique :
- Température
- Humidité
- Badges de statut de confort

### 🔹 custom / Personnalisé (par défaut)
Chaque point affiche exactement les champs cochés dans sa liste `details` — c'est le mode qui respecte votre configuration par point. Un point sans `details` retombe sur le point de rosée, la température humide, la température ressentie, l'enthalpie et l'indice PMV.

### 🔹 detailed / Détaillé
Affiche tous les champs disponibles pour tous les points, quel que soit `details` :
- Toutes les données du mode `custom`
- Teneur en eau, humidité absolue, volume spécifique
- Risque de moisissure
- Recommandations d'actions (chauffer, refroidir, humidifier, déshumidifier)
- Calculs de puissance pour chaque action, et consigne idéale

**Exemple :**
```yaml
type: custom:psychrometric-chart-enhanced
displayMode: minimal  # ou 'custom' ou 'detailed'
# ... autres paramètres
```

> `displayMode: standard` était l'ancien nom de `custom` et reste accepté : les configurations existantes continuent de fonctionner.

---

## Masquer le graphique

`showChart: false` retire le diagramme (et sa légende) : la carte ne montre plus que les cartes de données calculées. Pratique pour empiler une carte par pièce sans occuper tout le tableau de bord avec autant de diagrammes identiques.

```yaml
type: custom:psychrometric-chart-enhanced
showChart: false
showCalculatedData: true   # sinon il ne reste que le titre
# ... autres paramètres
```

L'option est aussi disponible dans l'éditeur visuel, section « Options d'affichage ». Quand elle est décochée, les réglages qui ne concernent que le tracé (enthalpie, pression de vapeur, légende, labels des points…) disparaissent de l'éditeur.

---

## Taille de la carte

Par défaut, le graphique **suit la place que Home Assistant accorde à la carte** :

- dans une vue *masonry* ou avec `grid_options: {rows: auto}`, il prend sa hauteur de repos, soit sa largeur divisée par `chartAspectRatio` (4:3 par défaut) ;
- avec `grid_options: {rows: N}`, il s'étire pour remplir les lignes accordées, ou se comprime pour y tenir — il ne déborde plus sur la carte suivante ;
- `chartHeight: 400` fixe la hauteur en pixels. Elle n'est plus étirée par la grille ; seule une carte trop courte pour la contenir la comprime encore.

```yaml
type: custom:psychrometric-chart-enhanced
chartHeight: 420        # hauteur fixe, en pixels
# ou :
chartAspectRatio: 2     # deux fois plus large que haut, hauteur libre
grid_options:
  columns: full
  rows: 8               # le graphique remplit les 8 lignes
```

Sur une carte étroite, le graphique **allège automatiquement son tracé** plutôt que d'empiler des étiquettes illisibles : les graduations de température s'espacent (5 °C → 10 °C → 20 °C), l'axe des pressions passe en notation courte (unité en en-tête), une courbe d'humidité sur deux est étiquetée, et sous ~300 px de zone de tracé les couches auxiliaires (enthalpie, températures humides, points de rosée) s'effacent comme en mode `minimal`. Les cartes de données, elles, se réorganisent déjà d'elles-mêmes en une colonne.

---

## Configuration du zoom

Le diagramme psychrométrique supporte le zoom pour se concentrer sur une plage de température spécifique. Ceci est particulièrement utile si vous souhaitez voir en détail une zone restreinte (par exemple, 15°C à 30°C pour une habitation).

### Options de zoom

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `zoom_temp_min` | number | `null` | Température minimale à afficher (en °C). Le diagramme sera automatiquement zoomé pour afficher cette plage. |
| `zoom_temp_max` | number | `null` | Température maximale à afficher (en °C). Doit être supérieur à `zoom_temp_min`. |
| `zoom_humidity_min` | number | `null` | Humidité minimale à afficher (en %). Optionnel, permet de centrer verticalement aussi. |
| `zoom_humidity_max` | number | `null` | Humidité maximale à afficher (en %). Optionnel, doit être supérieur à `zoom_humidity_min`. |

### Exemple : Zoom sur 15°C - 30°C

```yaml
type: custom:psychrometric-chart-enhanced
points:
  - temp: sensor.temperature
    humidity: sensor.humidity
    color: "#ff0000"
    label: Salon
zoom_temp_min: 15
zoom_temp_max: 30
```

### Exemple : Zoom complet (température + humidité)

```yaml
type: custom:psychrometric-chart-enhanced
points:
  - temp: sensor.temperature
    humidity: sensor.humidity
    color: "#ff0000"
    label: Chambre
zoom_temp_min: 18
zoom_temp_max: 26
zoom_humidity_min: 20
zoom_humidity_max: 30
