'use strict';

var express = require('express');
var port = 80;
 
// Créer une instance de l’application express:
var exp = express();
// Paramétrer le répertoire racine du site avec la méthode use:
exp.use(express.static(__dirname + '/www'));

exp.get('/', function (req, res) {
    console.log('Reponse a un client'); 
    res.sendFile(__dirname + '/www/index.html');
});

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Erreur serveur express');
});

exp.listen(port, function () {
    console.log('Serveur en ecoute');
});