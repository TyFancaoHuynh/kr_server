var userRoute = require('../routes/UserRoute');
let feedRoute = require('../routes/FeedRoute');
let authRoute = require('../routes/AuthRoute');
let commentRoute = require('../routes/CommentRoute');
let express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var fileName = ""
var fileNameUserWrite=""
var imageFile=""
var originalFile=""
var imageName = ""

var j=0;
const maxSize = 10000000;
var storageAudioOptions = multer.diskStorage({
    destination: 'uploads/audios',
    filename: function (req, file, cb) {
            let date = new Date()
            console.log("file at first: "+file)
        if(j%2==0){
            fileName = req.decoded.username + '-' + file.fieldname + '-' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds() + '-' + date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear()
            console.log("imagefile")
           cb(null, fileName);            
        }else{
            imageFile=req.decoded.username + '-' + file.fieldname + '-' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds() + '-' + date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear()
            cb(null, imageFile);
        }
        j++;               
    }
});
var i=0;
const audioUpload = multer({
    fileFilter: (req, file, cb) => {
        console.log("iiiiiiiiiiiiiiiiiii:   "+i)
        if(i%2==0){
            i++;                        
        const filetypes = /m4a|mp3|mp4/;
        const mimetype = filetypes.test(file.mimetype);
        console.log("mimetypes: " + mimetype + "   file.mime: " + file.mimetype + "  fileType: " + filetypes + "file :"+file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        console.log("extname: " + extname);
        if (!mimetype && extname) {
            return cb(new Error('Only audio files are allowed!'));            
        }
        return cb(null, true);   

        } else{
        i++;            
        const filetypes = /jpeg|png|jpg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        console.log("mimetypes: " + mimetype + "   file.mime: " + file.mimetype + "  fileType: " + filetypes+" extname: "+extname+" origin : "+file.originalname+ "path: "+path);        
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error('Only image files are allowed!'));
        }
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
        const filetypes = /jpeg|png|jpg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        console.log("mimetypes: " + mimetype + "   file.mime: " + file.mimetype + "  fileType: " + filetypes+" extname: "+extname+" origin : "+file.originalname+ "path: "+path);        
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
let dirFileMusic='uploads/audios';
let router = express.Router();
module.exports = {
    configure: function (app) {
    
        app.use('/api', router);
        router.post('/register', authRoute.register);
        router.post('/login', authRoute.login);
        router.use(authRoute.checkToken)
        router.get('/feeds', feedRoute.viewAll);
        router.get('/user/infor/:id', userRoute.viewOne);
        router.put('/user/update', function (req, res) {
            userRoute.update(req, res);
        });

        router.put('/user/update/avatar', imageUpload.single('avatar'), function (req, res) {
            userRoute.updateAvatar(req, res, imageName);
        });

        router.post('/feed/create', audioUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1}]), function (req, res) {
            fileNameUserWrite=req.body.file_name;   
            console.log("file name: " + fileName);  
            console.log("file name: " + fileNameUserWrite); 
            console.log("image file: " + imageFile); 
            feedRoute.createFeed(req, res, fileName,fileNameUserWrite,imageFile);
        });

        router.get('/feed/infor/:id', feedRoute.viewOne);
        router.get('/feed/:id/comments', feedRoute.comments);
        router.post('/feed/:id/like', feedRoute.like);
        router.delete('/feed/:id/like', feedRoute.unlike);
        router.post('/feed/:id/comment', feedRoute.comment);
        router.delete('/feed/me/:id',feedRoute.deleteFeed);
        router.put('/feed/me',audioUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1}]),function(req,res){
            feedRoute.updateFeed(req, res, fileName,fileNameUserWrite);
        });

        app.get('/avatar/:file(*)',(req, res) => {
            var file = req.params.file;
            var fileLocation = path.join('./uploads/avatars',file);
            console.log(fileLocation);
            res.download(fileLocation, file); 
          });
        
        app.get('/:file(*)',(req, res) => {
            var file = req.params.file;
            var fileLocation = path.join('./uploads/audios',file);
            console.log(fileLocation);
            res.download(fileLocation, file); 
          });
    }
};
