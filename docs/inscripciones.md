# 📝 Módulo de Inscripciones — EnrollmentsModule

Este documento describe el funcionamiento del módulo de Inscripciones dentro del backend **EduTrack**, incluyendo sus responsabilidades, estructura, reglas de autorización y ejemplos CRUD basados en la implementación real del repositorio.

---

# 📘 Descripción General

El módulo **Enrollments** administra las inscripciones de estudiantes a cursos.  
Cada inscripción contiene:

- Fecha de inscripción
- Nota (opcional)
- Estudiante asociado
- Curso asociado

El sistema valida estrictamente permisos y evita inscripciones duplicadas mediante una restricción única:

```ts
@Unique('student_course_unique', ['estudiante', 'curso'])
```

Esto garantiza que **un estudiante no pueda inscribirse dos veces al mismo curso**.

---

# 🧩 Responsabilidades del módulo

- Crear nuevas inscripciones.
- Obtener inscripciones individuales o listados según el rol.
- Actualizar información (nota, curso, fecha).
- Eliminar inscripciones.
- Validar duplicados.
- Respetar reglas de acceso según rol y curso del profesor.

---

# 🏛 Estructura de la entidad

```ts
@Entity({ name: 'enrollments' })
@Unique('student_course_unique', ['estudiante', 'curso'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_inscripcion', type: 'date' })
  fechaInscripcion: Date;

  @Column({ nullable: true })
  nota: number;

  @ManyToOne(() => StudentEntity, (est) => est.inscripciones, {
    eager: true,
    onDelete: 'CASCADE',
  })
  estudiante: StudentEntity;

  @ManyToOne(() => CourseEntity, (course) => course.inscripciones, {
    eager: true,
    onDelete: 'CASCADE',
  })
  curso: CourseEntity;
}
```

---

# Reglas de autorización

| Acción                 | Admin | Profesor               | Estudiante     |
| ---------------------- | ----- | ---------------------- | -------------- |
| Crear inscripción      | ✔    | ❌                     | Solo las suyas |
| Ver inscripciones      | ✔    | Solo las de sus cursos | Solo las suyas |
| Ver inscripción por ID | ✔    | Solo de sus cursos     | Solo la suya   |
| Actualizar inscripción | ✔    | Solo de sus cursos     | ❌             |
| Eliminar inscripción   | ✔    | ❌                     | Solo la suya   |

---

# Endpoints

Todos los endpoints se encuentran bajo:

```bash
/enrollments

```

```bash
POST /enrollments — Crear inscripción
```

Requiere:

- Rol: admin
- Estudiante (solo si él es el estudiante inscrito)

**Cuerpo**

```json
{
  "fechaInscripcion": "2024-03-01",
  "studentId": "uuid-estudiante",
  "courseId": "uuid-curso"
}
```

**Respuesta**

```json
{
  "id": "uuid",
  "fechaInscripcion": "2024-03-01",
  "nota": null,
  "estudiante": { "id": "uuidEst" },
  "curso": { "id": "uuidCurso" }
}
```

**Errores comunes**

| Error                                                | Motivo                  |
| ---------------------------------------------------- | ----------------------- |
| 403 - estudiante intenta inscribir a otro estudiante | studentId ≠ user.id     |
| 400 - inscripción duplicada                          | ya existe student-curso |
| 404 - curso o estudiante no existe                   | IDs inválidos           |

```bash
GET /enrollments — Obtener inscripciones
```

Permisos:

- Admin → todas
- Estudiante → solo sus inscripciones
- Profesor → solo inscripciones de cursos que él dicta

El backend ya implementa esta lógica internamente.

**Respuesta**

```json
[
  {
    "id": "uuid",
    "fechaInscripcion": "2024-02-10",
    "nota": 4,
    "estudiante": { "id": "uuidEst" },
    "curso": { "id": "uuidCurso", "nombre": "Algoritmos" }
  }
]
```

```bash
GET /enrollments/:id — Obtener curso por ID
```

Permisos:

- Admin → cualquier inscripción
- Profesor → solo si es un curso dictado por él
- Estudiante → solo su inscripción

**Respuesta**

```json
[
  {
    "id": "uuid",
    "fechaInscripcion": "2024-02-10",
    "nota": 4,
    "estudiante": { "id": "uuidEst" },
    "curso": { "id": "uuidCurso", "nombre": "Algoritmos" }
  }
]
```

```bash
PATCH /enrollments/:id — Actualizar inscripción
```

Requiere:

- Admin
- Profesor → ssolo en curso que dicta

**Cuerpo**

```json
{
  "nota": 4,
  "fechaInscripcion": "2025-02-01"
}
```

**Respuesta**

```json
{
  "id": "uuid",
  "fechaInscripcion": "2025-02-01",
  "nota": 4,
  "estudiante": { "id": "uuidEst" },
  "curso": { "id": "uuidCurso" }
}
```

**Errores comunes**

| Error                                  | Motivo                  |
| -------------------------------------- | ----------------------- |
| 403 - profesor sobre inscripción ajena | No pertenece a su curso |
| 403 - estudiante intenta actualizar    | No permitido            |
| 404 - inscripción no encontrada        | ID inválido             |

```bash
DELETE /enrollments/:id — Eliminar inscripción
```

Requiere:

- Admin → cualquiera
- Estudiante → solo sus inscripciones

**Respuesta**

```json
{
  "message": "Inscripción eliminada correctamente"
}
```

⚠️ Consideraciones

- Eliminación en cascada no afecta cursos ni estudiantes.
- Evita que un profesor elimine inscripciones.
