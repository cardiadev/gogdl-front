import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-testing-mode',
  imports: [],
  templateUrl: './testing-mode.component.html',
  styleUrl: './testing-mode.component.scss'
})
export class TestingModeComponent {
  private translate = inject(TranslateService);
  currentLanguage: string;

  constructor() {
    const savedLanguage = localStorage.getItem('language');
    this.currentLanguage = savedLanguage ? savedLanguage : 'en';
    if (!savedLanguage) {
      localStorage.setItem('language', 'en');
    }
    this.translate.use(this.currentLanguage);
  }

  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'en' ? 'es' : 'en';
    this.translate.use(this.currentLanguage);
    localStorage.setItem('language', this.currentLanguage);
  }
}
