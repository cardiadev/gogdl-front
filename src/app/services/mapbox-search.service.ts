import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MapboxSearchResult {
  id: string;
  name: string;
  full_address: string;
  place_formatted: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  context?: {
    country?: { name: string };
    region?: { name: string };
    place?: { name: string };
  };
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

  private generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
