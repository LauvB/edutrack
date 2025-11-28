# EduTrack - Backend (NestJS + PostgreSQL + TypeORM + JWT)

EduTrack es un sistema académico diseñado para gestionar usuarios, profesores, estudiantes, cursos e inscripciones, implementado con una arquitectura modular basada en **NestJS**, autenticación mediante **JWT**, persistencia con **PostgreSQL** y control de acceso granular mediante **roles (RBAC)** y **guards personalizados**.

---

# 📝 Descripción general

El sistema permite:

- Registro y administración de usuarios
- Creación y gestión de perfiles de profesor y estudiante
- Gestión de cursos dictados por profesores
- Inscripción de estudiantes a cursos
- Administración del sistema mediante rol **administrador**

Toda la lógica de negocio está protegida mediante autenticación JWT y reglas de autorización estrictas según rol.

---

# 🏛 Arquitectura general

Tecnologías principales:

| Tecnología      | Uso                            |
| --------------- | ------------------------------ |
| NestJS          | Backend modular en Node.js     |
| PostgreSQL      | Base de datos                  |
| TypeORM         | ORM basado en decoradores      |
| JWT             | Autenticación basada en tokens |
| Passport        | Estrategias de autenticación   |
| Class Validator | Validación de DTOs             |
| BCrypt          | Hash seguro de contraseñas     |

Arquitectura:

- Patrón **Modelo–Servicio–Controlador**
- Módulos independientes
- Guards para autorización
- Decoradores personalizados
- Seeders reutilizables
- Relaciones bidireccionales con TypeORM

---

## 📁 Estructura del proyecto

    src/
     ├── app.module.ts
     ├── main.ts
     ├── seeds/
     ├── auth/
     ├── users/
     ├── professors/
     ├── students/
     ├── courses/
     └── enrollments/

---

## ⚙️ Configuración inicial

### 1. Instalar el proyecto

```bash
git clone https://github.com/LauvB/edutrack.git
cd edutrack/backend
npm install
```

### 2. Configurar el entorno

En el archivo `.env`:

    DB_NAME
    DB_HOST
    DB_PORT
    DB_PASSWORD
    DB_USERNAME

    JWT_SECRET
    JWT_EXPIRES_IN
    SALT_ROUNDS

---

## 🚀 Ejecutar el proyecto

```bash
npm run start:dev
```

Servidor disponible en:

    http://localhost:3000

---

## 🌱 Seeders (Datos iniciales)

```bash
npm run seed
```

Esto genera:

- 1 administrador
- Profesores iniciales
- Estudiantes iniciales

Documentación detallada 👉 **[Documento de seeds](./docs/seeds.md)**

---

## 🔐 Flujo de autenticación (JWT)

1. El usuario inicia sesión mediante `POST /auth/login`
2. Si las credenciales son correctas:
   - Se genera `access_token`
   - Se devuelve el usuario autenticado
3. Todas las rutas protegidas requieren header:
   Authorization: Bearer <token>

Documentación detallada 👉 **[Documento auth](./docs/auth.md)**

---

## 🛡 Control de acceso (Roles y Guards)

El sistema implementa:

- `AuthGuard('jwt')`
- `RolesGuard`
- Decorador `@Roles()`
- Decorador `@GetUser()`

Permisos descritos en 👉 **[Roles y guardias](./docs/roles-y-guardias.md)**

---

## 📚 Descripción de módulos

| Módulo            | Descripción                            | Documentación                                  |
| ----------------- | -------------------------------------- | ---------------------------------------------- |
| **Auth**          | Login, JWT, validaciones               | [docs/auth.md](docs/auth.md)                   |
| **Usuarios**      | CRUD de usuarios, reglas de acceso     | [docs/usuarios.md](docs/usuarios.md)           |
| **Profesores**    | Gestión de profesores, cursos dictados | [docs/profesores.md](docs/profesores.md)       |
| **Estudiantes**   | Perfiles, inscripciones propias        | [docs/estudiantes.md](docs/estudiantes.md)     |
| **Cursos**        | Gestión de cursos por profesores       | [docs/cursos.md](docs/cursos.md)               |
| **Inscripciones** | Inscripción a cursos, notas            | [docs/inscripciones.md](docs/inscripciones.md) |

---

## 📘 Modelo de datos (Resumen)

Relaciones principales:

- User 1 ── 1 Student
- User 1 ── 1 Professor
- Professor 1 ── N Course
- Course 1 ── N Enrollment
- Student 1 ── N Enrollment

---

## 👨‍💻 Autor

**Laura Beltrán**  
Proyecto desarrollado como parte del curso de **NestJS**
