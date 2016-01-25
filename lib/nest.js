var Nest = function() {
  var rp      = require('request-promise');
  var config  = require('config');

	var logger  = require('./logger');
	var api     = require ('./nest/api');

  var structure = null;
  var current_presence  = null;
  var timeout   = null;

	function _init( ) {
    api.checkPresence(_postInit);
	}

  function _postInit( obj ) {
    structure = obj.structure;
    current_presence  = obj.presence;
    logger.info('initialized with presensce of "' + current_presence + '" for structure "' + structure + '"');
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
    logger.debug('presence updated to "' + current_presence + '"' );
  }

  function _getPresence() { 
    return current_presence;
  }

  _init();

	return {
    updatePresence: _updatePresence,
    getPresence: _getPresence
	};

};

module.exports = new Nest();
