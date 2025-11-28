# 🛡 Sistema de Roles y Guards en EduTrack

Este documento describe el sistema de control de acceso basado en roles (**RBAC**) implementado en EduTrack. Incluye los roles admitidos, los guardias utilizados, los decoradores personalizados y el comportamiento autorizado para cada módulo del sistema.

---

# 📘 Descripción general

EduTrack implementa un sistema de autorización basado en roles para asegurar que cada usuario interactúe únicamente con los recursos que le son permitidos.

El sistema está construido sobre:

- **JWT** → identifica al usuario autenticado.
- **Roles mediante decoradores** → definen permisos.
- **RolesGuard** → valida permisos en cada solicitud.
- **AuthGuard('jwt')** → asegura autenticación previa.

---

# 🧩 Roles del sistema

El backend soporta los siguientes roles:

| Rol            | Descripción                                            |
| -------------- | ------------------------------------------------------ |
| **admin**      | Acceso total al sistema (superusuario)                 |
| **profesor**   | Puede gestionar sus cursos y ver estudiantes inscritos |
| **estudiante** | Puede inscribirse a cursos y consultar su información  |

Los roles están definidos en el enumerado:

```ts
export type UserRole = 'admin' | 'profesor' | 'estudiante';
```

---

# 🔄 Flujo de autenticación

1. El usuario se autentica y obtiene un token JWT.
2. El token se envía en cada solicitud protegida mediante:
   Authorization: Bearer <token>
3. `AuthGuard('jwt')` verifica la validez del token.
4. `RolesGuard` analiza si el usuario:
   - posee uno de los roles permitidos para la ruta
   - cumple reglas adicionales (“solo puede acceder si dicta el curso”, etc.)

---

# Permisos por módulo

1. Módulo de Usuarios

   | Acción                 | Admin | Profesor        | Estudiante      |
   | ---------------------- | ----- | --------------- | --------------- |
   | Crear usuario          | ✔    | ❌              | ❌              |
   | Ver todos los usuarios | ✔    | ❌              | ❌              |
   | Ver usuario por ID     | ✔    | Solo su usuario | Solo su usuario |
   | Actualizar usuario     | ✔    | Solo su usuario | Solo su usuario |
   | Eliminar usuario       | ✔    | ❌              | ❌              |

2. Módulo de Profesores

   | Acción                   | Admin | Profesor       | Estudiante |
   | ------------------------ | ----- | -------------- | ---------- |
   | Crear perfil profesor    | ✔    | ❌             | ❌         |
   | Ver todos los profesores | ✔    | ✔             | ✔         |
   | Ver profesor por ID      | ✔    | ✔             | ✔         |
   | Actualizar profesor      | ✔    | Solo su perfil | ❌         |
   | Eliminar profesor        | ✔    | Solo su perfil | ❌         |

3. Módulo de Estudiantes

   | Acción                    | Admin | Profesor                     | Estudiante     |
   | ------------------------- | ----- | ---------------------------- | -------------- |
   | Crear perfil estudiante   | ✔    | ❌                           | ❌             |
   | Ver todos los estudiantes | ✔    | Solo inscritos en sus cursos | ❌             |
   | Ver estudiante por ID     | ✔    | Solo inscritos en sus cursos | Solo su perfil |
   | Actualizar estudiante     | ✔    | ❌                           | Solo su perfil |
   | Eliminar estudiante       | ✔    | ❌                           | Solo su perfil |

4. Módulo de Cursos

   | Acción               | Admin | Profesor            | Estudiante |
   | -------------------- | ----- | ------------------- | ---------- |
   | Crear curso          | ✔    | Solo si él lo dicta | ❌         |
   | Ver todos los cursos | ✔    | Solo los suyos      | ✔         |
   | Ver curso por ID     | ✔    | Solo los suyos      | ✔         |
   | Actualizar curso     | ✔    | Solo los suyos      | ❌         |
   | Eliminar curso       | ✔    | Solo los suyos      | ❌         |

5. Módulo de Inscripciones

   | Acción                 | Admin | Profesor               | Estudiante     |
   | ---------------------- | ----- | ---------------------- | -------------- |
   | Crear inscripción      | ✔    | ❌                     | Solo las suyas |
   | Ver inscripciones      | ✔    | Solo las de sus cursos | Solo las suyas |
   | Ver inscripción por ID | ✔    | Solo de sus cursos     | Solo la suya   |
   | Actualizar inscripción | ✔    | Solo de sus cursos     | ❌             |
   | Eliminar inscripción   | ✔    | ❌                     | Solo la suya   |

---

# Errores comunes

## Token faltante

        401 Unauthorized

## Rol no autorizado

        403 Forbidden resource

## Acceso denegado por reglas internas

        403 Solo puedes gestionar cursos que tú dictas.
