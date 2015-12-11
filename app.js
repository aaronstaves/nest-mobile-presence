
var logger = require('./lib/logger');
var mobilePresence = require('./lib/mobile-presence');

var nest   = require('./lib/nest');
setInterval(function() { 
  var new_presence     = mobilePresence.getPresence();
  var current_presence = nest.getPresence();

  logger.debug( 'NEW: ' + new_presence + ' / CURRENT: ' + current_presence );
  if ( new_presence != current_presence ) { 
    logger.debug( 'Updating to new presence ' + new_presence );
    nest.updatePresence( new_presence );
  }

}, 30000);

mobilePresence.monitor();


