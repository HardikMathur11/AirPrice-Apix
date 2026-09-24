export type ScreenId =
  | 'landing'
  | 'overview'
  | 'routes'
  | 'when-to-book'
  | 'forecast'
  | 'shocks'
  | 'inflation'
  | 'reliability'
  | 'api'
  | 'health';

export type UserMode = 'citizen' | 'policy';

export type Language = 'en' | 'hi';

export type AlertSeverity = 'critical' | 'warning' | 'normal';

export interface RouteData {
  id: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  currentFare: number;
  normalFare: number;
  avg30DFare: number;
  minFare: number;
  maxFare: number;
  changePercent: number;
  status: AlertSeverity;
  reliabilityScore: number;
  sourcesCount: number;
  dailyFlights: number;
  missingDataPercent: number;
  bestBookingWindowDays: string;
  potentialSavings: number;
  inflationContributionPercent: number;
  reason?: string;
  carriers: {
    airline: string;
    fare: number;
    flightsPerDay: number;
    onTimeRate: number;
  }[];
}

export interface FareShockAlert {
  id: string;
  routeId: string;
  routeLabel: string;
  origin: string;
  destination: string;
  severity: 'severe' | 'moderate';
  currentFare: number;
  normalFare: number;
  deviationPercent: number;
  detectedTime: string;
  reason: string;
  detailedAnalysis: {
    seatAvailabilityIndex: number;
    fuelImpactPercent: number;
    demandSurgeRatio: number;
    recommendedAction: string;
    regulatoryFlag: boolean;
  };
}

export interface TrendPoint {
  date: string;
  current: number;
  previous: number;
  baseline: number;
  change: number;
}

export interface ForecastPoint {
  date: string;
  historical?: number;
  predicted?: number;
  upperBand?: number;
  lowerBand?: number;
  type: 'past' | 'today' | 'future';
}

export interface InflationFactor {
  category: string;
  amount: number;
  percentage: number;
  description: string;
  color: string;
}

export interface ScraperSource {
  id: string;
  name: string;
  type: 'Airlines' | 'OTA' | 'GDS';
  status: 'operational' | 'warning' | 'critical';
  successRate: number;
  lastScraped: string;
  failedRequests24h: number;
  captchaIncidents: number;
  avgLatencyMs: number;
}

export interface SystemMetric {
  activeAlerts: number;
  severeAlerts: number;
  moderateAlerts: number;
  routesMonitored: number;
  totalDailyFlights: number;
  apixCurrent: number;
  apixPrevMonth: number;
  apixChangePercent: number;
  avgFareIndia: number;
  avgFareChangePercent: number;
  reliabilityScore: number;
  lastUpdated: string;
}
