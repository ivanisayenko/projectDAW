var mongo = require(__dirname + '/code/js/mongoNode.js');
var funcion = require(__dirname + '/code/js/funcionesServer.js');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var path = require('path');
var accion = 1;
var jugadoresTodos = {};
var jugadores = {};
var jugadoresRoom = 0;
var room = "sala";
var roomcount = 0;
server.lastPlayderID = 0;
var numeroMapa = parseInt(Math.random() * (4 - 1) + 1);

app.use('/css', express.static(__dirname + '/code/css'));
app.use('/js', express.static(__dirname + '/code/js'));
app.use('/assets', express.static(__dirname + '/media'));
server.listen(8000, function () {
  console.log('listening on *:8000');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/juego', function (req, res) {
  funcion.linea();
  console.log("--redireccionamos al juego");
  res.sendFile(__dirname + '/pages/game.html')
});

app.get('/invitado', function (req, res) {
  //funcion que hace redirect al juego porque jugamos como invitado
  linea();
  console.log("--jugamos como invitado");
  res.sendFile(__dirname + '/pages/game.html');
});

app.get('/registrar', function (req, res) {
  //funcion que nos registra
  linea();
  console.log("--registramos un usuario nuevo");
  mongo.insertarMongo(req.query.nick, req.query.contr).then(function (registrado) {
    if (registrado) {
      //res.sendFile(__dirname + '/pages/game.html');
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  });
});

app.get('/iniciar', function (req, res) {
  //funcion que nos inica la sesion
  linea();
  console.log("--iniciamos sesion");
  mongo.consultarUsuarioRegistrado(req.query.nick, req.query.contr).then(function (existe) {
    if (existe) {
      // res.json({ruta:"http:www.google.es"});
      // res.send(__dirname + '/pages/game.html');
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  });
});

//FUNCIONES DE MULTIJUGADOR
//funciones de peticion del lado cliente en el menu de incio
io.on('connection', function (socket) {
  //crea un jugador nuevo
  socket.on('newplayer', function () {
    linea();
    console.log("--usuario conectado al inicio");
    // console.log(jugadoresRoom);
    //jugadores room es un contador que guarda cuanjos jugadores hay en la última room creada
    //si hay mas de 2 se resetea y se crea una nueva room
    if (jugadoresRoom < 2) {
      socket.join(room + roomcount);
      jugadoresRoom++;
      if (jugadoresRoom == 2) {
        iniciarPartida(socket);
      }
    } else {
      numeroMapa = parseInt(Math.random() * (4 - 1) + 1);
      roomcount++;
      socket.join(room + roomcount);
      jugadoresRoom = 1;
    }
    jugadoresTodos[socket.id] = funcion.getRoom(socket);
    // console.log(funcion.getRoom(socket));
    socket.player = {
      id: server.lastPlayderID++,
      x: server.lastPlayderID % 2 == 0 ? 300 : 100,
      y: 700,
      numMap: numeroMapa
    };
    // console.log(socket.player);
    //creamos una objeto de jugadores donde la key es la room y el valor es una array de los jugadores que guarda todos aquellos que se han conectado
    if (room + roomcount in jugadores) {
      jugadores[room + roomcount].push(socket.player);
    } else {
      jugadores[room + roomcount] = [];
      jugadores[room + roomcount].push(socket.player);
    }
    // console.log(jugadores);
    nuevoJugador(socket, jugadores[room + roomcount]);
    //al mover el personaje
    socket.on('disconnect', function () {
      linea();
      console.log("--usuario desconectado del inico");
      let id = socket.id;
      let sala = jugadoresTodos[id];
      delete jugadores[sala];
      delete jugadoresTodos[id];
      //reiniciamos las paginas de todos
      socket.broadcast.to(sala).emit('finJuego');
      jugadoresRoom = (jugadoresRoom == 1) ? 0 : 1;
    });
  });


  //enviar moviemiento a los demas usuarios
  socket.on('presionar', function (data) {
    socket.broadcast.to(funcion.getRoom(socket)).emit('presionar', socket.player.id, data);
    //socket.emit('presionar', socket.player.id, movimiento, x, y);
  });

  socket.on('soltar', function (data) {
    // console.log("entramos en el server dodne se suelta la tecla");
    //socket.emit('soltar', socket.player.id);
    socket.broadcast.to(funcion.getRoom(socket)).emit('soltar', socket.player.id, data);
  });

  //reinicia todas las variables del jugador
  socket.on("matarConexiones", function () {
    // console.log();
    let id = socket.id;
    let sala = jugadoresTodos[id];
    //eliminamos la sala
    delete jugadores[sala];
    //eliminamos los jugadores de la sala
    delete jugadoresTodos[id];
    //reiniciamos las paginas de todos
    socket.broadcast.to(sala).emit('finJuego');
    jugadoresRoom = (jugadoresRoom == 1) ? 0 : 1;
  });

  socket.on("numMapaServidor", function () {
    // console.log("devolvemos el numero al game");
    io.sockets.in(funcion.getRoom(socket)).emit('numMapaServidor', numeroMapa);
  })
});

//funciones del aldo cliente en el juego
io.on('connection', function (socket) {
  socket.on('usuarioJuego', function () {
    linea();
    console.log("--usuario conectado al juego");
    socket.on('disconnect', function () {
      linea();
      console.log("--usuario desconectado del juego");
    });
  });
});

//funcion que imprime lin ea separadora en la consola de server
function linea() {
  console.log("\n" + accion + ": ------------------------------");
  accion++;
}

//envia un array de jugadores y el jugador que se ha conectado al juego
function nuevoJugador(socket, jugadores) {
  io.sockets.in(funcion.getRoom(socket)).emit('newplayer', socket.player, jugadores);
}

//funcion que inicia la partida cuando hay 2 jugadores conectados
function iniciarPartida(socket) {
  console.log("inicar partida servidor");
  io.sockets.in(funcion.getRoom(socket)).emit('inicarPartida');
}



