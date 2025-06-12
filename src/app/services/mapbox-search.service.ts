import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MapboxSearchResult {
  mapbox_id: string;
  name: string;
  feature_type: string;
  address?: string;
  full_address: string;
  place_formatted: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  context?: {
    country?: { name: string; country_code: string; };
    region?: { name: string };
    place?: { name: string };
    address?: {
      name: string;
      address_number?: string;
      street_name?: string;
    };
    street?: { name: string };
    postcode?: { name: string };
  };
  language?: string;
  maki?: string;
  poi_category?: string[];
  poi_category_ids?: string[];
  distance?: number;
}

export interface MapboxSearchResponse {
  suggestions: MapboxSearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class MapboxSearchService {
  private readonly baseUrl = 'https://api.mapbox.com/search/searchbox/v1';
  private readonly accessToken = environment.MAPBOX_TOKEN;

  constructor(private http: HttpClient) {}

  searchPlaces(query: string, proximity?: [number, number]): Observable<MapboxSearchResult[]> {
    if (!query.trim() || !this.accessToken) {
      return of([]);
    }

    const params: any = {
      q: query,
      access_token: this.accessToken,
      session_token: this.generateSessionToken(),
      types: 'poi,address',
      limit: 8,
      language: 'es'
    };

    // Si tenemos coordenadas de proximidad, las agregamos
    if (proximity) {
      params.proximity = `${proximity[0]},${proximity[1]}`;
    }

    return this.http.get<MapboxSearchResponse>(`${this.baseUrl}/suggest`, { params }).pipe(
      catchError((error) => {
        console.error('Mapbox Search API error:', error);
        return of({ suggestions: [] });
      }),
      switchMap((response: MapboxSearchResponse) => of(response.suggestions || []))
    );
  }

  // Método para obtener detalles completos de un lugar seleccionado
  retrievePlace(mapboxId: string): Observable<MapboxSearchResult | null> {
    if (!mapboxId || !this.accessToken) {
      return of(null);
    }

    const params = {
      access_token: this.accessToken,
      session_token: this.generateSessionToken()
    };

    return this.http.get<any>(`${this.baseUrl}/retrieve/${mapboxId}`, { params }).pipe(
      catchError((error) => {
        console.error('Mapbox Retrieve API error:', error);
        return of(null);
      }),
      switchMap((response) => {
        if (response && response.features && response.features.length > 0) {
          const feature = response.features[0];
          const result: MapboxSearchResult = {
            mapbox_id: feature.properties.mapbox_id,
            name: feature.properties.name,
            feature_type: feature.properties.feature_type,
            address: feature.properties.address,
            full_address: feature.properties.full_address,
            place_formatted: feature.properties.place_formatted,
            coordinates: {
              longitude: feature.geometry.coordinates[0],
              latitude: feature.geometry.coordinates[1]
            },
            context: feature.properties.context,
            language: feature.properties.language,
            maki: feature.properties.maki,
            poi_category: feature.properties.poi_category,
            poi_category_ids: feature.properties.poi_category_ids,
            distance: feature.properties.distance
          };
          return of(result);
        }
        return of(null);
      })
    );
  }

  private generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
