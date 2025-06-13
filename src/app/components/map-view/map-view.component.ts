import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  signal,
  inject,
  effect,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ControlComponent, MapComponent, MarkerComponent, NavigationControlDirective } from 'ngx-mapbox-gl';
import { LocationService, UserLocation, DirectionsResponse } from '../../services/location.service';
import { MapboxSearchResult } from '../../services/mapbox-search.service';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var mapboxgl: any;

@Component({
  selector: 'app-map-view',
  imports: [
  ],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  @Input() destination: MapboxSearchResult | null = null;
  @Input() route: DirectionsResponse | null = null;
  @Input() showDestinationPin = false;

  private destroy$ = new Subject<void>();
  private locationService = inject(LocationService);
  private map: any;

  center = signal<[number, number]>([-103.3496, 20.6597]); // Default to Guadalajara
  userLocation = signal<UserLocation | null>(null);

  constructor() {
    // Effect para reaccionar a cambios en la ruta
    effect(() => {
      if (this.route && this.map) {
        this.displayRoute(this.route);
      }
    });

    // Effect para reaccionar a cambios en el destino
    effect(() => {
      if (this.destination && this.map) {
        this.addDestinationMarker(this.destination);
      }
    });
  }

  ngOnInit(): void {
    // Suscribirse a la ubicación del usuario desde el servicio
    this.locationService.userLocation$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(location => {
      if (location) {
        this.userLocation.set(location);
        const coords: [number, number] = [location.longitude, location.latitude];
        this.center.set(coords);

        if (this.map) {
          this.map.setCenter(coords);
          this.addOriginMarker(coords);
        }
      }
    });

    // Suscribirse a las rutas de prueba
    this.locationService.testRoute$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(testRoute => {
      if (testRoute && this.map) {
        console.log('Mostrando ruta de prueba en el mapa:', testRoute);
        this.displayTestRoute(testRoute);
      } else if (testRoute === null && this.map) {
        console.log('Limpiando ruta de prueba del mapa');
        this.clearTestRoute();
      }
    });

    // Obtener ubicación inicial
    this.locationService.getCurrentLocation().subscribe({
      next: (location) => {
        // La ubicación se manejará a través del observable userLocation$
      },
      error: (error) => {
        console.error('Error obteniendo ubicación:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    mapboxgl.accessToken = environment.MAPBOX_TOKEN;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.center(),
      zoom: 13
    });

    this.map.on('load', () => {
      console.log('Mapa cargado');

      // Agregar marcador de origen si ya tenemos ubicación
      const currentLocation = this.userLocation();
      if (currentLocation) {
        const coords: [number, number] = [currentLocation.longitude, currentLocation.latitude];
        this.addOriginMarker(coords);
      }

      // Agregar marcador de destino si ya tenemos uno
      if (this.destination) {
        this.addDestinationMarker(this.destination);
      }

      // Mostrar ruta si ya tenemos una
      if (this.route) {
        this.displayRoute(this.route);
      }
    });

    // Agregar interactividad para hacer clic en el mapa
    this.map.on('click', (event: any) => {
      const coords = [event.lngLat.lng, event.lngLat.lat];
      console.log('Clic en el mapa:', coords);

      // Aquí podrías emitir un evento para que el componente padre maneje el clic
      // Por ahora solo logueamos las coordenadas
    });
  }

  private addOriginMarker(coords: [number, number]): void {
    // Remover marcador anterior si existe
    if (this.map.getLayer('origin-circle')) {
      this.map.removeLayer('origin-circle');
      this.map.removeSource('origin-circle');
    }

    // Agregar círculo verde para el origen
    this.map.addLayer({
      'id': 'origin-circle',
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'Point',
                'coordinates': coords
              }
            }
          ]
        }
      },
      'paint': {
        'circle-radius': 10,
        'circle-color': '#4ce05b'
      }
    });
  }

  private addDestinationMarker(destination: MapboxSearchResult): void {
    const coords: [number, number] = [destination.coordinates.longitude, destination.coordinates.latitude];

    // Remover marcador anterior si existe
    if (this.map.getLayer('destination-circle')) {
      this.map.removeLayer('destination-circle');
      this.map.removeSource('destination-circle');
    }

    // Agregar círculo rojo para el destino
    this.map.addLayer({
      'id': 'destination-circle',
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'Point',
                'coordinates': coords
              }
            }
          ]
        }
      },
      'paint': {
        'circle-radius': 10,
        'circle-color': '#f30'
      }
    });

    // Centrar el mapa para mostrar tanto origen como destino
    const currentLocation = this.userLocation();
    if (currentLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([currentLocation.longitude, currentLocation.latitude]);
      bounds.extend(coords);
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }

  private displayRoute(directionsResponse: DirectionsResponse): void {
    if (!directionsResponse.routes || directionsResponse.routes.length === 0) {
      console.warn('No hay rutas para mostrar');
      return;
    }

    const route = directionsResponse.routes[0];
    const geojson = {
      'type': 'Feature',
      'properties': {},
      'geometry': route.geometry
    };

    // Remover ruta anterior si existe
    if (this.map.getSource('route')) {
      this.map.getSource('route').setData(geojson);
    } else {
      // Agregar nueva capa de ruta
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }

    // Ajustar la vista para mostrar toda la ruta
    if (route.geometry && route.geometry.coordinates) {
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }

  // Método público para limpiar el mapa
  clearRoute(): void {
    if (this.map) {
      if (this.map.getLayer('route')) {
        this.map.removeLayer('route');
        this.map.removeSource('route');
      }
      if (this.map.getLayer('destination-circle')) {
        this.map.removeLayer('destination-circle');
        this.map.removeSource('destination-circle');
      }
    }
  }

  // Método público para limpiar rutas de prueba
  clearTestRoute(): void {
    if (this.map) {
      // Limpiar ruta de prueba
      if (this.map.getLayer('test-route')) {
        this.map.removeLayer('test-route');
        this.map.removeSource('test-route');
      }
      // Limpiar marcadores de prueba
      if (this.map.getLayer('test-origin-circle')) {
        this.map.removeLayer('test-origin-circle');
        this.map.removeSource('test-origin-circle');
      }
      if (this.map.getLayer('test-destination-circle')) {
        this.map.removeLayer('test-destination-circle');
        this.map.removeSource('test-destination-circle');
      }
    }
  }

  private displayTestRoute(directionsResponse: DirectionsResponse): void {
    if (!directionsResponse.routes || directionsResponse.routes.length === 0) {
      console.warn('No hay rutas de prueba para mostrar');
      return;
    }

    const route = directionsResponse.routes[0];

    // Agregar marcadores para las ubicaciones de prueba
    const testOrigin: [number, number] = [-103.386854, 20.674289]; // Calle Ingeniero Gabriel Castaños
    const testDestination: [number, number] = [-103.417812, 20.689791]; // Avenida de la Patria

    this.addTestOriginMarker(testOrigin);
    this.addTestDestinationMarker(testDestination);

    // Mostrar la ruta
    const geojson = {
      'type': 'Feature',
      'properties': {},
      'geometry': route.geometry
    };

    // Remover ruta anterior si existe
    if (this.map.getSource('test-route')) {
      this.map.getSource('test-route').setData(geojson);
    } else {
      // Agregar nueva capa de ruta de prueba
      this.map.addLayer({
        id: 'test-route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff6b35', // Color naranja para distinguir de rutas normales
          'line-width': 6,
          'line-opacity': 0.8
        }
      });
    }

    // Ajustar la vista para mostrar toda la ruta de prueba
    if (route.geometry && route.geometry.coordinates) {
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
      this.map.fitBounds(bounds, { padding: 80 });
    }
  }

  private addTestOriginMarker(coords: [number, number]): void {
    // Remover marcador anterior si existe
    if (this.map.getLayer('test-origin-circle')) {
      this.map.removeLayer('test-origin-circle');
      this.map.removeSource('test-origin-circle');
    }

    // Agregar círculo azul para el origen de prueba
    this.map.addLayer({
      'id': 'test-origin-circle',
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'Point',
                'coordinates': coords
              }
            }
          ]
        }
      },
      'paint': {
        'circle-radius': 12,
        'circle-color': '#007bff',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });
  }

  private addTestDestinationMarker(coords: [number, number]): void {
    // Remover marcador anterior si existe
    if (this.map.getLayer('test-destination-circle')) {
      this.map.removeLayer('test-destination-circle');
      this.map.removeSource('test-destination-circle');
    }

    // Agregar círculo naranja para el destino de prueba
    this.map.addLayer({
      'id': 'test-destination-circle',
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'Point',
                'coordinates': coords
              }
            }
          ]
        }
      },
      'paint': {
        'circle-radius': 12,
        'circle-color': '#ff6b35',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });
  }
}
