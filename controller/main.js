"use strict";

var redis       = App.get('redis');
var cfg          = require('../config/cfg.js');
var update      = require('../service/update');
var UPDATE_TYPE = require('../enums/game').UPDATE_TYPE;
var formidable = require('formidable');
var path       = require('path');
var fs         = require('fs');
const sharp = require('sharp');



/**
 */
App.get('/', function (req, handler) {
    handler.render('index.html');
});


App.post('/new-server', function(req, handler) {
    console.log("req.body",req.body);

    var params      = req.body,
        fromName     = params.fromName,
        fromEmail     = params.fromEmail,
        message     = params.message;

    var text = ["邮箱：",fromEmail,"联系电话：",message.Phone,"公司:",message.Company,"申请内容：",message.body].join("<BR>");

    Common.mailTo("service@xxxx.land",fromName +"申请开服", text);
    handler.redirect('/');
});



/**
 * 初始验证
 */
App.post('/game.check',checkSign, function (req, handler) {
    var oldVersion = req.body.ver,
        platform   = req.body.platform,
        promoter   = req.body.promoter;

    // 检查服务器状态
    if (cfg.Server.serverStatus) {
        return handler.send({code: Code.Server_Maintain, message: cfg.Server.serverStatus});
    }

    if(!oldVersion){
        return handler.send({code: Code.FAIL,error: "Params Error"});
    }

    if (platform == "web" ) {
        // return handler.send({code : Code.OK});
        return gameCheckReturnDone(handler);
    }else{
        var platform_test = /android/i.test(platform) ? 'android' : 'ios';
        // 检查新版本
        var newVersion = cfg.Server.currentVersion[platform_test];
        var updateType = update.getUpdateType(oldVersion, newVersion);

        console.log("oldVersion, newVersion:",oldVersion, newVersion);

        if (updateType === UPDATE_TYPE.FULL_UPDATE) {
            var fullUpdateUrl = cfg.Server.updateUrl.fullUpdate[platform_test];
            return handler.send({code: Code.New_Version, version: newVersion, url: fullUpdateUrl});
        }

        console.log("updateType:",updateType);

        // 服务器尚未发版
        // if(updateType === UPDATE_TYPE.NOT_RELEASED){
        //     return handler.send({code: Code.Server_Maintain, msg:'新版本正在发布，请稍后访问！'});
        // }

        // //热更新
        // if (updateType === UPDATE_TYPE.HOT_FIX_UPDATE) {
        //     var hotFixZipFileName = [oldVersion, newVersion].join('to') + '.zip';
        //     var hotFixZipUrl      = cfg.Server.updateUrl.hotFix[platform]
        //         .replace('#newVersion#', newVersion)
        //         .replace('#fileName#', hotFixZipFileName);
        //
        //     return handler.send({code: Code.HotFix_Version, version: newVersion, url: hotFixZipUrl});
        // }

        // 快速登陆开关
        return gameCheckReturnDone(handler);

    }

});

var gameCheckReturnDone = function (handler) {
    let key = Common.getKeyCfg('game.setting');
    var ary = [
        'wx_open', 'alipay_open', 'iap_open', 'guest_open', 'activity_open'
    ];
    var setMap = {},oSet;

    Underscore.each(ary, function(idx){
        setMap[idx] = idx;
    });
    ary = Underscore.union(ary, Underscore.values(setMap));
    ary.unshift(key);

    redis.hmget(ary, function (err,res) {
        oSet = [];
        if(!err){
            for(var i = 1;i<ary.length;i++){
                var entry = {};
                if(ary[i] == "activity_open"){
                    entry[ary[i]] = res[i]?String(res[i-1]).split(',') : [];
                }else{
                    entry[ary[i]] = parseInt(res[i-1]) ;
                }
                oSet.push(entry);
            }
        }

        return handler.send({code : Code.OK,setting     : {
            switch_set:oSet, servers:cfg.servers
        }});
    });
}



/**
 * 上传头像
 */
App.post('/avatar', function(req, handler){
    upload('avatar', req, handler);
})


/**
 * 上传方法
 */
var upload = function(type, req, handler){


    var form            = new formidable.IncomingForm();
    form.uploadDir      = path.join(DIR_ROOT+'public', 'tmp');   //文件保存的临时目录为当前项目下的tmp文件夹
    form.maxFieldsSize  = 2 * 1024 * 1024;                       //用cd a户头像大小限制
    form.keepExtensions = true;                                  //使用文件的原扩展名


    form.parse(req, function (err, fields, file) {
        var filePath = '';

        //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
        if(file.tmpFile){
            filePath = file.tmpFile.path;
        }
        else {
            for(var key in file){
                if(file[key].path && filePath===''){
                    filePath = file[key].path; break;
                }
            }
        }

        //文件移动的目录文件夹，不存在时创建目标文件夹
        var dateStr   = Utils.date('%F');
        var targetDir = path.join(DIR_ROOT+'public', 'pic', type);

        // console.log("targetDir:",targetDir);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }
        targetDir = path.join(targetDir, dateStr);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.'));

        //判断文件类型是否允许上传
        if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
            fs.unlink(filePath, function(){});
            handler.json({code:Code.FAIL, message:'File type error'});
        }
        else if (fs.statSync(filePath).size > form.maxFieldsSize) {
            // 上传文件大小
            fs.unlink(filePath, function(){});
            handler.json({code:Code.FAIL, message:'Exceeded size limit'});
        }
        else {
            //以当前时间戳对上传文件进行重命名
            var fileName   = new Date().getTime() + fileExt;
            var targetFile = path.join(targetDir, fileName);

            sharp(filePath)
                .resize(512, 512)
                .toFile(targetFile, function(err, info) {
                    fs.unlink(filePath, function(){});

                    var fileUrl = path.join('pic', type, dateStr, fileName);
                    handler.json({code:Code.OK, fileUrl:fileUrl});
                });

            // //移动文件
            // fs.rename(filePath, targetFile, function (err) {
            //     if (err) {
            //         console.info(err);
            //         handler.json({code:Code.FAIL, message:'Operation failed'});
            //     } else {
            //         //上传成功，返回文件的相对路径
            //         var fileUrl = path.join('pic', type, dateStr, fileName);
            //         handler.json({code:Code.OK, fileUrl:fileUrl});
            //     }
            //
            //     // 删除临时文件
            //     fs.unlink(filePath, function(){});
            // });
            // //移动文件 End
        }
    });
}
