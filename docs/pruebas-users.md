# Pruebas del CRUD de Users -- EduTrack Backend

Este documento contiene las pruebas realizadas al **CRUD completo de la
entidad Users**, incluyendo:

- Requests utilizados
- Respuestas del servidor
- Casos correctos
- Casos con validación fallida
- IDs reales generados (simulados)
- Comportamiento esperado según los DTOs

---

# 📌 1. POST /users --- Crear usuario

### ✅ **Caso exitoso**

**Request**

    POST http://localhost:3000/users

```json
{
  "nombreCompleto": "Laura Beltrán",
  "correo": "laura@example.com",
  "contraseña": "secreta123",
  "rol": "estudiante"
}
```

**Response**

    201 Created
    El usuario fue guardado

### ❌ **Caso con validación fallida (correo inválido)**

**Request**

```json
{
  "nombreCompleto": "Prueba",
  "correo": "correo-no-valido",
  "contraseña": "abc123",
  "rol": "profesor"
}
```

**Response**

```json
{
  "statusCode": 400,
  "message": ["correo must be an email"],
  "error": "Bad Request"
}
```

---

# 📌 2. GET /users --- Obtener todos los usuarios

**Request**

    GET http://localhost:3000/users/getAllUsers

**Response**

```json
[
  {
    "id": "0ac480f7-f989-4b74-b900-5109fe4eb106",
    "nombreCompleto": "Laura Beltrán",
    "correo": "laura@example.com",
    "rol": "estudiante"
  }
]
```

---

# 📌 3. GET /users/:id --- Obtener usuario por ID

### ✅ **Caso exitoso**

**Request**

    GET http://localhost:3000/users/0ac480f7-f989-4b74-b900-5109fe4eb106

**Response**

```json
{
  "id": "0ac480f7-f989-4b74-b900-5109fe4eb106",
  "nombreCompleto": "Laura Beltrán",
  "correo": "laura@example.com",
  "rol": "estudiante"
}
```

### ❌ **Caso fallido -- UUID incorrecto**

**Request**

    GET http://localhost:3000/users/123

**Response**

```json
{
  "message": "El termino de busqueda ingresado no es un id valido",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

# 📌 4. PATCH /users/:id --- Actualizar usuario

### ✅ **Caso exitoso**

**Request**

    PATCH http://localhost:3000/users/0ac480f7-f989-4b74-b900-5109fe4eb106

```json
{
  "nombreCompleto": "Laura Vanesa Beltrán"
}
```

**Response**

```json
{
  "id": "0ac480f7-f989-4b74-b900-5109fe4eb106",
  "nombreCompleto": "Laura Vanesa Beltrán",
  "correo": "laura@example.com",
  "rol": "estudiante"
}
```

---

# 📌 5. DELETE /users/:id --- Eliminar usuario

### ✅ **Caso exitoso**

**Request**

    DELETE http://localhost:3000/users/0ac480f7-f989-4b74-b900-5109fe4eb106

**Response**

    200 OK
    Se ha elminado el usuario con id: 0ac480f7-f989-4b74-b900-5109fe4eb106

### ❌ **Caso fallido --- ID no encontrado**

**Request**

    DELETE http://localhost:3000/users/f64a0875-dcdd-45b8-93f1-cdc3cff81a1d

**Response**

```json
{
  "message": "Usuario con id f64a0875-dcdd-45b8-93f1-cdc3cff81a1d no encontrado",
  "error": "Bad Request",
  "statusCode": 400
}
```

### ❌ **Caso fallido --- ID no válida**

**Request**

    DELETE http://localhost:3000/users/aaaa

**Response**

```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

# ✔ Conclusión

El CRUD de Users funciona completamente según los requerimientos:

- Validación de DTOs
- Manejo de errores
- Generación de UUID
- Endpoints accesibles
- Respuestas estructuradas mediante interfaces
