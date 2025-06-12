import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MapboxSearchResult } from '../../services/mapbox-search.service';

export interface ConfirmationDialogData {
  destination: MapboxSearchResult;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <mat-icon class="location-icon">place</mat-icon>
        <h2 mat-dialog-title>¿Dirigirse a este lugar?</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <div class="destination-info">
          <h3>{{ data.destination.name }}</h3>
          <p class="address">{{ data.destination.full_address }}</p>
          @if (data.destination.poi_category && data.destination.poi_category.length > 0) {
            <p class="category">{{ data.destination.poi_category[0] }}</p>
          }
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          (click)="onCancel()"
          class="cancel-button">
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onConfirm()"
          class="confirm-button">
          <mat-icon>directions</mat-icon>
          Dirigirme ahí
        </button>
      </div>
    </div>
  `,
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
