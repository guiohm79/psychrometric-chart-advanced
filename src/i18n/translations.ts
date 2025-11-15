/**
 * Internationalization (i18n) Translations
 * Supported languages: French (fr), English (en), Spanish (es), German (de)
 */

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de';

export interface TranslationStrings {
    // Error messages
    noPointsConfigured: string;
    noValidEntity: string;
    noDataAvailable: string;

    // Main labels
    temperature: string;
    humidity: string;
    dewPoint: string;
    wetBulbTemp: string;
    enthalpy: string;
    waterContent: string;
    absoluteHumidity: string;
    specificVolume: string;
    pmvIndex: string;
    moldRisk: string;

    // Actions
    action: string;
    totalPower: string;
    heating: string;
    cooling: string;
    humidification: string;
    dehumidification: string;
    idealSetpoint: string;

    // Comfort
    optimalComfort: string;
    outsideComfort: string;
    comfortZone: string;

    // Legend and UI
    legend: string;
    minimum: string;
    average: string;
    maximum: string;
    clickToViewHistory: string;

    // Action texts
    warm: string;
    cool: string;
    andHumidify: string;
    andDehumidify: string;
    historyLast24h: string;
    dataPoints: string;

    // Mold risk levels
    moldRiskNone: string;
    moldRiskVeryLow: string;
    moldRiskLow: string;
    moldRiskModerate: string;
    moldRiskHigh: string;
    moldRiskVeryHigh: string;
    moldRiskCritical: string;
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
    fr: {
        // Error messages
        noPointsConfigured: 'Aucun point ou entité configuré dans la carte !',
        noValidEntity: 'Aucune entité valide trouvée !',
        noDataAvailable: 'Aucune donnée disponible',

        // Main labels
        temperature: 'Température',
        humidity: 'Humidité',
        dewPoint: 'Point de rosée',
        wetBulbTemp: 'Temp. humide',
        enthalpy: 'Enthalpie',
        waterContent: 'Teneur eau',
        absoluteHumidity: 'Humidité abs.',
        specificVolume: 'Vol. spécifique',
        pmvIndex: 'Indice PMV',
        moldRisk: 'Moisissure',

        // Actions
        action: 'Action',
        totalPower: 'Puissance totale',
        heating: 'Chauffage',
        cooling: 'Refroidissement',
        humidification: 'Humidification',
        dehumidification: 'Déshumidification',
        idealSetpoint: 'Consigne idéale',

        // Comfort
        optimalComfort: 'Confort optimal',
        outsideComfort: 'Hors confort',
        comfortZone: 'Zone de confort',

        // Legend and UI
        legend: 'Légende',
        minimum: 'Minimum',
        average: 'Moyenne',
        maximum: 'Maximum',
        clickToViewHistory: 'Cliquer pour voir l\'historique',

        // Action texts
        warm: 'Réchauffer',
        cool: 'Refroidir',
        andHumidify: 'et Humidifier',
        andDehumidify: 'et Déshumidifier',
        historyLast24h: 'Historique des dernières 24 heures',
        dataPoints: 'points de données',

        // Mold risk levels
        moldRiskNone: 'Aucun risque',
        moldRiskVeryLow: 'Très faible',
        moldRiskLow: 'Faible',
        moldRiskModerate: 'Modéré',
        moldRiskHigh: 'Élevé',
        moldRiskVeryHigh: 'Très élevé',
        moldRiskCritical: 'Critique'
    },
    en: {
        // Error messages
        noPointsConfigured: 'No points or entities configured in the card!',
        noValidEntity: 'No valid entities found!',
        noDataAvailable: 'No data available',

        // Main labels
        temperature: 'Temperature',
        humidity: 'Humidity',
        dewPoint: 'Dew point',
        wetBulbTemp: 'Wet bulb temp.',
        enthalpy: 'Enthalpy',
        waterContent: 'Water content',
        absoluteHumidity: 'Absolute humidity',
        specificVolume: 'Specific volume',
        pmvIndex: 'PMV Index',
        moldRisk: 'Mold risk',

        // Actions
        action: 'Action',
        totalPower: 'Total power',
        heating: 'Heating',
        cooling: 'Cooling',
        humidification: 'Humidification',
        dehumidification: 'Dehumidification',
        idealSetpoint: 'Ideal setpoint',

        // Comfort
        optimalComfort: 'Optimal comfort',
        outsideComfort: 'Outside comfort',
        comfortZone: 'Comfort zone',

        // Legend and UI
        legend: 'Legend',
        minimum: 'Minimum',
        average: 'Average',
        maximum: 'Maximum',
        clickToViewHistory: 'Click to view history',

        // Action texts
        warm: 'Warm up',
        cool: 'Cool down',
        andHumidify: 'and Humidify',
        andDehumidify: 'and Dehumidify',
        historyLast24h: 'History of the last 24 hours',
        dataPoints: 'data points',

        // Mold risk levels
        moldRiskNone: 'No risk',
        moldRiskVeryLow: 'Very low',
        moldRiskLow: 'Low',
        moldRiskModerate: 'Moderate',
        moldRiskHigh: 'High',
        moldRiskVeryHigh: 'Very high',
        moldRiskCritical: 'Critical'
    },
    es: {
        // Error messages
        noPointsConfigured: '¡No hay puntos o entidades configuradas en la tarjeta!',
        noValidEntity: '¡No se encontraron entidades válidas!',
        noDataAvailable: 'No hay datos disponibles',

        // Main labels
        temperature: 'Temperatura',
        humidity: 'Humedad',
        dewPoint: 'Punto de rocío',
        wetBulbTemp: 'Temp. húmeda',
        enthalpy: 'Entalpía',
        waterContent: 'Contenido agua',
        absoluteHumidity: 'Humedad abs.',
        specificVolume: 'Vol. específico',
        pmvIndex: 'Índice PMV',
        moldRisk: 'Moho',

        // Actions
        action: 'Acción',
        totalPower: 'Potencia total',
        heating: 'Calefacción',
        cooling: 'Refrigeración',
        humidification: 'Humidificación',
        dehumidification: 'Deshumidificación',
        idealSetpoint: 'Consigna ideal',

        // Comfort
        optimalComfort: 'Confort óptimo',
        outsideComfort: 'Fuera de confort',
        comfortZone: 'Zona de confort',

        // Legend and UI
        legend: 'Leyenda',
        minimum: 'Mínimo',
        average: 'Promedio',
        maximum: 'Máximo',
        clickToViewHistory: 'Haz clic para ver el historial',

        // Action texts
        warm: 'Calentar',
        cool: 'Enfriar',
        andHumidify: 'y Humidificar',
        andDehumidify: 'y Deshumidificar',
        historyLast24h: 'Historial de las últimas 24 horas',
        dataPoints: 'puntos de datos',

        // Mold risk levels
        moldRiskNone: 'Sin riesgo',
        moldRiskVeryLow: 'Muy bajo',
        moldRiskLow: 'Bajo',
        moldRiskModerate: 'Moderado',
        moldRiskHigh: 'Alto',
        moldRiskVeryHigh: 'Muy alto',
        moldRiskCritical: 'Crítico'
    },
    de: {
        // Error messages
        noPointsConfigured: 'Keine Punkte oder Entitäten in der Karte konfiguriert!',
        noValidEntity: 'Keine gültigen Entitäten gefunden!',
        noDataAvailable: 'Keine Daten verfügbar',

        // Main labels
        temperature: 'Temperatur',
        humidity: 'Luftfeuchtigkeit',
        dewPoint: 'Taupunkt',
        wetBulbTemp: 'Feuchtkugeltemp.',
        enthalpy: 'Enthalpie',
        waterContent: 'Wassergehalt',
        absoluteHumidity: 'Abs. Feuchtigkeit',
        specificVolume: 'Spez. Volumen',
        pmvIndex: 'PMV-Index',
        moldRisk: 'Schimmel',

        // Actions
        action: 'Aktion',
        totalPower: 'Gesamtleistung',
        heating: 'Heizung',
        cooling: 'Kühlung',
        humidification: 'Befeuchtung',
        dehumidification: 'Entfeuchtung',
        idealSetpoint: 'Idealer Sollwert',

        // Comfort
        optimalComfort: 'Optimaler Komfort',
        outsideComfort: 'Außerhalb Komfort',
        comfortZone: 'Komfortzone',

        // Legend and UI
        legend: 'Legende',
        minimum: 'Minimum',
        average: 'Durchschnitt',
        maximum: 'Maximum',
        clickToViewHistory: 'Klicken Sie, um den Verlauf anzuzeigen',

        // Action texts
        warm: 'Erwärmen',
        cool: 'Abkühlen',
        andHumidify: 'und Befeuchten',
        andDehumidify: 'und Entfeuchten',
        historyLast24h: 'Verlauf der letzten 24 Stunden',
        dataPoints: 'Datenpunkte',

        // Mold risk levels
        moldRiskNone: 'Kein Risiko',
        moldRiskVeryLow: 'Sehr niedrig',
        moldRiskLow: 'Niedrig',
        moldRiskModerate: 'Mäßig',
        moldRiskHigh: 'Hoch',
        moldRiskVeryHigh: 'Sehr hoch',
        moldRiskCritical: 'Kritisch'
    }
};
