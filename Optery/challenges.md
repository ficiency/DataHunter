# Preparación para Full Stack Developer - Optery
Job Post: https://www.workatastartup.com/jobs/82853

## 📋 Requerimientos Técnicos del Puesto

### Requerimientos Obligatorios
- **Node.js**: 2+ años de experiencia en proyectos significativos
- **Programación Asíncrona**: Entendimiento profundo de async/await, Promises, callbacks
- **Arquitectura Event-Driven**: Manejo de eventos y arquitecturas basadas en eventos
- **Web Scraping**: Experiencia con crawlers y herramientas de automatización web
- **Bases de Datos**:
  - SQL: PostgreSQL
  - NoSQL: Redis, Elasticsearch, MongoDB
- **REST APIs**: Desarrollo e integración con servicios de terceros
- **Seguridad de Datos**: Best practices para manejo seguro de datos de usuarios
- **Frontend Básico**: HTML, CSS, conocimientos básicos de desarrollo frontend
- **Trabajo Remoto**: Capacidad de trabajo independiente

### Requerimientos Bonus (Opcionales)
- **Puppeteer**: Automatización y scraping web
- **Generative AI**: Uso de IA para mejorar automatización de workflows
- **Python y Django**: Familiaridad con el stack
- **Message Brokers**: RabbitMQ, Kafka
- **Cloud & Containerización**: Kubernetes, AWS, GCP, Azure

### Stack Tecnológico de Optery
- **Backend**: Python, Django, Node.js
- **Frontend**: React
- **Infraestructura**: AWS, Kubernetes (EKS), Grafana, Loki

---

## 🎯 Retos de Preparación

### NIVEL 1: FUNDAMENTOS (Fácil)

> **Leyenda**: 🔴 = CRÍTICO para la vacante | ⚪ = OPCIONAL/BONUS

#### 🔴 Reto 1.1: Async/Await Básico
Crea un programa que:
- Haga 3 peticiones HTTP a diferentes APIs públicas (ejemplo: JSONPlaceholder, OpenWeather, etc.)
- Use async/await correctamente
- Maneje errores con try/catch
- Muestre los resultados en consola

#### 🔴 Reto 1.2: Servidor REST API Simple
Desarrolla una API REST con Node.js (Express) que:
- Tenga endpoints CRUD para "productos" (GET, POST, PUT, DELETE)
- Use arrays en memoria (sin base de datos)
- Retorne respuestas JSON correctas
- Implemente validación básica de datos

#### 🔴 Reto 1.3: Conexión a PostgreSQL
Crea una aplicación que:
- Se conecte a PostgreSQL usando `pg` o `node-postgres`
- Cree una tabla de "usuarios" (id, nombre, email, fecha_creacion)
- Implemente operaciones CRUD básicas
- Use prepared statements para prevenir SQL injection

#### 🔴 Reto 1.4: Web Scraper Básico
Desarrolla un scraper que:
- Extraiga títulos y links de una página de noticias
- Use `axios` o `node-fetch` para obtener el HTML
- Use `cheerio` para parsear el HTML
- Guarde los resultados en un archivo JSON

---

### NIVEL 2: INTERMEDIO (Medio)

> **Leyenda**: 🔴 = CRÍTICO para la vacante | ⚪ = OPCIONAL/BONUS

#### 🔴 Reto 2.1: Event Emitter Custom
Crea un sistema de eventos que:
- Implemente un EventEmitter personalizado
- Simule un sistema de logs con diferentes niveles (info, warning, error)
- Tenga múltiples listeners que reaccionen a diferentes eventos
- Implemente un sistema de prioridad para los listeners

#### 🔴 Reto 2.2: API con Rate Limiting
Desarrolla una API que:
- Implemente rate limiting (máximo 10 requests por minuto por IP)
- Use Redis para almacenar los contadores
- Retorne headers apropiados (X-RateLimit-Remaining, X-RateLimit-Reset)
- Maneje errores 429 (Too Many Requests) correctamente

#### 🔴 Reto 2.3: Web Crawler con Queue
Crea un crawler que:
- Inicie desde una URL seed
- Extraiga todos los links de la página
- Siga los links de manera recursiva (máximo 3 niveles de profundidad)
- Use una cola (queue) para manejar las URLs a visitar
- Evite visitar la misma URL dos veces
- Respete robots.txt
- Implemente delays entre requests

#### 🔴 Reto 2.4: Scraper con Puppeteer
Desarrolla un scraper que:
- Use Puppeteer para cargar páginas con JavaScript
- Navegue por un sitio con paginación
- Extraiga datos de múltiples páginas
- Tome screenshots de las páginas visitadas
- Maneje timeouts y errores de red

#### ⚪ Reto 2.5: Data Pipeline con MongoDB
Crea un pipeline que:
- Lea datos de una API pública
- Transforme los datos (limpie, normalice)
- Almacene los datos en MongoDB
- Implemente índices apropiados
- Use aggregation pipeline para generar reportes

#### 🔴 Reto 2.6: Clasificación de Formularios con IA
Desarrolla un sistema que:
- Use OpenAI API (o similar) para analizar páginas HTML
- Identifique si una página contiene un formulario de opt-out/unsubscribe
- Clasifique el tipo de formulario (email, SMS, data removal, etc.)
- Extraiga los campos requeridos del formulario
- Genere un JSON estructurado con la información del formulario
- Maneje errores de la API y respuestas ambiguas
- Implemente caché de resultados para URLs ya analizadas

#### 🔴 Reto 2.7: Integración Full Stack (Node.js + Django + React)
Crea un sistema híbrido que:
- **Backend Principal (Node.js + Express)**:
  - API REST para gestionar trabajos de scraping
  - Reciba solicitudes de usuarios
  - Envíe jobs a un servicio Django
- **Servicio de Procesamiento (Python + Django)**:
  - Cree una API Django simple con un endpoint
  - Procese datos pesados (ej: análisis de texto, ML simple)
  - Devuelva resultados al servicio Node.js
- **Frontend (React)**:
  - Interfaz para crear solicitudes de scraping
  - Visualice el estado de los jobs (pendiente, procesando, completado)
  - Muestre resultados en una tabla o tarjetas
- **Comunicación**:
  - Node.js se comunica con Django vía HTTP
  - Usa PostgreSQL compartida entre ambos servicios
  - Implementa autenticación básica entre servicios

---

### NIVEL 3: AVANZADO (Difícil)

> **Leyenda**: 🔴 = CRÍTICO para la vacante | ⚪ = OPCIONAL/BONUS

#### 🔴 Reto 3.1: Sistema de Job Queue Distribuido
Desarrolla un sistema que:
- Use Bull o BullMQ (basado en Redis) para job queues
- Implemente workers que procesen jobs en paralelo
- Maneje reintentos automáticos en caso de fallo
- Implemente prioridades de jobs
- Tenga un dashboard para monitorear el estado de los jobs
- Maneje dead letter queues para jobs fallidos

#### 🔴 Reto 3.2: Crawler Robusto con Anti-Ban
Crea un web crawler que:
- Use Puppeteer con stealth plugin para evitar detección
- Implemente rotación de User-Agents
- Use proxies rotativos
- Maneje CAPTCHAs (detección y logging)
- Implemente backoff exponencial en caso de errores
- Use headless browser con fingerprinting aleatorio
- Guarde el progreso para poder reanudar después de interrupciones

#### 🔴 Reto 3.3: API de Opt-Out Automatizado
Desarrolla un sistema que:
- Permita a usuarios registrar sus datos personales
- Busque esos datos en sitios "data brokers" simulados
- Genere solicitudes de eliminación automatizadas
- Verifique que la eliminación fue exitosa
- Envíe notificaciones al usuario sobre el progreso
- Use PostgreSQL para almacenar usuarios y requests
- Use Redis para caché de resultados de búsqueda

#### ⚪ Reto 3.4: Sistema de Scraping Distribuido
Implementa un sistema que:
- Use RabbitMQ o Kafka para distribuir tareas de scraping
- Tenga múltiples workers que consuman de la cola
- Implemente un coordinator que distribuya el trabajo
- Maneje fallos de workers (health checks)
- Use Elasticsearch para almacenar y buscar los datos scrapeados
- Implemente deduplicación de datos
- Tenga métricas y logging centralizado

#### 🔴 Reto 3.5: Automation Workflow con IA
Crea un sistema que:
- Use un modelo de lenguaje (OpenAI API o similar) para entender páginas web
- Identifique automáticamente formularios de opt-out
- Genere estrategias de llenado de formularios
- Valide que los formularios fueron enviados correctamente
- Aprenda de errores previos
- Use Puppeteer para automatización del navegador
- Implemente logging detallado del proceso

#### ⚪ Reto 3.6: Infraestructura con Docker & Kubernetes
Desarrolla una aplicación que:
- Contenga un API, workers, y base de datos
- Cree Dockerfiles optimizados para cada servicio
- Use Docker Compose para desarrollo local
- Cree manifiestos de Kubernetes (Deployments, Services, ConfigMaps)
- Implemente health checks y readiness probes
- Configure auto-scaling basado en carga
- Use secrets para credenciales sensibles

---

## 🔐 Desafíos de Seguridad

### 🔴 Desafío S1: Protección de Datos Personales
Implementa un sistema que:
- Encripte datos sensibles en PostgreSQL
- Use bcrypt para hashear passwords
- Implemente JWT para autenticación
- Valide y sanitice todos los inputs
- Prevenga SQL injection, XSS, y CSRF

### 🔴 Desafío S2: Manejo Seguro de Credenciales
Crea una aplicación que:
- Nunca almacene credenciales en código
- Use variables de entorno
- Implemente vault para secretos (opcional: HashiCorp Vault)
- Rote credenciales periódicamente
- Audite accesos a datos sensibles

---

## 📊 Proyecto Final Integrador

### 🔴 Sistema Completo de Data Privacy
Construye una versión simplificada de Optery que:

**Features del MVP:**
1. **User Management**
   - Registro y login de usuarios
   - Almacenamiento seguro de datos personales
   
2. **Data Discovery**
   - Crawler que busque el nombre del usuario en 5 sitios simulados
   - Detecte presencia de datos personales
   - Genere un reporte con screenshots

3. **Removal Automation**
   - Identifique formularios de opt-out
   - Rellene formularios automáticamente con Puppeteer
   - Envíe solicitudes de eliminación
   
4. **Verification & Reporting**
   - Verifique que los datos fueron removidos
   - Genere reportes visuales con before/after
   - Notifique al usuario del progreso

5. **API & Frontend**
   - REST API completa documentada
   - Frontend simple en React para visualizar reportes
   - Dashboard con estadísticas

**Requisitos Técnicos:**
- Backend: Node.js + Express
- Base de Datos: PostgreSQL + Redis
- Automation: Puppeteer
- Queue: Bull/BullMQ
- Frontend: React (básico)
- Containerización: Docker
- Testing: Jest + Supertest
- Documentación: Swagger/OpenAPI

**Criterios de Éxito:**
- Código limpio y bien estructurado
- Manejo apropiado de errores
- Tests unitarios e integración
- Documentación clara
- Seguridad implementada
- Performance optimizada
- Logs y monitoring

---

## 📚 Recursos de Estudio Recomendados

### Node.js & Async Programming
- Documentación oficial de Node.js
- "Node.js Design Patterns" por Mario Casciaro
- Event Loop explicado

### Web Scraping
- Documentación de Puppeteer
- Documentación de Cheerio
- Best practices de web scraping ético

### Bases de Datos
- PostgreSQL Tutorial oficial
- Redis Documentation
- MongoDB University (cursos gratuitos)

### Arquitectura
- Event-Driven Architecture patterns
- Microservices patterns
- Queue-based systems

### Seguridad
- OWASP Top 10
- Secure coding practices
- Data privacy regulations (GDPR basics)

---

## ✅ Checklist de Preparación

- [ ] Dominar async/await y Promises en Node.js
- [ ] Crear al menos 3 web scrapers diferentes
- [ ] Implementar un sistema de queues con Redis
- [ ] Trabajar con Puppeteer en al menos 2 proyectos
- [ ] Crear APIs REST bien documentadas
- [ ] Integrar PostgreSQL y MongoDB en proyectos
- [ ] Implementar autenticación y autorización segura
- [ ] Crear Dockerfiles y usar Docker Compose
- [ ] Estudiar arquitecturas event-driven
- [ ] Practicar debugging y troubleshooting
- [ ] Leer sobre compliance y privacidad de datos
- [ ] Completar el proyecto final integrador

---

## 🎓 Notas Importantes

1. **Ética en Web Scraping**: Siempre respeta robots.txt, términos de servicio, y leyes locales
2. **Performance**: Optimiza desde el inicio, el scraping a escala requiere eficiencia
3. **Error Handling**: En scraping, los errores son comunes - manéjalos apropiadamente
4. **Testing**: Testea especialmente casos edge (sitios caídos, HTML malformado, etc.)
5. **Documentación**: Documenta tus decisiones técnicas y arquitectura

---

## 🚀 Próximos Pasos

1. Comienza con los retos de Nivel 1
2. Avanza a Nivel 2 cuando te sientas cómodo
3. Tackle Nivel 3 cuando domines los anteriores
4. Completa el Proyecto Final Integrador
5. Prepara tu portfolio con estos proyectos
6. Estudia el producto de Optery para entender su misión
7. Prepara preguntas sobre su arquitectura y desafíos técnicos

¡Buena suerte con tu preparación! 💪

