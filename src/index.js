const express = require('express');
const cors = require('cors');
const moviesJson = require('../web/src/data/movies.json');
const Database = require('better-sqlite3');

//BASE DE DATOS
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

  const response = {
    success: true,
    movies: movies,
  };
  res.json(response);
});

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

server.get('/user/profile', (req, res) => {
  console.log('estamos en user profile');

  const user = req.body.email;
  console.log(id);

  const query = db.prepare(
    'UPDATE user SET email = ?, password = ?, name = ? WHERE userId = ?'
  );

  res.json({ success: true });
});

//Servidor de estaticos
const staticServerPath = './src/public-react';
server.use(express.static(staticServerPath));

server.get('/movies/:moviesId', (req, res) => {
  const requestParamsMovie = req.params.moviesId;

  const moviesData = moviesJson.find(
    (movie) => movie.id === requestParamsMovie
  );

  console.log(moviesData);

  res.render('movie', moviesData);
});
