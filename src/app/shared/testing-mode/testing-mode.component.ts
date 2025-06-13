import { Component, computed, inject, signal } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { AppStateService } from '../../services/app-state.service';
import { LocationService, MockCoordinates } from '../../services/location.service';

@Component({
  selector: 'app-testing-mode',
  imports: [MatIconModule, MatSlideToggleModule, TranslateModule],
  templateUrl: './testing-mode.component.html',
  styleUrl: './testing-mode.component.scss'
})
export class TestingModeComponent {
  // Injected services
  private appStateService = inject(AppStateService);
  private locationService = inject(LocationService);

  // Variables
  isMenuOpen = signal(false);

  // Test locations from mapbox API response example
  private testLocations = {
    origin: {
      lat: 20.674289,
      lng: -103.386854,
      name: 'Ubicación de Origen (Calle Ingeniero Gabriel Castaños)'
    },
    destination: {
      lat: 20.689791,
      lng: -103.417812,
      name: 'Ubicación de Destino (Avenida de la Patria)'
    }
  };

  // Computed properties
  currentLanguage = computed(() => this.appStateService.appState().language);
  isSplashEnabled = computed(() => this.appStateService.appState().splashEnabled);

  // Functions
  setLanguage(language: 'es' | 'en'): void {
    this.appStateService.updateAppState('language', language);
  }

  toggleLanguage(): void {
    const newLanguage = this.currentLanguage() === 'en' ? 'es' : 'en';
    this.appStateService.updateAppState('language', newLanguage);
  }

  clearLocalStorage(): void {
    localStorage.clear();
    location.reload();
  }

  resetUserData(): void {
    // Restaurar datos dummy iniciales
    const defaultUserData = {
      firstName: 'Carlos Javier',
      lastName: 'Díaz Flores',
      email: 'carlos.diaz@gmail.com',
      birthDate: new Date(1989, 4, 23), // May 23, 1989
      password: 'mySecurePass123'
    };

    localStorage.setItem('userProfile', JSON.stringify(defaultUserData));
    console.log('User profile reset to default data:', defaultUserData);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  toggleSplashScreen(): void {
    const newSplashState = !this.isSplashEnabled();
    this.appStateService.updateAppState('splashEnabled', newSplashState);
  }

  setTestLocationAsOrigin(): void {
    const testLocation: MockCoordinates = {
      latitude: this.testLocations.origin.lat,
      longitude: this.testLocations.origin.lng,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    };

    // Simular que es la ubicación actual del usuario
    this.locationService.setMockLocation(testLocation);
    console.log('Test location set as current position:', this.testLocations.origin.name);
  }

  setTestLocationAsDestination(): void {
    const testLocation: MockCoordinates = {
      latitude: this.testLocations.destination.lat,
      longitude: this.testLocations.destination.lng,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    };

    // Simular que es la ubicación actual del usuario
    this.locationService.setMockLocation(testLocation);
    console.log('Test location set as current position:', this.testLocations.destination.name);
  }

  resetToRealLocation(): void {
    this.locationService.clearMockLocation();
    console.log('Cleared mock location, using real GPS location');
  }

  generateTestRoute(): void {
    // Generar una ruta entre las dos ubicaciones del JSON de ejemplo
    const origin: [number, number] = [this.testLocations.origin.lng, this.testLocations.origin.lat];
    const destination: [number, number] = [this.testLocations.destination.lng, this.testLocations.destination.lat];

    console.log('Generando ruta de prueba desde:', this.testLocations.origin.name);
    console.log('Hacia:', this.testLocations.destination.name);

    this.locationService.getDirections(origin, destination, 'driving').subscribe({
      next: (directionsResponse) => {
        console.log('Ruta de prueba generada:', directionsResponse);

        if (directionsResponse.routes && directionsResponse.routes.length > 0) {
          const route = directionsResponse.routes[0];
          const durationMinutes = Math.round(route.duration / 60);
          const distanceKm = (route.distance / 1000).toFixed(1);

          console.log(`Ruta: ${distanceKm}km, ${durationMinutes} minutos`);

          // Establecer la ruta de prueba en el servicio para que el mapa la muestre
          this.locationService.setTestRoute(directionsResponse);
        }
      },
      error: (error) => {
        console.error('Error generando ruta de prueba:', error);
      }
    });
  }

  clearTestRoute(): void {
    this.locationService.clearTestRoute();
    console.log('Ruta de prueba limpiada');
  }
}
