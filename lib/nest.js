var Nest = function() {
  var rp      = require('request-promise');
  var config  = require('config');

	var logger  = require('./logger');
	var api     = require ('./nest/api');

  var structure = null;
  var current_presence  = null;
  var new_presence = null;
  var timeout = null;
	var cameras = null

	function _init( ) {
    api.checkPresence(_postInit);
	}

  function _postInit( obj ) {
    structure    = obj.structure;
    new_presence = obj.presence;
		cameras      = obj.cameras;
    if ( new_presence !== current_presence ) {
      current_presence = new_presence
      logger.info('structure "' + structure + '" has set presence to "' + current_presence + '"');

			if ( cameras ) {
				Object.keys ( cameras ).forEach( function(i) {
      		logger.info('camera "' + cameras[i].name+ '" is streaming "' + cameras[i].is_streaming + '"');
				});
			}
			_postUpdatePresence( current_presence );
    }
    else {
      logger.debug('no change from structure since last poll');
    }
  }

  function _updatePresence( presence ) {

    if ( timeout !== null ) {
      clearTimeout( timeout ) ;
    }

    if ( current_presence === null ) {
      logger.warn( 'initial presence hasn\'t been loaded yet, delaying updatePresence call with arg "' + presence + '"' );
      timeout = setTimeout(_updatePresence, 1000, presence);
    }
    else {
      logger.debug('updating presence to "' + presence + '"' );
      api.setPresence( presence, structure, _postUpdatePresence );
    }
  }

  function _postUpdatePresence( presence ) {
    current_presence = presence;
    logger.info('presence updated to "' + current_presence + '"' );

		if ( cameras === null ) {
			logger.warn ( 'no cameras found, nothing to update' );
		}
		else {
			var is_streaming = ( presence == "away" ) ? true : false;
			logger.debug ( 'Setting cameras to is_streaming "' + is_streaming + '"' );
			api.setCameras( is_streaming, cameras, _postUpdateCameras );
		}
  }

	function _postUpdateCameras ( is_streaming, camera) {
		logger.info( 'camera "' + camera.name + '" updated to "' + is_streaming + '"' );
	}

  function _getPresence() {
    api.checkPresence(_postInit);
    return current_presence;
  }

  _init();

	return {
    updatePresence: _updatePresence,
    getPresence: _getPresence
	};

};

module.exports = new Nest();
