var user = require('../controllers/UserController');

module.exports = {
  viewOne: function (req, res) {
    user.get(req, res);
  },
  update: function (req, res, filename) {
    user.update(req, res, filename);
  },
  download:function(req,res){
    user.download(req,res)
  }
}
