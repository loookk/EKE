/**
 * 更新逻辑
 */
'use strict';

const _           = require('lodash');
const UPDATE_TYPE = require('../enums/game').UPDATE_TYPE;

module.exports = {
    needUpdate   : needUpdate,
    getUpdateType: getUpdateType
};

/**
 * 获取更新类型
 * @param clientVersion
 * @param nowVersion
 */
function getUpdateType(clientVersion, nowVersion) {
    if (clientVersion === nowVersion) {
        return UPDATE_TYPE.NOT_NEED_UPDATE;
    }

    console.log("clientVersion:",clientVersion);
    console.log("nowVersion:",nowVersion);

    clientVersion = clientVersion.split('.');
    nowVersion    = nowVersion.split('.');

    if (+clientVersion[0] < +nowVersion[0] || +clientVersion[1] < +nowVersion[1]) {
        return UPDATE_TYPE.FULL_UPDATE;
    }

    // 客户端版本领先服务器发布版本
    let clientIsNewer = _.some(clientVersion, (item, index) => {
            return +item > +nowVersion[index];
    });

    if (clientIsNewer) {
        return UPDATE_TYPE.NOT_RELEASED;
    }

    if (+clientVersion[2] < +nowVersion[2]) {
        return UPDATE_TYPE.HOT_FIX_UPDATE;
    }

    return UPDATE_TYPE.NOT_NEED_UPDATE;
}

/**
 * 是否需要更新
 * @param oldVersion
 * @param newVersion
 */
function needUpdate(oldVersion, newVersion) {
    if (oldVersion === newVersion) {
        return false;
    }

    oldVersion = oldVersion.split('.');
    newVersion = newVersion.split('.');

    var len = Math.min(oldVersion.length, newVersion.length);

    for (var i = 0; i < len; i++) {
        if (+oldVersion[i] < +newVersion[i]) {
            return true;
        }
    }

    return oldVersion.length < newVersion.length;
}