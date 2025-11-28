# 👤 Módulo de Usuarios — UsersModule

Este documento describe el funcionamiento del módulo de Usuarios dentro del backend EduTrack. Incluye sus responsabilidades, endpoints, reglas de autorización, ejemplos CRUD y comportamiento específico según el rol del usuario autenticado.

---

# 📘 Descripción General

El módulo **Users** administra la información base de cada persona registrada en el sistema. Un usuario puede poseer diferentes roles:

- `admin`
- `profesor`
- `estudiante`

En función del rol, el usuario podrá (o no) crear su perfil correspondiente en los módulos _Estudiantes_ o _Profesores_.

El módulo garantiza:

- Hash seguro de contraseñas
- Validación mediante DTOs
- Restricciones de acceso según rol
- Relación entre `UserEntity` y perfiles académicos

---

# 🧩 Responsabilidades del Módulo

- Registrar un nuevo usuario.
- Obtener usuarios individuales o todos.
- Actualizar información personal.
- Eliminar usuarios.
- Prevenir duplicados (correos únicos).
- Gestionar el "rol" del usuario.
- Crear automáticamente relación con Student o Professor si aplica (mediante semillas o servicios externos).

---

# 👤 Módulo de Usuarios — UsersModule

Este documento describe el funcionamiento del módulo de Usuarios dentro del backend EduTrack. Incluye sus responsabilidades, endpoints, reglas de autorización, ejemplos CRUD y comportamiento específico según el rol del usuario autenticado.

---

# 📘 Descripción general

El módulo **Users** administra la información base de cada persona registrada en el sistema. Un usuario puede poseer diferentes roles:

- `admin`
- `profesor`
- `estudiante`

En función del rol, el usuario podrá (o no) crear su perfil correspondiente en los módulos _Estudiantes_ o _Profesores_.

El módulo garantiza:

- Hash seguro de contraseñas
- Validación mediante DTOs
- Restricciones de acceso según rol
- Relación entre `UserEntity` y perfiles académicos

---

# 🧩 Responsabilidades del módulo

- Registrar un nuevo usuario.
- Obtener usuarios individuales o todos.
- Actualizar información personal.
- Eliminar usuarios.
- Prevenir duplicados (correos únicos).
- Gestionar el "rol" del usuario.
- Crear automáticamente relación con Student o Professor si aplica (mediante semillas o servicios externos).

---

# 🏛 Estructura

La entidad del usuario contiene:

```ts
@PrimaryGeneratedColumn('uuid')
id: string;

@Column('text', { unique: true })
correo: string;

@Column('text', { select: false })
contraseña: string;

@Column({ type: 'enum', enum: UserRole })
rol: UserRole;

```

---

# Reglas de autorización

El acceso a los endpoints está regulado mediante:

- `AuthGuard('jwt')`
- `RolesGuard`
- Decorador `Roles()`
- Validaciones internas en el servicio

  | Acción                 | Admin | Profesor        | Estudiante      |
  | ---------------------- | ----- | --------------- | --------------- |
  | Crear usuario          | ✔    | ❌              | ❌              |
  | Ver todos los usuarios | ✔    | ❌              | ❌              |
  | Ver usuario por ID     | ✔    | Solo su usuario | Solo su usuario |
  | Actualizar usuario     | ✔    | Solo su usuario | Solo su usuario |
  | Eliminar usuario       | ✔    | ❌              | ❌              |

---

# Endpoints

Todos los endpoints se encuentran bajo:

```bash
/users

```

Los ejemplos se presentan en formato JSON y pueden probarse con Postman o con el API Tester del frontend.

```bash
POST /users - Crear usuario
```

**Cuerpo**

```json
{
  "nombreCompleto": "Laura Beltrán",
  "correo": "laura@example.com",
  "contraseña": "123456",
  "rol": "estudiante"
}
```

**Respuesta**

```json
{
  "message": "Usuario creado correctamente",
  "id": "uuid-generado"
}
```

```bash
GET /users/getAllUsers — Obtener todos los usuarios
```

Solo disponible para admin.

**Respuesta**

```json
{
  "users": [
    {
      "id": "uuid1",
      "nombreCompleto": "Admin",
      "correo": "admin@example.com",
      "rol": "admin"
    },
    {
      "id": "uuid2",
      "nombreCompleto": "Profesor 1",
      "correo": "prof1@example.com",
      "rol": "profesor"
    }
  ]
}
```

```bash
GET /users/:id — Obtener usuario por ID
```

- Admin → puede ver cualquiera
- Profesor → solo su propio usuario
- Estudiante → solo su propio usuario

**Respuesta**

```json
{
  "id": "uuid",
  "nombreCompleto": "Laura Beltrán",
  "correo": "laura@example.com",
  "rol": "estudiante"
}
```

```bash
PATCH /users/:id — Actualizar usuario
```

- Admin → cualquiera
- Profesor → solo su propio perfil
- Estudiante → solo su propio perfil

**Cuerpo permitido**

```json
{
  "nombreCompleto": "Laura B. Actualizada",
  "correo": "laura2@example.com"
}
```

❗ No se permite cambiar el rol desde aquí
(El rol se gestiona únicamente al crear el usuario, o mediante cambios administrativos explícitos).

**Respuesta**

```json
{
  "id": "uuid",
  "nombreCompleto": "Laura B. Actualizada",
  "correo": "laura2@example.com",
  "rol": "estudiante"
}
```

```bash
DELETE /users/:id — Eliminar usuario
```

Solo admin puede eliminar usuarios.

**Restricciones del backend**

- Si el usuario tiene perfil de profesor con cursos asignados → no se elimina
- Si el usuario tiene perfil estudiante, su perfil estudiante e inscripciones se eliminan en cascada
- El usuario base siempre puede eliminarse si no infringe reglas de integridad

**Respuesta**

```json
{
  "message": "Usuario eliminado correctamente"
}
```

---

# Errores comunes

| Error                                 | Causa                               | Solución                |
| ------------------------------------- | ----------------------------------- | ----------------------- |
| `403 Forbidden`                       | Intento de ver/editar usuario ajeno | Verificar ID y permisos |
| `400 Bad Request - correo duplicado`  | El correo ya existe                 | Usar otro correo        |
| `400 - no se puede eliminar profesor` | Tiene cursos asignados              | Reasignar cursos antes  |
| `401 Unauthorized`                    | Token faltante o expirado           | Reautenticar            |
