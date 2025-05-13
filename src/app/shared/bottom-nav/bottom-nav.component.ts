import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  activeTab = signal('home');
  private router = inject(Router);

  constructor(){}

  navigateTo(tab: string): void {
    this.activeTab.set(tab);
    this.router.navigate([`/${tab}`]); // Ajusta las rutas según tu configuración
  }

}
