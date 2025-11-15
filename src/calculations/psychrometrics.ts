/**
 * Psychrometric Calculations Module
 * Pure functions for thermodynamic and HVAC calculations
 * All calculations are scientifically validated (see AUDIT_CALCULS.md)
 */

/**
 * Calculate dew point temperature using Magnus-Tetens formula
 * @param temp - Air temperature in °C
 * @param humidity - Relative humidity in %
 * @returns Dew point temperature in °C
 */
export function calculateDewPoint(temp: number, humidity: number): number {
    const A = 17.27;
    const B = 237.3;
    const alpha = ((A * temp) / (B + temp)) + Math.log(humidity / 100);
    return (B * alpha) / (A - alpha);
}

/**
 * Calculate water content (moisture ratio) in kg water per kg dry air
 * @param temp - Air temperature in °C
 * @param humidity - Relative humidity in %
 * @returns Water content in kg/kg
 */
export function calculateWaterContent(temp: number, humidity: number): number {
    const P = 101.325; // Atmospheric pressure in kPa
    const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const P_v = (humidity / 100) * P_sat;
    return 0.622 * (P_v / (P - P_v));
}

/**
 * Calculate specific enthalpy of humid air
 * @param temp - Air temperature in °C
 * @param waterContent - Water content in kg/kg
 * @returns Specific enthalpy in kJ/kg
 */
export function calculateEnthalpy(temp: number, waterContent: number): number {
    return 1.006 * temp + waterContent * (2501 + 1.84 * temp);
}

/**
 * Calculate absolute humidity in g/m³
 * Formula: ρv = (Pv × 1000) / (Rv × T)
 * Rv = 461.5 J/(kg·K) - specific gas constant for water vapor
 * @param temp - Air temperature in °C
 * @param rh - Relative humidity in %
 * @returns Absolute humidity in g/m³
 */
export function calculateAbsoluteHumidity(temp: number, rh: number): number {
    const P_sat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const P_v = (rh / 100) * P_sat; // kPa

    // Conversion: kPa → Pa → kg/m³ → g/m³
    const P_v_Pa = P_v * 1000; // kPa to Pa
    const absHumidity_kg = P_v_Pa / (461.5 * (temp + 273.15)); // kg/m³
    return absHumidity_kg * 1000; // g/m³
}

/**
 * Calculate wet-bulb temperature using simplified Stull approximation
 * @param temp - Air temperature in °C
 * @param rh - Relative humidity in %
 * @returns Wet-bulb temperature in °C
 */
export function calculateWetBulbTemp(temp: number, rh: number): number {
    const tw = temp * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5))
            + Math.atan(temp + rh) - Math.atan(rh - 1.676331)
            + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
    return tw;
}

/**
 * Calculate vapor pressure
 * @param temp - Air temperature in °C
 * @param rh - Relative humidity in %
 * @returns Vapor pressure in kPa
 */
export function calculateVaporPressure(temp: number, rh: number): number {
    return 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3)) * (rh / 100);
}

/**
 * Calculate specific volume of humid air
 * @param temp - Air temperature in °C
 * @param rh - Relative humidity in %
 * @returns Specific volume in m³/kg
 */
export function calculateSpecificVolume(temp: number, rh: number): number {
    const P = 101.325; // Atmospheric pressure in kPa
    const Rd = 287.058; // Specific gas constant for dry air in J/(kg·K)
    const T = temp + 273.15; // Temperature in Kelvin
    const P_v = calculateVaporPressure(temp, rh);
    const W = calculateWaterContent(temp, rh);

    // Specific volume of humid air
    return (Rd * T) / (P - P_v) * (1 + 1.608 * W);
}

/**
 * Calculate mold risk on a scale of 0-6
 * ⚠️ NOTE: Simplified heuristic, not a scientifically validated calculation
 * For precise evaluation, use VTT or IEA Annex 55 models
 * @param temp - Air temperature in °C
 * @param humidity - Relative humidity in %
 * @returns Risk score from 0 (no risk) to 6 (very high risk)
 */
export function calculateMoldRisk(temp: number, humidity: number): number {
    let risk = 0;

    // Temperature factor
    if (temp < 5) {
        risk += 0; // Too cold for mold
    } else if (temp >= 5 && temp < 15) {
        risk += 1; // Low risk
    } else if (temp >= 15 && temp < 20) {
        risk += 2; // Moderate risk
    } else if (temp >= 20 && temp < 25) {
        risk += 3; // High risk
    } else if (temp >= 25) {
        risk += 2.5; // Slightly less favorable than 20-25°C
    }

    // Humidity factor
    if (humidity < 60) {
        risk += 0; // Too dry for mold
    } else if (humidity >= 60 && humidity < 70) {
        risk += 1; // Beginning of risk
    } else if (humidity >= 70 && humidity < 80) {
        risk += 2; // Moderate risk
    } else if (humidity >= 80 && humidity < 90) {
        risk += 2.5; // High risk
    } else if (humidity >= 90) {
        risk += 3; // Very high risk
    }

    // Dew point and surface temperature
    const dewPoint = calculateDewPoint(temp, humidity);
    if (dewPoint > 12) {
        risk += 0.5;
    }

    return Math.min(risk, 6); // Limit to 6 (scale 0-6)
}

/**
 * Calculate Predicted Mean Vote (PMV) for thermal comfort
 * ⚠️ WARNING: Very simplified PMV calculation, for indicative purposes only
 * This calculation does NOT follow the complete ISO 7730 standard (would require ~50 lines)
 * For precise thermal comfort evaluation, use specialized software
 * Standard parameters: clothing=0.7 clo, activity=1.2 met, air velocity=0.1 m/s
 * @param temp - Air temperature in °C
 * @param humidity - Relative humidity in %
 * @returns PMV value from -3 (cold) to +3 (hot), 0 being neutral
 */
export function calculatePMV(temp: number, humidity: number): number {
    // Conversion to necessary parameters
    const ta = temp; // Air temperature
    const tr = temp; // Radiant temperature (assumed equal to air temperature)
    const vel = 0.1; // Air velocity (m/s)
    const rh_fraction = humidity / 100;
    const clo = 0.7; // Clothing insulation
    const met = 1.2; // Metabolic activity level (in met)
    const M = met * 58.15; // Conversion to W/m² for heat load calculations

    // Correction factors based on Fanger's formulas
    const pa = rh_fraction * 10 * Math.exp(16.6536 - 4030.183 / (ta + 235)); // Vapor pressure

    // Simplified PMV calculation based on an approximation of Fanger's equation
    let pmv = 0.303 * Math.exp(-0.036 * M) + 0.028;
    pmv *= (M - 58.15) - 0.42 * (M - 50) - 0.0173 * M * (5.87 - pa)
         - 0.0014 * M * (34 - ta) - 3.96 * Math.pow(10, -8) * 0.7 * (Math.pow(tr + 273, 4) - Math.pow(ta + 273, 4))
         - 0.072 * 0.7 * (34 - ta) - 0.054 * (5.87 - pa);

    // Adjustment for air velocity
    if (vel > 0.1) {
        pmv -= 0.2223 * (1 - Math.exp(-1.387 * vel));
    }

    // Limit PMV to the range -3 to +3
    return Math.max(-3, Math.min(3, pmv));
}

/**
 * Comfort range interface for setpoint calculations
 */
export interface ComfortRange {
    tempMin: number;
    tempMax: number;
    rhMin: number;
    rhMax: number;
}

/**
 * Ideal setpoint result
 */
export interface IdealSetpoint {
    temp: number;
    humidity: number;
}

/**
 * Calculate ideal setpoint for energy savings while reaching comfort zone
 * @param temp - Current air temperature in °C
 * @param humidity - Current relative humidity in %
 * @param comfortRange - Comfort zone boundaries
 * @returns Ideal temperature and humidity setpoints
 */
export function calculateIdealSetpoint(
    temp: number,
    humidity: number,
    comfortRange: ComfortRange
): IdealSetpoint {
    let idealTemp = temp;
    let idealHumidity = humidity;

    // Temperature adjustment
    if (temp < comfortRange.tempMin) {
        // If too cold, increase to minimum needed
        idealTemp = comfortRange.tempMin;
    } else if (temp > comfortRange.tempMax) {
        // If too hot, decrease to maximum needed
        idealTemp = comfortRange.tempMax;
    }

    // Humidity adjustment
    if (humidity < comfortRange.rhMin) {
        // If too dry, humidify to minimum needed
        idealHumidity = comfortRange.rhMin;
    } else if (humidity > comfortRange.rhMax) {
        // If too humid, dehumidify to maximum needed
        idealHumidity = comfortRange.rhMax;
    }

    // If values are already in comfort zone, suggest optimal values
    // for energy savings (generally low end of comfort zone for temperature
    // in winter, and high end in summer)
    const isSummer = temp > 23; // Simplified season estimation

    if (idealTemp === temp && idealHumidity === humidity) {
        if (isSummer) {
            // In summer, prefer higher temperature to save on AC
            idealTemp = Math.min(temp, comfortRange.tempMax);
            // And lower humidity for comfort
            idealHumidity = Math.max(comfortRange.rhMin, Math.min(humidity, comfortRange.rhMin + 5));
        } else {
            // In winter, prefer lower temperature to save on heating
            idealTemp = Math.max(temp, comfortRange.tempMin);
            // And higher humidity for comfort
            idealHumidity = Math.min(comfortRange.rhMax, Math.max(humidity, comfortRange.rhMax - 5));
        }
    }

    return { temp: idealTemp, humidity: idealHumidity };
}

/**
 * Calculate heating power required
 * @param temp - Current air temperature in °C
 * @param targetTemp - Target air temperature in °C
 * @param massFlowRate - Air mass flow rate in kg/s
 * @returns Required heating power in watts
 */
export function calculateHeatingPower(
    temp: number,
    targetTemp: number,
    massFlowRate: number
): number {
    const cp = 1.006; // Specific heat capacity of air in kJ/kg°C
    return massFlowRate * cp * (targetTemp - temp) * 1000; // Conversion to watts
}

/**
 * Calculate cooling power required
 * @param temp - Current air temperature in °C
 * @param targetTemp - Target air temperature in °C
 * @param massFlowRate - Air mass flow rate in kg/s
 * @returns Required cooling power in watts (absolute value)
 */
export function calculateCoolingPower(
    temp: number,
    targetTemp: number,
    massFlowRate: number
): number {
    // For cooling, we take absolute value since power is always positive
    return Math.abs(calculateHeatingPower(temp, targetTemp, massFlowRate));
}

/**
 * Calculate power required for humidity adjustment
 * @param temp - Current air temperature in °C
 * @param humidity - Current relative humidity in %
 * @param targetHumidity - Target relative humidity in %
 * @param massFlowRate - Air mass flow rate in kg/s
 * @returns Required power in watts (absolute value)
 */
export function calculateHumidityPower(
    temp: number,
    humidity: number,
    targetHumidity: number,
    massFlowRate: number
): number {
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
