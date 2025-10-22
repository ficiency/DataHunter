Partiendo de la carpeta padre del proyecto, primero: 

1. Se creo el archivo docker-compose.yml para la configuración del docker, el cual incluye la versión, y los services, en este ultimo se pone que volumen, image, container_name, environmente (user, password, name), puerto, entre otras cosas.

2. Despues se definieron las variables de entorno dentro del .env, incluyendo la url de la database asi como sus minimos y  maximos de conexiones posibles (pool). Tambien se incluyo valores del puerto del server, configuración de puppeteer como headless y timeout y cuestiones de seguridad (encryptionKey y JWT secret) y el nivel del logs (info).

3. Se hizo un archivo de prueba llamado test-db.js en la carpeta nueva scripts, para proibar que la imagen se construia exitosamente asi como probar las tablas creadas en src/database/schemas.sql mediante el gestor postgres.js, este ultimo se encarga de la conexión con la db y realizar operaciones con las tablas (query es un metodo base)

🎯 Analogía:
schema.sql = Plano de construcción de una casa 🏗️
Define: cuántos cuartos, dónde van las puertas, qué tamaño tienen
Se usa: una vez al construir la casa
Crea: la estructura física
postgres.js = Sistema de llaves y puertas 🔑
Permite: entrar, salir, abrir cuartos
Se usa: cada vez que alguien entra/sale
Gestiona: el acceso a la estructura


4. Despues profundizamos en la logica y base del servidor, creando el index.js en el directorio raiz de src, y en la carpeta /src/api se hizo server.js y las carpetas controllers con archivo scan-controller.js y routes con archivo scans.js.

5. Se comenzo con server.js, aqui se hace la aplicación principal, se crea la ruta raiz y la de healthcheck asi como cuando el handle Error cuando la ruta solicitada no existe, tambien se aplican metodos de seguridad HTTPs entre otras cosas, el rate limiter para prevenir ataques ddos, y se prepara el montador de rutas.

6. se paso a consturir scans-controller.js, el cual es el encargado de la lógica de negocio y operaciones con la DB. Es llamado por las rutas pero es independiente de ellas

🎨 Analogía:
Routes = Recepcionista del hotel 🏨
"¿Quieres ver todas las habitaciones? Llama a getAllRooms()"
"¿Quieres reservar? Llama a createReservation()"
Solo dirige a la función correcta
Controller = Personal que hace el trabajo 👷
getAllRooms() → Va a la base de datos y trae habitaciones
createReservation() → Guarda la reserva en la DB
Solo ejecuta la lógica

7. después pasamos a construir routes/scans.js, el cual es un Router de Express que define las URLs/endpoints y las conecta con las funciones del controller.
