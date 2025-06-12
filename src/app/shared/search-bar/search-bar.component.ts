import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MapboxSearchService, MapboxSearchResult } from '../../services/mapbox-search.service';
import { LocationService, UserLocation } from '../../services/location.service';

@Component({
  selector: 'app-search-bar',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() destinationSelected = new EventEmitter<MapboxSearchResult>();

  searchTerm = '';
  searchResults = signal<MapboxSearchResult[]>([]);
  isSearching = signal(false);
  showResults = signal(false);
  userLocation = signal<UserLocation | null>(null);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private mapboxSearchService: MapboxSearchService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });

    // Obtener ubicación del usuario
    this.locationService.getCurrentLocation().subscribe({
      next: (location) => {
        this.userLocation.set(location);
        console.log('Ubicación del usuario:', location);
      },
      error: (error) => {
        console.error('Error obteniendo ubicación:', error);
      }
    });

    // Suscribirse a cambios de ubicación
    this.locationService.userLocation$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(location => {
      this.userLocation.set(location);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput() {
    if (this.searchTerm.trim()) {
      this.isSearching.set(true);
      this.showResults.set(true);
      this.searchSubject.next(this.searchTerm);
    } else {
      this.clearSearch();
    }
  }

  private performSearch(query: string) {
    // Usar proximidad si tenemos la ubicación del usuario
    const proximity = this.userLocation()
      ? [this.userLocation()!.longitude, this.userLocation()!.latitude] as [number, number]
      : undefined;

    this.mapboxSearchService.searchPlaces(query, proximity).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  selectResult(result: MapboxSearchResult) {
    this.searchTerm = result.name;
    this.showResults.set(false);

    // Solo emitir evento de destino seleccionado para mostrar el pin
    this.destinationSelected.emit(result);

    console.log('Lugar seleccionado:', result);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults.set([]);
    this.showResults.set(false);
    this.isSearching.set(false);
  }

  hideResults() {
    // Pequeño delay para permitir clicks en los resultados
    setTimeout(() => {
      this.showResults.set(false);
    }, 150);
  }

  requestUserLocation() {
    this.locationService.getCurrentLocation().subscribe({
      next: (location) => {
        console.log('Ubicación actualizada:', location);
      },
      error: (error) => {
        console.error('Error obteniendo ubicación:', error);
        // Aquí podrías mostrar un mensaje al usuario
      }
    });
  }
}
