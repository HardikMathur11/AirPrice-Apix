const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_API_KEY = 'airprice_demo_key_2026';

export interface ApixCurrentResponse {
  calculation_date: string;
  apix_value: number;
  base_year_value: number;
  changes: {
    change_1d: number;
    change_7d: number;
    change_30d: number;
    change_365d: number;
  };
  total_routes: number;
  total_fares: number;
  status: string;
}

export interface ApixHistoricalResponse {
  frequency: string;
  start_date: string;
  end_date: string;
  total_records: number;
  data: Array<{
    date: string;
    apix_value: number;
    change_1d: number;
  }>;
}

export interface RouteItem {
  route_code: string;
  origin: string;
  destination: string;
  dgca_weight: number;
  tier: string;
  avg_fare_30d: number;
}

export interface RoutesListResponse {
  total_routes: number;
  routes: RouteItem[];
}

export interface FareItem {
  source: string;
  source_type: string;
  travel_date: string;
  booking_window: string;
  base_fare: number;
  taxes: number;
  convenience_fee: number;
  total_fare: number;
  availability: string;
  flight_number?: string;
  airline_code?: string;
}

export interface RoutePricesResponse {
  route_code: string;
  travel_date: string;
  booking_window: string;
  statistics: {
    min_fare: number;
    avg_fare: number;
    max_fare: number;
  };
  fares: FareItem[];
}

export interface ElasticityWindow {
  booking_window: string;
  avg_fare: number;
  savings_percent: number;
}

export interface CarrierElasticityItem {
  carrier: string;
  t1_fare: number;
  t7_fare: number;
  t15_fare: number;
  t30_fare: number;
  t45_fare: number;
  max_savings_percent: number;
  recommended_window: string;
}

export interface RouteElasticityResponse {
  route_code: string;
  optimal_booking_window: string;
  max_savings_percent: number;
  avg_amount_saved?: number;
  best_day_to_book?: string;
  windows: ElasticityWindow[];
  carrier_breakdown?: CarrierElasticityItem[];
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database_health: {
    postgresql: boolean;
    mongodb: boolean;
    redis: boolean;
  };
  next_crawl_time?: string;
}

async function apiFetch<T>(endpoint: string, apiKey: string = DEFAULT_API_KEY): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API Request failed with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export interface CarrierForecastItem {
  source: string;
  source_type: string;
  flight_number: string;
  airline_code: string;
  current_spot_fare: number;
  projected_7d: number;
  projected_15d: number;
  projected_30d: number;
  surge_probability_percent: number;
  recommendation: string;
}

export interface RouteForecastResponse {
  route_code: string;
  current_avg_spot_fare: number;
  projected_7d_avg: number;
  projected_15d_avg: number;
  projected_30d_avg: number;
  confidence_score_percent: number;
  carrier_forecasts: CarrierForecastItem[];
}

export const apiService = {
  getHealth: async (): Promise<HealthResponse> => {
    return apiFetch<HealthResponse>('/health', '');
  },

  getCurrentApix: async (apiKey?: string): Promise<ApixCurrentResponse> => {
    return apiFetch<ApixCurrentResponse>('/api/v1/apix/current', apiKey);
  },

  getHistoricalApix: async (
    frequency: string = 'daily',
    startDate?: string,
    endDate?: string,
    apiKey?: string
  ): Promise<ApixHistoricalResponse> => {
    let query = `/api/v1/apix/historical?frequency=${frequency}`;
    if (startDate) query += `&start_date=${startDate}`;
    if (endDate) query += `&end_date=${endDate}`;
    return apiFetch<ApixHistoricalResponse>(query, apiKey);
  },

  getRoutes: async (apiKey?: string): Promise<RoutesListResponse> => {
    return apiFetch<RoutesListResponse>('/api/v1/routes', apiKey);
  },

  getRoutePrices: async (
    routeCode: string,
    bookingWindow: string = 'T+7',
    travelDate?: string,
    apiKey?: string
  ): Promise<RoutePricesResponse> => {
    let query = `/api/v1/routes/${routeCode}/prices?booking_window=${bookingWindow}`;
    if (travelDate) query += `&travel_date=${travelDate}`;
    return apiFetch<RoutePricesResponse>(query, apiKey);
  },

  getRouteElasticity: async (
    routeCode: string,
    apiKey?: string
  ): Promise<RouteElasticityResponse> => {
    return apiFetch<RouteElasticityResponse>(`/api/v1/routes/${routeCode}/elasticity`, apiKey);
  },

  getAlerts: async (apiKey?: string): Promise<{ status: string; total_anomalies: number; alerts: any[] }> => {
    return apiFetch<{ status: string; total_anomalies: number; alerts: any[] }>('/api/v1/alerts', apiKey);
  },

  getRouteForecast: async (routeCode: string, apiKey?: string): Promise<RouteForecastResponse> => {
    return apiFetch<RouteForecastResponse>(`/api/v1/routes/${routeCode}/forecast`, apiKey);
  },
};
