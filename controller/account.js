"use strict";

var async        = require('async');
var cfg          = require('../config/cfg.js');
var tokenSer     = require(DIR_ROOT + '../shared/token.js');
var playerAcc    = require(DIR_ROOT + 'entity/playerAcc.js');
var playerDao    = require(DIR_ROOT + 'entity/player.js');


var redis        = require(DIR_SHARED + 'redis/redis.js');
var secretCfg 	 = SysCfg.session;

var wallet       = require(DIR_ROOT + 'entity/wallet.js');



/**
 * 绑定邮箱密码
 */
App.post('/bind',checkSign, EnsureAuth, function(req, handler) {
    var oAcc,
        now	        = Utils.now(),
        params      = req.body,
        pToken      = params.pToken,
        email       = params.email,
        pwd         = params.password,
        mobilePrefix  = params.mobile_prefix,
        mobile      = params.mobile,
        idcardName  = params.idcard_name,
        idcardNo    = params.idcard_no,
        errCode  = Code.FAIL,
        errMsg  = 'error';
    var salt = Common.getRandStr(4);

    var title = 'center-account-bind: '
    console.log(title, "start")

    if (!email
        || !pwd
        || !mobilePrefix
        || !mobile
        || !idcardName
        || !idcardNo
        ) {
        return handler.send({code: errCode, error: "Params Error"});
    }

    if ( !Utils.chkInput('email', email) ) {
        return handler.send({code: errCode, error: "please input the correct email address"});
    }

    async.waterfall(
        [
            //验证Email是否已存在
            function(cb) {
                playerAcc.getByEmail(email, cb);
            },
            function(res, cb) {
                if ( res ) {
                    errCode = Code.Account_Exist;
                    errMsg  = 'Account Exist';
                    return cb(new Error('Account Exist'),errCode);
                }else{
                    //如果不存在，查询token对应的pid用户信息
                    playerAcc.getByPid(pToken.pid, cb);
                }
            },
            function(res, cb) {
                oAcc = res;

                // 账号验证
                if ( !oAcc ) {
                    errCode = Code.Not_Exist;
                    errMsg  = 'Login Error, Your account does not exist!';
                    return cb(new Error(errMsg),errCode);
                }

                // 被封禁
                // if (oAcc && oAcc.is_ban) {
                //     errCode = Code.Invalid_Ban;
                //     errMsg  = 'Account is ban';
                //     return cb(new Error(errMsg),errCode);
                // }

                cb(null, oAcc);
            },
            function(res, cb) {
                // console.log("获取对应的钱包地址")
                oAcc = res;

                //设置账号密码
                oAcc.email = email;
                oAcc.salt = salt;
                oAcc.password = Common.makePassword(pwd, salt);
                oAcc.quickID = "";
                oAcc.mobile_prefix = mobilePrefix
                oAcc.mobile = mobile
                oAcc.idcard_name = idcardName
                oAcc.idcard_no = idcardNo


                oAcc.dbUpdate(
                    ['email', 'password', 'quickID', 'salt', 'mobile_prefix', 'mobile', 'idcard_name', 'idcard_no'],
                    function () {
                        cb(null,oAcc);
                    }
                );
            },
        ],
        function(err, Data) {

            if ( err ) {

                handler.send({code:Data, error: err.message});
                return;
            }

            var token = tokenSer.create(oAcc.pid, Date.now(), secretCfg.secret,"");
            handler.send({code: Code.OK, token: token, pid: oAcc.pid});

            // handler.send({code: Code.OK});
        });

    console.log(title, "end")

});

/**
 * 邀请
 */

App.get('/invite',  function(req, handler) {
    var now	        = Utils.now(),
        params      = req.query,
        vid         = parseInt(params.vid) ,
        server      = params.server,
        uri         = params.uri,
        errCode     = Code.FAIL,
        errMsg      = 'error';

    if (!vid || isNaN(vid) || vid <= 0 || !uri) {
        return handler.send({code: errCode, error: "Params Error"});
    }

    var ipAddress   = Utils.clientIp(req) || "127.0.0.1";

    var address = cfg.serverAddress[server];


    if(address){
        Common.serverRpc(address,'system.sysRemote.dailyGiftInvite', null, [{vid:vid,ip: ipAddress, protocol: 'hybrid'}], function (err,data) {
            if(err){
                handler.redirect(uri);
            }else{
                var key = data.key;
                // var url = "http://localhost:8000?redirect=1&invite="+key+"&vid="+vid;
                // var url = "http://localhost:8000?redirect=1&invite="+key+"&vid="+vid;
                var url = "http://localhost?redirect=1&invite="+key+"&vid="+vid;
                console.log("url:",url)
                handler.redirect(url);
            }
        });
    }else{
        handler.redirect('/');
    }


    // var pid	  = session.get('pid');
    // console.log("__++++pid:",secretCfg)

    // Common.rpc('system.sysRemote.dailyGiftInvite', null, [{vid:vid,ip: ipAddress, protocol: 'hybrid'}], function (err,data) {
    //     if(err){
    //         handler.redirect(uri);
    //     }else{
    //         var key = data.key;
    //         var url = uri+"?invite="+key+"&vid="+vid;
    //         // console.log("url:",url)
    //         handler.redirect(url);
    //     }
    // });


    // handler.send({code: Code.OK, vid: vid});
});

/**
 * 新玩家
 * @param playerInfo
 * @param cb
 */
function createNewPlayerAcc(playerInfo, cb) {
    async.waterfall([
        function (cb) {
            playerAcc.getPlayerId(cb);
        },
        function (rst, cb) {
            if(rst.code !== 200){
                return cb(rst);
            }
            playerInfo.pid = rst.pid;
            playerAcc.create(playerInfo, cb);
        }
    ], cb);
}

/**
 * 注册
 */
App.post('/register', checkSign, function(req, handler) {
    var oAcc,
        now	        = Utils.now(),
        params      = req.body,
        email       = params.email,
        pwd         = params.password,
        promoter    = params.promoter,
        platform    = params.platform,
        mobilePrefix  = params.mobile_prefix,
        mobile      = params.mobile,
        idcardName  = params.idcard_name,
        idcardNo    = params.idcard_no,
        errCode  = Code.FAIL,
        errMsg  = 'error';
    var salt = Common.getRandStr(4);
    var address;
    var last_ip   = Utils.clientIp(req);

    if (!email
        || !pwd
        || !promoter
        || !platform
        || !mobilePrefix
        || !mobile
        || !idcardName
        || !idcardNo
        ) {
        return handler.send({code: errCode, error: "Params Error"});
    }

    if ( !Utils.chkInput('email', email) ) {
        return handler.send({code: errCode, error: "please input the correct email address"});
    }

    async.waterfall([
            function(cb) {
                playerAcc.getByEmail(email, cb);
            },
            function(res, cb) {
                oAcc = res;

                if ( oAcc ) {
                    errCode = Code.Account_Exist;
                    errMsg  = 'Account Exist';
                    return cb(new Error('Account Exist'),errCode);
                }else{

                    // 创建新账号
                    createNewPlayerAcc({
                        email       : email,
                        password    : Common.makePassword(pwd, salt),
                        salt        : salt,
                        mobile_prefix : mobilePrefix,
                        mobile : mobile,
                        idcard_name : idcardName,
                        idcard_no : idcardNo,
                        add_time    : now,
                        last_time   : now,
                        login_cnt   : 0,
                        is_bind_address : 0,
                    },function(err, res) {
                        oAcc = res;
                        if ( oAcc.pid ) {
                            return cb(null,oAcc);
                        }
                        cb( new Error('Create Account Error'),Code.FAIL );
                    });
                }
            },
            function(res, cb) {
                //获取对应的钱包地址
                wallet.bind(oAcc.pid,function (err,data) {
                    // console.log("quickLogin ------ bind result: ", data,err);

                    if(err){
                        return cb(new Error(errMsg),Code.FAIL);
                    }

                    oAcc.is_bind_address = 1;
                    oAcc.dbUpdate(['is_bind_address'],function () {
                        // console.log("______oAcc.dbUpdate")
                    });
                    cb(null, oAcc);
                });
            },
            // function(res, cb) {
            //     if ( oAcc.pid ) {
            //         return playerDao.create({
            //             pid      : oAcc.pid,
            //             name     : 'Guest ' + oAcc.pid,
            //             gem      : cfg.newPlayerGiftGemCnt,
            //             energy   : cfg.newPlayerEnergy,
            //             promoter    : promoter,
            //             platform    : platform,
            //             is_ban      : 0,
            //             last_ip     : last_ip,
            //             is_novice   :  1,
            //             add_time    : now,
            //             last_time   : now,
            //         }, cb);
            //     }
            //     cb( new Error('Create Account Error') );
            // },
            // function (rst, cb) {
            //     // 获取game-server的host port
            //     // console.log("获取game-server的host port");
            //     Common.rpc('system.routeRemote.queryEntry', null, [{pid: oAcc.pid, protocol: 'hybrid'}], cb);
            // }
        ],
        function(err, rst) {

            if ( err ) {
                handler.send({code:rst, error: err.message});
                return;
            }

            loginReturn(oAcc,handler);
        });
});

/**
 * 账号密码登陆
 */
App.post('/pwlogin', checkSign, function(req, handler) {
    var oAcc, oPlayer,
        now	        = Utils.now(),
        params      = req.body,
        email       = params.email,
        pwd         = params.password,
        promoter    = params.promoter,
        platform    = params.platform,
        errCode     = Code.FAIL,
        errMsg      = 'game server connect error';

    if (!email || !pwd || !promoter || !platform) {
        return handler.send({code: errCode, error: "Params Error"});
    }

    if ( !Utils.chkInput('email', email) ) {
        return handler.send({code: errCode, error: "please input the correct email address"});
    }

    async.waterfall([
            function( cb ) {
                playerAcc.getByEmail(email, cb);
            },
            function(res, cb) {
                oAcc = res;

                // 账号验证
                if ( !oAcc ) {
                    errCode = Code.Not_Exist;

                    console.log("++++++",errCode)
                    errMsg  = 'Login Error, Your account does not exist!';
                    return cb(new Error(errMsg),errCode);
                }

                // 验证密码
                var chkPwd = Common.makePassword(pwd, oAcc.salt);
                if (chkPwd != oAcc.password) {
                    errCode = Code.Invalid_Pwd;
                    errMsg  = 'Password Wrong';

                    console.log("____errCode:",errCode);
                    return cb(new Error(errMsg),errCode);
                }

                // if (oAcc && oAcc.is_ban) {
                //     errCode = Code.Invalid_Ban;
                //     errMsg  = 'Account is ban';
                //     return cb(new Error(errMsg),errCode);
                // }

                if(oAcc.is_bind_address != 1){
                    wallet.bind(oAcc.pid,function (err,data) {
                        // console.log("quickLogin ------ bind result: ", data,err);

                        if(err){
                            return cb(new Error(errMsg),errCode);
                        }

                        oAcc.is_bind_address = 1;
                        oAcc.dbUpdate(['is_bind_address'],function () {
                            // console.log("______oAcc.dbUpdate")
                        });
                        cb(null, oAcc);
                    });
                }else{
                    cb(null, oAcc);
                }
            },
        ],
        function(err, rst) {

            if ( err ) {
                handler.send({code: rst, error: err.message});
                return;
            }

            loginReturn(oAcc,handler);
        });
});



/**
 * token登陆
 */
App.post('/login',checkSign,EnsureAuth, function(req, handler) {
    var oAcc,
        now	        = Utils.now(),
        params      = req.body,
        pToken      = params.pToken,
        promoter    = params.promoter,
        platform    = params.platform,
        errCode     = Code.FAIL,
        errMsg      = 'game server connect error';

    // console.log("----------pToken:",pToken);

    if (!promoter || !platform) {
        return handler.send({code: errCode, error: "Params Error"});
    }

    async.waterfall([
            function( cb ) {
                playerAcc.getByPid(pToken.pid, cb);
            },
            function(res, cb) {
                oAcc = res;

                // 账号验证
                if ( !oAcc ) {
                    errCode = Code.Not_Exist;
                    errMsg  = 'Login Error, Your account does not exist!';
                    return cb(new Error(errMsg),errCode);
                }

                if(oAcc.is_bind_address != 1){
                    wallet.bind(oAcc.pid,function (err,data) {
                        // console.log("quickLogin ------ bind result: ", data,err);

                        if(err){
                            return cb(new Error(errMsg),errCode);
                        }

                        oAcc.is_bind_address = 1;
                        oAcc.dbUpdate(['is_bind_address'],function () {
                            // console.log("______oAcc.dbUpdate")
                        });
                        cb(null, oAcc);
                    });
                }else{
                    cb(null, oAcc);
                }
            },
        ],
        function(err, rst) {

            if ( err ) {
                handler.send({code: errCode, error: err.message});
                return;
            }

            loginReturn(oAcc,handler);
        });
});



/**
 * 快速登陆
 */
App.post('/quickLogin' ,checkSign,  function(req, handler) {
    var oAcc,
        now	        = Utils.now(),
        params      = req.body,
        serial      = params.serial,
        promoter    = params.promoter,
        platform    = params.platform,
        errCode     = Code.FAIL,
        errMsg      = 'game server connect error';
    var last_ip   = Utils.clientIp(req);


    if (!serial || !promoter || !platform) {
        return handler.send({code: errCode, error: "Params Error"});
    }

    async.waterfall(
        [
            function( cb ) {
                playerAcc.getByQuickID(serial, cb);
            },
            function (rst, cb) { // 账户不存在，创建

                // console.log("______rst:",rst)
                if ( rst ) {
                    oAcc = rst;
                    return cb(null, rst);
                }

                // 创建新账号
                createNewPlayerAcc({
                    quickID     : serial,
                    email       : "",
                    password    : "",
                    salt        : "",
                    add_time    : now,
                    last_time   : now,
                    login_cnt   : 0,
                    is_bind_address : 0,
                }, function(err, res) {
                    oAcc = res;
                    if ( oAcc.pid ) {
                        // return playerDao.create({
                        //     pid      : oAcc.pid,
                        //     name     : 'Guest ' + oAcc.pid,
                        //     gem      : cfg.newPlayerGiftGemCnt,
                        //     energy   : cfg.newPlayerEnergy,
                        //     promoter    : promoter,
                        //     platform    : platform,
                        //     is_ban      : 0,
                        //     last_ip     : last_ip,
                        //     is_novice   :  1,
                        //     add_time    : now,
                        //     last_time   : now,
                        // }, cb);
                        return cb(null,oAcc);
                    }
                    cb( new Error('Create Account Error'),Code.FAIL );
                });
            },
            function(res, cb) {
                // oAcc = res;
                // 被封禁
                if (!oAcc) {
                    errCode = Code.Invalid_Ban;
                    errMsg  = 'Account Error';
                    return cb(new Error(errMsg),errCode);
                }

                if(oAcc.is_bind_address != 1){

                    wallet.bind(oAcc.pid,function (err,data) {
                        // console.log("quickLogin ------ bind result: ", data,err);

                        if(err){
                            return cb(new Error(errMsg),errCode);
                        }

                        oAcc.is_bind_address = 1;
                        oAcc.dbUpdate(['is_bind_address'],function () {
                            // console.log("______oAcc.dbUpdate")
                        });

                        cb(null, oAcc);
                    });
                }else{
                    cb(null, oAcc);
                }
            },
        ],
        function(err, rst) {

            if ( err ) {
                handler.send({code: rst, error: err.message});
                return;
            }

            loginReturn(oAcc,handler);
        });
});

var loginReturn = function(oAcc,handler){
    var token = tokenSer.create(oAcc.pid, Date.now(), secretCfg.secret,"");

    var lastServer;
    if(oAcc.last_server > 0){
        lastServer = oAcc.last_server;
    }else{
        lastServer = cfg.introServer;
    }

    handler.send({
        code: Code.OK,
        token: token,
        pid: oAcc.pid,
        servers:cfg.servers,
        lastServer:lastServer
    });

    // 登录次数加1
    oAcc.login_cnt++;
    oAcc.last_time = Utils.now();
    // oAcc.last_ip   = Utils.clientIp(req);
    oAcc.dbUpdate(['login_cnt', 'last_time']);
    // 登录次数加1 End
};

App.post('/servers',checkSign, function(req, handler) {
    handler.send({
        code: Code.OK,
        servers:cfg.servers,
    });
});

App.post('/queryEntry',checkSign, function(req, handler) {

    var params      = req.body,
        serverID    = params.serverID,
        pid         = params.pid;

    var address = cfg.serverAddress[serverID];
console.log("address:",address,serverID, cfg.serverAddress);    
if(address){
        Common.serverRpc(address,'system.routeRemote.queryEntry', null, [{pid: pid, protocol: 'hybrid'}], function (err,Data) {
console.log("debug:", err, Data);    
            if ( err ) {
                handler.send({code: Data ? Data : Code.FAIL, error: err.message});
                return;
            }
            if ( !Data || !Data.host ) {
                handler.send({code: Code.FAIL, error: "Can not find game-server"});
                return;
            }

            playerAcc.getByPid(pid, function (err,oAcc) {

                if(!err){
                    oAcc.last_server = serverID;
                    oAcc.dbUpdate(['last_server'],function () {
                    });
                }
            });

            handler.send({code: Code.OK, host: Data.host, port: Data.port});
        });

    }else{
        handler.send({code: Code.FAIL, error: "Server Error"});
    }
});


/**
 * 验证码
//  */
App.post('/vcode',checkSign, function(req, handler) {
    var params  = req.body,
        email   = params.email,
        type    = params.type || 'reset',
        vcode   = Underscore.random(1000, 9999),
        errCode = Code.FAIL;

    if ( !Utils.chkInput('email', email) ) {
        return handler.send({code: errCode, error: "please input email"});
    }

    var check = email.split("@");
    if(Underscore.contains(["fa8.club","cjw8.club"],check[1])){
        return handler.send({code: Code.OK});
    }

    if(check[1] != null){
        var check1 = check[1].split(".");
        if(check1[1] == "club" || check1[1] == "xyz"){
            return handler.send({code: Code.OK});
        }
    }

    // var ipAddress   = Utils.clientIp(req) || "127.0.0.1";
    // if(ipAddress == "120.37.117.194"){
    //     return handler.send({code: Code.OK});
    // }


    async.waterfall([
            function( cb ) {
                playerAcc.getByEmail(email, cb);
            },
            function(oAcc, cb) {
                // 重置
                if ((type=='reset' && !oAcc) || (type=='withdraw' && !oAcc)) {
                    errCode = Code.Not_Exist;
                    return cb('Email is not registered',errCode);
                }

                // 发验证码
                Common.mailTo(email,"Your vcode is "+vcode, "Your vcode is "+vcode);
		cb()
                // Common.sendSMS(type, phone, vcode, cb);
            }
        ],
        function(err, data){
            if ( err ) {
                console.log("errerr:",err);
                handler.send({code: Code.FAIL, error: err});
            }else{
                // 验证码存储
                VerifyCodeRed('setex', email, vcode, Utils.emptyFunc);
                // handler.send({code: Code.OK, vcode: vcode});
                handler.send({code: Code.OK});
            }


        })
})

// 验证码各操作
var VerifyCodeRed = function(func, email, vcode, cb) {
    var key = redis.key('verify-code', email);

    switch (func) {
        case 'setex':
            redis.setex(key, 3600, vcode, cb);
            break;

        case 'get':
            redis.get(key, cb);
            break;

        case 'del':
            redis.del(key, cb);
            break;

        default:
            throw new Error("No verify code function:" + func);
    }
}



/**
 * 设置密码
 */
App.post('/reset',checkSign,  function(req, handler) {
    var oAcc,
        params  = req.body,
        email   = params.email,
        pwd     = params.password,
        vcode   = params.vcode,
        errCode = Code.FAIL;

    if (!email || !pwd || !vcode) {
        return handler.send({code: errCode, error: "Param Error"});
    }
    if ( !Utils.chkInput('email', email) ) {
        return handler.send({code: errCode, error: "Please input email"});
    }

    // console.log("_____vcode:",vcode);

    async.waterfall([
            function( cb ) {
                VerifyCodeRed('get', email, '', cb);
            },
            function(chkCode, cb) {
                // console.log("_____chkCode:",chkCode);
                // console.log("_____vcode:",vcode);
                if (vcode != chkCode) {
                    errCode = Code.Invalid_Vcode;
                    return cb(new Error('vcode error'));
                }

                playerAcc.getByEmail(email, cb);
            },
            function(res, cb) {
                oAcc = res;

                if ( !oAcc ) {
                    errCode = Code.Not_Exist;
                    return cb(new Error('Email not register'));
                }

                //设置账号密码
                var salt = Common.getRandStr(4);
                oAcc.salt = salt;
                oAcc.password = Common.makePassword(pwd, salt);

                oAcc.dbUpdate(['password','salt'],function () {
                    cb(null,oAcc);
                });

            },
            // function(res, cb) {  // 获取game-server的host port
            //     Common.rpc('system.routeRemote.queryEntry', null, [{pid:oAcc.pid, protocol:'hybrid'}], cb);
            // }
        ],
        function(err, rst) {

            if ( err ) {
                handler.send({code: errCode, error: err.message});
                return;
            }

            loginReturn(oAcc,handler);
            VerifyCodeRed('del', email, '', Utils.emptyFunc);
        });
        // function(err, Data) {
        //     if ( err ) {
        //         return handler.send({code: errCode, error: err.message});
        //     }
        //     if (!Data || !Data.host) {
        //         return handler.send({code: errCode, error: "Can not find game-server"});
        //     }
        //
        //     handler.send({
        //         code : Code.OK,
        //         pid  : oAcc.pid,
        //         host : Data.host,
        //         port : Data.port,
        //         isNew: 0,
        //         token: tokenSer.create(oAcc.pid, Date.now(), SysCfg.session.secret)
        //     });
        //     VerifyCodeRed('del', email, '', Utils.emptyFunc);
        // });
})
