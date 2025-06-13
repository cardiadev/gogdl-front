# Documentación de Implementación - GoGDL Configs

## 📋 Índice
1. [Arquitectura General](#arquitectura-general)
2. [Integración con Mapbox](#integración-con-mapbox)
3. [Sistema de Testing](#sistema-de-testing)
4. [Componentes Principales](#componentes-principales)
5. [Servicios](#servicios)
6. [Internacionalización](#internacionalización)
7. [Estilos y UI](#estilos-y-ui)

## 🏗️ Arquitectura General

### Estructura del Proyecto
```
src/
├── app/
│   ├── components/
│   │   ├── map-view/
│   │   ├── search-bar/
│   │   └── location-list/
│   ├── shared/
│   │   ├── testing-mode/
│   │   └── feature-flags/
│   ├── services/
│   │   ├── location.service.ts
│   │   └── feature-flags.service.ts
│   └── models/
│       └── location.model.ts
├── assets/
│   └── i18n/
└── environments/
```

### Tecnologías Principales
- Angular 17+
- Mapbox GL JS
- NgRx (para estado global)
- i18n (internacionalización)

## 🗺️ Integración con Mapbox

### Configuración Inicial
```typescript
// environments/environment.ts
export const environment = {
  mapbox: {
    accessToken: 'pk.eyJ1IjoiY2FyZGlhZGV2IiwiYSI6ImNsdX...',
    style: 'mapbox://styles/cardiadev/clu...'
  }
};
```

### Componente Mapa Principal
- **MapViewComponent**: Componente principal que maneja la visualización del mapa
- **Características**:
  - Inicialización del mapa
  - Manejo de eventos (click, zoom, etc.)
  - Visualización de rutas
  - Marcadores dinámicos
  - Controles de navegación

### Funcionalidades de Mapa
1. **Búsqueda de Ubicaciones**
   - Autocompletado con Mapbox Geocoding API
   - Sugerencias en tiempo real
   - Formateo de resultados

2. **Cálculo de Rutas**
   - Direcciones con Mapbox Directions API
   - Múltiples perfiles (driving, walking, cycling)
   - Visualización de rutas alternativas

3. **Marcadores y Popups**
   - Marcadores personalizados
   - Popups informativos
   - Clusters para múltiples ubicaciones

## 🧪 Sistema de Testing

### Feature Flags
```typescript
// feature-flags.config.ts
export const FEATURE_FLAGS = {
  ENABLE_TESTING_MODE: true,
  ENABLE_ROUTE_OPTIMIZATION: false,
  ENABLE_OFFLINE_MODE: false
};
```

### Testing Mode
- **Componente**: `TestingModeComponent`
- **Funcionalidades**:
  - Simulación de ubicaciones
  - Generación de rutas de prueba
  - Marcadores de prueba
  - Limpieza de rutas de prueba

### Modo de Prueba
1. **Ubicaciones de Prueba**
   ```typescript
   const testLocations = {
     origin: {
       name: "Calle Ingeniero Gabriel Castaños",
       lat: 20.6736,
       lng: -103.3444
     },
     destination: {
       name: "Avenida de la Patria",
       lat: 20.6736,
       lng: -103.3444
     }
   };
   ```

2. **Rutas de Prueba**
   - Visualización con estilo distintivo
   - Marcadores especiales
   - Auto-ajuste del mapa

## 🎯 Componentes Principales

### MapViewComponent
- **Responsabilidades**:
  - Inicialización del mapa
  - Manejo de eventos
  - Visualización de rutas
  - Gestión de marcadores

### SearchBarComponent
- **Funcionalidades**:
  - Búsqueda de ubicaciones
  - Autocompletado
  - Formateo de resultados
  - Integración con Mapbox Geocoding

### LocationListComponent
- **Características**:
  - Lista de ubicaciones guardadas
  - Gestión de favoritos
  - Historial de búsquedas
  - Acciones rápidas

## 🔧 Servicios

### LocationService
```typescript
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  // Estado
  private currentLocationSubject = new BehaviorSubject<[number, number] | null>(null);
  private testRouteSubject = new BehaviorSubject<DirectionsResponse | null>(null);

  // Observables
  currentLocation$ = this.currentLocationSubject.asObservable();
  testRoute$ = this.testRouteSubject.asObservable();

  // Métodos principales
  getDirections(origin: [number, number], destination: [number, number], profile: string): Observable<DirectionsResponse>
  searchLocation(query: string): Observable<Feature[]>
  setTestRoute(route: DirectionsResponse): void
  clearTestRoute(): void
}
```

### FeatureFlagsService
- Gestión de características
- Control de acceso
- Configuración dinámica

## 🌐 Internacionalización

### Estructura
```
assets/i18n/
├── es.json
└── en.json
```

### Implementación
```typescript
// app.module.ts
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
```

## 🎨 Estilos y UI

### Temas
- **Claro**: Variables CSS para modo claro
- **Oscuro**: Variables CSS para modo oscuro
- **Responsive**: Diseño adaptable

### Componentes UI
1. **Botones**
   - Estilos consistentes
   - Estados (hover, active, disabled)
   - Iconos integrados

2. **Inputs**
   - Autocompletado
   - Validación
   - Feedback visual

3. **Listas**
   - Animaciones
   - Scroll virtual
   - Acciones contextuales

## 🔄 Flujos de Trabajo

### Búsqueda de Ubicación
1. Usuario escribe en la barra de búsqueda
2. Se consulta Mapbox Geocoding API
3. Se muestran sugerencias
4. Usuario selecciona ubicación
5. Se actualiza el mapa

### Generación de Ruta
1. Selección de origen y destino
2. Cálculo de ruta con Mapbox Directions API
3. Visualización en el mapa
4. Opciones de navegación

### Modo de Prueba
1. Activación del modo de prueba
2. Generación de ruta de prueba
3. Visualización con estilo distintivo
4. Limpieza de rutas de prueba

## 📱 Responsive Design

### Breakpoints
```scss
$breakpoints: (
  'xs': 0,
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px
);
```

### Adaptaciones
- Mapa a pantalla completa en móvil
- Lista colapsable
- Controles optimizados para touch

## 🔒 Seguridad

### Buenas Prácticas
- Tokens de API en variables de entorno
- Validación de inputs
- Sanitización de datos
- Manejo de errores

## 🚀 Optimizaciones

### Rendimiento
- Lazy loading de módulos
- Caché de rutas
- Optimización de marcadores
- Compresión de assets

### Código
- Tree shaking
- Minificación
- Code splitting
- Bundle optimization 
