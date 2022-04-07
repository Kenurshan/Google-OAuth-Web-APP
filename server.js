const fetch = require("node-fetch")
//Define express server code to accept web requests
const express = require('express')
const app = express()
const port = 3000
const {google} = require('googleapis')

// fetch client_Id & secret from terminal
const cId = process.argv[2]
const cSecret = process.argv[3]

//App can access public(index.html,css, images) folder using middleware(express.static)
app.use(express.static('public'))

//When a get request recieved, respond with client_id using json fle
app.get('/cId', (req, res) => {
  res.send(JSON.stringify({ cId }))
})

//Get the user access token using authentication function(CltOAuth2) after user login
app.get('/oauth2callback', CltOAuth2)

//Creating a function for OAuth2 authentication
async function CltOAuth2(req, res) {
  //Define 'tokenResponse' to fetch the access token from the url(google authorization server).
  const tokenResponse = await fetch(
    `https://www.googleapis.com/oauth2/v4/token`,
    {
      //Client_id,_secret, grand type and uri defining into json for OAuth2 authentication using post method
      method: 'POST',
      body: JSON.stringify({
        code: req.query.code,
        client_id: cId,
        client_secret: cSecret,
        redirect_uri: 'http://localhost:3000/oauth2callback',
        grant_type: 'authorization_code',
      })
    }
  )
  //Define accesstoken to 'tokenJson' 
  const tokenJson = await tokenResponse.json()
  //Define gathered user information to 'userdata'
  const userdata = await getUserdata(tokenJson.access_token)
  
  //Response redirected to local server(3000) with user information by calling 'userdata'
  res.redirect(`http://localhost:3000?${Object.keys(userdata).map(key => `${key}=${encodeURIComponent(userdata[key])}`).join('&')}`)
}

//Create a function-'getUserdata', that retrive data from resource API  using the Access token
//Add access token in headers of 'fetch()' call to get the user information
async function getUserdata(accessToken) {
  const response = await fetch(
     `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
    {
      //place the access token in HTTP authorization header of outgoing requests
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  //
  const json = await response.json()
  return json
}


//Define the port 3000 for web requests
app.listen(port, () => console.log(`Go to your browser & browse on http://localhost:${port}!`))
