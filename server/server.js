Okta = {

    serviceName: 'okta',
    whitelistedFields: ['id', 'emails', 'first_name', 'last_name', 'name'],

    retrieveCredential: function(credentialToken, credentialSecret) {
        return OAuth.retrieveCredential(credentialToken, credentialSecret);
    }
};

OAuth.registerService(Okta.serviceName, 2, null, function(query) {

    var config = ServiceConfiguration.configurations.findOne({service: Okta.serviceName});
    if (!config) {
        throw new ServiceConfiguration.ConfigError();
    }

    var response = getTokens(query, config),
        expiresAt = (+new Date) + (1000 * parseInt(response.expiresIn, 10)),
        identity = getIdentity(response.accessToken, config),

        serviceData = {
            accessToken: response.accessToken,
            idToken: response.idToken,
            expiresAt: expiresAt,
            scope: response.scope
        };

        console.log("okta user profile:" + JSON.stringify(identity));
    /*var fields = _.pick(identity, Okta.whitelistedFields);
    _.extend(serviceData, fields);
*/

    /*
    Meteor accounts requires id field but Okta does not provide an id attribute.
    Make sure to map a field of you convinence as id field. In my setup I have created an
    custom attribute called id
     */
    //for testing purposes assign existing users id
  if(!identity.id){
      //throw new Error("Missing id field in okta profile");
  }
  identity.id = "abz9743w4foFnFu7Q";
    _.extend(serviceData, identity);

    // only set the token in serviceData if it's there. this ensures
    // that we don't lose old ones (since we only get this on the first
    // log in attempt)
    if (response.refreshToken)
        serviceData.refreshToken = response.refreshToken;

    return {
        serviceData: serviceData,
        options: {profile: {name: identity.name}}
    };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
var getTokens = function (query, config) {


    
    console.log("query is %s", JSON.stringify(query));
    var response;
    try {
        response = HTTP.post(
            "https://" + config.domain + "/oauth2/v1/token", {params: {
                code: query.code,
                client_id: config.clientId,
                client_secret: OAuth.openSecret(config.secret),
                redirect_uri: OAuth._redirectUri(Okta.serviceName, config),
                //redirect_uri:"http://localhost:3000/_oauth/okta",
                grant_type: 'authorization_code'
            }});
    } catch (err) {
        throw _.extend(
            new Error("server.js: HTTP.post. Failed to complete OAuth handshake with Okta. " + err.message),
            {response: err.response}
        );
    }

    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error("Server.js:response error. Failed to complete OAuth handshake with Okta. " + response.data.error);
    } else {
        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
            idToken: response.data.id_token
        };
    }
};

var getIdentity = function (accessToken, config) {
    console.log("access token:" + accessToken);
    try {
        return HTTP.get(

            "https://"+ config.domain + "/oauth2/v1/userinfo",
            { headers: { Authorization: "Bearer " + accessToken,
                         Accept: "application/json"} }).data;
    } catch (err) {
        throw _.extend(
            new Error("Failed to fetch identity from Okta. " + err.message),
            { response: err.response }
        );
    }
};