var NestAuth = function() {
  var rp      = require('request-promise');
	var fs      = require('fs');
  var config  = require('config');
	var logger  = require('../logger');

	var auth_url      = 'https://home.nest.com/login/oauth2?client_id=2f68ccd5-dc1f-4d30-9c8f-8fc19e435bce&state=STATE';
	var token_url     = 'https://api.home.nest.com/oauth2/access_token';
	var access_token  = null;

	// grabs token from nest
	function _get_token( code ) {
		logger.debug('attempting to grab token using code "' + code + '"');

		try {
			var client_id     = config.get('client_id');
			var client_secret = config.get('client_secret');;
		}
		catch (e) {
			logger.error(e.message);
			process.exit();
		}

		var opt = {
			uri : token_url,
			json: true,

      // this endpoint needs to post like a form for some rasin ?
			form: {
				code         : config.get('auth_code'),
				client_id    : config.get('client_id'),
				client_secret: config.get('client_secret'),
				grant_type   : "authorization_code"
			}

		};

    rp.post(opt)
      .then(function(ret) {
        config.access_token = ret.access_token;
				logger.debug("writing token " + config.access_token + ' to file');
				fs.writeFile("config/default.json", JSON.stringify( config, null, 2 ), function(err) {
		    	if(err) {
						logger.error(err.message);
						process.exit();
		    	}
				});
      })
      .catch( function(err) { 
        var response = err.response.body;
        if ( response && response.error_description) { 
          logger.error(response.error_description);
          logger.error('You may need to generate a new auth_code at ' + auth_url );
        }
        else {
          logger.error(err.message);
        }
        process.exit();
      });

	}


	// initializes api communication
	function _init() {

		// see if there's a token
		try {
			access_token = config.get('access_token');
		}
		// no token, maybe we have client_id and secret
		catch (e) {
			logger.warn(e.message);

			// no token, maybe a code?
			try {
				var code = config.get('auth_code');
				_get_token(code);
			}
			catch(e) {
				logger.error(e.message);
				logger.error('Visit ' + auth_url + ' to obtain an auth_code and place it in config/default.json');
				process.exit();
			}
		}
	}


	_init();

	return {
		access_token: access_token
	};
};

module.exports = new NestAuth();
