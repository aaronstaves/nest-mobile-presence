var NestApi = function() {
  var rp      = require('request-promise');
	var logger  = require('../logger');
	var auth    = require('./auth');

  var base_url     = 'https://developer-api.nest.com/'
	var timeout    = null;

  function _checkPresence( callback ) { 

		if ( timeout ) {
			clearTimeout( timeout );
		}
		if ( !auth.getAccessToken() ) { 
			logger.debug ( 'No auth token defined, delaying check presence call' );
			timeout = setTimeout( _checkPresence, 1000, callback );
			return;
		}
    var opt = {
      uri: base_url,
      json: true,
      auth: {
        bearer: auth.getAccessToken()
      }
    };

    rp.get(opt)
      .then( function(ret) { 
        var presence  = null;
        var structure = null;
        Object.keys( ret.structures).forEach( function( i ) { 
          presence  = ret.structures[i].away;
          structure = i;
        });
        callback({ presence: presence, structure: structure });
      })
      .catch( function (err) { 
        var ret = null;
        if ( err.response && err.response.body ) { 
          ret = err.response.body;
        };


        if ( ret && ret.error ) { 
          logger.error( ret.error + ': ' + ret.message );
        }
        else {
          logger.error( err.message );
        }
      });
  }

  function _setPresence( presence, structure, callback ) { 
    var opt = {
      uri: base_url + 'structures/' + structure,
      json: true,
      followAllRedirects: true,
      body: {
        away: presence
      },
      auth: {
        bearer: auth.getAccessToken()
      }
    };

    rp.put(opt)
      .then( function(ret) { 
        callback( ret.away );
      })
      .catch( function (err) { 
        var ret = null;
        if ( err.response && err.response.body ) { 
          ret = err.response.body;
        };


        if ( ret && ret.error ) { 
          logger.error( ret.error + ': ' + ret.message );
        }
        else {
          logger.error( err.message );
        }
      });
  }

	return {
    checkPresence: _checkPresence,
    setPresence  : _setPresence
  };
};

module.exports = new NestApi();
