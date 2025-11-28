# 🔐 Autenticación — AuthModule

El módulo de autenticación de EduTrack implementa un sistema de login basado en **JWT** que permite validar credenciales, generar tokens seguros, extraer el usuario autenticado y proteger rutas mediante guards especializados.

Este documento describe su arquitectura, endpoints, flujo de autenticación y ejemplos prácticos de uso.

---

# 📘 Descripción general

El módulo de autenticación se encarga de:

- Validar credenciales de usuario.
- Verificar contraseña mediante BCrypt.
- Generar tokens JWT.
- Retornar un usuario autenticado.
- Proteger rutas mediante **AuthGuard**.
- Verificar roles mediante **RolesGuard**.

El sistema maneja **tres roles principales**:

- `admin`
- `profesor`
- `estudiante`

Cada uno tiene permisos específicos documentados en:
👉 **[Roles y guardias](./docs/roles-y-guardias.md)**

---

## Dependencias principales:

- `@nestjs/passport`
- `passport-jwt`
- `jsonwebtoken`
- `bcrypt`
- `@nestjs/jwt`

---

# 🔄 Flujo de autenticación

1. El usuario envía email y contraseña a `/auth/login`
2. El sistema:
   - Verifica que el correo exista.
   - Compara la contraseña con BCrypt.
   - Genera un token JWT con:
     ```
     { id, rol, correo }
     ```
   - Devuelve:
     - el token
     - los datos del usuario
3. El frontend almacena el token en memoria o localStorage.
4. Para rutas protegidas, el cliente envía:
   Authorization: Bearer <token>
5. El backend valida el token mediante `JwtStrategy`.

---

# 🛠 Endpoint principal

**Request**

        POST /auth/login

```json
{
  "correo": "admin@edutrack.com",
  "contraseña": "Admin123*"
}
```

**Response**

```json
{
  "access_token": "<token_jwt>",
  "user": {
    "id": "uuid",
    "correo": "admin@edutrack.com",
    "rol": "admin",
    "nombreCompleto": "Administrador del Sistema"
  }
}
```

**Errores**

| Código | Descripción           |
| ------ | --------------------- |
| 400    | Datos inválidos       |
| 401    | Contraseña incorrecta |
| 404    | Usuario no encontrado |

---

# 🛡 Guardias de seguridad

## AuthGuard('jwt')

Protege rutas que requieren usuario atenticado.

Ejemplo:

```ts
@UseGuards(AuthGuard('jwt'))
@Get('perfil')
perfil(@GetUser() user) {
  return user;
}

```

## RolesGuard

Valida si el usuario cumple los roles permitidos.

Ejemplo:

```ts
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Get('todos')
findAllUsers() { ... }
```

## Decorador @Roles()

```ts
Decorador @Roles()
```

## Decorador GetUser

Permite extraer el usuario desde el token sin repetir lógica.

```ts
export const GetUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
```

Uso:

```ts
@Get('mi-perfil')
getProfile(@GetUser() user) {
  return user;
}

```

---

# Ejemplos prácticos

## Ruta exclusiva de admin

```bash
GET /users/getAllUsers
Authorization: Bearer <token_admin>

```

## Ruta exclusiva de profesor

```bash
PATCH /professors/:id
Authorization: Bearer <token_profesor>

```

## Ruta exclusiva de admin

```bash
POST /enrollments
Authorization: Bearer <token_estudiante>

```

---

# Errores comunes

## Token inexistente

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Token inválido o expirado

```json
{
  "statusCode": 401,
  "message": "jwt malformed"
}
```

## Usuario con rol insuficiente

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
