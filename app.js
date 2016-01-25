var config = require('config');
var logger = require('./lib/logger');
var mobilePresence = require('./lib/mobile-presence');

var nest   = require('./lib/nest');

function _init() {
  try {
    interval = config.get('poll_interval_ms');
  }
  catch (e) {
    logger.error(e.message);
    process.exit();
  }
}

setInterval(function() { 
  var new_presence     = mobilePresence.getPresence();
  var current_presence = nest.getPresence();

  logger.debug( 'NEW: ' + new_presence + ' / CURRENT: ' + current_presence );
  if ( new_presence != current_presence ) { 
    logger.debug( 'Updating to new presence ' + new_presence );
    nest.updatePresence( new_presence );
  }

}, interval);

mobilePresence.monitor();


