var comment = require('../controllers/CommentController');
var timeout=3000
module.exports = {
    viewAll: function (req, res) {
        res.setTimeout(() => {
            comment.get(res);
        }, timeout);
    },
    createFeed: function (req, res, fileName) {
        res.setTimeout(()=>{
            comment.create(req, res, fileName);
        },timeout)
    },
    viewOne: function (req, res) {

    }
}
