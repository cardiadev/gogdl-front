import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map-view',
  imports: [],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private readonly token: string = "aaaa";

  ngOnInit(): void {
    const map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-103.3496, 20.6597], // Guadalajara
      zoom: 13,
      accessToken: this.token, // ✅ Pasamos el token como opción del mapa
    });

    map.addControl(new mapboxgl.NavigationControl());
  }

}
