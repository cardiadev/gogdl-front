import { Component } from '@angular/core';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-home',
  imports: [
    MapViewComponent,
    BottomNavComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
