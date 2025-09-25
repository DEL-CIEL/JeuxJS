'use strict';

var express = require('express');
 
// Créer une instance de l’application express:
var exp = express();
// Paramétrer le répertoire racine du site avec la méthode use:
exp.use(express.static(__dirname + '/www'));

exp.get('/', function (req, res) {
    console.log('Reponse a un client'); 
    res.sendFile(__dirname + '/www/textchat.html');
});

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Erreur serveur express');
});



/*  *************** serveur WebSocket express *********************   */
// 
var expressWs = require('express-ws')(exp);

// Connexion des clients à la WebSocket /echo et evenements associés
var message;
exp.ws('/echo', function (ws, req) {

    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);

    ws.on('message', function (message) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        message = aWss._socket._peername.address + aWss._socket._peername.port + ' : ' + message;
        aWss.broadcast(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });
});



/*  ****** Serveur web et WebSocket en ecoute sur le port 80  ********   */
//  
var portServ = 80;
exp.listen(portServ, function () {
    console.log('Serveur en ecoute');
});


/*  ****************** Broadcast clients WebSocket  **************   */
var aWss = expressWs.getWss('/echo');
var WebSocket = require('ws');
aWss.broadcast = function broadcast(data) {
    console.log("Broadcast aux clients navigateur : %s", data);
    aWss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log("    -  %s-%s", client._socket.remoteAddress,
                    client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast : %s', error.toString());
                }
            });
        }
    });
};



class CQr {
    constructor() {
        this.question = '?';
        this.bonneReponse = 0;
    }

    GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    NouvelleQuestion() {
        let x = this.GetRandomInt(11);
        let y = this.GetRandomInt(11);
        this.question = x + '*' + y + ' = ?';
        this.bonneReponse = x * y;
    }


    EnvoyerResultatDiff() {
        const messagePourLesClients = {
            question: this.question
        };
        aWss.broadcast(JSON.stringify(messagePourLesClients));
    }


    TraiterReponse(wsClient, message) {
        let mess = JSON.parse(message);
        let reponse = parseInt(mess.reponse);

        if (reponse === this.bonneReponse) {
            this.question = "Bonne reponse de " + mess.nom;
        } else {
            this.question = "Mauvaise reponse de " + mess.nom;
        }

        this.EnvoyerResultatDiff();

        setTimeout(() => {
            this.NouvelleQuestion();
            this.EnvoyerResultatDiff();
        }, 3000);
    }
}

var jeuxQr = new CQr;

/* *************** serveur WebSocket express /qr ********************* */
//
exp.ws('/qr', function (ws, req) {
    let quiz = new CQr();

    quiz.NouvelleQuestion();
    quiz.EnvoyerResultatDiff();

    ws.on("message", function (message) {
        quiz.TraiterReponse(ws, message);
    });
});



/*
var question = '?';
var bonneReponse = 0;
// Connexion des clients a la WebSocket /qr et evenements associés 
// Questions/reponses
exp.ws('/qr', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);
    NouvelleQuestion();

    ws.on('message', TraiterReponse);

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });


    function TraiterReponse(message) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        if (message == bonneReponse) {
            ws.send("Bonne reponse");
            setTimeout(NouvelleQuestionBinaire, 3000);
            
        }
        else {
            ws.send("Mauvaise reponse");
        }
    }


    function NouvelleQuestion() {
        var x = GetRandomInt(11);
        var y = GetRandomInt(11);
        question = x + '*' + y + ' =  ?';
        bonneReponse = x * y;
        aWss.broadcast(question);
    }

    function NouvelleQuestionBinaire() {
        var nbDec = Math.floor(Math.random() * 256);
        var nbBin = nbDec.toString(2).padStart(8, '0');
        question = nbBin;
        bonneReponse = nbDec;
        aWss.broadcast(question);
    }

    function GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

});*/