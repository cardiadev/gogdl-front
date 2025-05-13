import {
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ControlComponent, MapComponent, MarkerComponent, NavigationControlDirective } from 'ngx-mapbox-gl';

@Component({
  selector: 'app-map-view',
  imports: [
    MapComponent,
    MarkerComponent,
    ControlComponent,
    NavigationControlDirective

  ],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent implements OnInit {

  center = signal<[number, number]>([-103.3496, 20.6597]); // Default to Guadalajara
  showMarker = signal(true);

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          this.center.set(coords);
          this.showMarker.set(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    } else {
      console.warn('Geolocation not supported');
    }
  }
}
