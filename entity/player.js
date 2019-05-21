"use strict";

var async		= require('async');
var util 		= require('util');
var Entity 		= require(DIR_SHARED + 'mysql/entity.js');
module.exports  = Player;


function Player(opts) {
    opts = opts || {};
    Entity.call(this, {
        pid      : opts.pid,
        name     : Common.base64_encode(opts.name) || "",
        pic      : opts.pic  || '1',
        exp      : + opts.exp || 0,
        energy   : + opts.energy || 0,
        energy_recovery   : + opts.energy_recovery || 0,
        shield   : + opts.shield || 0,
        level    : + opts.level || 1,
        vip      : + opts.vip || 0,
        gem      : opts.gem || 0,
        wheel_count     : opts.wheel_count || 0,
        steal_count     : opts.steal_count || 0,
        friend_energy_count     : opts.friend_energy_count || 0,
        attack_count    : opts.attack_count || 0,
        friends_count   : opts.friends_count || 0,
        harvest_count   : opts.harvest_count || 0,
        revenge_count   : opts.revenge_count || 0,
        unlock_planet   : opts.unlock_planet  || 1,
        unlock_galaxy   : opts.unlock_galaxy  || 1,
        build_levels    : opts.build_levels  || 0,
        win_lose        : opts.win_lose  || 0,
        can_attack_win  : opts.can_attack_win  || 0,
        init	        : opts.init  || 0,
        items	        : opts.items || {},
		ext		        : opts.ext   || {},
        is_maja	        : opts.is_maja || 0,
        is_novice       : opts.is_novice || 0,
        attacked_time   : opts.attacked_time || 0,
        add_time        : opts.add_time || 0,
        last_time       : opts.last_time || 0,
        attack_uid      : opts.attack_uid || 0,
        steal_uid       : opts.steal_uid || [],
        enemy           : opts.enemy || [],
        sign            : opts.sign || 0,
        sign_time       : opts.sign_time || 0,
        friend_energy   : opts.friend_energy || 0,
        friend_energy_time       : opts.friend_energy_time || 0,
        last_ip     : opts.last_ip,
        promoter    : opts.promoter,
        platform    : opts.platform,
        is_ban      : opts.is_ban,
        upline      : opts.upline || 0,
        new_target  : opts.new_target || 0
    });

    this.idKey          = 'pid';
    this.tbname	        = 'game_player';
    this.build_levels   = (Underscore.isArray(this.build_levels)    ? this.build_levels : Utils.parseJSON(this.build_levels)) || 0;
	this.ext            = (Underscore.isObject(this.ext)            ? this.ext          : Utils.parseJSON(this.ext)) || {};
    this.items	        = (Underscore.isObject(this.items)	        ? this.items        : Utils.parseJSON(this.items)) || {};
    this.steal_uid      = (Underscore.isArray(this.steal_uid)       ? this.steal_uid    : Utils.parseJSON(this.steal_uid)) || [];
    this.enemy          = (Underscore.isArray(this.enemy)           ? this.enemy        : Utils.parseJSON(this.enemy)) || [];

}
util.inherits(Player, Entity);


// /**
//  * Create a player
//  */
// Player.create = function (opts, cb){
//     var oPlayer   = new Player(opts);
//     oPlayer.gem   = opts.gem || 0;
//     oPlayer.can_attack_win = 36;
//     oPlayer.dbAdd(function(err, res) {
//         cb(err, oPlayer);
//
//         // 欢迎邮件
//         // var param = {
//         //     pid : oPlayer.pid,
//         //     data: JSON.stringify({
//         //         title: 'Welcome to Bitman!',
//         //         content: 'Welcome！'
//         //     })
//         // };
//         // Common.rpc('system.sysRemote.sendSysMsg', null, [param], Utils.emptyFunc);
//     });
// };