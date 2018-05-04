var http = require('http'),
    fs = require('fs');

var files = require('data.json'),
    length = datas.length,
    imgs = [],
    i = 0;

while (i < length) {
    imgs.push(files[i].imageURL);
    i++;
}

var download = function (url, dest) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        if (response.statusCode === 200) {
            var file = fs.createWriteStream("copy.html");
            response.pipe(file);
        }
        // Add timeout.
        request.setTimeout(12000, function () {
            request.abort();
        });
    });
};

imgs.forEach(function (img, index) {
    download(img, String(index + 1) + '.jpg');
});
