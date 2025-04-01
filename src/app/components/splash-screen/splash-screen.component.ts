import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, signal } from '@angular/core';

const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

const fadeOut = trigger('fadeOut', [
  transition(':leave', [
    style({ opacity: 1 }),
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);


@Component({
  selector: 'app-splash-screen',
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
  animations: [fadeIn, fadeOut],
})
export class SplashScreenComponent implements OnInit {
  @Input() duration = 500;
  isVisible = signal(true);

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isVisible.set(false);
    }, this.duration);
  }


}
