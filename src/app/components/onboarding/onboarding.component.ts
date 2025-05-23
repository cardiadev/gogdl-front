import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-onboarding',
  imports: [TranslateModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingComponent implements OnInit {
  private appStateService = inject(AppStateService);

  constructor() {}

  ngOnInit(): void {
  }

  skipOnboarding(): void {
    this.appStateService.updateAppState('seenOnboarding', true);
  }
}
