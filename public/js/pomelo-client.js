(function () {
	var JS_WS_CLIENT_TYPE = 'js-websocket';
//	var JS_WS_CLIENT_TYPE = 'c';
	var JS_WS_CLIENT_VERSION = '0.0.1';

	var Protocol, Package, Message, EventEmitter, root, protobuf;

	if ( typeof require == 'function' ) {
		Protocol = require( 'pomelo-protocol' );
		EventEmitter = require( 'events' ).EventEmitter;
		root = module.exports;
		protobuf = require( 'protobuf' );
	} else {
		root = window;
		Protocol = window.Protocol;
		EventEmitter = window.EventEmitter;
	}
	Package = Protocol.Package;
	Message = Protocol.Message;

	var RES_OK = 200;
	var RES_FAIL = 500;
	var RES_OLD_CLIENT = 501;

	if ( typeof Object.create !== 'function' ) {
		Object.create = function (o) {
			function F() {
			}

			F.prototype = o;
			return new F();
		};
	}

	function Pomelo() {
		EventEmitter.call( this );

		this._socket = null;
		this._reqId = 0;
		this._callbacks = {};

		var handlers = this._handlers = {};
		handlers[Package.TYPE_HANDSHAKE] = handshake.bind( this );
		handlers[Package.TYPE_HEARTBEAT] = heartbeat.bind( this );
		handlers[Package.TYPE_DATA] = onData.bind( this );
		handlers[Package.TYPE_KICK] = onKick.bind( this );

		//Map from request id to route
		this._routeMap = {};
		this._dict = {};    // route string to code
		this._abbrs = {};   // code to route string
		this._serverProtos = {};
		this._clientProtos = {};
		this._protoVersion = 0;

		this._heartbeatInterval = 0;
		this._heartbeatTimeout = 0;
		this._nextHeartbeatTimeout = 0;
		this._gapThreshold = 100;   // heartbeat gap threashold
		this._heartbeatId = null;
		this._heartbeatTimeoutId = null;

		this._handshakeCallback = null;

		this._decode = null;
		this._encode = null;

		this._handshakeBuffer = {
			'sys': {
				type: JS_WS_CLIENT_TYPE,
				version: JS_WS_CLIENT_VERSION
			},
			'user': {
			}
		};
	}

	var pomelo = Pomelo.prototype = Object.create( EventEmitter.prototype ); // object extend from object

	pomelo._debug = false;

	pomelo.setDebug = function(debug){
		this._debug = !!debug;
	}

	pomelo.log = function () {
		if (this._debug)
			console.log.apply( console, arguments );
	}


	pomelo.init = function (params, cb) {
//		initCallback = cb;
		var host = params.host;
		var port = params.port;

		this._encode = params.encode || defaultEncode;
		this._decode = params.decode || defaultDecode;

		var url = 'ws://' + host;
		if ( port ) {
			url += ':' + port;
		}

		this._handshakeBuffer.user = params.user;
		this._handshakeCallback = params.handshakeCallback;
		initWebSocket.call( this, url );
		this.once( 'onmessage', cb );
	};

	var defaultDecode = pomelo.decode = function (data) {
		//probuff decode
		var msg = Message.decode( data );

		if ( msg.id > 0 ) {
			msg.route = this._routeMap[msg.id];
			delete this._routeMap[msg.id];
			if ( !msg.route ) {
				return;
			}
		}

		msg.body = deCompose.call( this, msg );
		return msg;
	};

	var defaultEncode = pomelo.encode = function (reqId, route, msg) {
		var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;

		//compress message by protobuf
		var clientProtos = this._clientProtos;
		if ( clientProtos && clientProtos[route] ) {
			msg = protobuf.encode( route, msg );
		} else {
			msg = Protocol.strencode( JSON.stringify( msg ) );
		}

		var compressRoute = 0, dict = this.dict;
		if ( dict && dict[route] ) {
			route = dict[route];
			compressRoute = 1;
		}

		return Message.encode( reqId, type, compressRoute, route, msg );
	};

	function onopen(event) {
		var obj = Package.encode( Package.TYPE_HANDSHAKE, Protocol.strencode( JSON.stringify( this._handshakeBuffer ) ) );
		send.call( this, obj );
	};

	function onmessage(event) {
		processPackage.call( this, Package.decode( event.data ) );
		// new package arrived, update the heartbeat timeout
		if ( this._heartbeatTimeout ) {
			this._nextHeartbeatTimeout = Date.now() + this._heartbeatTimeout;
		}
		this.emit( 'onmessage', event.data );
	};
	function onerror(event) {
		this.emit( 'io-error', event );
//		console.error( 'socket error: ', event );
	};
	function onclose(event) {
		this.emit( 'close', event );
		this.log('socket close', event);
	};

	var initWebSocket = function (url) {
		//Set protoversion
		this._handshakeBuffer.sys.protoVersion = this._protoVersion;

		var socket = this._socket = new WebSocket( url );
		socket.binaryType = 'arraybuffer';
		socket.onopen = onopen.bind( this );
		socket.onmessage = onmessage.bind( this );
		socket.onerror = onerror.bind( this );
		socket.onclose = onclose.bind( this );
	};

	pomelo.disconnect = function () {
		var socket = this._socket;
		if ( socket ) {
			if ( socket.disconnect ) socket.disconnect();
			if ( socket.close ) socket.close();
			this.emit( 'disconnect' );
			this._socket = socket = null;
		}

		if ( this._heartbeatId ) {
			clearTimeout( this._heartbeatId );
			this._heartbeatId = null;
		}
		if ( this._heartbeatTimeoutId ) {
			clearTimeout( this._heartbeatTimeoutId );
			this._heartbeatTimeoutId = null;
		}
	};

	pomelo.request = function (route, msg, cb) {
		if ( arguments.length === 2 && typeof msg === 'function' ) {
			cb = msg;
			msg = {};
		} else {
			msg = msg || {};
		}
		route = route || msg.route;
		if ( !route ) {
			return;
		}

		var reqId = ++this._reqId;
		sendMessage.call( this, reqId, route, msg );

		this._callbacks[reqId] = cb;
		this._routeMap[reqId] = route;
	};

	pomelo.notify = function (route, msg) {
		msg = msg || {};
		sendMessage.call( this, 0, route, msg );
	};

	pomelo.setMd5Signature = function(secret_key){
		this._secret_key = secret_key;
	}

	pomelo.setMd5Sign = function(){
		return this.setMd5Signature.apply(this, arguments);
	}

	function localCmp(str1, str2) {
		return str1.localeCompare( str2 );
	}

	function md5Signature(secret_key, route, msg){
		var keys = Object.keys(msg);
		keys.sort(localCmp);

		var sign_str = route;
		keys.forEach(function(key){
			if (typeof msg[key] !== 'object') {
				sign_str += msg[key];
			}
		});
		sign_str += secret_key;

		return hex_md5(sign_str);
	}

	var sendMessage = function (reqId, route, msg) {
		if (this._secret_key) {
			msg._ts = Math.round(new Date().getTime() / 1000);
			msg.sign = md5Signature(this._secret_key, route, msg);
		}

		this.log('sendMessage', reqId, msg);

		if ( this._encode ) {
			msg = this._encode( reqId, route, msg );
		}

		var packet = Package.encode( Package.TYPE_DATA, msg );
		send.call( this, packet );
	};

	function send(packet) {
		this._socket.send( packet.buffer );
	};


	function heartbeat(data) {
		if ( !this._heartbeatInterval ) {
			// no heartbeat
			return;
		}

		var obj = Package.encode( Package.TYPE_HEARTBEAT );
		if ( this._heartbeatTimeoutId ) {
			clearTimeout( this._heartbeatTimeoutId );
			this._heartbeatTimeoutId = null;
		}

		if ( this._heartbeatId ) {
			// already in a heartbeat interval
			return;
		}


		this._heartbeatId = setTimeout( function () {
			this._heartbeatId = null;
			send.call( this, obj );

			this._nextHeartbeatTimeout = Date.now() + this._heartbeatTimeout;
			this._heartbeatTimeoutId = setTimeout( heartbeatTimeoutCb.bind( this ), this._heartbeatTimeout );
		}.bind( this ), this._heartbeatInterval );
	};

	function heartbeatTimeoutCb() {
		var gap = this._nextHeartbeatTimeout - Date.now();
		if ( gap > this._gapThreshold ) {
			this._heartbeatTimeoutId = setTimeout( this._heartbeatTimeoutCb, gap );
		} else {
			console.error( 'server heartbeat timeout' );
			this.emit( 'heartbeat timeout' );
			this.disconnect();
		}
	};

	function handshake(data) {
		data = JSON.parse( Protocol.strdecode( data ) );
		if ( data.code === RES_OLD_CLIENT ) {
			this.emit( 'error', 'client version not fullfill' );
			return;
		}

		if ( data.code !== RES_OK ) {
			this.emit( 'error', 'handshake fail' );
			return;
		}

		handshakeInit.call( this, data );

		var obj = Package.encode( Package.TYPE_HANDSHAKE_ACK );
		send.call( this, obj );
		this.emit( 'handshake response', data );
		this.log( 'handshake response', data );
	};

	function onData(data) {
		var msg = data;
		if ( this._decode ) {
			msg = this._decode( msg );
		}
		this.log('onData', msg);
		processMessage.call( this, msg );
	};

	function onKick(data) {
		console.log('onKick');
		var msg = data;
		if ( this._decode ) {
			msg = this._decode( msg );
		}
		this.emit( 'onKick', msg);
	};


	var processPackage = function (msg) {
		this._handlers[msg.type]( msg.body );
	};

	var processMessage = function (msg) {
		if ( !msg.id ) {
			// server push message
			this.emit( msg.route, msg.body );
			return;
		}

		//if have a id then find the callback function with the request
		var cb = this._callbacks[msg.id];

		delete this._callbacks[msg.id];
		if ( typeof cb !== 'function' ) {
			return;
		}

		cb( msg.body );
		return;
	};

	var processMessageBatch = function (pomelo, msgs) {
		for ( var i = 0, l = msgs.length; i < l; i++ ) {
			processMessage( pomelo, msgs[i] );
		}
	};

	var deCompose = function (msg) {
		var route = msg.route;

		//Decompose route from dict
		if ( msg.compressRoute ) {
			if ( !this._abbrs[route] ) {
				return {};
			}

			route = msg.route = abbrs[route];
		}
		var serverProtos = this._serverProtos;
		if ( serverProtos && serverProtos[route] ) {
			return protobuf.decode( route, msg.body );
		} else {
			return JSON.parse( Protocol.strdecode( msg.body ) );
		}

		return msg;
	};

	function handshakeInit(data) {
		if ( data.sys && data.sys.heartbeat ) {
			this._heartbeatInterval = data.sys.heartbeat * 1000;   // heartbeat interval
			this._heartbeatTimeout = this._heartbeatInterval * 2;        // max heartbeat timeout
		} else {
			this._heartbeatInterval = 0;
			this._heartbeatTimeout = 0;
		}

		initData.call( this, data );

		if ( typeof this._handshakeCallback === 'function' ) {
			this._handshakeCallback( data.user );
		}
	};

	//Initilize data used in pomelo client
	var initData = function (data) {
		if ( !data || !data.sys ) {
			return;
		}
		var dict = data.sys.dict;
		var protos = data.sys.protos;

		//Init compress dict
		if ( dict ) {
			this._dict = dict;
			var abbrs = this._abbrs;

			for ( var route in dict ) {
				abbrs[dict[route]] = route;
			}
		}

		//Init protobuf protos
		if ( protos ) {
			this._protoVersion = protos.version || 0;
			this._serverProtos = protos.server || {};
			this._clientProtos = protos.client || {};
			if ( !!protobuf ) {
				protobuf.init( {encoderProtos: protos.client, decoderProtos: protos.server} );
			}
//
//			//Save protobuf protos to localStorage
//			window.localStorage.setItem( 'protos', JSON.stringify( protos ) );
		}
	};

	if (typeof module !== 'undefined' && typeof window === 'undefined') {
		module.exports = Pomelo;
		module.exports.pomelo = new Pomelo();
	} else {
		root.Pomelo = Pomelo;
		root.pomelo = new Pomelo();
	}
})();
