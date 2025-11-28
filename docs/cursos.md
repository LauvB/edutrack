# 📚 Módulo de Cursos — CoursesModule

Este documento describe el funcionamiento del módulo de Cursos dentro del backend **EduTrack**, incluyendo responsabilidades, estructura, reglas de autorización, endpoints disponibles y ejemplos CRUD basados en la implementación real del repositorio.

---

# 📘 Descripción General

El módulo **Courses** administra los cursos disponibles en la plataforma. Cada curso está asociado a:

- Un nombre
- Una descripción
- Un número de créditos
- Un profesor responsable (perfil de profesor)

Las relaciones también permiten obtener:

- Inscripciones de estudiantes al curso
- Profesor que lo dicta
- Restricciones basadas en el rol del usuario autenticado

---

# 🧩 Responsabilidades del módulo

- Crear cursos (profesor autenticado o admin).
- Obtener cursos individuales o listados.
- Actualizar cursos (solo el profesor que los dicta o admin).
- Eliminar cursos (solo profesor responsable o admin).
- Validar asignación correcta de profesor.
- Controlar permisos mediante guards y validaciones internas.

---

# 🏛 Estructura de la entidad

```ts
@Entity({ name: 'courses' })
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column('int')
  creditos: number;

  @ManyToOne(() => ProfessorEntity, (profesor) => profesor.cursos, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  profesor: ProfessorEntity;

  @OneToMany(() => EnrollmentEntity, (ins) => ins.curso)
  inscripciones: EnrollmentEntity[];
}
```

---

# Reglas de autorización

| Acción               | Admin | Profesor            | Estudiante |
| -------------------- | ----- | ------------------- | ---------- |
| Crear curso          | ✔    | Solo si él lo dicta | ❌         |
| Ver todos los cursos | ✔    | Solo los suyos      | ✔         |
| Ver curso por ID     | ✔    | Solo los suyos      | ✔         |
| Actualizar curso     | ✔    | Solo los suyos      | ❌         |
| Eliminar curso       | ✔    | Solo los suyos      | ❌         |

⚠️ Importante:

- El profesor solo puede administrar cursos de los cuales es el profesor asignado.
- Los estudiantes pueden ver cursos, pero no modificarlos.

---

# Endpoints

Todos los endpoints se encuentran bajo:

```bash
/courses

```

```bash
POST /courses — Crear curso
```

Requiere:

- Rol: admin
- Profesor (solo si se asigna a sí mismo)

**Cuerpo**

```json
{
  "nombre": "Algoritmos Avanzados",
  "descripcion": "Estudio de técnicas de optimización",
  "creditos": 3,
  "profesorId": "uuid-del-profesor"
}
```

**Respuesta**

```json
{
  "message": "Curso creado correctamente",
  "id": "uuid-generado"
}
```

**Errores comunes**

| Error                      | Motivo                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| 400 - profesor no existe   | `profesorId` inválido                                                   |
| 403 - profesor no coincide | El profesor autenticado intenta crear un curso asignado a otro profesor |
| 400 - campos inválidos     | Error en DTO                                                            |

```bash
GET /courses/getAllCourses — Obtener todos los cursos
```

Permisos:

- Admin
- Estudiante → todos
- Profesor → solo los suyos

El backend ya implementa esta lógica internamente.

**Respuesta**

```json
{
  "courses": [
    {
      "id": "uuid",
      "nombre": "Algoritmos",
      "descripcion": "Curso básico",
      "creditos": 3,
      "profesor": {
        "id": "uuidProf",
        "especialidad": "Programación"
      }
    }
  ]
}
```

```bash
GET /courses/:id — Obtener curso por ID
```

Permisos:

- Admin
- Profesor → solo si dicta el curso
- Estudiante → cualquiera

**Respuesta**

```json
{
  "id": "uuid",
  "nombre": "Estructuras de Datos",
  "descripcion": "Árboles, grafos y más.",
  "creditos": 4,
  "profesor": {
    "id": "uuidProf",
    "usuario": { "nombreCompleto": "Laura Beltrán" }
  }
}
```

```bash
PATCH /courses/:id — Actualizar curso
```

Requiere:

- Admin
- Profesor → si lo dicta

**Cuerpo**

```json
{
  "nombre": "Estructuras de Datos II",
  "creditos": 5
}
```

**Respuesta**

```json
{
  "id": "uuid",
  "nombre": "Estructuras de Datos II",
  "descripcion": "Árboles, grafos y más.",
  "creditos": 5,
  "profesor": {
    "id": "uuidProf"
  }
}
```

**Errores comunes**

| Error                     | Motivo                                 |
| ------------------------- | -------------------------------------- |
| 403 - no dicta el curso   | Profesor intenta modificar curso ajeno |
| 404 - curso no encontrado | ID inválido                            |

```bash
DELETE /courses/:id — Eliminar curso
```

Requiere:

- Admin → cualquiera
- Profesor → si lo dicta

**Respuesta**

```json
{
  "message": "Curso eliminado correctamente"
}
```

⚠️ Consideraciones

- Las inscripciones relacionadas se eliminan en cascada.
- Si se necesita eliminar un profesor con cursos, primero deben eliminarse o reasignarse sus cursos.
