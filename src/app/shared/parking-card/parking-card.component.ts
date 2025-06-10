import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { UnsplashService } from '../../services/unsplash.service';

export interface ParkingLot {
  id: number;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  distance: string;
  pricePerHour: number;
  availableSpots: number;
  totalSpots: number;
  isFavorite: boolean;
  availability: 'available' | 'limited' | 'full';
}

@Component({
  selector: 'app-parking-card',
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './parking-card.component.html',
  styleUrl: './parking-card.component.scss'
})
export class ParkingCardComponent {
  @Input() parkingLot!: ParkingLot;
  @Input() showActions: boolean = true;
  @Input() viewMode: 'cards' | 'list' = 'cards';

  @Output() onDirections = new EventEmitter<ParkingLot>();
  @Output() onShare = new EventEmitter<ParkingLot>();
  @Output() onToggleFavorite = new EventEmitter<ParkingLot>();

  private unsplashService = inject(UnsplashService);

  getAvailabilityClass(): string {
    switch (this.parkingLot.availability) {
      case 'available': return 'available';
      case 'limited': return 'limited';
      case 'full': return 'full';
      default: return 'available';
    }
  }

  getAvailabilityTextKey(): string {
    switch (this.parkingLot.availability) {
      case 'full': return 'PARKING.AVAILABILITY.FULL';
      case 'limited': return 'PARKING.AVAILABILITY.LIMITED';
      case 'available': return 'PARKING.AVAILABILITY.AVAILABLE';
      default: return 'PARKING.AVAILABILITY.AVAILABLE';
    }
  }

  getAvailabilityCount(): number {
    return this.parkingLot.availableSpots;
  }

  onDirectionsClick(): void {
    this.onDirections.emit(this.parkingLot);
  }

  onShareClick(): void {
    this.onShare.emit(this.parkingLot);
  }

  onFavoriteToggle(): void {
    this.onToggleFavorite.emit(this.parkingLot);
  }

  onImageError(event: any): void {
    // Use the service's purple placeholder when image fails to load
    event.target.src = this.unsplashService.getPurplePlaceholder(this.parkingLot.id);
  }

  getParkingColor(): string {
    // Generate a color based on parking lot ID
    const colors = ['#6200ea', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];
    return colors[this.parkingLot.id % colors.length];
  }

  getParkingInitial(): string {
    // Get the first letter of the parking lot name
    return this.parkingLot.name.charAt(0).toUpperCase();
  }

  getRandomTime(): string {
    // Generate random time intervals for list view
    const times = ['30 min', '1 hora', '2 horas', '3 horas', '45 min', '1h 30min'];
    return times[this.parkingLot.id % times.length];
  }

  getRandomDuration(): string {
    // Generate random durations for list view
    const durations = ['15min', '30min', '45min', '1h', '2h 30min', '1h 15min'];
    return durations[(this.parkingLot.id + 1) % durations.length];
  }
}
