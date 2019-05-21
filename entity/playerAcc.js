"use strict";

var tbname  = 'game_player_acc';
var util 	= require('util');
var Entity 	= require(DIR_ROOT + '../shared/mysql/entity.js');
var Promise     = require("bluebird");
var redis       = require(DIR_SHARED + 'redis/redis.js');
var async 	= require("async");

var TaskManager	= require(DIR_ROOT + 'entity/taskMgr.js' ).TaskManager;
var mgrTask    	= new TaskManager({closeOnEmpty: true});


/**
 * Initialize a new 'playerAccEntity' with the given 'opts'.
 */
var playerAcc = function(opts) {
    opts = opts || {};
    Entity.call(this, {
        pid         : opts.pid,
        quickID     : opts.quickID,
        email       : opts.email,
        mobile_prefix : opts.mobile_prefix || '0086',
        mobile      : opts.mobile,
        idcard_name : opts.idcard_name,
        idcard_no   : opts.idcard_no,
        password    : opts.password,
        salt        : opts.salt,
        is_bind_address : opts.is_bind_address,
        is_bind_dceUser : opts.is_bind_dceUser || 0,
        dce_userId  : opts.dce_userId || 0,
        login_cnt   : opts.login_cnt,
        last_server : opts.last_server || 0,
        add_time    : opts.add_time,
        last_time   : opts.add_time,
    });
    this.idKey  = 'pid';
    this.tbname = tbname;
};
util.inherits(playerAcc, Entity);

module.exports = playerAcc;

/**
 * Get playerAcc by quickID
 * 获取快速登陆的用户，且该用户不能绑定过钱包
 */
playerAcc.getByQuickID = function (quickID, cb){
    var sql  = ["Select * From ", tbname, " Where quickID=? Limit 1"].join(''),
        args = [quickID];

    console.log("sql",sql)

    Entity.getDb().query(sql, args, function(err, res){
        console.log("++++++++++res:")
        if (res && res.length>0) {
            return cb(null, new playerAcc(res[0]));
        }
        cb(err, null);
    });
}



/**
 * Get playerAcc by pid
 */
playerAcc.getByPid = function (pid, cb){
  	var sql  = ["Select * From ", tbname, " Where pid=?  Limit 1"].join(''),
        args = [pid];

  	console.log("sql",sql)

    Entity.getDb().query(sql, args, function(err, res){
        if (res && res.length>0) {
            return cb(null, new playerAcc(res[0]));
        }
      	cb(err, null);
  	});
}

/**
 * Get playerAcc by email
 */
playerAcc.getByEmail = function (email, cb){
    var sql  = ["Select * From ", tbname, " Where email=?  Limit 1"].join(''),
        args = [email];

    console.log("sql",sql)

    Entity.getDb().query(sql, args, function(err, res){
        if (res && res.length>0) {
            return cb(null, new playerAcc(res[0]));
        }
        cb(err, null);
    });
}


/**
 * Create a playerAcc
 */
playerAcc.create = function (opts, cb){
    var oAcc = new playerAcc(opts);

    oAcc.dbAdd(function(err, res){
        if( err ){
            return cb(err, null);
        }
        oAcc.pid = res.insertId;

        //bind


        cb(null, oAcc);
    });
}


/**
 * 简单处理随机玩家id
 */
playerAcc.getPlayerId = function (cb) {
    let isValidPid = false;
    async.whilst(
        function () {
            return !isValidPid;
        },
        function (callback) {
            let pid;
            async.waterfall([
                function (cb) {
                    _getPlayerId(cb);
                },
                function (rst, cb) {
                    pid = rst;
                    isPidUsed(pid, cb);
                }
            ], function (err, isUsed) {
                if (err) {
                    return callback(err);
                }

                if (!isUsed) {
                    isValidPid = true;
                }
                return callback(null, pid);
            });
        },
        function (err, pid) {
            if(err){
                return cb(err);
            }
            return cb(null, {code: Code.OK, pid: pid});
        }
    );
};

const redisSet   = Promise.promisify(redis.set.bind(redis));
const redisGet   = Promise.promisify(redis.get.bind(redis));
const addServersredisSadd  = Promise.promisify(redis.sadd.bind(redis));
const redisScard = Promise.promisify(redis.scard.bind(redis));
const redisSpop  = Promise.promisify(redis.spop.bind(redis));

function _getPlayerId(cb) {
    const increaseStep   = 10000;
    const thresholdValue = 10000;

    let REDIS_KEY = {
        PlayerPidPool        : 'PlayerPidPool',
        PlayerPidLastMaxValue: 'PlayerPidLastMaxValue'
    };

    console.log("REDIS_KEY:",REDIS_KEY)

    mgrTask.addTask('getPlayerId', function (oTask) {
        return Promise.props({
            memberCnt : redisScard(REDIS_KEY.PlayerPidPool),
            lastMaxPid: redisGet(REDIS_KEY.PlayerPidLastMaxValue)
        }).then(result => {
            let {memberCnt, lastMaxPid} = result;
        memberCnt                   = +memberCnt;
        lastMaxPid                  = +lastMaxPid;
        if (!lastMaxPid) {
            console.log("PlayerPidPool没有初始化!")
            throw  new Error('PlayerPidPool没有初始化!');
        }
        if (memberCnt < thresholdValue) {
            let nextPidArr    = _.range(lastMaxPid + 1, lastMaxPid + 1 + increaseStep);
            let nextLatMaxPid = _.max(nextPidArr);
            return Promise.props({
                newMemerCnt: redisSadd(REDIS_KEY.PlayerPidPool, nextPidArr),
                lastMaxPid : redisSet(REDIS_KEY.PlayerPidLastMaxValue, nextLatMaxPid)
            });
        }
    }).then(() => {
            return redisSpop(REDIS_KEY.PlayerPidPool);
    }).asCallback(function (err, pid) {
            oTask.done();
            Utils.invokeCallback(cb, err && err.message, pid);
        });
    });
}

function isPidUsed(pid, cb) {
    let sql  = 'select pid from game_player where pid = ?';
    Entity.getDb().query(sql, [pid], function(err, res) {
        return cb(err, res && !!res.length);
    });
}