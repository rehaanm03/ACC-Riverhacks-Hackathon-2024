const express = require("express");
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
const path = require('path')
const chalk = require('chalk')
const fs = require("fs");
require("dotenv").config();
const cors = require('cors');



var app = express();
const PORT = process.env.SCOREPORT
const SitePrefix = process.env.URLPREFIX
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

app.use(cors({
    origin: 'http://localhost:5000', // Replace with your frontend origin
    credentials: true // Set to true if your API sends cookies
}));

const theRedirectURI = `${SitePrefix}/api/discord/callback`


app.set('view engine', 'ejs');
app.use(express.static('.'));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.use('/assets', express.static('assets'));
app.use(cookieParser())


app.get('/getScore', async (req, res) => {
    var scoreFile = JSON.parse(fs.readFileSync("json/scores.json", 'utf8'))
    console.log()
    console.log(`GET Request Incoming to /getScore`)
    console.log(`GET REQUEST Headers:`)
    console.log(req.query)
    console.log()

    var foundUser = false;
    for (var i = 0; i < scoreFile.length; i++) {
        console.log(scoreFile[i].DiscordID, req.query.id)
        if (scoreFile[i].DiscordID == req.query.id) {
            console.log("FOUND USER")
            console.log(scoreFile[i])
            if (scoreFile[i]["flappyBird"]) {
                res.json(scoreFile[i]["flappyBird"])
            }
            foundUser = true;
            break;
        }
    }
    console.log(scoreFile)
    if (!foundUser) {
        console.log("User not found")
    } else {
        // fs.writeFileSync(JSON.stringify(scoreFile))
    }


});

app.post('/updateScore', jsonParser, async (req, res) => {
    const obj = req.body
    var scoreFile = JSON.parse(fs.readFileSync("json/scores.json", 'utf8'))
    // console.log(scoreFile)
    console.log()
    console.log(`Post Request Incoming to /updateScore`)
    console.log(`POST REQUEST Headers:`)
    console.log(obj);
    console.log()
    var foundUser = false;
    for (var i = 0; i < scoreFile.length; i++) {
        console.log(scoreFile[i].DiscordID, obj.DiscordID)
        if (scoreFile[i].DiscordID == obj.DiscordID) {
            console.log("FOUND USER")
            console.log(scoreFile[i])
            if (scoreFile[i][obj.Game]) {
                scoreFile[i][obj.Game]["roundsPlayed"]++;
                if (scoreFile[i][obj.Game]["highestScore"] < obj.newScore) {
                    scoreFile[i][obj.Game]["highestScore"] = obj.newScore
                }
            }
            foundUser = true;
            break;
        }
    }
    console.log(scoreFile)
    if (!foundUser) {
        console.log("User not found")
    } else {
        // fs.writeFileSync(JSON.stringify(scoreFile))
        fs.writeFileSync("json/scores.json", JSON.stringify(scoreFile, null, 2), 'utf8')
    }
    res.status(200).send("Success")
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))