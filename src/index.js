const express = require('express');
const cors = require('cors');
const moviesJson = require('../web/src/data/movies.json');
const Database = require('better-sqlite3');

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
  const query = db.prepare('SELECT * FROM movies ORDER BY title ?');

  const movies = query.all(req.query.sort);
  // respondemos a la petición con los datos que ha devuelto la base de datos

  const response = {
    success: true,
    movies: movies,
  };
  res.json(response);
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

//BASE DE DATOS
const db = new Database('./src/db/database.db', { verbose: console.log });
