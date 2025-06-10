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
}
