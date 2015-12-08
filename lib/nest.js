module.exports = function() {
  var request = require('request');
  var config  = require('config');

  var base_url = 'https://developer-api.nest.com/';
  var auth_url = 'https://api.home.nest.com/oauth2/access_token';
  
  var token      = '';
  var structures = null;
  var aways      = null;
  var busy       = 0;

  function _auth() { 
    try { 
      var code = config.get('product.code');
    }
    catch (e) {
      console.error("Could not get Product.code from config, visit the authorization URL to create a code");
      console.error("https://home.nest.com/login/oauth2?client_id="+ config.get("product.client_id") + "&state=STATE" );
      process.exit();
    }
    var options = {
      json: true,
      form: {
        code: config.get('product.code'),
        client_id: config.get('product.client_id'),
        client_secret: config.get('product.client_secret'),
        grant_type: "authorization_code"
      }
    };
    request.post(auth_url, options, function(err, res, ret) {
      if ( err ) { 
        console.error( err.message);
      }
      else if ( ret.errors ) { 
        ret.errors.forEach( function(msg, i) { 
          console.error( msg.label + ': ' + msg.format );
        });
      }
      else if ( ret.error ) { 
        console.error( ret.error + ': ' + ret.error_description );
      }
      else {
        return ret.access_token
      }
    });
  }

  function _get_away_status() { 
    busy = 1;
    console.log('calling: '+base_url+'?'+token);
    request.get(base_url+'?auth='+token, { json: true }, function(err, res, ret) { 
      if ( err ) { 
        console.error( err.message);
        busy = 0;
        return;
      }
      structures = Object.keys(ret.structures);

      aways = [];
      structures.forEach( function( structure ) { 
        aways.push( ret.structures[structure].away ); 
      });
      console.dir(aways);
      busy = 0;
    });
  }

  function _set_away_status( new_status ) { 
    console.log('setting status to ' + new_status );
    if ( structures === null ) {
      if ( busy == 0 ) { 
        _get_away_status();
      }
      setTimeout( _set_away_status, 1000, new_status );
      return;
    }
    var data = { structures: {} };

    structures.forEach( function( structure ) { 
      console.log(base_url+'structures/'+structure+'/?auth='+token);
      request.put(base_url+'structures/'+structure+'/?auth='+token, { contentType: 'application/json', followAllRedirects: true, form: { away: "home" }, json: true }, function(err, res, ret) { 
        console.dir(res);
      });
    });
  }


  return { 
    init: function() { 
      try { 
        token = config.get('access_token');
      }
      catch (e) {
        token = _auth();
      }
      console.log('Using token ' + token);
    },

    away_status: function( new_status ) { 
      if ( new_status ) { 
        _set_away_status( new_status );
      }
      else {
        _get_away_status()
      }
    }
  }
};
