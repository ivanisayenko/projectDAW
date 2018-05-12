//VARIABLES------------------------------------------------------------------------------------------------------------------------------------
var suelo, arboles, jugador1, cursors, hit1;
var Timer = 0;
var salto = true;
var jugadoresImprimidos = new Map();
var idJugadoresImprimidos = [];
var game = new Phaser.Game(1920, 900, Phaser.AUTO, document.getElementById('game'));
var idContactoPermitido = [5, 6, 19];
var Game = {};
var miid = 0;
var mensaje;
var mensajeOculto;
var map;
var otromapa;
var posx, posy;
var cantidadSalto = 0;
var sePuedeJugar = true;
var propiedadesTexto = {
    fill: "white",
    stroke: "black",
    fontSize: 40
};
var quieto = true;
var countCon = 0;
var direccion;
var contadorTecla = 0;
var mostrarMensajeOculto = false;
var frase;
Game.playerMap = new Map();


//FUNCIONES GAME---------------------------------------------------------------------------------------------------------------------------------
Game.addNewPlayer = function (id, x, y, jugadores, numMapa) {
    if (jugadoresImprimidos.size < 1) {
        miid = id;
        //dibujamos el mapa para el jugador
        map = game.add.tilemap(`mapa${numMapa}`);
        map.addTilesetImage('paisaje', `tileset${numMapa}`);
        nocolision = map.createLayer('nocolision');
        suelo = map.createLayer('suelo');
        doblesuelo = map.createLayer('doblesuelo');
        arboles = map.createLayer('arboles');
        map.setCollisionBetween(40, 216, true, suelo);
        map.setCollisionBetween(40, 216, true, doblesuelo);
        game.physics.p2.convertTilemap(map, suelo);
        game.physics.p2.convertTilemap(map, doblesuelo);
        countCon = 1;
    }

    let g = game.add.sprite(x, y, 'caballero');
    Game.playerMap.set(id, g);
    var jugador = Game.playerMap.get(id);
    jugador.anchor.setTo(0.5, 0.5);
    jugador.scale.setTo(1.3, 1.3);
    jugador.animations.add('right', [15, 16, 17, 18, 19], 60, true);
    jugador.animations.add('stay', [1, 2, 3, 4], 60, true);
    jugador.animations.add('hit1', [5, 6, 7, 8, 9, 10], 60, false);
    jugador.animations.add('hit2', [11, 12, 13, 14], 60, true);

    game.physics.p2.enable(jugador, true);
    //resizePolygon('ninja_physics', 'ninja_escalado', 'correr', 0.1);
    jugador.body.setRectangle(35, 58, -10, 22);
    //jugador.body.loadPolygon("ninja_escalado", "correr");
    jugador.body.fixedRotation = true;
    jugador.body.mass = 70;
    jugadoresImprimidos.set(id, g);
    idJugadoresImprimidos.push(id);
    textoEspera();
    //imprimimos los juagdores que no se muestran 
    //recorremos la array de jugadores que hemos pasado desde el servidor 
    //el servidor nos devuelve la array de todos los jugadores que se han conectado
    for (let player of jugadores) {
        //si el jugador no esta imprimido y id no coincide con actual, se crea un nuevo jugador (se evita que se impriman dobles)
        if (player.id != id && idJugadoresImprimidos.indexOf(player.id) == -1) {
            imprimirJugador(player);
        }
    }
};

Game.create = function () {
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 5000;
    game.stage.backgroundColor = '#ccffff';
    cursors = game.input.keyboard.createCursorKeys();
    hit1 = game.input.keyboard.addKey(Phaser.Keyboard.C);
    hit2 = game.input.keyboard.addKey(Phaser.Keyboard.X);
    Client.askNewPlayer();
    game.physics.p2.setPostBroadphaseCallback(checkOverlap, this);
};

Game.update = function () {
    //solo permite movimiento
    if (sePuedeJugar) {
        if (jugadoresImprimidos.size != 0) {
            var data = {
                x: jugadoresImprimidos.get(miid).x,
                y: jugadoresImprimidos.get(miid).y
            };
        }
        //movimiento para el personaje que controla el jugador
        if (cursors.left.isDown && quieto) {
            direccion = "left";
            Client.presionar(data, "izquierda");
            moverJugador(miid, "izquierda");
        } else if (cursors.right.isDown && quieto) {
            direccion = "right";
            Client.presionar(data, "derecha");
            moverJugador(miid, "derecha");
        } else if (quieto) {
            if (jugadoresImprimidos.size != 0) {
                Client.soltar(data);
                if (jugadoresImprimidos.has(miid)) {
                    jugadoresImprimidos.get(miid).body.velocity.x = 0;
                    jugadoresImprimidos.get(miid).animations.play('stay', 10, true);
                }
            }
        }
        if (cursors.up.isDown) {
            while (salto) {
                jugadoresImprimidos.get(miid).body.moveUp(1200);
                salto = false;
            }
            Client.presionar(data, "salto");
        } else if (cursors.up.isUp) {
            salto = true;
        }
        if (hit1.isDown) {
            Client.ataque("hit1");
            pegar1(miid);
        }
        if (hit2.isDown) {
            Client.ataque("hit2");
            pegar2(miid);
        }
    }
    //parte de easter egg
    if (game.input.keyboard.addKey(Phaser.Keyboard.R).isDown) {
        contadorTecla += 1;
        if (contadorTecla == 200) {
            imprimirMensajeOculto("rius");
            cuentaAtras(5);
            mostrarMensajeOculto = true;
        }
    } else if (game.input.keyboard.addKey(Phaser.Keyboard.I).isDown) {
        contadorTecla += 1;
        if (contadorTecla == 200) {
            imprimirMensajeOculto("inma");
            cuentaAtras(5);
            mostrarMensajeOculto = true;
        }
    } else if (game.input.keyboard.addKey(Phaser.Keyboard.S).isDown) {
        contadorTecla += 1;
        if (contadorTecla == 200) {
            imprimirMensajeOculto("samuel");
            cuentaAtras(5);
            mostrarMensajeOculto = true;
        }
    }
    //easter egg
    if (mostrarMensajeOculto === true) {
        mensajeOculto.position.x = jugadoresImprimidos.get(miid).x;
        mensajeOculto.position.y = jugadoresImprimidos.get(miid).y - 20;

    }
}

Game.render = function () {
}

Game.init = function () {
    game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
    for (let numMapa = 1; numMapa < 4; numMapa++) {
        game.load.tilemap(`mapa${numMapa}`, `assets/mapas/mapa${numMapa}/elMapa${numMapa}.json`, null, Phaser.Tilemap.TILED_JSON);
        game.load.spritesheet(`tileset${numMapa}`, `assets/mapas/mapa${numMapa}/mapa${numMapa}.png`, 16, 16);
    }
    game.load.spritesheet('caballero', 'assets/imagenes/personajes/caballero.png', 90, 80);
};

//movemos al jugadopr enemigo sincornizando los movimientos
Game.movimiento = function (id, data, accion, direccion) {
    //¿Porque se producia mal sincronizacion del personaje en el servidor ubuntu?
    //- Porque no reinciaba la variable de velocidad y, y el personaje tenia su propia velocidad y caia mas rapido de como lo hacia el jugador de verdad
    //- y se producian esos lagazos
    //le decimos al personaje enemigo controlado por otro jugador que no tenga sus propios movimientos
    jugadoresImprimidos.get(id).body.velocity.x = 0;
    jugadoresImprimidos.get(id).body.velocity.y = 0;
    //aqui le decimos que siga exactamente las x e y del jugador que lo controla
    jugadoresImprimidos.get(id).body.x = data.x;
    jugadoresImprimidos.get(id).body.y = data.y;
    //movimiento para los otros personajes
    //hay que tener en cuenta de que escuha constantemente los movimientos, tal vez es lo que mas carga el sistema
    if (accion == "presionar") {
        if (direccion == "izquierda") {
            jugadoresImprimidos.get(id).scale.setTo(-1.3, 1.3);
            jugadoresImprimidos.get(id).body.setRectangle(35, 58, 10, 22);
            jugadoresImprimidos.get(id).animations.play('right', 10, true);
        } else if (direccion == "derecha") {
            jugadoresImprimidos.get(id).body.setRectangle(35, 58, -10, 22);
            jugadoresImprimidos.get(id).scale.setTo(1.3, 1.3);
            jugadoresImprimidos.get(id).animations.play('right', 10, true);
        } else if (direccion == "salto") {
            jugadoresImprimidos.get(id).animations.play('stay', 10, true);
        }
    } else if (accion == "soltar") {
        if (jugadoresImprimidos.size != 0) {
            jugadoresImprimidos.get(id).animations.play('stay', 10, true);
        }
    }
}

Game.iniciarPartida = function () {
    propiedadesTexto.fontSize = 50;
    sePuedeJugar = false;
    var segundos = 3;
    var imprimirSegundos;
    setTimeout(function () {
        mensaje.setText("La partida empieza en...");
        imprimirSegundos = setInterval(function () {
            mensaje.setText(segundos);
            segundos--;
            if (segundos == -1) {
                iniciarPartida();
                mensaje.setText("");
                clearInterval(imprimirSegundos);
                sePuedeJugar = true;
            }
        }, 1000);
    }, 1000);

}

Game.ataqueEnemigo = function (id, ataque) {
    if (ataque == "hit1") {
        pegar1(id);
    } else if (ataque == "hit2") {
        pegar2(id);
    }
}
game.state.add('Game', Game);
game.state.start('Game');


