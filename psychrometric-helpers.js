/**
 * Psychrometric Calculations Helper
 * Contains pure functions for psychrometric conversions and calculations.
 * All temperatures are in Celsius internally.
 */
export class PsychrometricCalculations {

    // ========================================
    // RANDOM COLOR GENERATION
    // ========================================

    /**
     * Generate a random bright color for points without specified colors
     * Uses HSL color space to ensure vibrant, saturated colors
     */
    static generateRandomBrightColor() {
        // Generate bright, vibrant colors using HSL
        const hue = Math.floor(Math.random() * 360); // Random hue (0-360)
        const saturation = 80 + Math.floor(Math.random() * 20); // 80-100% saturation
        const lightness = 50 + Math.floor(Math.random() * 15); // 50-65% lightness

        // Convert HSL to hex
        const h = hue / 360;
        const s = saturation / 100;
        const l = lightness / 100;

        const hslToRgb = (h, s, l) => {
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
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
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        };

        const [r, g, b] = hslToRgb(h, s, l);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    // ========================================
    // TEMPERATURE CONVERSION UTILITIES
    // ========================================

    /**
     * Convert Fahrenheit to Celsius
     */
    static fahrenheitToCelsius(tempF) {
        return (tempF - 32) * 5 / 9;
    }

    /**
     * Convert Celsius to Fahrenheit
     */
    static celsiusToFahrenheit(tempC) {
        return (tempC * 9 / 5) + 32;
    }

    // ========================================
    // PSYCHROMETRIC CALCULATION METHODS
    // All calculations work in Celsius internally
    // ========================================

    static calculateDewPoint(temp, humidity) {
        const A = 17.27;
        const B = 237.3;
        const alpha = ((A * temp) / (B + temp)) + Math.log(humidity / 100);
        return (B * alpha) / (A - alpha);
    }

    static calculateWaterContent(temp, humidity) {
        const P = 101.325;
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (humidity / 100) * P_sat;
        return 0.622 * (P_v / (P - P_v));
    }

    static calculateEnthalpy(temp, waterContent) {
        return 1.006 * temp + waterContent * (2501 + 1.84 * temp);
    }

    static calculateAbsoluteHumidity(temp, rh) {
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v = (rh / 100) * P_sat;
        const P_v_Pa = P_v * 1000;
        const absHumidity_kg = P_v_Pa / (461.5 * (temp + 273.15));
        return absHumidity_kg * 1000;
    }

    static calculateWetBulbTemp(temp, rh) {
        const tw = temp * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5))
            + Math.atan(temp + rh) - Math.atan(rh - 1.676331)
            + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
        return tw;
    }

    static calculateVaporPressure(temp, rh) {
        return 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3)) * (rh / 100);
    }

    static calculateSpecificVolume(temp, rh) {
        const P = 101.325;
        const Rd = 287.058;
        const T = temp + 273.15;
        const P_v = this.calculateVaporPressure(temp, rh);
        const W = this.calculateWaterContent(temp, rh);
        return (Rd * T) / (P - P_v) * (1 + 1.608 * W);
    }

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

    static calculatePMV(temp, humidity) {
        const ta = temp;
        const tr = temp;
        const vel = 0.1;
        const rh_fraction = humidity / 100;
        const clo = 0.7;
        const met = 1.2;
        const M = met * 58.15;

        const pa = rh_fraction * 10 * Math.exp(16.6536 - 4030.183 / (ta + 235));

        let pmv = 0.303 * Math.exp(-0.036 * M) + 0.028;
        pmv *= (M - 58.15) - 0.42 * (M - 50) - 0.0173 * M * (5.87 - pa)
            - 0.0014 * M * (34 - ta) - 3.96 * Math.pow(10, -8) * 0.7 * (Math.pow(tr + 273, 4) - Math.pow(ta + 273, 4))
            - 0.072 * 0.7 * (34 - ta) - 0.054 * (5.87 - pa);

        if (vel > 0.1) {
            pmv -= 0.2223 * (1 - Math.exp(-1.387 * vel));
        }

        return Math.max(-3, Math.min(3, pmv));
    }

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

    static calculateHeatingPower(temp, targetTemp, massFlowRate) {
        const cp = 1.006;
        return massFlowRate * cp * (targetTemp - temp) * 1000;
    }

    static calculateCoolingPower(temp, targetTemp, massFlowRate) {
        return Math.abs(this.calculateHeatingPower(temp, targetTemp, massFlowRate));
    }

    static calculateHumidityPower(temp, humidity, targetHumidity, massFlowRate) {
        const P = 101.325;
        const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
        const P_v_actual = (humidity / 100) * P_sat;
        const W_actual = 0.622 * (P_v_actual / (P - P_v_actual));

        const P_v_target = (targetHumidity / 100) * P_sat;
        const W_target = 0.622 * (P_v_target / (P - P_v_target));

        const deltaW = W_target - W_actual;
        const latentHeat = 2501;

        return Math.abs(deltaW * massFlowRate * latentHeat * 1000);
    }
}
