
var jwt = require('../controllers/AuthController');

module.exports = {
    register: function (req, res, next) {
        jwt.register(req, res);
    },
    checkToken: function (req, res, next) {
        jwt.checkToken(req, res, next);
    },
    login:function(req,res,next){
        jwt.login(req,res)
    }
}



