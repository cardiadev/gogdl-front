import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MapboxSearchService, MapboxSearchResult } from '../../services/mapbox-search.service';

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
  searchTerm = '';
  searchResults = signal<MapboxSearchResult[]>([]);
  isSearching = signal(false);
  showResults = signal(false);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private mapboxSearchService: MapboxSearchService) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
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
    this.mapboxSearchService.searchPlaces(query).subscribe({
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
    // Aquí puedes emitir un evento o llamar a un servicio para manejar la selección
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
}
