var frasesRius = ["El windows es una mierda!", "Usa un navegador de verdad!", "Viteh!", "Que eres, de Madrid?"];
var frasesInma = ["Estamos a lo que estamos?", "Venga, vamos a ver el pdf", "Esto esta mal", "Me gusta mucho"];
var frasesSamuel = ["Que tal vais?", "Chicos, hoy toca un tipo test", "Teneis la entrega de 'fora de termini'", "Si a mi me dicen que haces UML, te contrato"];

//imprime jugadores si alguien se ha conectado
function imprimirJugador(jugadorImprimir) {
    let g = game.add.sprite(jugadorImprimir.x, jugadorImprimir.y, 'caballero');
    Game.playerMap.set(jugadorImprimir.id, g);
    var jugador = Game.playerMap.get(jugadorImprimir.id);
    jugador.anchor.setTo(0.5, 0.5);
    jugador.scale.setTo(1.3, 1.3);
    jugador.animations.add('right', [15, 16, 17, 18, 19], 60, true);
    jugador.animations.add('stay', [1, 2, 3, 4], 60, true);
    jugador.animations.add('hit1', [5, 6, 7, 8, 9, 10], 60, false);
    jugador.animations.add('hit2', [11, 12, 13, 14], 60, true);
    game.physics.p2.enable(jugador, true);
    //resizePolygon('ninja_physics', 'ninja_escalado', 'correr', 0.1);
    jugador.body.setRectangle(30, 47, -10, 18);
    jugador.body.fixedRotation = true;
    jugador.body.mass = 70;
    jugador.body.immovable = true;
    jugador.body.moves = false;
    jugador.name = "jugador";
    jugadoresImprimidos.set(jugadorImprimir.id, g);
    //metemos la id del jugador imprimido
    idJugadoresImprimidos.push(jugadorImprimir.id);
}


//funcion que redimensiona fisicas de colisiones
function resizePolygon(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
    var newData = [];
    var data = game.cache.getPhysicsData(originalPhysicsKey, shapeKey);
    for (var i = 0; i < data.length; i++) {
        var vertices = [];
        for (var j = 0; j < data[i].shape.length; j += 2) {
            vertices[j] = data[i].shape[j] * scale;
            vertices[j + 1] = data[i].shape[j + 1] * scale;
        }
        newData.push({ shape: vertices });
    }
    var item = {};
    item[shapeKey] = newData;
    game.load.physics(newPhysicsKey, '', item);
}


//Funciones para el salto --EN DESARROLLO--
function saltar(body, bodyB, shapeA, shapeB, equation) {
    //solo salta en las ids que quiero
    salto = idContactoPermitido.indexOf(bodyB.id) != -1 ? true : false;
    // salto = true;
}

function nosaltar(body, bodyB) {
    salto = false;
}

//si se recarga la pagina a la hora del juego se reinicia todo para no poder continiar jugando
if (window.performance.navigation.type == 1) {
    alert("el juego se va a interrumpir, todos los jugadores iran al menu de logeo");
    location.href = "/";
    jugadoresImprimidos = [];
    idJugadoresImprimidos = [];
    Client.killAllConnections();
}

function iniciarPartida() {
    if (idJugadoresImprimidos[0] < idJugadoresImprimidos[1]) {
        jugadoresImprimidos.get(idJugadoresImprimidos[0]).body.x = 200;
        jugadoresImprimidos.get(idJugadoresImprimidos[1]).body.x = 400;
    } else {
        jugadoresImprimidos.get(idJugadoresImprimidos[1]).body.x = 200;
        jugadoresImprimidos.get(idJugadoresImprimidos[0]).body.x = 400;
    }
}

function textoEspera() {
    // console.log("imprimimos el texto de espera");
    if (jugadoresImprimidos.size != 2) {
        mensaje = game.add.text(game.world.centerX, game.world.centerY, "Esperando a otro jugador...", propiedadesTexto);
        mensaje.anchor.setTo(0.5, 0.5);
        mensaje.setShadow(1, 1, 'black', 5);
    }
}

var prueba = false;
//comprobacion se plataformas
function checkOverlap(body1, body2) {
    if (prueba == false) {
    }
    prueba = true;
    return true;
}
function pegar1(id) {
    jugadoresImprimidos.get(id).body.velocity.x = 0;
    if (direccion == "right") jugadoresImprimidos.get(id).body.setRectangle(60, 58, 5, 22);
    else jugadoresImprimidos.get(id).body.setRectangle(60, 58, -5, 22);
    quieto = false;
    jugadoresImprimidos.get(id).animations.play('hit1', 10, false);
    jugadoresImprimidos.get(id).animations.currentAnim.onComplete.add(function () {
        quieto = true;
        if (direccion == "right") jugadoresImprimidos.get(id).body.setRectangle(35, 58, -10, 22);
        else jugadoresImprimidos.get(id).body.setRectangle(35, 58, 10, 22);
    }, this);
}

function pegar2(id) {
    jugadoresImprimidos.get(id).body.velocity.x = 0;
    //Client.pegar(data,"hit1");
    if (direccion == "right") jugadoresImprimidos.get(id).body.setRectangle(70, 58, 10, 22);
    else jugadoresImprimidos.get(id).body.setRectangle(70, 58, -10, 22);
    quieto = false;
    quieto = false;
    jugadoresImprimidos.get(id).animations.play('hit2', 10, false);
    jugadoresImprimidos.get(id).animations.currentAnim.onComplete.add(function () {
        quieto = true;
        if (direccion == "right") jugadoresImprimidos.get(id).body.setRectangle(35, 58, -10, 22);
        else jugadoresImprimidos.get(id).body.setRectangle(35, 58, 10, 22);
    }, this);
}

function moverJugador(id, direccion) {
    if (direccion == "izquierda") {
        jugadoresImprimidos.get(id).scale.setTo(-1.3, 1.3);
        jugadoresImprimidos.get(id).body.setRectangle(35, 58, 10, 22);
        jugadoresImprimidos.get(id).body.moveLeft(700);
        jugadoresImprimidos.get(id).animations.play('right', 10, true);
    } else if (direccion == "derecha") {
        jugadoresImprimidos.get(id).body.setRectangle(35, 58, -10, 22);
        jugadoresImprimidos.get(id).scale.setTo(1.3, 1.3);
        jugadoresImprimidos.get(id).body.moveRight(700);
        jugadoresImprimidos.get(id).animations.play('right', 10, true);
    }
}

function imprimirMensajeOculto(quien) {
    if (quien == "rius") {
        frase = frasesRius[parseInt(Math.random() * (frasesRius.length - 0) + 0)];
    } else if (quien == "samuel") {
        frase = frasesSamuel[parseInt(Math.random() * (frasesSamuel.length - 0) + 0)];
    } else if (quien == "inma") {
        frase = frasesInma[parseInt(Math.random() * (frasesInma.length - 0) + 0)];
    }
    mensajeOculto = game.add.text(jugadoresImprimidos.get(miid).x, jugadoresImprimidos.get(miid).y - 20, frase, {
        fill: "black",
        stroke: "black",
        fontSize: 10
    });
    mensajeOculto.anchor.setTo(0.5, 0.5);
}

function cuentaAtras(segundos) {
    setTimeout(function () {
        mostrarMensajeOculto = false;
        mensajeOculto.destroy();
        contadorTecla = 0;
    }, segundos * 1000)
}