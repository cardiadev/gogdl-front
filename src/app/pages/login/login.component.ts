import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  private readonly STORAGE_KEY = 'userProfile';

  // Datos dummy para login
  private validCredentials = {
    email: 'carlos.diaz@gmail.com',
    password: 'mySecurePass123'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Pre-llenar con datos dummy si no hay datos guardados
    const savedProfile = localStorage.getItem(this.STORAGE_KEY);
    if (!savedProfile) {
      this.loginForm.patchValue({
        email: this.validCredentials.email,
        password: this.validCredentials.password
      });
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;

      // Validar credenciales
      if (email === this.validCredentials.email && password === this.validCredentials.password) {
        // Login exitoso - guardar datos de perfil
        const userProfile = {
          firstName: 'Carlos Javier',
          lastName: 'Díaz Flores',
          email: email,
          birthDate: new Date(1989, 4, 23),
          password: password
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userProfile));

        if (rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
        }

        console.log('Login successful');
        this.router.navigate(['/profile']);
      } else {
        // Login fallido
        console.log('Invalid credentials');
        // Aquí podrías mostrar un mensaje de error
      }
    }
  }

  onFieldBlur(fieldName: string): void {
    const control = this.loginForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return `LOGIN.${fieldName.toUpperCase()}_REQUIRED`;
      }
      if (control.errors?.['email']) {
        return 'LOGIN.EMAIL_INVALID';
      }
      if (control.errors?.['minlength']) {
        return 'LOGIN.PASSWORD_MIN_LENGTH';
      }
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // Implementar lógica de recuperación de contraseña
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
