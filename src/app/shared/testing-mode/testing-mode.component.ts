import { Component, computed, inject, signal } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-testing-mode',
  imports: [MatIconModule],
  templateUrl: './testing-mode.component.html',
  styleUrl: './testing-mode.component.scss'
})
export class TestingModeComponent {
  // Injected services
  private appStateService = inject(AppStateService);

  // Variables
  isMenuOpen = signal(false);

  // Computed properties
  currentLanguage = computed(() => this.appStateService.appState().language);
  isSplashEnabled = computed(() => this.appStateService.appState().splashEnabled);

  // Functions
  toggleLanguage(): void {
    const newLanguage = this.currentLanguage() === 'en' ? 'es' : 'en';
    this.appStateService.updateAppState('language', newLanguage);
  }

  clearLocalStorage(): void {
    localStorage.clear();
    location.reload();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  toggleSplashScreen(): void {
    const newSplashState = !this.isSplashEnabled();
    this.appStateService.updateAppState('splashEnabled', newSplashState);
  }
}
