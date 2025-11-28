# 🎓 Módulo de Profesores — ProfessorsModule

Este documento describe el funcionamiento del módulo de Profesores del backend **EduTrack**, incluyendo responsabilidades, endpoints, reglas de autorización, validaciones y ejemplos CRUD basados en el código real del repositorio.

---

# 📘 Descripción General

El módulo **Professors** administra el perfil académico de los usuarios cuyo rol es:

- `profesor`

Un profesor **no es un usuario independiente**, sino una extensión del `UserEntity`.  
Cada profesor tiene:

- Una **especialidad**
- Un **usuario asociado (OneToOne)**
- Una lista de **cursos dictados**

---

# 🧩 Responsabilidades del módulo

- Crear perfiles de profesor (solo admin).
- Obtener información de profesores.
- Actualizar especialidad.
- Eliminar un profesor (si no tiene cursos asignados).
- Validar que el usuario asociado tenga el rol adecuado.
- Evitar duplicación de perfiles para el mismo usuario.
- Verificar permisos según rol usando Guards y lógica interna.

---

# 🏛 Estructura de la Entidad

```ts
@Entity({ name: 'professors' })
export class ProfessorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  especialidad: string;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  usuario: UserEntity;

  @OneToMany(() => CourseEntity, (course) => course.profesor)
  cursos: CourseEntity[];
}
```

---

# Reglas de autorización

| Acción                   | Admin | Profesor       | Estudiante |
| ------------------------ | ----- | -------------- | ---------- |
| Crear perfil profesor    | ✔    | ❌             | ❌         |
| Ver todos los profesores | ✔    | ✔             | ✔         |
| Ver profesor por ID      | ✔    | ✔             | ✔         |
| Actualizar profesor      | ✔    | Solo su perfil | ❌         |
| Eliminar profesor        | ✔    | Solo su perfil | ❌         |

⚠️ Restricción importante:

Un profesor no puede eliminarse si tiene cursos asignados.

---

# Endpoints

Todos los endpoints se encuentran bajo:

```bash
/professors

```

```bash
POST /professors — Crear perfil profesor
```

Requiere:

- Rol: admin
- Usuario con rol profesor previamente creado

**Cuerpo**

```json
{
  "especialidad": "Ingeniería de Software",
  "userId": "uuid-del-usuario"
}
```

**Respuesta**

```json
{
  "message": "Perfil de profesor creado correctamente"
}
```

**Errores comunes**

| Error                           | Motivo                                                  |
| ------------------------------- | ------------------------------------------------------- |
| 400 - "debe tener rol profesor" | Se intenta crear un perfil para un usuario con otro rol |
| 400 - "ya tiene un perfil"      | El usuario ya es profesor                               |
| 404 - "usuario no encontrado"   | `userId` inválido                                       |

```bash
GET /professors — Obtener todos los profesores
```

Disponible para todos los usuarios.

**Respuesta**

```json
[
  {
    "id": "uuid1",
    "especialidad": "Matemáticas",
    "usuario": {
      "id": "uuidUser",
      "correo": "prof1@example.com",
      "rol": "profesor"
    }
  }
]
```

```bash
GET /professors/:id — Obtener profesor por ID
```

Disponible para todos los usuarios.

**Respuesta**

```json
{
  "id": "uuid",
  "especialidad": "Bases de Datos",
  "usuario": {
    "id": "uuidUser",
    "correo": "profesor@example.com"
  }
}
```

```bash
GET /professors/byUser/:userId — Obtener perfil del profesor autenticado
```

**Respuesta**

```json
{
  "id": "uuidProfesor",
  "especialidad": "Programación",
  "usuario": {
    "id": "uuidUser",
    "nombreCompleto": "Laura Beltrán",
    "correo": "laura@example.com"
  },
  "cursos": [
    { "id": "uuidCurso1", "nombre": "Algoritmos" },
    { "id": "uuidCurso2", "nombre": "Estructuras de Datos" }
  ]
}
```

```bash
PATCH /professors/:id — Actualizar especialidad
```

Requiere:

- Admin → puede actualizar cualquiera
- Profesor → solo su perfil

**Cuerpo**

```json
{
  "especialidad": "Arquitectura de Software"
}
```

**Respuesta**

```json
{
  "id": "uuid",
  "especialidad": "Arquitectura de Software",
  "usuario": { "id": "uuidUser", "correo": "prof@example.com" }
}
```

**Errores comunes**

| Error                                    | Motivo                                    |
| ---------------------------------------- | ----------------------------------------- |
| 403 - "solo puedes actualizar tu perfil" | ID no corresponde al profesor autenticado |
| 404 - profesor no encontrado             | ID inválido                               |

```bash
DELETE /professors/:id — Eliminar perfil
```

Requiere:

- Admin → cualquier profesor
- Profesor → solo su perfil

El backend evita eliminar:

- Profesores con cursos asociados
  (error code 23503 → integridad referencial)

**Respuesta**

```json
{
  "message": "Profesor con id <uuid> eliminado correctamente"
}
```

**Errores comunes**

| Error         | Motivo                                         |
| ------------- | ---------------------------------------------- |
| 403 Forbidden | Intento de eliminar o actualizar otro profesor |
| 400 / 23503   | El profesor tiene cursos asociados             |
| 404 Not Found | ID inexistente                                 |
