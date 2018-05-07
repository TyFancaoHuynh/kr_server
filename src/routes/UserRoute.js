var user = require('../controllers/UserController');

module.exports = {
  viewOne: function (req, res) {
    user.get(req, res);
  },
  update: function (req, res) {
    user.update(req, res);
  },
  updateAvatar: function (req, res, filename) {
    user.updateAvatar(req, res, filename);
  },
  download:function(req,res){
    user.download(req,res)
  }
}
