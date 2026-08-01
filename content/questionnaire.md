# Content Questionnaire

This document gathers the real content needed to complete the portfolio. The answers to these questions will fill the typed data files (`src/data/profile.ts`, `src/data/projects.ts`, `src/data/skills.ts`, `src/data/experience.ts`).

> **Cómo responder:** cada sección corresponde a un bloque del portfolio. Responde cada pregunta con la mayor precisión posible. Si algo no aplica todavía, déjalo marcado como pendiente (ej. `Pendiente` / `TBD`) y lo completamos en una iteración posterior.

---

## 1. Información personal (Personal info)

> Alimenta el Hero y la sección About.

| #   | Pregunta                                                      | Campo destino      | Ejemplo                                            |
| --- | ------------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| 1.1 | ¿Cuál es tu nombre completo?                                  | `profile.name`     | Ana García López                                   |
| 1.2 | ¿Qué título/rol muestras (ej. "Desarrolladora Fullstack JR")? | `profile.role`     | Desarrollador Fullstack Junior                     |
| 1.3 | Escribe una bio corta (1-2 frases) sobre ti y tu motivación.  | `profile.bio`      | Apasionado por crear aplicaciones web completas... |
| 1.4 | ¿Tienes foto o avatar? (ruta o URL, opcional)                 | `profile.photo`    | /assets/avatar.jpg o URL                           |
| 1.5 | ¿Dónde estás ubicado/a? (ciudad, país)                        | `profile.location` | Madrid, España                                     |
| 1.6 | ¿Cuál es tu email de contacto?                                | `profile.email`    | ana.garcia@example.com                             |

## 2. Redes sociales (Social links)

> Alimentan la sección Contact y el Footer.

| #   | Pregunta                                               | Campo destino                  | Ejemplo                           |
| --- | ------------------------------------------------------ | ------------------------------ | --------------------------------- |
| 2.1 | URL de tu perfil de GitHub                             | `profile.socialLinks.github`   | https://github.com/anagarcia      |
| 2.2 | URL de tu perfil de LinkedIn                           | `profile.socialLinks.linkedin` | https://linkedin.com/in/anagarcia |
| 2.3 | ¿Alguna otra red? (Twitter/X, Portfolio antiguo, etc.) | `profile.socialLinks.others`   | https://x.com/anagarcia           |

## 3. Proyectos (Projects)

> Alimentan la sección Projects. Completa una ficha por proyecto (idealmente 3-6 proyectos).

| #   | Pregunta                                                               | Campo destino             | Ejemplo                                                          |
| --- | ---------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------- |
| 3.1 | Nombre del proyecto                                                    | `projects[].name`         | TaskManager                                                      |
| 3.2 | Descripción siguiendo **problema → enfoque → resultado** (2-4 frases). | `projects[].description`  | Las listas de tareas se perdían... Implementé... El resultado... |
| 3.3 | Tecnologías usadas (tags)                                              | `projects[].technologies` | React, Node.js, PostgreSQL                                       |
| 3.4 | URL del demo desplegado (opcional si no existe)                        | `projects[].demoUrl`      | https://taskmanager-demo.vercel.app                              |
| 3.5 | URL del repositorio                                                    | `projects[].repoUrl`      | https://github.com/anagarcia/taskmanager                         |
| 3.6 | Captura de pantalla (ruta o URL, opcional)                             | `projects[].screenshot`   | /assets/projects/taskmanager.png                                 |

## 4. Habilidades (Skills)

> Alimentan la sección Skills, agrupadas por categoría.

| #   | Pregunta                                                           | Campo destino     | Ejemplo                                    |
| --- | ------------------------------------------------------------------ | ----------------- | ------------------------------------------ |
| 4.1 | Habilidades de **frontend** con nivel de dominio                   | `skills.frontend` | React (Avanzado), TypeScript (Intermedio)  |
| 4.2 | Habilidades de **backend** con nivel de dominio                    | `skills.backend`  | Node.js (Intermedio), Express (Intermedio) |
| 4.3 | Habilidades de **base de datos / DevOps / herramientas** con nivel | `skills.tools`    | PostgreSQL, Git, Docker                    |
| 4.4 | Otras habilidades (soft skills, diseño, etc.)                      | `skills.other`    | Trabajo en equipo, Scrum                   |

> Niveles sugeridos: `Básico`, `Intermedio`, `Avanzado`. El nivel se refleja visualmente en la UI.

## 5. Experiencia y educación (Experience & education)

> Alimentan la sección About (timeline). Añade cada puesto, curso o certificación.

| #   | Pregunta                                                     | Campo destino               | Ejemplo                                           |
| --- | ------------------------------------------------------------ | --------------------------- | ------------------------------------------------- |
| 5.1 | Puesto + empresa + fechas + 1-2 logros (experiencia laboral) | `experience.work`           | Desarrollador Frontend en StartupX (2024-2025)... |
| 5.2 | Estudios: título, institución, fechas                        | `experience.education`      | Grado en Ingeniería Informática, UPM (2020-2024)  |
| 5.3 | Certificaciones o cursos destacados                          | `experience.certifications` | freeCodeCamp: Responsive Web Design               |

## 6. Preferencia visual (Visual preference)

> Define la dirección de diseño. Ver propuestas en `spec.md`.

| #   | Pregunta                                                                                                          | Campo destino |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------- |
| 6.1 | ¿Qué propuesta visual prefieres?                                                                                  | `design`      |
| -   | **Opción A — Dark & Modern** (recomendada): fondo oscuro, acentos cian/violeta, glassmorphism, animaciones suaves |               |
| -   | **Opción B — Minimal Light**: fondo blanco limpio, un solo color de acento, mucho espacio                         |               |
| -   | **Opción C — Bold Gradient**: base oscura con degradados vibrantes púrpura→rosa→naranja                           |               |
