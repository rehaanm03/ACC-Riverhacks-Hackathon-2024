const express = require("express");
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
const path = require('path')
const chalk = require('chalk')
// import chalk from 'chalk';
// import express from 'express';
// import cookieParser from 'cookie-parser';
// import bodyParser from 'body-parser';
// import path from 'path';

var app = express();
var PORT = process.env.PORT || 5000
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
// const SitePrefix = "http://localhost:5000"
const SitePrefix = "https://hackathon2024-alpha.vercel.app"


const theRedirectURI = `${SitePrefix}/api/discord/callback`


app.set('view engine', 'ejs');
app.use(express.static('.'));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.use('/assets', express.static('assets'));
app.use(cookieParser())

// routing any /api/discord to a different folder for better code organization
app.use('/api/discord', require('./api/discord'));

app.get('/dashboard', async (req, res) => {
    if (req.cookies) {
        res.redirect(theRedirectURI)
    }
});


app.get('/relogin', async (req, res) => {
    res.render('discordLogin', {
        qs: req.query,
        error: {
            v1Error: '',
            v2Error: 'Please Relogin'
        }
    });
});
app.get('/dashboard', async (req, res) => {
    res.render('discordLogin', {
        qs: req.query,
        error: {
            v1Error: '',
            v2Error: ''
        }
    });
});



app.use((err, req, res, next) => {
    console.log(err)
    switch (err.message) {
        case 'NoCodeProvided':
            return res.status(400).send({
                status: 'ERROR',
                error: err.message,
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message,
            });
    }
});

app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/crossword', async (req, res) => {
    res.render('crossword');
});

app.get('/dinoGame', async (req, res) => {
    res.render('dinoGame');
});

app.get('/flappyBird', async (req, res) => {
    res.render('flappyBird');
});

app.get('/mineSweeper', async (req, res) => {
    res.render('mineSweeper');
});

app.get('/games', async(req, res) => {
    res.redirect('/dashboard')
})


app.listen(PORT, () => console.log(`Listening on ${PORT}`))
