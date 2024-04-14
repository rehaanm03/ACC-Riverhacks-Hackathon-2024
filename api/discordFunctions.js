const express = require('express');
const axios = require('axios');
const queryString = require('querystring');
const fetch = require('node-fetch');
const FormData = require('form-data')
// import chalk from 'chalk';
const chalk = require('chalk');

const CLIENT_ID = '729128168341897226';
const CLIENT_SECRET = 'LYlR4Vtv85YzherVjoPwbSPKnVxIWRkV';
const SCOPES = "identify%20guilds%20guilds.join"
const scopes = "identify guilds guilds.join"

// const urlPrefix = "http://localhost:5000"
const urlPrefix = "https://hackathon2024-alpha.vercel.app"

const reloginURL = `${urlPrefix}/relogin`
const dashboardURL = `${urlPrefix}/signing`
const theRedirectURI = `${urlPrefix}/api/discord/callback`
const redirect = encodeURIComponent(`${urlPrefix}/api/discord/callback`);

async function gettingUser(token, res) {
  const discordInfo = await fetch('http://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`
    }
  })
  console.log(discordInfo.status)
  if (discordInfo.status == 401) {
    console.log('Invalid Token')
    res.redirect(dashboardURL)
    return null
  }
  const userJSON = await discordInfo.json();
  return userJSON
}

async function gettingToken(code, res) {
  const clientData = new FormData()
  clientData.append('client_id', CLIENT_ID)
  clientData.append('client_secret', CLIENT_SECRET)
  clientData.append('grant_type', 'authorization_code')
  clientData.append('redirect_uri', theRedirectURI)
  clientData.append('scope', scopes)
  clientData.append('code', code)

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: clientData,
  })
  console.log(response.status)
  if (response.status == 400) return null
  const json = await response.json();
  res.cookie("token", {
    access_token: json.access_token,
    refresh_token: json.refresh_token
  }, {
    maxAge: Date.now() + 31556952000
  })
  return json
}

async function refreshingToken(refresh_token, res) {
  result = await axios.post('https://discordapp.com/api/oauth2/token', queryString.stringify({
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET,
      'grant_type': 'refresh_token',
      'refresh_token': refresh_token,
      'redirect_uri': theRedirectURI,
      'scope': scopes
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .catch(error => {
      console.warn(error["response"]["data"])
      // res.cookie('token', {
      //   expires: Date.now()
      // });
      res.redirect(reloginURL)
      return null
    })
  try {
    console.log(result["data"])
  } catch (e) {
    console.log(chalk.red.bold(e.stack))
    return null
  }
  res.cookie("token", {
    access_token: result["data"]["access_token"],
    refresh_token: result["data"]["refresh_token"]
  }, {
    maxAge: Date.now() + 31556952000
  })
  return result["data"]
}

async function gettingMembersGuilds(json, res) {
  console.log(chalk.cyan('Refreshing Tokens'))
  var json = await refreshingToken(json.refresh_token, res)
  if (!json) return null
  console.log(chalk.cyan(`Getting Users Guilds`))
  const guildInfoRequest = await fetch('http://discord.com/api/users/@me/guilds', {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${json.access_token}`
    }
  })
  console.log(guildInfoRequest.status)
  if (guildInfoRequest.status == 401) {
    console.log(chalk.red.bold('Invalid Token'))
    res.redirect(dashboardURL)
    return null
  }
  console.log(chalk.green.bold('Successfully Gotten Users Guilds'))
  var guildInfoJSON = await guildInfoRequest.json();
  return [json, guildInfoJSON]
}

async function checkingMembersGuildsIfInServer(json, res) {
  var [json, guildInfoJSON] = await gettingMembersGuilds(json, res)
  var userInServer = false
  console.log(chalk.yellow.bold('Checking if User is in Guild'))
  console.log(chalk.yellow.bold(`Guild Length: ${guildInfoJSON.length}`))

  for (i = 0; i < guildInfoJSON.length; i++) {
    if (guildInfoJSON[i]["id"] == "1228764276013924473") {
      console.log(chalk.green.bold('User is Already in Discord Server'))
      userInServer = true
    }
  }
  return [json, userInServer]
}

async function addingMemberToGuild(discordID, res, json) {
  console.log(chalk.cyan('Refreshing Tokens'))
  var json = await refreshingToken(json.refresh_token, res)
  if (!json) return null
  var data = JSON.stringify({
    "access_token": json.access_token,
    "roles": ["1228767167986536510", 1228767167986536510]
  });

  var config = {
    method: 'put',
    url: `http://discordapp.com/api/guilds/1228764276013924473/members/${discordID}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bot MTIyODc2NDYxODQyODc3NjQ3OA.GaGG4m.7eEd0qUa-wPTSY9IubDcS1a5lsQ6JD-J0MDlL',
    },
    data: data
  };

  await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(chalk.green.bold('Successfully Added Member to Guild'))
    })
    .catch(function (error) {
      console.log(error["response"]["data"]);
      console.log(chalk.red.bold('Member was Not Added to Guild'))
    });
}

exports.gettingUser = gettingUser;
exports.gettingToken = gettingToken;
exports.refreshingToken = refreshingToken;
exports.gettingMembersGuilds = gettingMembersGuilds;
exports.checkingMembersGuildsIfInServer = checkingMembersGuildsIfInServer;
exports.addingMemberToGuild = addingMemberToGuild;
