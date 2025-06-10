import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  password: string;
}

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
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  showPassword = false;
  hasUnsavedChanges = false;
  private readonly STORAGE_KEY = 'userProfile';
  private storageListener?: (event: StorageEvent) => void;
  private checkInterval?: any;
  private hasData = true;
  private originalFormData: any = null;

  // Dummy data inicial
  private defaultUserData: UserProfile = {
    firstName: 'Carlos Javier',
    lastName: 'Díaz Flores',
    email: 'carlos.diaz@gmail.com',
    birthDate: new Date(1989, 4, 23), // May 23, 1989
    password: 'mySecurePass123'
  };

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      birthDate: [null, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Verificar si hay datos de perfil, si no, redirigir al login
    const savedProfile = localStorage.getItem(this.STORAGE_KEY);
    if (!savedProfile) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.setupFormChangeDetection();
    this.setupStorageListener();
    this.startStorageCheck();
  }

  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  // Configurar detección de cambios en el formulario
  private setupFormChangeDetection(): void {
    this.profileForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  // Verificar si hay cambios no guardados
  private checkForChanges(): void {
    if (!this.originalFormData) return;

    const currentData = this.profileForm.value;
    this.hasUnsavedChanges = this.isDifferentData(currentData, this.originalFormData);
  }

  // Guardar cambios manualmente
  saveChanges(): void {
    if (this.profileForm.valid) {
      this.saveUserProfile();
      this.hasUnsavedChanges = false;
      this.originalFormData = { ...this.profileForm.value };
      console.log('Changes saved successfully');
    }
  }

  // Descartar cambios
  discardChanges(): void {
    if (this.originalFormData) {
      this.setFormValues(this.originalFormData);
      this.hasUnsavedChanges = false;
      console.log('Changes discarded');
    }
  }

  // Configurar chequeo periódico para cambios en localStorage (mismo tab)
  private startStorageCheck(): void {
    this.checkInterval = setInterval(() => {
      const currentData = localStorage.getItem(this.STORAGE_KEY);

      // Si teníamos datos y ahora no hay, resetear
      if (this.hasData && !currentData) {
        console.log('User profile deleted detected via polling, resetting form...');
        this.resetFormToEmpty();
        this.hasData = false;
      }
      // Si no teníamos datos y ahora hay, cargar
      else if (!this.hasData && currentData) {
        console.log('User profile data detected, loading...');
        this.loadUserProfile();
        this.hasData = true;
      }
      // Si teníamos datos y hay datos diferentes, recargar (solo si no hay cambios pendientes)
      else if (this.hasData && currentData && !this.hasUnsavedChanges) {
        const savedProfile = JSON.parse(currentData);
        const currentFormData = this.profileForm.value;

        if (this.isDifferentData(savedProfile, currentFormData)) {
          console.log('Different user profile data detected, reloading...');
          this.loadUserProfileSilently();
        }
      }
    }, 500);
  }

  // Verificar si los datos son diferentes
  private isDifferentData(data1: any, data2: any): boolean {
    return (
      data1.firstName !== data2.firstName ||
      data1.lastName !== data2.lastName ||
      data1.email !== data2.email ||
      data1.password !== data2.password ||
      new Date(data1.birthDate).getTime() !== new Date(data2.birthDate).getTime()
    );
  }

  // Cargar datos sin disparar valueChanges
  private loadUserProfileSilently(): void {
    const savedProfile = localStorage.getItem(this.STORAGE_KEY);

    if (savedProfile) {
      const userProfile: UserProfile = JSON.parse(savedProfile);
      userProfile.birthDate = new Date(userProfile.birthDate);

      this.setFormValues(userProfile);
      this.originalFormData = { ...this.profileForm.value };
      this.hasData = true;
      this.hasUnsavedChanges = false;
    }
  }

  // Configurar listener para cambios en localStorage (otras tabs)
  private setupStorageListener(): void {
    this.storageListener = (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEY && event.newValue === null) {
        console.log('User profile deleted externally, resetting form...');
        this.resetFormToEmpty();
        this.hasData = false;
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  // Resetear formulario a valores vacíos (simular logout)
  private resetFormToEmpty(): void {
    this.profileForm.reset();
    this.profileForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      birthDate: null,
      password: ''
    });
    this.originalFormData = null;
    this.hasUnsavedChanges = false;
    console.log('Form reset to empty values');
  }

  // Cargar datos del perfil desde localStorage
  private loadUserProfile(): void {
    const savedProfile = localStorage.getItem(this.STORAGE_KEY);

    if (savedProfile) {
      const userProfile: UserProfile = JSON.parse(savedProfile);
      userProfile.birthDate = new Date(userProfile.birthDate);
      this.setFormValues(userProfile);
      this.hasData = true;

      // Guardar datos originales para comparación
      this.originalFormData = { ...this.profileForm.value };
      this.hasUnsavedChanges = false;
    } else {
      // Si no hay datos, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  // Establecer valores en el formulario
  private setFormValues(profile: UserProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      birthDate: profile.birthDate,
      password: profile.password
    });
  }

  // Guardar datos en localStorage
  private saveUserProfile(): void {
    if (this.profileForm.valid) {
      const profileData: UserProfile = {
        firstName: this.profileForm.get('firstName')?.value || '',
        lastName: this.profileForm.get('lastName')?.value || '',
        email: this.profileForm.get('email')?.value || '',
        birthDate: this.profileForm.get('birthDate')?.value || new Date(),
        password: this.profileForm.get('password')?.value || ''
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profileData));
      this.hasData = true;
      console.log('Profile saved to localStorage:', profileData);
    }
  }

  // Obtener datos actuales del perfil
  getCurrentProfile(): UserProfile | null {
    const savedProfile = localStorage.getItem(this.STORAGE_KEY);
    return savedProfile ? JSON.parse(savedProfile) : null;
  }

  // Limpiar datos de perfil (para logout)
  clearProfile(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.resetFormToEmpty();
    this.hasData = false;
  }

  // Restaurar datos por defecto
  resetToDefault(): void {
    this.setFormValues(this.defaultUserData);
    this.saveUserProfile();
  }

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

  onFieldBlur(fieldName: string): void {
    const control = this.profileForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  // Detectar cambios manuales en tiempo real
  onFieldChange(): void {
    this.checkForChanges();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);

    // Solo mostrar errores si el campo ha sido tocado Y modificado Y perdió el foco
    if (field && field.invalid && field.touched && field.dirty) {
      // Además, no mostrar error si el campo está actualmente enfocado (siendo editado)
      const activeElement = document.activeElement;
      const fieldElement = document.querySelector(`[formControlName="${fieldName}"]`);

      // Si el campo está siendo editado actualmente, no mostrar error
      if (activeElement === fieldElement) {
        return null;
      }

      if (field.errors?.['required']) {
        // Mapear nombres de campos a las keys correctas
        const fieldErrorMap: { [key: string]: string } = {
          'firstName': 'PROFILE.ERRORS.FIRST_NAME_REQUIRED',
          'lastName': 'PROFILE.ERRORS.LAST_NAME_REQUIRED',
          'email': 'PROFILE.ERRORS.EMAIL_REQUIRED',
          'birthDate': 'PROFILE.ERRORS.BIRTH_DATE_REQUIRED',
          'password': 'PROFILE.ERRORS.PASSWORD_REQUIRED'
        };
        return fieldErrorMap[fieldName] || 'PROFILE.ERRORS.FIELD_REQUIRED';
      }
      if (field.errors?.['email'] || field.errors?.['invalidEmail']) {
        return 'PROFILE.ERRORS.EMAIL_INVALID';
      }
      if (field.errors?.['minlength']) {
        if (fieldName === 'password') {
          return 'PROFILE.ERRORS.PASSWORD_MIN_LENGTH';
        }
        return 'PROFILE.ERRORS.MIN_LENGTH';
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);

    if (!field || !field.invalid || !field.touched || !field.dirty) {
      return false;
    }

    // No mostrar como inválido si está siendo editado actualmente
    const activeElement = document.activeElement;
    const fieldElement = document.querySelector(`[formControlName="${fieldName}"]`);

    return activeElement !== fieldElement;
  }

  onLogout(): void {
    this.clearProfile();
    console.log('User logged out - profile data cleared');
    this.router.navigate(['/login']);
  }

  showCurrentData(): void {
    const currentData = this.getCurrentProfile();
    console.log('Current profile data:', currentData);
  }
}
