const express = require('express');
const cors = require('cors');
const moviesJson = require('../web/src/data/movies.json');

//aqui configuramos la base de datos instalando la dependencia de npm better-sqlite3
const Database = require('better-sqlite3');

//BASE DE DATOS

//cramos una base de datos con dos tablas primero con las peliculas y luego le añadimos las usuarias
const db = new Database('./src/db/database.db', { verbose: console.log });

// create and config server
const server = express();
server.use(cors());
server.use(express.json());
server.set('view engine', 'ejs');

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//Esto es un endpoint para pedir las peliculas y ademas tenemos los "filtros" para ordenar por titulo y por genero
server.get('/movies', (req, res) => {
  // preparamos y ejecutamos la query
  let movies;

  if (req.query.gender === '') {
    const query = db.prepare(
      `SELECT * FROM movies ORDER BY title ${req.query.sort}`
    );
    movies = query.all();
  } else {
    const query = db.prepare(
      `SELECT * FROM movies WHERE gender=? ORDER BY title ${req.query.sort}`
    );
    movies = query.all(req.query.gender);
  }

  // respondemos a la petición con los datos que ha devuelto la base de datos
  //antes teniamos los datos por JSON y más adelante los pasamos a una base de datos
  const response = {
    success: true,
    movies: movies,
  };
  res.json(response);
});

//Este es el registro de nuevas usarias en el back, donde recoge los datos del front a traves de body params y tambien comprueba si la usuaria ya ha sido registrada a traves de un if

server.post('/sign-up', (req, res) => {
  // nos traemos el body (data)
  const email = req.body.email;
  const password = req.body.password;

  //ahora verificamos si existe la usuario
  const queryUser = db.prepare('SELECT * FROM user WHERE email=?');
  const foundUser = queryUser.get(email); //antes habia run, hemos cambiado las bases de datos de dos a una con dos tablas, pero no entendemos porque antes de

  console.log(foundUser);

  if (foundUser === undefined) {
    // ahora creamos la query para isertar a las usuarias.
    const query = db.prepare(
      'INSERT INTO user (email, password) VALUES (?,?) '
    );
    //se utiliza .run xq queremos añadir registros.
    const userInsert = query.run(email, password);
    res.json({
      success: true,
      userId: userInsert.lastInsertRowid,
    });
  } else {
    res.json({
      success: false,
      message: 'Error email ya existe',
    });
  }
});

server.post('/user/profile', (req, res) => {
  console.log('estamos en user profile');

  const user = req.body.email;
  console.log(req.headers);

  const query = db.prepare(
    'UPDATE user SET email = ?, password = ?, name = ? WHERE userId = ?'
  );

  res.json({ success: true });
});

//Escucha las peticiones para crear un motor de plantillas
//En views/movie.ejs creamos el motor de plantillas para renderizar las peliculas y su información

//Está esperando a que desde el navegador se le solicite un fichero (con un endpoint). Cuando esto sucede, el endpoint:
// Coge una plantilla.
// Obtiene los datos, generalmente desde una base de datos. En esta lección todavía no sabemos cómo trabajar con bases de datos, así que vamos a obtenerlos de un JSON.
// Mete los datos en la plantilla. A este proceso se le llama renderizado.
// Y devuelve la plantilla personalizada al navegador para que la usuaria la visualice.
server.get('/movies/:moviesId', (req, res) => {
  const requestParamsMovie = req.params.moviesId;

  const moviesData = moviesJson.find(
    (movie) => movie.id === requestParamsMovie
  );

  console.log(moviesData);

  res.render('movie', moviesData);
});
//Servidor de estaticos
//Un servidor de ficheros estáticos es un servidor que devuelve al navegador que los solicita ficheros sin modificar, independientemente de quién, cuándo o desde dónde los pida
//Este endpoint siempre, siempre, siempre debe ser el último, por detrás del resto de endpoints y de los servidores de estáticos.

//Cuando se entra en la página http://localhost:3000, no estamos indicando ningún fichero en la URL. Por ello el servidor de estáticos busca en public/ si existe el fichero index.html, lo encuentra y lo devuelve.

//Esto sirve para conectar el servidor de react (3000) con el servidor back (4000)
const staticServerPath = './src/public-react';
server.use(express.static(staticServerPath));
