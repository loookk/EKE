__resources__["/clientManager.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function (exports, require, module, __filename, __dirname) {
        //var clientManager = require('Manager');

        var pomelo     = window.pomelo;
        var msgHandler = require('msgHandler');
        var config     = require('config');
        var alert      = window.alert;
        var self       = this;
        var loading    = false;
        var httpHost   = location.href.replace(location.pathname, '/');

        pomelo.on('websocket-error', function () {
            lodading = false;
        });

        function init() {
            //bind events
            $('#conectBtn').on('click', login);
            $('#disconnetBtn').hide().on('click', disconnect);
            $('#registerBtn').on('click', register);

            //oauth button
            $('#authBtn li a').on('click', function () {
                var $a  = $(this);
                var url = $a.attr('href');
                if ( url && url !== '#' ) {
                    window.open(window.location.origin + url, "auth", "toolbar=0,status=0,resizable=1,width=620,height=450,left=200,top=200");
                }
                return false;
            });
        }


        /**
         * login
         */
        function login() {
            var username = $('#username').val().trim();
            var pwd      = $('#password').val().trim();
            if ( !username ) {
                alert("Username is required!");
                return;
            }
            if ( !pwd ) {
                alert("Password is required!");
                return;
            }

            $.post(httpHost + 'quickLogin', {serial: username, promoter: "promoter",platform:"debug"}, function (data) {
            // $.post(httpHost + 'login', {serial: username, app_flag: pwd}, function (data) {
                var msg = '';

                switch (+data.code) {
                    case 200:
                        break;

                    case 1001:
                        msg = 'Login fail!';
                        break;

                    case 1003:
                        msg = 'Username not exits!';
                        break;

                    case 9000:
                        msg = data.error;
                        break;

                    default:
                        msg = data.error || 'Login Fail!';
                }
                if ( msg ) {
                    alert(msg);
                    return;
                }

                if ( !data.host || !data.port ) {
                    alert('服务器分配失败');
                    return;
                }
                entry(data.host, data.port, data.token, async function () {

                    if ( ['x', 'y', 'z'].includes(username) ) {
                        let route, params;
                        if ( username === 'x' ) {
                            route  = 'player.roomHandler.create';
                            params = '{"dizhu":"jiao","cnt":"8","fengding":"8","difanbei":"true","3dai2":"true","mingpai":"false","goingDutch":"0","gameType":"doudizhu","debug":true}';
                        } else {
                            route  = 'player.roomHandler.join';
                            params = '{"mwid":100000}';
                        }
                        let data = await PR(route, params);
                        console.error(data);
                        data = await PR('ddz.deskHandler.ready', "{}");
                        console.error(data);

                        $('#route').val('ddz.deskHandler.mingPai');
                        $("#params").val(routeMap['ddz.deskHandler.mingPai']);
                    } else {
                        $('#route').val('player.roomHandler.join');
                        $("#params").val(routeMap['player.roomHandler.join']);
                    }

                });
                $('#result').val(JSON.stringify(data));
            });
        }

        function PR(route, params) {
            return new Promise((res, rej) => {
                pomelo.request(route, JSON.parse(params), data => {
                    return res(data);
                });
            });
        }
        let i={"cmd":[98,{"longitude":113.001,"latitude":100.9,"state":"Success","type":"location"}],"cards":[]}


        /**
         * enter game server
         */
        function entry(host, port, token, callback) {
            if ( host === '127.0.0.1' ) {
                host = config.GATE_HOST;
            }

            pomelo.setMd5Signature($('#secret_key').val());
            pomelo.setDebug(true);

            pomelo.init({host: host, port: port, log: true}, function () {
                pomelo.request('connector.entryHandler.entry', {token: token, from: "web"}, function (data) {
                    if ( callback ) {
                        callback(data.code);
                    }

                    var msg = '';
                    switch (+data.code) {
                        case 200:
                            break;

                        case 1001:
                            msg = 'Login fail!';
                            break;

                        case 1003:
                            msg = 'Username not exits!';
                            break;

                        case 9000:
                            msg = data.error;
                            break;

                        default:
                            msg = data.error || 'Login Fail!';
                    }
                    if ( msg ) {
                        alert(msg);
                        return;
                    }

                    // init handler
                    msgHandler.init();
                    afterLogin(data);
                });
            });
        }


        function authEntry(pid, token, hostcfg, callback) {
            entry(hostcfg.host, hostcfg.port, token, callback);
        }

        pomelo.authEntry = authEntry;


        //register
        function register() {
            if ( loading ) {
                return;
            }

            loading  = true;
            var name = $('#username').val().trim();
            var pwd  = $('#password').val().trim();

            $('#password').val('');
            if ( name === '' ) {
                alert('Username is required!');
                loading = false;
                return;
            }
            if ( pwd === '' ) {
                alert('Password is required!');
                loading = false;
                return;
            }

            $.post(httpHost + 'register', {name: name, password: pwd}, function (data) {
                if ( data.code === 501 ) {
                    $('#result').val('Username already exists！');
                } else if ( data.code === 200 ) {
                    $('#result').val(JSON.stringify(data));
                } else {
                    $('#result').val('Register fail！');
                }
                loading = false;
            });
        }


        function afterLogin(data) {
            var playerData  = data.data.player;
            pomelo.playerId = playerData.pid;
            pomelo.player   = playerData;

            $('#conectBtn').hide();
            $('#disconnetBtn').show();
        }


        function disconnect() {
            pomelo.disconnect();
            $('#conectBtn').show();
            $('#disconnetBtn').hide();
        }


        //暴露的接口和对象
        exports.init  = init;
        exports.entry = entry;
    }
};