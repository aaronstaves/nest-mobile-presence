var MobilePresence = function() {
  var config  = require('config');
  var ping    = require('ping');

	var logger  = require('./logger');
	var api     = require ('./nest/api');
  var found   = 0;
  var timeouts = {};
  var ip_status = {};

  var ips = null;
	function _init( ) {
    try {
      ips = config.get('ip_addresses');
    }
    catch (e) { 
      logger.error(e.message);
      process.exit();
    }
  }

  function monitorIp(ip) { 
    ping.sys.probe( ip, function( isAlive ) { 
      if ( isAlive ) { 
        logger.debug( ip + ': ONLINE' );
        ip_status[ip].online = 1;
      }
      else { 
        logger.debug( ip + ': OFFLINE' );
        ip_status[ip].online = 0;
      }
    });
  }

  function getPresence() { 
    var online = 0;
    var offline = 0;
    ips.forEach( function( ip ) { 
      if ( ip_status[ip].online == 1 ) { 
        online++;
      }
      else {
        offline++;
      }
    });
    logger.debug( 'ONLINE: ' + online);
    logger.debug( 'OFFLINE: ' + offline );
    logger.debug( 'IPS: ' + ips.length );

    if ( offline == ips.length ) { 
      return "away";
    }
    else { 
      return "home";
    }
  }

  function monitor() { 
    ips.forEach( function(ip) { 
      ip_status[ip] = { online: null };
      monitorIp(ip);
      setInterval( monitorIp, 15000, ip );
    });
  }

  _init();

	return {
    monitor: monitor,
    getPresence: getPresence
	};

};

module.exports = new MobilePresence();
