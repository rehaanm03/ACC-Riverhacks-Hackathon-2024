const express = require('express');
// import chalk from 'chalk';
const chalk = require('chalk');
const router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const { catchAsync } = require('../utils');
require("dotenv").config();

const {
  gettingUser,
  gettingToken,
  refreshingToken,
  gettingMembersGuilds,
  checkingMembersGuildsIfInServer,
  addingMemberToGuild
} = require('./discordFunctions.js')

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = "identify%20guilds%20guilds.join"
const scopes = "identify guilds guilds.join"

const urlPrefix = process.env.URLPREFIX;

const reloginURL = `${urlPrefix}/relogin`
const dashboardURL = `${urlPrefix}/signin`
const theRedirectURI = `${urlPrefix}/api/discord/callback`
const redirect = encodeURIComponent(`${urlPrefix}/api/discord/callback`);

router.get('/login', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&response_type=code&redirect_uri=${redirect}`);
});


router.get('/signout', catchAsync(async (req, res) => {
  res.cookie('token', {
    expires: Date.now()
  });
  res.render('discordLogin', {
    qs: req.query,
    error: {
      v1Error: '',
      v2Error: 'Signed Out Successfully'
    }
  });
}))



router.get('/callback', catchAsync(async (req, res) => {
  var code = req.query.code;
  if (!req.query.code && req.cookies.token) {
    var code = req.cookies.token.access_token;
  }
  if (!code) {
    res.redirect(dashboardURL)
    return
  }
  console.log()
  console.log(chalk.cyan.bold('Signing With Discord OAuth2'))
  console.log(chalk.yellow.bold(`Code: ${code}`))
  console.log(chalk.yellow.bold('Getting Auth Token'))
  var json = await gettingToken(code, res)
  console.log(json)
  if (!json && req.cookies.token) {
    console.log(chalk.cyan.bold('Refreshing Token'))
    console.log(chalk.yellow.bold(req.cookies.token.refresh_token))
    var json = await refreshingToken(req.cookies.token.refresh_token, res)
    // return json
  } else if (!json && !req.cookies.json) {
    console.log(chalk.red.bold("Token is Invalid, Redirecting User to Login"))
    res.redirect(reloginURL)
    return
  }
  if (!json) return
  console.log(chalk.cyan.bold(`Finding User with Tokens`))
  const userJSON = await gettingUser(json.access_token, res)
  if (!userJSON) return
  console.log(chalk.green.bold('Found User'))
  console.log(chalk.yellow.bold(`Username: ${userJSON["username"]}#${userJSON["discriminator"]}`))
  console.log(chalk.yellow.bold(`Discord ID: ${userJSON.id}`))

  if (req.query.code) {
    console.log(chalk.cyan.bold(`Checking if User: ${userJSON["username"]}#${userJSON["discriminator"]} is in Guild`))
    var [json, userInServer] = await checkingMembersGuildsIfInServer(json, res)
    console.log(chalk.yellow.bold(`User in Server: ${userInServer}`))
    if (userInServer == false) {
      await addingMemberToGuild(userJSON["id"], res, json)
    } else {
      console.log(chalk.green.bold('User is already in Server'))
    }
  } else {
    console.log(chalk.green.bold(`User Should Be in Guild`))
  }

  console.log(req.query, userJSON)

  res.render('games', {
    qs: req.query,
    discordUser: userJSON,
    error: {
      error: ''
    }
  });
}));




module.exports = router;
