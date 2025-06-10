import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
}

export interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UnsplashService {
  private readonly baseUrl = 'https://api.unsplash.com';
  private readonly accessKey = environment.UNSPLASH_ACCESS_KEY;

  constructor(private http: HttpClient) {}

  searchParkingImages(query: string = 'parking garage', perPage: number = 10): Observable<UnsplashResponse> {
    if (!this.accessKey) {
      return of(this.createEmptyResponse(perPage));
    }

    const url = `${this.baseUrl}/search/photos`;
    const params = {
      query,
      per_page: perPage.toString(),
      client_id: this.accessKey,
      orientation: 'landscape'
    };

    return this.http.get<UnsplashResponse>(url, { params }).pipe(
      catchError((error) => {
        console.error('Unsplash API error:', error);
        return of(this.createEmptyResponse(perPage));
      })
    );
  }

  getRandomParkingImages(count: number): Observable<string[]> {
    return new Observable(observer => {
      // Try different parking-related search terms for variety
      const searchTerms = [
        'parking garage',
        'car park',
        'parking lot',
        'underground parking',
        'parking structure',
        'parking building'
      ];

      const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

      this.searchParkingImages(searchTerm, count).subscribe(response => {
        if (response.results && response.results.length > 0) {
          const images = response.results.map(img => img.urls.regular);
          observer.next(images);
        } else {
          const placeholders = Array.from({ length: count }, (_, i) => this.getPurplePlaceholder(i + 1));
          observer.next(placeholders);
        }
        observer.complete();
      });
    });
  }

  getPurplePlaceholder(index: number): string {
    const svg = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill="#6200ea"/>
        <circle cx="120" cy="100" r="25" fill="white" opacity="0.3"/>
        <circle cx="280" cy="100" r="25" fill="white" opacity="0.3"/>
        <rect x="100" y="140" width="200" height="30" fill="white" opacity="0.2"/>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private createEmptyResponse(count: number): UnsplashResponse {
    const results: UnsplashImage[] = Array.from({ length: count }, (_, i) => ({
      id: `placeholder-${i + 1}`,
      urls: {
        regular: this.getPurplePlaceholder(i + 1),
        small: this.getPurplePlaceholder(i + 1),
        thumb: this.getPurplePlaceholder(i + 1)
      },
      alt_description: `Parking ${i + 1}`
    }));

    return {
      results,
      total: count,
      total_pages: 1
    };
  }
}
