import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-onboarding',
  imports: [TranslateModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
  }

  skipOnboarding(): void {
    console.log("Skip onboarding");
  }
}
