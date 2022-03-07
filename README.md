<p align="center">
  <h1>NestJS basic api for authentication</h1>
</p>
<br />
<h3>Routes:</h3>
<h6>GET /: return {"message": "online"} with status 200 </h6>
<h6>GET /api/v1/: return {"message": "api-online"} with status 200 </h6>
<br/>
<h4> SIGNUP:
<h6>POST /api/v1/signup: create users on db </h6>
<h6>OPTIONS /api/v1/signup: return signup fields</h6>
<h6>GET /api/v1/callback/signup?token=&&redirecturl=&&redirecterrorurl=: confirm user </h6>
<br />
<h4> SIGNIN:
<h6>POST /api/v1/signin: (receive login/password) returns refresh token(long: 60 minutes) and jwt token(short: 60 seconds)</h6>
<h6>OPTIONS /api/v1/signin: return signin fields</h6>
<br />
<h4> APP FLUX:
<h6>POST /api/v1/regenerate-token: (receive refreshtoken, jwttoken(can be expired)): generate new tokens</h6>
<h6>GET /api/v1/authenticated-route: (valid bearer token): authenticated route with middleware</h6>
