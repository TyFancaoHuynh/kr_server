var userRoute = require('../routes/UserRoute');
let feedRoute = require('../routes/FeedRoute');
let authRoute = require('../routes/AuthRoute');
let commentRoute = require('../routes/CommentRoute');
let express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var fileName = ""
var imageName = ""

const maxSize = 10000000;
var storageAudioOptions = multer.diskStorage({
    destination: 'uploads/audios',
    filename: function (req, file, cb) {
        let date = new Date()
        fileName = req.decoded.username + '-' + file.fieldname + '-' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds() + '-' + date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear()
        cb(null, fileName)
    }
});

const audioUpload = multer({
    fileFilter: (req, file, cb) => {
        const filetypes = /m4a|mp3|mp4/;
        const mimetype = filetypes.test(file.mimetype);
        console.log("mimetypes: " + mimetype + "   file.mime: " + file.mimetype + "  fileType: " + filetypes);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        console.log("extname: " + extname);
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error('Only audio files are allowed!'));
    },
    limits: {
        fileSize: maxSize
    },
    storage: storageAudioOptions
});


var storageImageOptions = multer.diskStorage({
    destination: 'uploads/avatars',
    filename: function (req, file, cb) {
        let date = new Date()
        imageName = req.decoded.username + '-' + file.fieldname + '-' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds() + '-' + date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear()
        cb(null, imageName)
    }
});

const imageUpload = multer({
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error('Only image files are allowed!'));
    },
    limits: {
        fileSize: maxSize
    },
    storage: storageImageOptions
});

let dirAvartar = 'uploads/avatars';
let router = express.Router();
module.exports = {
    configure: function (app) {
        fs.readdir(dirAvartar, (err, files) => {
            console.log("files: " + files.length);
            files.forEach(file => {
                console.log(file);
                app.use('/' + file, userRoute.download);
            });
        })
        app.use('/api', router);
        router.post('/register', authRoute.register);
        router.post('/login', authRoute.login);
        router.use(authRoute.checkToken)
        router.get('/feeds', feedRoute.viewAll);
        router.get('/user/me', userRoute.viewOne);
        router.put('/user/update', function (req, res) {
            userRoute.update(req, res);
        });

        router.put('/user/update/avatar', imageUpload.single('avatar'), function (req, res) {
            userRoute.updateAvatar(req, res, imageName);
        });

        router.post('/feed/create', audioUpload.single('audio'), function (req, res) {
            console.log("file name: " + fileName)
            feedRoute.createFeed(req, res, fileName);
        });

        router.get('/feed/me', feedRoute.viewOne);
        router.get('/feed/:id/comments', feedRoute.comments);
        router.post('/feed/:id/like', feedRoute.like);
        router.delete('/feed/:id/like', feedRoute.unlike);
        router.post('/feed/:id/comment', feedRoute.comment);

    }
};
