// /**
//  * Created by vd on 03/07/17.
//  * 二维码
//  */
'use strict';
var qr =  require('qr-image');

App.get('/qrcode', function (req, res, next) {
    var url = req.query.url;
    if (!url) {
        return res.send({code: Code.FAIL, data: 'error'});
    }
    url = new Buffer(url, 'base64').toString();

    var stream = qr.image(url, {type: 'png'});
    stream.on('error', function (err) {
        console.error(err);
        return res.send({code: Code.FAIL, data: 'error'});
    });

    stream.pipe(res);
});