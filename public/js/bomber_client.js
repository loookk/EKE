/**
 * Created with JetBrains WebStorm.
 * User:
 * Date: 13-11-8
 * Time: 上午11:04
 * To change this template use File | Settings | File Templates.
 */
(function(){
  var pomelo = window.pomelo;
  var EventEmitter = window.EventEmitter;

  var State = {
    INIT : 0,
    CONNECTING : 1,
    CONNECTED : 2,
    QUERYING : 3,
    DISCONNECTING : 5,
    DISCONNECTED : 6
  }

  function BomberClient(conn){
    EventEmitter.call(this);

    this.pomelo = conn;
    this.state = State.INIT;

    var self = this;
    conn.on('disconnect', function(reason){
      updateState.call(self, State.DISCONNECTED, reason);
      self.emit('disconnect', reason);
    })

    conn.on('error', function(err){
      updateState.call(self, State.DISCONNECTED, err);
    })

    conn.on('move', function(data){
      self.emit('move', data);
    })

    conn.on('start', function(data){
      self.emit('start', data);
    })

    conn.on('notify', function(data){
      self.emit('notify', data);
    })
  }

  BomberClient.prototype = Object.create(EventEmitter.prototype);

  var bomber = BomberClient.prototype;

  bomber.setParam = function(param){
    this._host = param.host;
    this._port = param.port;
  }

  bomber.connect = function(){
    updateState.call(this, State.CONNECTING);
    var self = this;
    this.pomelo.init({
      port : this._port,
      host : this._host,
      log : true
    }, function(){
      onConnect.call(self);
    });
  }

  bomber.request = function(){
    this.pomelo.request.apply(this.pomelo, arguments);
  }

  bomber.notify = function(){
    this.pomelo.notify.apply(this.pomelo, arguments);
  }

  bomber.move = function(x, y){
    this.notify('room.gameHandler.move', {x: x, y:y});
  }

  bomber.joinRoom = function(cb){
    this.request('room.roomHandler.join', cb);
  }

  bomber.disconnect = function(){
    updateState.call(this, State.DISCONNECTING);
    var self = this;
    this.pomelo.disconnect();
  }

  function onConnect(){
    updateState.call(this, State.CONNECTED);
    this.emit('connected');
  }

  function updateState(state){
    this.state = state;
    this.emit('state', state);
  }


  BomberClient.State = State;
  window.BomberClient = BomberClient;
  window.Bomber = new BomberClient(pomelo);

})();