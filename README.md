# EduTrack -- Primera Entrega

## 📌 Descripción General

EduTrack Backend es un sistema académico básico construido en
**NestJS**, diseñado para gestionar:

- Usuarios (profesores y estudiantes)
- Profesores
- Estudiantes
- Cursos
- Inscripciones

Este proyecto cumple con los requerimientos de la **primera entrega**,
incluyendo:

✔ Proyecto Nest configurado\
✔ Integración con PostgreSQL mediante TypeORM\
✔ Entidades y relaciones del dominio académico\
✔ DTOs con validaciones\
✔ CRUD completo funcionando para `Users`\
✔ Interfaces para todas las entidades\
✔ Configuración de `ValidationPipe` global

---

## 📁 Estructura del proyecto

    src/
     ├── app.module.ts
     ├── main.ts
     ├── users/
     │    ├── dto/
     │    │   ├── create-user.dto.ts
     │    │   └── update-user.dto.ts
     │    ├── entities/
     │    │   └── user.entity.ts
     │    ├── interfaces/
     │    │   └── user.interface.ts
     │    ├── users.controller.ts
     │    ├── users.module.ts
     │    └── users.service.ts
     ├── professors/
     │    ├── dto/...
     │    ├── entities/professor.entity.ts
     │    ├── interfaces/professor.interface.ts
     │    └── professors.module.ts
     ├── students/
     │    ├── dto/...
     │    ├── entities/student.entity.ts
     │    ├── interfaces/student.interface.ts
     │    └── students.module.ts
     ├── courses/
     │    ├── dto/...
     │    ├── entities/course.entity.ts
     │    ├── interfaces/course.interface.ts
     │    └── courses.module.ts
     └── enrollments/
          ├── dto/...
          ├── entities/enrollment.entity.ts
          ├── interfaces/enrollment.interface.ts
          └── enrollments.module.ts

---

## 🛠️ Tecnologías Utilizadas

- **NestJS** (Framework backend Node.js)
- **TypeORM** (ORM para PostgreSQL)
- **PostgreSQL**
- **class-validator** & **class-transformer**
- **TypeScript**

---

## ⚙️ Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Instalar dependencias adicionales

```bash
npm install @nestjs/typeorm typeorm pg class-validator class-transformer
```

### 3. Configurar base de datos

En el archivo `.env`:

    DB_NAME=TestEdutrack
    DB_HOST=localhost
    DB_PORT=5432
    DB_PASSWORD=1234
    DB_USERNAME=postgres

---

## 🚀 Ejecutar el proyecto

```bash
npm run start:dev
```

Servidor disponible en:

    http://localhost:3000

---

## 🧩 Entidades Implementadas

Resumen de entidades:

- **User** -- UUID, nombre, correo, contraseña, rol
- **Professor** -- especialidad, relación 1--1 con User
- **Student** -- año de ingreso, relación 1--1 con User
- **Course** -- nombre, descripción, créditos, relación con Professor
- **Enrollment** -- fecha inscripción, nota, relación con Student y
  Course

---

## 🔐 DTOs y Validación

Todos los DTOs incluyen reglas con `class-validator`, por ejemplo:

```ts
@IsString()
@IsNotEmpty()
nombreCompleto: string;
```

Para Users, Students, Professors, Courses y Enrollments.

---

## 🔄 CRUD Completo Implementado (Users)

Para esta entrega, la entidad **Users** cuenta con un CRUD completamente
funcional.

Además, se documentaron las pruebas y resultados en un archivo aparte:

👉 **[Ver documento de pruebas del CRUD de
Users](./docs/pruebas-users.md)**

### **POST /users**

Crear usuario.

### **GET /users/getAllUsers**

Obtener todos los usuarios.

### **GET /users/:id**

Obtener un usuario por ID.

### **PATCH /users/:id**

Actualizar un usuario.

### **DELETE /users/:id**

Eliminar un usuario.

---

## 📘 Modelo de Datos (Resumen)

Relaciones principales:

- User 1--1 Student\
- User 1--1 Professor\
- Professor 1--N Course\
- Course 1--N Enrollment\
- Student 1--N Enrollment

---

## 👨‍💻 Autor

**Laura Beltrán**  
Proyecto desarrollado como parte del curso de **NestJS** -- Primera
entrega.

---

## 📎 Notas finales

- Las contraseñas aún no están encriptadas (se agregará en entregas
  futuras).
- En la segunda entrega se implementarán servicios y controladores
  para las demás entidades.
