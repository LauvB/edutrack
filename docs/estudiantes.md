# 🎓 Módulo de Estudiantes — StudentsModule

Este documento describe el funcionamiento del módulo de Estudiantes dentro del backend **EduTrack**, incluyendo su estructura interna, reglas de autorización, endpoints disponibles y ejemplos CRUD basados en la implementación real del repositorio.

---

# 📘 Descripción General

El módulo **Students** administra los perfiles de usuarios cuyo rol es:

- `estudiante`

Un estudiante es una extensión del `UserEntity` y contiene:

- Año de ingreso académico
- Relación con el usuario correspondiente (`OneToOne`)
- Lista de inscripciones en cursos (`OneToMany`)

Este módulo aplica reglas estrictas de autorización y validación interna.

---

# 🧩 Responsabilidades del módulo

- Crear perfiles de estudiantes (solo admin).
- Obtener estudiantes individuales o listados.
- Actualizar información del estudiante.
- Eliminar perfiles en cascada (incluye inscripciones).
- Garantizar que el usuario asociado tenga rol `estudiante`.
- Evitar duplicación de perfiles.

---

# 🏛 Estructura de la Entidad

```ts
@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'año_ingreso' })
  añoIngreso: number;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  usuario: UserEntity;

  @OneToMany(() => EnrollmentEntity, (ins) => ins.estudiante)
  inscripciones: EnrollmentEntity[];
}
```

---

# Reglas de autorización

| Acción                    | Admin | Profesor                     | Estudiante     |
| ------------------------- | ----- | ---------------------------- | -------------- |
| Crear perfil estudiante   | ✔    | ❌                           | ❌             |
| Ver todos los estudiantes | ✔    | Solo inscritos en sus cursos | ❌             |
| Ver estudiante por ID     | ✔    | Solo inscritos en sus cursos | Solo su perfil |
| Actualizar estudiante     | ✔    | ❌                           | Solo su perfil |
| Eliminar estudiante       | ✔    | ❌                           | Solo su perfil |

⚠️ Importante:

- Al eliminar un estudiante, sus inscripciones se eliminan en cascada automáticamente.

---

# Endpoints

Todos los endpoints se encuentran bajo:

```bash
/students

```

```bash
POST /students — Crear perfil estudiante
```

Requiere:

- Rol: admin
- Usuario con rol estudiante

**Cuerpo**

```json
{
  "anioIngreso": 2023,
  "userId": "uuid-del-usuario"
}
```

**Respuesta**

```json
{
  "message": "Perfil de estudiante creado correctamente"
}
```

**Errores comunes**

| Error                                     | Motivo                                      |
| ----------------------------------------- | ------------------------------------------- |
| 400 - "usuario debe tener rol estudiante" | Intento de crear perfil sobre un profesor   |
| 400 - "perfil ya existe"                  | El usuario ya tiene un perfil de estudiante |
| 404 - usuario no encontrado               | `userId` inválido                           |

```bash
GET /students — Obtener estudiantes
```

Permisos:

- Admin → obtiene todos
- Profesor → obtiene solo los estudiantes inscritos en sus cursos
- Estudiante → acceso denegado

**Respuesta**

```json
[
  {
    "id": "uuid",
    "anioIngreso": 2023,
    "usuario": {
      "id": "uuidUser",
      "correo": "est1@example.com",
      "rol": "estudiante"
    }
  }
]
```

```bash
GET /students/:id — Obtener perfil por ID
```

Permisos:

- Admin → cualquiera
- Profesor → solo si el estudiante está inscrito en un curso que dicta
- Estudiante → solo su propio perfil

**Respuesta**

```json
{
  "id": "uuidEst",
  "anioIngreso": 2024,
  "usuario": {
    "id": "uuidUser",
    "nombreCompleto": "Laura García",
    "correo": "laura@example.com"
  }
}
```

```bash
PATCH /students/:id — Actualizar estudiante
```

Requiere:

- Admin → puede actualizar cualquiera
- Estudiante → solo su propio perfil
- Profesor → no permitido

**Cuerpo**

```json
{
  "anioIngreso": 2025
}
```

**Respuesta**

```json
{
  "anioIngreso": 2025
}
```

**Errores comunes**

| Error                 | Motivo                                |
| --------------------- | ------------------------------------- |
| 403 - acceso denegado | Se intenta actualizar otro estudiante |
| 404 - no encontrado   | ID inexistente                        |

```bash
DELETE /students/:id — Eliminar perfil
```

Requiere:

- Admin → cualquiera
- Estudiante → solo su perfil

**Respuesta**

```json
{
  "message": "Estudiante eliminado correctamente"
}
```

🔥 Comportamiento especial

- Las inscripciones del estudiante se eliminan automáticamente gracias a CASCADE.
