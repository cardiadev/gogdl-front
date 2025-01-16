import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TestingModeComponent } from './shared/testing-mode/testing-mode.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, TestingModeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private translate = inject(TranslateService);

  constructor() {
    // this.translate.addLangs(['de', 'en']);
    // this.translate.setDefaultLang('en');
    // this.translate.use('en');
    const savedLanguage = localStorage.getItem('language');
    const defaultLanguage = 'en';
    if (!savedLanguage) {
      localStorage.setItem('language', defaultLanguage);
    }
    this.translate.use(savedLanguage || defaultLanguage);
  }
  title = 'gogdl';
}
