import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [
    BottomNavComponent,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['Carlos Javier', [Validators.required, Validators.minLength(2)]],
      lastName: ['Díaz Flores', [Validators.required, Validators.minLength(2)]],
      email: ['email@gmail.com', [Validators.required, Validators.email, this.emailValidator]],
      birthDate: [new Date(1989, 4, 23), [Validators.required]], // May 23, 1989
      password: ['password123', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  // Custom email validator for more strict validation
  emailValidator(control: any) {
    const email = control.value;
    if (!email) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? null : { invalidEmail: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `PROFILE.ERRORS.${fieldName.toUpperCase()}_REQUIRED`;
      }
      if (field.errors?.['email'] || field.errors?.['invalidEmail']) {
        return 'PROFILE.ERRORS.EMAIL_INVALID';
      }
      if (field.errors?.['minlength']) {
        if (fieldName === 'password') {
          return 'PROFILE.ERRORS.PASSWORD_MIN_LENGTH';
        }
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onLogout(): void {
    // Implementar lógica de logout
    console.log('Logout clicked');
  }
}
