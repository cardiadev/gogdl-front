import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface AppState {
  language: string;
  splashEnabled: boolean;
  seenOnboarding: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  appState = signal<AppState>({
    language: 'en',
    splashEnabled: true,
    seenOnboarding: false,
  });

  constructor(private translate: TranslateService) {
    this.loadAppState();
  }

  loadAppState(): void {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      this.appState.set(JSON.parse(savedState) as AppState);
    } else {
      this.saveAppState();
    }
    this.translate.use(this.appState().language);
  }

  private saveAppState(): void {
    localStorage.setItem('appState', JSON.stringify(this.appState()));
  }

  updateAppState<T extends keyof AppState>(key: T, value: AppState[T]): void {
    this.appState.update((state) => {
      const newState = { ...state, [key]: value };
      localStorage.setItem('appState', JSON.stringify(newState));
      return newState;
    });

    if (key === 'language') {
      this.translate.use(value as string);
    }
  }
}
