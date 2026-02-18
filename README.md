# EduTareas PWA - Gestión Escolar 🎓

Esta es una **Progressive Web App (PWA)** diseñada para optimizar la asignación y seguimiento de tareas en niveles de educación secundaria. El proyecto forma parte del entregable de estadías profesionales, enfocado en crear una solución técnica escalable, rápida y funcional.

## 🚀 Tecnologías Utilizadas

* **Framework:** [Angular 19](https://angular.dev/) (Standalone Components)
* **Backend as a Service:** [Firebase](https://firebase.google.com/)
    * **Authentication:** Gestión de acceso para docentes y alumnos.
    * **Cloud Firestore:** Base de datos NoSQL en tiempo real para tareas.
* **Estilos:** SCSS (Sass) siguiendo lineamientos de **Material Design 3**.
* **Control de Versiones:** Git & GitHub.

## 🛠️ Configuración del Proyecto

Para ejecutar este proyecto en un entorno local, sigue estos pasos:

### 1. Clonar el repositorio

git clone [https://github.com/miketo-developer/edutareas-pwa.git](https://github.com/miketo-developer/edutareas-pwa.git)
```bash
cd edutareas
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (Firebase)

Por razones de seguridad, las credenciales de Firebase han sido omitidas del repositorio.

Dirígete a src/environments/.

Renombra el archivo environment.template.ts a environment.ts.

Completa los campos con tus credenciales obtenidas desde la Consola de Firebase.

TypeScript

// Ejemplo de estructura en environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    // ... rest of config
  }
};

### 4. Ejecutar servidor de desarrollo
```bash
ng serve
```

La aplicación estará disponible en http://localhost:4200/.

📂 Estructura del Proyecto
src/app/core: Servicios globales, guardias y configuración de Firebase.
src/app/shared: Componentes reutilizables (Botones, Cards, Navbar).
src/app/features: Módulos de funcionalidad (Login, Muro de tareas, Perfil).
src/environments: Configuración de variables según el entorno.

📄 Licencia
Este proyecto fue desarrollado con fines académicos para el proceso de estadías profesionales.










This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
