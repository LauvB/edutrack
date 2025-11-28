# 🌱 Sistema de Seeders — EduTrack

Este documento describe el funcionamiento del sistema de **seeders** incluido en el backend EduTrack. Los seeders permiten poblar automáticamente la base de datos con:

- Usuario administrador
- Profesores
- Estudiantes
- Cursos de ejemplo
- Inscripciones válidas entre estudiantes y cursos

Esto facilita las pruebas de autenticación, roles, guards y el funcionamiento del API Tester del frontend.

---

# 🧩 Objetivo del sistema de seeders

- Crear un conjunto de datos iniciales coherentes.
- Permitir probar permisos basados en roles (`admin`, `profesor`, `estudiante`).
- Crear usuarios con perfiles asociados (profesor y estudiante).
- Crear cursos con profesores asignados.
- Crear inscripciones válidas evitando duplicados.
- Asegurar que la base de datos queda lista para demostraciones o pruebas automáticas.

---

# 🏗 Estructura del módulo de seeders

El sistema de seeders se encuentra en:

```
src/seeds/
```

incluye:

```
seed.ts
seed.module.ts
seed.service.ts
seed-data/
admin.seeder.ts
professors.seeder.ts
students.seeder.ts
courses.seeder.ts
enrollments.seeder.ts
```

---

# 🧪 Flujo completo de ejecución

El sistema ejecuta los seeders en el siguiente orden:

1. AdminSeeder → crea administrador
2. ProfessorsSeeder → crea usuarios + perfiles de profesor
3. StudentsSeeder → crea usuarios + perfiles de estudiante
4. CoursesSeeder → crea cursos y los asigna a profesores
5. EnrollmentsSeeder → inscribe estudiantes a cursos válidos

Cada seeder revisa si ya existen datos para evitar duplicaciones.

---

# ▶️ ¿Cómo ejecutar los seeders?

1.  Asegurar `.env`

    DB_NAME
    DB_HOST
    DB_PORT
    DB_PASSWORD
    DB_USERNAME

    JWT_SECRET
    JWT_EXPIRES_IN
    SALT_ROUNDS

2.  Ejecutar

```
npm run seed
```

---

# Errores comunes

| Error                                                             | Causa                                     | Solución                                    |
| ----------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| `Error: Entity metadata for EnrollmentEntity#curso was not found` | Falta agregar entidades al TypeOrmModule  | Verificar `TypeOrmModule.forFeature`        |
| `23505 duplicate key`                                             | Seeder ejecutado dos veces sin validación | Los seeders ya incluyen verificación previa |
| `ECONNREFUSED`                                                    | Base de datos no conectada                | Verificar PostgreSQL                        |
| `.env undefined`                                                  | Ruta incorrecta                           | ConfigModule con `isGlobal: true`           |

---

# Notas importantes

- Los seeders no afectan datos existentes (tienen protecciones).
- Están diseñados para entornos de desarrollo.
- No deben ejecutarse en producción.
- Son completamente compatibles con tu sistema de roles y guards.
- El flujo de seeds deja la BD lista para probar todo el sistema desde el frontend.
