import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModeComponent } from './shared/testing-mode/testing-mode.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { AppStateService } from './services/app-state.service';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslateModule,
    TestingModeComponent,
    SplashScreenComponent,
    OnboardingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Injected services
  private appStateService = inject(AppStateService);

  // Variables
  appState = this.appStateService.appState;

  constructor() {
    this.appStateService.loadAppState();
  }

  ngOnInit(): void {}

  // Functions
}
