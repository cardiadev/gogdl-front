import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { SearchBarComponent } from 'src/app/shared/search-bar/search-bar.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { MapboxSearchResult } from '../../services/mapbox-search.service';
import { LocationService, UserLocation, DirectionsResponse } from '../../services/location.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [
    MapViewComponent,
    BottomNavComponent,
    SearchBarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentDestination: MapboxSearchResult | null = null;
  currentRoute: DirectionsResponse | null = null;
  userLocation: UserLocation | null = null;
  showDestinationPin = false;

  constructor(
    private locationService: LocationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Suscribirse a la ubicación del usuario
    this.locationService.userLocation$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(location => {
      this.userLocation = location;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDestinationSelected(destination: MapboxSearchResult) {
    console.log('Destino seleccionado en Home:', destination);
    this.currentDestination = destination;
    this.showDestinationPin = true;

    // Mostrar el pin en el mapa inmediatamente
    // Aquí puedes pasar el destino al componente del mapa para mostrar el pin

    // Mostrar diálogo de confirmación
    this.showConfirmationDialog(destination);
  }

  private showConfirmationDialog(destination: MapboxSearchResult) {
    const dialogData: ConfirmationDialogData = {
      destination: destination
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: false,
      panelClass: 'confirmation-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Usuario confirmó - generar ruta
        this.generateRoute(destination);
      } else {
        // Usuario canceló - mantener solo el pin
        console.log('Usuario canceló la navegación, manteniendo solo el pin');
      }
    });
  }

  private generateRoute(destination: MapboxSearchResult) {
    if (!this.userLocation) {
      console.error('No se tiene la ubicación del usuario');
      return;
    }

    console.log('Generando ruta hacia:', destination.name);

    // Generar la ruta usando la Directions API
    const origin: [number, number] = [this.userLocation.longitude, this.userLocation.latitude];
    const destinationCoords: [number, number] = [destination.coordinates.longitude, destination.coordinates.latitude];

    this.locationService.getDirections(origin, destinationCoords, 'driving').subscribe({
      next: (directionsResponse) => {
        console.log('Respuesta de direcciones:', directionsResponse);
        this.currentRoute = directionsResponse;

        if (directionsResponse.routes && directionsResponse.routes.length > 0) {
          const route = directionsResponse.routes[0];
          console.log(`Ruta encontrada: ${route.distance}m, ${Math.round(route.duration / 60)} minutos`);

          // Aquí puedes pasar la ruta al componente del mapa para mostrarla
          // También puedes mostrar información de la ruta en la UI
        }
      },
      error: (error) => {
        console.error('Error obteniendo direcciones:', error);
      }
    });
  }

  // Método para calcular tiempo estimado en formato legible
  getRouteTimeText(): string {
    if (!this.currentRoute || !this.currentRoute.routes || this.currentRoute.routes.length === 0) {
      return '';
    }

    const duration = this.currentRoute.routes[0].duration;
    const minutes = Math.round(duration / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    } else {
      return `${minutes}min`;
    }
  }

  // Método para obtener distancia en formato legible
  getRouteDistanceText(): string {
    if (!this.currentRoute || !this.currentRoute.routes || this.currentRoute.routes.length === 0) {
      return '';
    }

    const distance = this.currentRoute.routes[0].distance;
    const km = (distance / 1000).toFixed(1);
    return `${km} km`;
  }

  // Método para limpiar el destino y la ruta
  clearDestinationAndRoute() {
    this.currentDestination = null;
    this.currentRoute = null;
    this.showDestinationPin = false;
  }
}
