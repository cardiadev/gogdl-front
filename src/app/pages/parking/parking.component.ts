import { Component, OnInit, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { ParkingCardComponent, ParkingLot } from '../../shared/parking-card/parking-card.component';
import { CommonModule } from '@angular/common';
import { UnsplashService } from '../../services/unsplash.service';
import { environment } from '../../../environments/environment';

export interface FilterOption {
  id: string;
  labelKey: string;
  icon: string;
  isActive: boolean;
}

@Component({
  selector: 'app-parking',
  imports: [MatIconModule, TranslateModule, BottomNavComponent, ParkingCardComponent, CommonModule],
  templateUrl: './parking.component.html',
  styleUrl: './parking.component.scss'
})
export class ParkingComponent implements OnInit {

  // Signals para manejo de estado
  private allParkingLots = signal<ParkingLot[]>([]);
  private activeFilter = signal<string>('all');
  private isLoadingImages = signal<boolean>(true);

  // Computed properties
  nearbyParkingLots = computed(() => this.getFilteredParkingLots());
  favoriteParkingLots = computed(() => this.allParkingLots().filter(lot => lot.isFavorite));

  // Opciones de filtro
  filterOptions: FilterOption[] = [
    { id: 'all', labelKey: 'PARKING.FILTERS.ALL', icon: 'apps', isActive: true },
    { id: 'best_rated', labelKey: 'PARKING.FILTERS.BEST_RATED', icon: 'star', isActive: false },
    { id: 'open_now', labelKey: 'PARKING.FILTERS.OPEN_NOW', icon: 'schedule', isActive: false },
    { id: 'available', labelKey: 'PARKING.FILTERS.AVAILABLE', icon: 'local_parking', isActive: false },
    { id: 'nearby', labelKey: 'PARKING.FILTERS.NEARBY', icon: 'near_me', isActive: false }
  ];

  constructor(private unsplashService: UnsplashService) {}

  ngOnInit() {
    this.loadMockData();
  }

  private getDefaultParkingImage(index: number = 0): string {
    // Use the service's purple placeholder
    return this.unsplashService.getPurplePlaceholder(index + 1);
  }

  private async loadMockData() {
    // Datos base de estacionamientos
    const parkingBaseData = [
      {
        id: 1,
        name: 'AutoPlaza Chapultepec Premium',
        rating: 4.9,
        reviewCount: 201,
        distance: '1.2 Km',
        pricePerHour: 15,
        availableSpots: 45,
        totalSpots: 100,
        isFavorite: false,
        availability: 'available' as const
      },
      {
        id: 2,
        name: 'Centro Magno Mall',
        rating: 4.7,
        reviewCount: 189,
        distance: '0.8 Km',
        pricePerHour: 20,
        availableSpots: 12,
        totalSpots: 80,
        isFavorite: true,
        availability: 'limited' as const
      },
      {
        id: 3,
        name: 'Plaza Tapatía Cultural',
        rating: 4.5,
        reviewCount: 156,
        distance: '0.3 Km',
        pricePerHour: 12,
        availableSpots: 78,
        totalSpots: 120,
        isFavorite: false,
        availability: 'available' as const
      },
      {
        id: 4,
        name: 'Galerías Guadalajara Shopping Center',
        rating: 4.3,
        reviewCount: 234,
        distance: '2.1 Km',
        pricePerHour: 18,
        availableSpots: 0,
        totalSpots: 200,
        isFavorite: false,
        availability: 'full' as const
      },
      {
        id: 5,
        name: 'Mercado San Juan de Dios',
        rating: 4.1,
        reviewCount: 98,
        distance: '1.5 Km',
        pricePerHour: 10,
        availableSpots: 25,
        totalSpots: 60,
        isFavorite: true,
        availability: 'available' as const
      },
      {
        id: 6,
        name: 'Andares Luxury Mall',
        rating: 4.8,
        reviewCount: 312,
        distance: '3.2 Km',
        pricePerHour: 25,
        availableSpots: 89,
        totalSpots: 150,
        isFavorite: false,
        availability: 'available' as const
      },
      {
        id: 7,
        name: 'Expo Guadalajara',
        rating: 4.2,
        reviewCount: 145,
        distance: '4.5 Km',
        pricePerHour: 22,
        availableSpots: 5,
        totalSpots: 300,
        isFavorite: false,
        availability: 'limited' as const
      },
      {
        id: 8,
        name: 'Plaza Universidad',
        rating: 3.9,
        reviewCount: 87,
        distance: '2.8 Km',
        pricePerHour: 14,
        availableSpots: 0,
        totalSpots: 70,
        isFavorite: false,
        availability: 'full' as const
      }
    ];

    // Cargar imágenes usando el nuevo servicio
    try {
      this.isLoadingImages.set(true);

      this.unsplashService.getRandomParkingImages(parkingBaseData.length).subscribe({
        next: (imageUrls: string[]) => {
          const parkingData: ParkingLot[] = parkingBaseData.map((parking, index) => ({
            ...parking,
            imageUrl: imageUrls[index] || this.getDefaultParkingImage(index)
          }));

          this.allParkingLots.set(parkingData);
          this.isLoadingImages.set(false);
        },
        error: (error) => {
          console.warn('Error loading images:', error);
          const parkingData: ParkingLot[] = parkingBaseData.map((parking, index) => ({
            ...parking,
            imageUrl: this.getDefaultParkingImage(index)
          }));

          this.allParkingLots.set(parkingData);
          this.isLoadingImages.set(false);
        }
      });
    } catch (error) {
      console.error('Error in loadMockData:', error);
      const parkingData: ParkingLot[] = parkingBaseData.map((parking, index) => ({
        ...parking,
        imageUrl: this.getDefaultParkingImage(index)
      }));

      this.allParkingLots.set(parkingData);
      this.isLoadingImages.set(false);
    }
  }

  private getFilteredParkingLots(): ParkingLot[] {
    const filter = this.activeFilter();
    const allLots = this.allParkingLots();

    switch (filter) {
      case 'best_rated':
        return [...allLots].sort((a, b) => b.rating - a.rating);

      case 'open_now':
        // Simular que algunos están "abiertos ahora" (rating > 4.0)
        return allLots.filter(lot => lot.rating > 4.0);

      case 'available':
        return allLots.filter(lot => lot.availability === 'available');

      case 'nearby':
        return [...allLots].sort((a, b) => {
          const distanceA = parseFloat(a.distance.split(' ')[0]);
          const distanceB = parseFloat(b.distance.split(' ')[0]);
          return distanceA - distanceB;
        });

      default: // 'all'
        return allLots;
    }
  }

  selectFilter(filterId: string) {
    // Actualizar estado de filtros
    this.filterOptions.forEach(option => {
      option.isActive = option.id === filterId;
    });

    // Actualizar filtro activo
    this.activeFilter.set(filterId);
  }

  // Método para recargar imágenes manualmente (útil para testing)
  refreshImages() {
    this.loadMockData();
  }

  // Getter para mostrar estado de carga
  get isLoading() {
    return this.isLoadingImages();
  }

  onDirections(parkingLot: ParkingLot) {
    console.log('Navigate to:', parkingLot.name);
    // Aquí implementarías la navegación con Google Maps o similar
  }

  onShare(parkingLot: ParkingLot) {
    console.log('Share:', parkingLot.name);
    // Aquí implementarías el compartir nativo del dispositivo
  }

  onToggleFavorite(parkingLot: ParkingLot) {
    // Actualizar estado de favorito
    const allLots = this.allParkingLots();
    const updatedLots = allLots.map(lot =>
      lot.id === parkingLot.id
        ? { ...lot, isFavorite: !lot.isFavorite }
        : lot
    );
    this.allParkingLots.set(updatedLots);
  }
}
