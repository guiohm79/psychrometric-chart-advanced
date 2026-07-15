/**
 * Psychrometric Calculations Helper
 * Contains pure functions for psychrometric conversions and calculations.
 * All temperatures are in Celsius internally.
 */
export class PsychrometricCalculations {

    // ========================================
    // COLOR GENERATION
    // ========================================

    /**
     * Convert an HSL color to RGB components.
     * @param {number} h - Hue, normalized to 0-1
     * @param {number} s - Saturation, normalized to 0-1
     * @param {number} l - Lightness, normalized to 0-1
     * @returns {number[]} [r, g, b] in the 0-255 range
     */
    static hslToRgb(h, s, l) {
        if (s === 0) {
            const v = Math.round(l * 255);
            return [v, v, v];
        }
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return [
            hue2rgb(p, q, h + 1 / 3),
            hue2rgb(p, q, h),
            hue2rgb(p, q, h - 1 / 3),
        ].map(v => Math.round(v * 255));
    }

    /**
     * Generate a deterministic color based on a string hash.
     * Ensures the same input string always produces the same color.
     * @param {string} str - Input string (e.g., entity ID)
     * @returns {string} Hex color code
     */
    static generateColorFromHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = Math.abs(hash % 360) / 360;
        const saturation = (70 + (Math.abs(hash) % 30)) / 100;
        const lightness = (45 + (Math.abs(hash) % 20)) / 100;

        return this.rgbToHex(this.hslToRgb(hue, saturation, lightness));
    }

    // ========================================
    // COLOR PARSING UTILITIES
    // ========================================

    /**
     * Extract the RGB components of a CSS color (3/6/8-digit hex, rgb() or rgba()).
     * @param {string} color - CSS color
     * @returns {number[]} [r, g, b], defaults to [0, 0, 0] when unparseable
     */
    static colorToRgb(color) {
        if (typeof color === 'string') {
            const value = color.trim();
            if (value.startsWith('#')) {
                const body = value.slice(1);
                if (body.length === 3) {
                    return [0, 1, 2].map(i => parseInt(body[i] + body[i], 16));
                }
                if (body.length >= 6) {
                    return [0, 2, 4].map(i => parseInt(body.slice(i, i + 2), 16));
                }
            }
            const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
            if (match) return [1, 2, 3].map(i => parseInt(match[i], 10));
        }
        return [0, 0, 0];
    }

    /**
     * Extract the opacity of a CSS color.
     * @param {string} color - CSS color
     * @returns {number} Opacity between 0 and 1, defaults to 1
     */
    static colorToAlpha(color) {
        if (typeof color === 'string') {
            const value = color.trim();
            if (value.startsWith('#') && value.length === 9) {
                return parseInt(value.slice(7, 9), 16) / 255;
            }
            const match = value.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
            if (match) return parseFloat(match[1]);
        }
        return 1;
    }

    /**
     * Convert RGB components to a hex color.
     * @param {number[]} rgb - [r, g, b]
     * @returns {string} Hex color (#rrggbb)
     */
    static rgbToHex(rgb) {
        const [r, g, b] = Array.isArray(rgb) ? rgb : [0, 0, 0];
        return `#${[r, g, b]
            .map(v => Math.max(0, Math.min(255, Math.round(v || 0))).toString(16).padStart(2, '0'))
            .join('')}`;
    }

    /**
     * Recompose a CSS color from RGB components and an opacity.
     * Returns a hex string at full opacity, an rgba() string otherwise.
     * @param {number[]} rgb - [r, g, b]
     * @param {number} alpha - Opacity between 0 and 1
     * @returns {string} CSS color
     */
    static rgbToCss(rgb, alpha) {
        if (!(alpha < 1)) return this.rgbToHex(rgb);
        const [r, g, b] = Array.isArray(rgb) ? rgb : [0, 0, 0];
        return `rgba(${r}, ${g}, ${b}, ${Number(Math.max(0, alpha).toFixed(2))})`;
    }

    // ========================================
    // TEMPERATURE CONVERSION UTILITIES
    // ========================================

    /**
     * Convert Fahrenheit to Celsius
     * @param {number} tempF - Temperature in Fahrenheit
     * @returns {number} Temperature in Celsius
     */
    static fahrenheitToCelsius(tempF) {
        return (tempF - 32) * 5 / 9;
    }

    /**
     * Convert Celsius to Fahrenheit
     * @param {number} tempC - Temperature in Celsius
     * @returns {number} Temperature in Fahrenheit
     */
    static celsiusToFahrenheit(tempC) {
        return (tempC * 9 / 5) + 32;
    }

    // ========================================
    // PSYCHROMETRIC CALCULATION METHODS
    // All calculations work in Celsius internally
    // ========================================

    /**
     * Atmospheric pressure at sea level, in kPa.
     * @type {number}
     */
    static get ATMOSPHERIC_PRESSURE() {
        return 101.325;
    }

    /**
     * Calculate the saturation vapor pressure (Magnus-Tetens).
     * Single source of truth: every other formula must go through this one
     * rather than inlining the `0.61078 * exp(17.27 t / (t + 237.3))` expression.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @returns {number} Saturation vapor pressure in kPa
     */
    static calculateSaturationPressure(temp) {
        return 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    }

    /**
     * Calculate Dew Point temperature.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Dew point temperature in Celsius
     */
    static calculateDewPoint(temp, humidity) {
        const A = 17.27;
        const B = 237.3;
        const alpha = ((A * temp) / (B + temp)) + Math.log(humidity / 100);
        return (B * alpha) / (A - alpha);
    }

    /**
     * Calculate Water Content (Mixing Ratio).
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Water content in kg/kg (dry air)
     */
    static calculateWaterContent(temp, humidity) {
        const P = this.ATMOSPHERIC_PRESSURE;
        const P_v = (humidity / 100) * this.calculateSaturationPressure(temp);
        return 0.622 * (P_v / (P - P_v));
    }

    /**
     * Convert a water content (mixing ratio) back to a vapor pressure.
     * @param {number} waterContent - Water content in kg/kg (dry air)
     * @returns {number} Vapor pressure in kPa
     */
    static waterContentToVaporPressure(waterContent) {
        return (waterContent * this.ATMOSPHERIC_PRESSURE) / (0.622 + waterContent);
    }

    /**
     * Calculate the water content of moist air along a constant wet bulb line (ASHRAE).
     * Replaces the brute-force search that used to scan `calculateWetBulbTemp` over a
     * temperature/humidity grid: this is a direct, closed-form evaluation.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} wetBulb - Wet bulb temperature in Celsius
     * @returns {number} Water content in kg/kg (dry air)
     */
    static calculateWaterContentFromWetBulb(temp, wetBulb) {
        const Ws = this.calculateWaterContent(wetBulb, 100);
        return ((2501 - 2.326 * wetBulb) * Ws - 1.006 * (temp - wetBulb))
            / (2501 + 1.86 * temp - 4.186 * wetBulb);
    }

    /**
     * Calculate Enthalpy.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} waterContent - Water content in kg/kg
     * @returns {number} Enthalpy in kJ/kg
     */
    static calculateEnthalpy(temp, waterContent) {
        return 1.006 * temp + waterContent * (2501 + 1.84 * temp);
    }

    /**
     * Calculate Absolute Humidity.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Absolute humidity in g/m³
     */
    static calculateAbsoluteHumidity(temp, rh) {
        const P_v_Pa = this.calculateVaporPressure(temp, rh) * 1000;
        const absHumidity_kg = P_v_Pa / (461.5 * (temp + 273.15));
        return absHumidity_kg * 1000;
    }

    /**
     * Calculate Wet Bulb Temperature.
     *
     * Inverts the ASHRAE constant-wet-bulb relation by bisection rather than using
     * Stull's closed-form approximation: Stull is only valid for 5-99 % RH and drifts
     * by up to ~1 °C (nearly 5 points of RH around 10 °C), which would put the value
     * shown on a point out of step with the iso-wet-bulb lines drawn on the chart —
     * both now come from `calculateWaterContentFromWetBulb`.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Wet bulb temperature in Celsius
     */
    static calculateWetBulbTemp(temp, rh) {
        const target = this.calculateWaterContent(temp, rh);

        // La température humide est bornée par le point de rosée et la température sèche.
        let low = this.calculateDewPoint(temp, Math.max(rh, 0.01));
        let high = temp;
        if (!(low < high)) return temp; // air saturé

        // W est strictement croissante en tw : la bissection converge toujours.
        for (let i = 0; i < 60; i++) {
            const mid = (low + high) / 2;
            if (this.calculateWaterContentFromWetBulb(temp, mid) < target) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return (low + high) / 2;
    }

    /**
     * Calculate Vapor Pressure.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Vapor pressure in kPa
     */
    static calculateVaporPressure(temp, rh) {
        return this.calculateSaturationPressure(temp) * (rh / 100);
    }

    /**
     * Calculate Specific Volume, per kilogram of dry air.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Specific volume in m³/kg (dry air)
     */
    static calculateSpecificVolume(temp, rh) {
        // Rd exprimé en kJ/(kg·K) pour rester homogène avec une pression en kPa.
        const Rd = 0.287058;
        const T = temp + 273.15;
        const W = this.calculateWaterContent(temp, rh);
        // v = Rd·T·(1 + 1.6078·W) / P : le facteur (1 + 1.6078·W) porte déjà tout
        // l'effet de la vapeur, la pression au dénominateur est donc la pression totale.
        return (Rd * T * (1 + 1.6078 * W)) / this.ATMOSPHERIC_PRESSURE;
    }

    /**
     * Calculate Mold Risk based on temperature and humidity.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Risk level (0-6)
     */
    static calculateMoldRisk(temp, humidity) {
        let risk = 0;

        if (temp < 5) {
            risk += 0;
        } else if (temp >= 5 && temp < 15) {
            risk += 1;
        } else if (temp >= 15 && temp < 20) {
            risk += 2;
        } else if (temp >= 20 && temp < 25) {
            risk += 3;
        } else if (temp >= 25) {
            risk += 2.5;
        }

        if (humidity < 60) {
            risk += 0;
        } else if (humidity >= 60 && humidity < 70) {
            risk += 1;
        } else if (humidity >= 70 && humidity < 80) {
            risk += 2;
        } else if (humidity >= 80 && humidity < 90) {
            risk += 2.5;
        } else if (humidity >= 90) {
            risk += 3;
        }

        const dewPoint = this.calculateDewPoint(temp, humidity);
        if (dewPoint > 12) {
            risk += 0.5;
        }

        return Math.min(risk, 6);
    }

    /**
     * Calculate PMV (Predicted Mean Vote) thermal comfort index, per ISO 7730 / Fanger.
     * @param {number} temp - Dry bulb (air) temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @param {Object} [options] - Comfort model parameters
     * @param {number} [options.clo=0.7] - Clothing insulation, in clo
     * @param {number} [options.met=1.2] - Metabolic rate, in met
     * @param {number} [options.vel=0.1] - Relative air velocity, in m/s
     * @param {number} [options.tr=temp] - Mean radiant temperature in Celsius
     * @returns {number} PMV index, clamped to -3..+3
     */
    static calculatePMV(temp, humidity, options = {}) {
        const { clo = 0.7, met = 1.2, vel = 0.1, tr = temp } = options;
        const ta = temp;

        // Pression partielle de vapeur, en Pa (l'équation de Fanger l'exige en Pa).
        const pa = this.calculateVaporPressure(ta, humidity) * 1000;

        const icl = 0.155 * clo;      // isolation vestimentaire, m²K/W
        const m = met * 58.15;        // métabolisme, W/m²
        const w = 0;                  // travail mécanique externe, négligé
        const mw = m - w;

        const fcl = icl <= 0.078 ? 1.0 + 1.29 * icl : 1.05 + 0.645 * icl;
        const hcf = 12.1 * Math.sqrt(vel);
        const taa = ta + 273;
        const tra = tr + 273;

        // Température de surface du vêtement : résolue par itération, l'équation
        // étant implicite (tcl apparaît des deux côtés via rayonnement et convection).
        const tcla = taa + (35.5 - ta) / (3.5 * (icl + 0.1));
        const p1 = icl * fcl;
        const p2 = p1 * 3.96;
        const p3 = p1 * 100;
        const p4 = p1 * taa;
        const p5 = 308.7 - 0.028 * mw + p2 * Math.pow(tra / 100, 4);

        let xn = tcla / 100;
        let xf = xn;
        let hc = hcf;
        for (let i = 0; i < 150; i++) {
            xf = (xf + xn) / 2;
            const hcn = 2.38 * Math.pow(Math.abs(100 * xf - taa), 0.25);
            hc = hcf > hcn ? hcf : hcn;
            xn = (p5 + p4 * hc - p2 * Math.pow(xf, 4)) / (100 + p3 * hc);
            if (Math.abs(xn - xf) <= 0.00015) break;
        }
        const tcl = 100 * xn - 273;

        // Composantes de la déperdition thermique
        const hl1 = 3.05 * 0.001 * (5733 - 6.99 * mw - pa);          // diffusion cutanée
        const hl2 = mw > 58.15 ? 0.42 * (mw - 58.15) : 0;            // sudation
        const hl3 = 1.7 * 0.00001 * m * (5867 - pa);                 // respiration latente
        const hl4 = 0.0014 * m * (34 - ta);                          // respiration sensible
        const hl5 = 3.96 * fcl * (Math.pow(xn, 4) - Math.pow(tra / 100, 4)); // rayonnement
        const hl6 = fcl * hc * (tcl - ta);                           // convection

        const ts = 0.303 * Math.exp(-0.036 * m) + 0.028;
        const pmv = ts * (mw - hl1 - hl2 - hl3 - hl4 - hl5 - hl6);

        return Math.max(-3, Math.min(3, pmv));
    }

    /**
     * Calculate ideal setpoint to reach comfort zone with minimal energy.
     * @param {number} temp - Current temperature in Celsius
     * @param {number} humidity - Current humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {Object} Ideal setpoint {temp, humidity}
     */
    static calculateIdealSetpoint(temp, humidity, comfortRange) {
        let idealTemp = temp;
        let idealHumidity = humidity;

        if (temp < comfortRange.tempMin) {
            idealTemp = comfortRange.tempMin;
        } else if (temp > comfortRange.tempMax) {
            idealTemp = comfortRange.tempMax;
        }

        if (humidity < comfortRange.rhMin) {
            idealHumidity = comfortRange.rhMin;
        } else if (humidity > comfortRange.rhMax) {
            idealHumidity = comfortRange.rhMax;
        }

        const isSummer = temp > 23;

        if (idealTemp === temp && idealHumidity === humidity) {
            if (isSummer) {
                idealTemp = Math.min(temp, comfortRange.tempMax);
                idealHumidity = Math.max(comfortRange.rhMin, Math.min(humidity, comfortRange.rhMin + 5));
            } else {
                idealTemp = Math.max(temp, comfortRange.tempMin);
                idealHumidity = Math.min(comfortRange.rhMax, Math.max(humidity, comfortRange.rhMax - 5));
            }
        }

        return { temp: idealTemp, humidity: idealHumidity };
    }

    /**
     * Calculate heating power required.
     * @param {number} temp - Current temperature
     * @param {number} targetTemp - Target temperature
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateHeatingPower(temp, targetTemp, massFlowRate) {
        const cp = 1.006;
        return massFlowRate * cp * (targetTemp - temp) * 1000;
    }

    /**
     * Calculate cooling power required.
     * @param {number} temp - Current temperature
     * @param {number} targetTemp - Target temperature
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateCoolingPower(temp, targetTemp, massFlowRate) {
        return Math.abs(this.calculateHeatingPower(temp, targetTemp, massFlowRate));
    }

    /**
     * Calculate power required for humidification/dehumidification.
     * @param {number} temp - Current temperature
     * @param {number} humidity - Current humidity
     * @param {number} targetHumidity - Target humidity
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateHumidityPower(temp, humidity, targetHumidity, massFlowRate) {
        const W_actual = this.calculateWaterContent(temp, humidity);
        const W_target = this.calculateWaterContent(temp, targetHumidity);

        const deltaW = W_target - W_actual;
        const latentHeat = 2501;

        return Math.abs(deltaW * massFlowRate * latentHeat * 1000);
    }
}
