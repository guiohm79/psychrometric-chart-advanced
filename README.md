<div align="center">
  <img src="icon.svg" alt="Psychrometric Chart Logo" width="200"/>

  # Psychrometric Chart for Home Assistant

  [![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
  [![GitHub release](https://img.shields.io/github/release/guiohm79/psychrometric-chart-advanced.svg)](https://github.com/guiohm79/psychrometric-chart-advanced/releases)
  [![License](https://img.shields.io/github/license/guiohm79/psychrometric-chart-advanced.svg)](LICENSE)
  [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/guiohm79)
  ![downloads-total][github-downloads]
  ![downloads-latest][github-latest-downloads]
  ![stars][github-stars]

[github-downloads]: https://img.shields.io/github/downloads/guiohm79/psychrometric-chart-advanced/total?style=flat
[github-latest-downloads]: https://img.shields.io/github/downloads/guiohm79/psychrometric-chart-advanced/latest/total?style=flat
[github-stars]: https://img.shields.io/github/stars/guiohm79/psychrometric-chart-advanced?style=flat




  
  **Language:** [🇬🇧 English](README.md) | [🇫🇷 Français](README.fr.md)
</div>
<img width="589" alt="image" src="https://github.com/guiohm79/psychrometric-chart-advanced/blob/main/Capture3.png">
<img width="589" alt="image" src="https://github.com/guiohm79/psychrometric-chart-advanced/blob/main/Capture.png">
<img width="589" alt="image" src="https://github.com/guiohm79/psychrometric-chart-advanced/blob/main/Capture2.png">



## Description

This project provides a custom card for **Home Assistant**, allowing you to visualize a **psychrometric chart** based on temperature and humidity data from sensors. The card also calculates key values such as enthalpy, water content, and dew point. It indicates whether actions are needed to heat, cool, humidify, or dehumidify, while estimating the power required to reach the **comfort zone**.

## Features

### 📊 Advanced Visualization
- **Interactive psychrometric chart** fully responsive
- **Modern design** with glassmorphism effects and smooth animations
- **Adaptive chart** that automatically adjusts to screen size (mobile, tablet, desktop)
- **Hover tooltips** on points with detailed information

### 📈 Data History
- **Elegant modal popup** displaying 24-hour history
- **Temperature, humidity and dew point overlaid**: both of the point's sensors on a dual axis (°C left, % right), plus the dew point recomputed from the two series
- **Scrubbing cursor**: hovering (or touching) draws a vertical line giving the exact time and every curve's value
- **Comfort band** behind the chart, with the share of time spent outside comfort
- **Detailed statistics**: min, max, average, trend over the period
- **▲ / ▼ markers** on the highest and lowest samples, to see *when* they happened
- **Clickable legend** to hide a curve
- **Click on values** of temperature or humidity to see history; `Escape` closes the dialog
- Native integration with Home Assistant's History API

### 🎨 Enhanced User Interface
- **Modern cards** with gradients, shadows, and depth effects
- **Smooth animations** during loading and interactions
- **Status badges** indicating if values are in the comfort zone
- **Emoji icons** for better readability
- **Dark mode** optimized with improved contrast

### 📐 Customizable Comfort Zone
- Adjustable min/max temperature
- Configurable min/max relative humidity
- Customizable color for the zone
- Clear visual indicators

### 🔬 Scientific Calculations Displayed
- Dew point temperature
- Water content
- Enthalpy
- Absolute humidity
- Wet bulb temperature
- Specific volume
- PMV index (thermal comfort)
- Mold risk with color code
- Estimated power for heating/cooling/humidifying/dehumidifying

### ⚙️ Advanced Chart Options
- Relative humidity curves (10% to 100%)
- Optional enthalpy curves
- Visualized dew points
- **Configurable vapor pressure** (vertical grid lines)
- Dotted lines to axes
- Animated and customizable legend
- Adjustable mass flow rate for precise power calculations

### 🌍 Multilingual
- **English**, **French**, **Spanish**, and **German** interface
- Configurable via `language` parameter
- All labels and messages translated

### 🔍 Zoom and Navigation
- **YAML-configurable zoom**: define a specific temperature range to display
- **Centered zoom**: configured range is automatically centered on the chart
- Ideal for focusing on a specific temperature zone (e.g., 15°C-30°C)

---

## Installation

### Via HACS (recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=guiohm79&repository=psychrometric-chart-advanced&category=plugin)


1. Make sure you have [HACS](https://hacs.xyz/) installed in Home Assistant
2. Open HACS in Home Assistant
3. Go to "Frontend"
4. Click the "+" button in the bottom right
5. Search for "Psychrometric Chart"
6. Click "Install"
7. Restart Home Assistant

### Manual Installation

1. **Download the files** from this repository
2. Place the **`psychrometric-chart-advanced.js`** file in the **`www/custom-lovelace/psychrometric/`** folder of your Home Assistant installation
3. Add the file to your dashboard via **Configuration > Dashboards > Resources**:
   - URL: `/local/custom-lovelace/psychrometric/psychrometric-chart-advanced.js`
   - Type: **JavaScript Module**
4. Reload the Lovelace interface in Home Assistant (CTRL+F5 or clear cache)

### Prerequisites

- Home Assistant 2024.1.0 or higher
- **History** must be enabled in your Home Assistant configuration to use the history feature

---

## Usage

Add this YAML configuration to your dashboard in **Home Assistant**:

```yaml
type: custom:psychrometric-chart-enhanced
language: en  # 'en' for English, 'fr' for French, 'es' for Spanish, 'de' for German (default: 'fr')
points:
  - temp: sensor.bme680_temperature
    humidity: sensor.bme680_humidity
    color: "#ff0000"
    label: Master Bedroom
    icon: mdi:bed
  - temp: sensor.living_room_temperature
    humidity: sensor.living_room_humidity
    color: "#0000ff"
    label: Living Room
    icon: mdi:sofa
  - temp: sensor.outdoor_temperature
    humidity: sensor.outdoor_humidity
    color: "#00ff00"
    label: Outdoor
    icon: mdi:weather-sunny
bgColor: "#000000"
textColor: "#ffffff"
gridColor: rgba(0, 238, 254, 0.15)
curveColor: "#3B58DD"
showChart: true
showCalculatedData: true
comfortRange:
  tempMin: 18
  tempMax: 22
  rhMin: 40
  rhMax: 60
comfortColor: rgba(144, 238, 144, 0.3)
massFlowRate: 0.5
chartTitle: Psychrometric Chart
themeMode: auto
displayMode: custom
showEnthalpy: true
showVaporPressure: true
showLegend: false
showPointLabels: true

# Zoom options (optional)
zoom_temp_min: 15      # Minimum temperature to display (°C)
zoom_temp_max: 30      # Maximum temperature to display (°C)
zoom_humidity_min: 30  # Minimum humidity to display (%) - optional
zoom_humidity_max: 70  # Maximum humidity to display (%) - optional
```

### Configuration Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be `custom:psychrometric-chart-enhanced` |
| `language` | string | No | `fr` | Interface language: `en` (English), `fr` (French), `es` (Spanish), or `de` (German) |
| `points` | list | **Yes** | - | List of sensor points to display |
| `points[].temp` | string | **Yes** | - | Temperature sensor entity ID |
| `points[].humidity` | string | **Yes** | - | Humidity sensor entity ID |
| `points[].color` | string | No | Random | Point color (hex format) |
| `points[].label` | string | No | - | Point label |
| `points[].icon` | string | No | `mdi:home` | MDI icon |
| `bgColor` | string | No | Theme | Background color |
| `textColor` | string | No | Theme | Text color |
| `gridColor` | string | No | Theme | Grid color |
| `curveColor` | string | No | Theme | Humidity curves color |
| `bgOpacity` / `textOpacity` / `gridOpacity` / `curveOpacity` / `enthalpyOpacity` / `comfortOpacity` | number | No | - | Opacity (0-100) for the matching `*Color` option, set independently of the color itself. Adjusting opacity never overwrites the color, so it doesn't break light/dark theme switching |
| `gridLineStyle` | string | No | `dashed` | Grid line style: `solid`, `dashed`, `dotted`, or `dashdot` |
| `curveLineStyle` | string | No | `solid` | Humidity curves line style |
| `enthalpyLineStyle` | string | No | `dotted` | Enthalpy lines style |
| `wetBulbLineStyle` | string | No | `dotted` | Wet bulb lines style |
| `comfortLineStyle` | string | No | `solid` | Comfort zone outline style |
| `pointLineStyle` | string | No | `dashed` | Point halo outline style |
| `tempSubdivisions` | number | No | `1` | Minor gridlines drawn between two temperature ticks (1-10). `1` means no intermediate line |
| `showChart` | boolean | No | `true` | Show the psychrometric diagram. Set to `false` to keep only the calculated data cards (useful to stack several compact cards, one per room) |
| `chartHeight` | number | No | - | Chart height in pixels. Left empty, the chart follows the space the card is given; a value pins it, and only a card too short to hold it still compresses it |
| `chartAspectRatio` | number | No | `1.33` | Width/height ratio used when no height is imposed (`1.33` = 4:3, `2` = twice as wide as tall) |
| `theme` | string | No | `modern` | Data-card style: `modern`, `classic` (flat), `compact` (dense), or `mono` (technical readout: big temperature, monospace values right-aligned in two columns) |
| `chartMode` | string | No | `2d` | Chart projection: `2d` (classic flat chart) or `3d` (perspective scene — drag to rotate, wheel or two-finger pinch to zoom, plus 3D / top-view buttons) |
| `heightMetric` | string | No | `pmv` | 3D only. What a sensor's height represents: `pmv` (rises with the distance from comfort, hot *and* cold), `enthalpy`, or `flat` (no height) |
| `showCalculatedData` | boolean | No | `true` | Show calculated data cards |
| `comfortRange` | object | No | - | Comfort zone configuration |
| `comfortRange.tempMin` | number | No | `18` | Minimum comfort temperature (°C) |
| `comfortRange.tempMax` | number | No | `22` | Maximum comfort temperature (°C) |
| `comfortRange.rhMin` | number | No | `40` | Minimum comfort relative humidity (%) |
| `comfortRange.rhMax` | number | No | `60` | Maximum comfort relative humidity (%) |
| `comfortColor` | string | No | Theme | Comfort zone color |
| `enthalpyColor` | string | No | Theme | Enthalpy lines color |
| `massFlowRate` | number | No | `0.5` | Mass flow rate (kg/s) for power calculations |
| `chartTitle` | string | No | `Psychrometric Chart` | Chart title |
| `themeMode` | string | No | `auto` | Colour theme: `auto` (follows the Home Assistant light/dark theme), `light`, or `dark` |
| `displayMode` | string | No | `custom` | Detail level: `minimal`, `custom` (applies each point's `details`), or `detailed` |
| `showEnthalpy` | boolean | No | `false` | Show enthalpy curves |
| `showVaporPressure` | boolean | No | `true` | Show vapor pressure vertical grid lines (kPa) |
| `showLegend` | boolean | No | `true` | Show legend |
| `showPointLabels` | boolean | No | `true` | Show point labels on chart |
| `zoom_temp_min` | number | No | `null` | Minimum temperature to display (°C) - enables auto zoom |
| `zoom_temp_max` | number | No | `null` | Maximum temperature to display (°C) - must be > zoom_temp_min |
| `zoom_humidity_min` | number | No | `null` | Minimum humidity to display (%) - optional vertical centering |
| `zoom_humidity_max` | number | No | `null` | Maximum humidity to display (%) - must be > zoom_humidity_min |

### 🎨 Custom Point Display

You can customize exactly which data fields are displayed for each point, overriding the global `displayMode`. This is configured in the visual editor by expanding the "Affichage personnalisé" (Custom Display) section for each point.

Available fields (`points[].details`):
- `dewPoint` — Dew point
- `wetBulb` — Wet bulb temperature
- `apparentTemp` — Feels like (apparent temperature)
- `enthalpy` — Enthalpy
- `absHumidity` — Absolute humidity
- `waterContent` — Water content
- `specificVolume` — Specific volume
- `pmvIndex` — PMV index
- `moldRisk` — Mold risk
- `action` — Action, power and ideal setpoint

If you select specific fields for a point, **only** those fields (plus Temperature and Humidity) will be shown for that point. If you uncheck all fields, only Temperature and Humidity will be shown.

---

## Display Modes

The `displayMode` parameter is a master switch above each point's `details`. Three modes are available:

### 🔹 minimal
Shows only basic measurements, and drops the auxiliary layers from the chart:
- Temperature
- Humidity
- Comfort status badges

### 🔹 custom (default)
Each point shows exactly the fields ticked in its `details` list — this is the mode that honours your per-point configuration. When a point has no `details` at all, it falls back to dew point, wet bulb, feels like, enthalpy and PMV index.

### 🔹 detailed
Shows every available field for every point, whatever `details` says:
- All data from `custom` mode
- Water content, absolute humidity, specific volume
- Mold risk
- Action recommendations (heat, cool, humidify, dehumidify)
- Power calculations for each action, and the ideal setpoint

**Example:**
```yaml
type: custom:psychrometric-chart-enhanced
displayMode: minimal  # or 'custom' or 'detailed'
# ... other parameters
```

> `displayMode: standard` was the previous name of `custom` and is still accepted, so existing configurations keep working.

---

## Zoom Configuration

The psychrometric chart supports zoom to focus on a specific temperature range. This is particularly useful if you want to see details in a restricted area (e.g., 15°C to 30°C for a home).

### Zoom Options

The zoom feature allows you to:
- **Define a temperature range** via YAML configuration (`zoom_temp_min` and `zoom_temp_max`)
- **Optionally define a humidity range** for vertical centering (`zoom_humidity_min` and `zoom_humidity_max`)
- The chart automatically centers and scales to display the configured range

### Example: Zoom on 15°C - 30°C

```yaml
type: custom:psychrometric-chart-enhanced
points:
  - temp: sensor.temperature
    humidity: sensor.humidity
    color: "#ff0000"
    label: Living Room
zoom_temp_min: 15
zoom_temp_max: 30
```

### Example: Full zoom (temperature + humidity)

```yaml
type: custom:psychrometric-chart-enhanced
points:
  - temp: sensor.temperature
    humidity: sensor.humidity
    color: "#ff0000"
    label: Bedroom
zoom_temp_min: 18
zoom_temp_max: 26
zoom_humidity_min: 20
zoom_humidity_max: 30
```

---

## Screenshots

### Comfort Zone Visualization
The chart clearly displays the comfort zone with customizable temperature and humidity ranges.

### Data History Modal
Click on any temperature or humidity value to open an elegant modal showing the last 24 hours of data. Both sensors of the point are drawn together on a dual axis, along with the dew point derived from them; a hover cursor reads every curve at the same instant, the configured comfort zone appears as a background band, and the tiles report min, max, average, trend and time spent outside comfort.

### Multi-sensor Tracking
Track multiple rooms or zones simultaneously with color-coded points and detailed information for each sensor.

---

## Technical Details

### Psychrometric Calculations

The card uses scientifically accurate formulas to calculate:

- **Dew point**: Temperature at which water vapor condenses
- **Wet bulb temperature**: Temperature measured with a wet thermometer
- **Enthalpy**: Total heat content of air (kJ/kg)
- **Water content**: Mass of water vapor per kg of dry air
- **Absolute humidity**: Mass of water vapor per m³ of air
- **Specific volume**: Volume occupied by 1 kg of dry air
- **PMV index**: Predicted Mean Vote for thermal comfort
- **Mold risk**: Assessment based on temperature and humidity

### Power Calculations

When a point is outside the comfort zone, the card estimates the power needed to:
- Heat or cool the air to reach the target temperature
- Humidify or dehumidify to reach the target humidity
- Total power is calculated based on the configured mass flow rate

---

## Contributing

Contributions are welcome! Feel free to:
- Report bugs via [GitHub Issues](https://github.com/guiohm79/psychrometric-chart-advanced/issues)
- Suggest new features
- Submit pull requests

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Changelog

See [Releases](https://github.com/guiohm79/psychrometric-chart-advanced/releases) for version history and changes.

---

## Support

If you find this project helpful, please ⭐ star the repository on GitHub!

[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/guiohm79)

For questions or support, please open an issue on GitHub.
