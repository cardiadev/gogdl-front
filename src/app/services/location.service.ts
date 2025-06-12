import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MockCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface DirectionsResponse {
  routes: Route[];
  waypoints: Waypoint[];
  code: string;
  uuid: string;
}

export interface Route {
  geometry: string;
  legs: Leg[];
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
}

export interface Leg {
  summary: string;
  weight: number;
  duration: number;
  steps: Step[];
  distance: number;
}

export interface Step {
  geometry: string;
  maneuver: Maneuver;
  mode: string;
  driving_side: string;
  name: string;
  intersections: any[];
  weight: number;
  duration: number;
  distance: number;
  voiceInstructions: any[];
  bannerInstructions: any[];
}

export interface Maneuver {
  bearing_after: number;
  bearing_before?: number;
  location: [number, number];
  modifier?: string;
  type: string;
  instruction: string;
}

export interface Waypoint {
  hint: string;
  distance: number;
  name: string;
  location: [number, number];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly baseUrl = 'https://api.mapbox.com/directions/v5/mapbox';
  private readonly accessToken = environment.MAPBOX_TOKEN;

  private userLocationSubject = new BehaviorSubject<UserLocation | null>(null);
  public userLocation$ = this.userLocationSubject.asObservable();

  // Mock location for testing
  private mockLocation: MockCoordinates | null = null;

  constructor(private http: HttpClient) {}

  getCurrentLocation(): Observable<UserLocation> {
    return new Observable(observer => {
      // If mock location is set, use it instead of real GPS
      if (this.mockLocation) {
        const location: UserLocation = {
          latitude: this.mockLocation.latitude,
          longitude: this.mockLocation.longitude,
          accuracy: this.mockLocation.accuracy
        };
        this.userLocationSubject.next(location);
        observer.next(location);
        observer.complete();
        return;
      }

      if (!navigator.geolocation) {
        observer.error('Geolocalización no soportada');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.userLocationSubject.next(location);
          observer.next(location);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }

  watchPosition(): Observable<UserLocation> {
    return new Observable(observer => {
      // If mock location is set, emit it periodically
      if (this.mockLocation) {
        const location: UserLocation = {
          latitude: this.mockLocation.latitude,
          longitude: this.mockLocation.longitude,
          accuracy: this.mockLocation.accuracy
        };
        this.userLocationSubject.next(location);
        observer.next(location);

        // Emit the same location every 5 seconds for consistency
        const interval = setInterval(() => {
          if (this.mockLocation) {
            observer.next(location);
          } else {
            clearInterval(interval);
          }
        }, 5000);

        return () => {
          clearInterval(interval);
        };
      }

      if (!navigator.geolocation) {
        observer.error('Geolocalización no soportada');
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.userLocationSubject.next(location);
          observer.next(location);
        },
        (error) => {
          observer.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minuto
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }

  getDirections(
    origin: [number, number],
    destination: [number, number],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Observable<DirectionsResponse> {
    if (!this.accessToken) {
      return of({} as DirectionsResponse);
    }

    const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    const url = `${this.baseUrl}/${profile}/${coordinates}`;

    const params = {
      access_token: this.accessToken,
      geometries: 'geojson',
      steps: 'true',
      voice_instructions: 'true',
      banner_instructions: 'true',
      language: 'es'
    };

    return this.http.get<DirectionsResponse>(url, { params }).pipe(
      catchError((error) => {
        console.error('Error getting directions:', error);
        return of({} as DirectionsResponse);
      })
    );
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distancia en kilómetros
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  getUserLocation(): UserLocation | null {
    return this.userLocationSubject.value;
  }

  // Mock location methods for testing
  setMockLocation(coords: MockCoordinates): void {
    this.mockLocation = coords;
    const location: UserLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy
    };
    this.userLocationSubject.next(location);
  }

  clearMockLocation(): void {
    this.mockLocation = null;
    // Trigger a new location request to get real GPS location
    this.getCurrentLocation().subscribe();
  }

  isMockLocationActive(): boolean {
    return this.mockLocation !== null;
  }
}
