/**
 * Created by MeiHua on 2016/12/7.
 */
var flag=navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
var ios = navigator.userAgent.match(/iPhone|iPod|ios|iPad/i);
function timeFormat(seconds) {
    var m =  Math.floor(seconds / 60);
    var s = parseInt(seconds - m * 60);
    if (m < 10) {
        m = '0' + m;
    }
    if (s < 10) {
        s = '0' + s;
    }
    return m + ':' + s;
}
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
    var str=decodeURI(window.location.search);
    str = decodeURI(str);
    var r = str.substr(1).match(reg);
    if (r!=null){
        return unescape(r[2])
    }; return null;
}
function $(id) {
    return document.getElementById(id)
}
function $class(el) {
    return document.querySelectorAll(el);
}
function _getJSONP(src){
    var script = document.createElement('script');
    script.src = src + '&callback=_jsonpcallback'+ "&" + parseInt(Math.random()*10000);
    document.getElementsByTagName('head')[0].appendChild(script);
    document.getElementsByTagName('head')[0].removeChild(script);
}
(function() {
    var getOffsetLeft = function(elem) {
        var offsetLeft = elem.offsetLeft;
        var offsetParent = elem.offsetParent;
        while(offsetParent) {
            offsetLeft += offsetParent.offsetLeft;
            offsetParent = offsetParent.offsetParent;
        }
        return offsetLeft;
    };

    var mousedown = false;
    window.setDraggable = function(handler, onMove) {
        if (handler && typeof onMove == 'function') {
            var start = function() {
                mousedown = true;
            };
            var end = function() {
                mousedown = false;
            };
            var move = function(event) {
                if (mousedown) {
                    event = event || window.event;
                    var trackLeft = getOffsetLeft(handler);
                    var trackWidth = handler.clientWidth;
                    var pageX = event.pageX;
                    if (event.touches && event.touches.length) {
                        pageX = event.touches[0].pageX;
                    }
                    if (pageX >= trackLeft && pageX <= trackLeft + trackWidth) {
                        var progress = (pageX - trackLeft) / trackWidth;
                        onMove(progress);
                    }
                }
            };

            handler.onmousedown = start;
            document.onmouseup = end;
            document.onmousemove = move;

            handler.addEventListener('touchstart', start, false);
            document.addEventListener('touchend', end, false);
            document.addEventListener('touchmove', move, false);
        }
    };
})();
if (!flag){
    $('pc').style.display = 'block';
}
function getDuration(url) {
    var _player = new Audio(url);
    _player.addEventListener("durationchange", function (e) {
        if (this.duration!=Infinity) {
            var duration = this.duration;
            _player.remove();
            $('playerTotalTime').innerHTML = timeFormat(duration);
        }
    }, false);
}
function _jsonpcallback(data) {
    if (data.response_status.error == false){
        var solo = $('solo');
        var playerBtn = $('playerBtn');
        var bufferedTrack = $('bufferedTrack');
        var playerCurrent = $('playerCurrent');
        var range = $('range');
        var playerCurrentTime = $('playerCurrentTime');
        var playerTotalTime = $('playerTotalTime');
        var audio = $('audio');
        var leftCover = $class('.leftCover')[0];
        var rightCover = $class('.rightCover')[0];

        $class('.songName')[0].innerHTML = data.response_data.song.name;
        $class('.blur')[0].setAttribute('src',data.response_data.user.headImg);
        $class('#container pre')[0].innerHTML = data.response_data.song.desc;
        $class('.icon-music')[0].innerHTML = data.response_data.song.listenCount;
        $class('.icon-gift')[0].innerHTML = data.response_data.song.charm;
        $class('.icon-msg')[0].innerHTML = data.response_data.song.commentCount;
        $class('.icon-like')[0].innerHTML = data.response_data.song.praiseCount;
        if (data.response_data.song.type == 0 || data.response_data.song.type == 2){
            data.response_data.song.type == 0 ? $class('.type')[0].style.display = 'block' : ($class('.type')[1].style.display = 'block',$class('.solo em')[0].innerHTML = data.response_data.song.chorusCount+'lần song ca');
            $class('#solo .singer img')[0].setAttribute('src',data.response_data.user.headImg);
            solo.style.display = 'block';
            $class('.singerInfo .solo .name')[0].innerHTML = data.response_data.user.nick;
            $class('.solo .singer-pic img')[0].setAttribute('src',data.response_data.user.headImg);
            $class('.singerInfo .solo .lv')[0].style.backgroundImage = 'url("../img/song/rank/singerRank_'+(data.response_data.user.singerTitleLv <= 9 ? '0'+data.response_data.user.singerTitleLv : data.response_data.user.singerTitleLv)+'.png")';
            $class('.singerInfo .solo .grow')[0].style.backgroundImage = 'url("../img/song/grow/icon_grow0'+(parseInt(data.response_data.user.singerLv/10) + 1)+'.png")';
            $class('.singerInfo .solo dd')[0].innerHTML = 'ID '+data.response_data.user.uid;
            $class('.singerInfo .solo')[0].style.display = 'block';
        }else if (data.response_data.song.type == 1){
            $class('.song_info')[0].style.paddingTop = '2.55rem';
            $class('.leftCover img')[0].setAttribute('src',data.response_data.user.headImg);
            $class('.rightCover img')[0].setAttribute('src',data.response_data.song.partner.headImg);
            $('chorus').style.display = 'block';
            $class('.chorus img')[0].setAttribute('src',data.response_data.user.headImg);
            $class('.chorus img')[1].setAttribute('src',data.response_data.song.partner.headImg);
            $class('.chorus strong')[0].innerHTML = data.response_data.user.nick;
            $class('.chorus strong')[1].innerHTML = data.response_data.song.partner.nick;
            $class('.chorus em')[0].innerHTML = 'ID '+data.response_data.user.uid;
            $class('.chorus em')[1].innerHTML = 'ID '+data.response_data.song.partner.uid;
            $class('.chorus')[0].style.display = 'block';
        }
        $class('.haveSong')[0].style.display = 'block';
        $('container').style.display = 'block';
        getDuration(data.response_data.song.path);
        if (audio && audio.canPlayType('audio/mpeg')) {
            audio.src = data.response_data.song.path;
            audio.addEventListener('timeupdate', function() {
                var progress = parseInt((this.currentTime / this.duration) * 100);
                range.value = progress;
                playerCurrent.style.width = progress + '%';
                playerCurrentTime.innerHTML = timeFormat(this.currentTime);
                playerTotalTime.innerHTML = timeFormat(this.duration);

                if (audio.buffered && audio.buffered.length) {
                    bufferedTrack.style.width =  parseInt(audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100) + '%';
                }
            });

            audio.addEventListener('ended', function() {
                range.value = 0;
                playerCurrent.style.width = '0%';
                playerCurrentTime.innerHTML = timeFormat(0);
                playerTotalTime.innerHTML = timeFormat(this.duration);
                playerBtn.className = 'playerBtn';
                if (data.response_data.song.type == 1){
                    leftCover.className = 'leftCover';
                    rightCover.className = 'rightCover';
                }else {
                    solo.className = '';
                }
            });

            audio.load();
            playerBtn.className = 'playerBtn';

        } else {
            // alert('');
        }
        playerBtn.onclick = function() {
            if (audio.paused) {
                audio.play();
                this.className = 'playerBtn playing';
                if (data.response_data.song.type == 1){
                    leftCover.className = 'leftCover rotate';
                    rightCover.className = 'rightCover rotate';
                }else {
                    solo.className = 'rotate';
                }
            } else {
                audio.pause();
                this.className = 'playerBtn';
                if (data.response_data.song.type == 1){
                    leftCover.className = 'leftCover';
                    rightCover.className = 'rightCover';
                }else {
                    solo.className = '';
                }
            }
        };

        range.onchange = function() {
            playerCurrent.style.width = this.value + '%';
            audio.currentTime = audio.duration * (this.value / 100);
        };

        var allImgs = document.getElementsByTagName('img');
        for (var i = 0, len = allImgs.length; i < len; i++) {
            allImgs[i].setAttribute('ondragstart', 'return false');
        }

        setDraggable(range, function(progress) {
            audio.currentTime = audio.duration * progress;
            var percent = parseInt(progress * 100);
            range.value = percent;
            playerCurrent.style.width = percent + '%';
        });
    }else if(data.response_status.code == 10010) {
        $class('.noSong')[0].style.display = 'block';
        $('container').style.display = 'block';
    }
}
function is_wechat(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}

function GetSid(sid)
{
    console.log("vo day lay sid ni");
        if(sid != null && sid.length >= 2)
        {
                if(sid.charAt(0)  == '/' )
                        sid = sid.substr(1 , sid.length);
        }       
        return sid ;
}

var sid = GetQueryString('sid');
console.log("vo day ni lay sid");
sid = GetSid(sid) ;
var src = 'http://act.singnowapp.com/index.php?action=GetSongInfo&sid='+sid;
_getJSONP(src);

for(var i = 0,len = $class('.downLoad').length; i < len; i++){
    $class('.downLoad')[i].onclick = function () {
        if(flag){
            if(ios){
                var weChatFlag = is_wechat();
                if(weChatFlag){
                    $('maskBox').style.display = 'block';
                }else {
                    location.href = 'singnowapp://sid='+sid;
                    setTimeout(function(){
                        window.location.href = "http://singnowapp.com/goto_appstore";
                    }, 3000);
                }
            }else {
               //location.href = 'singnowapp://singnowapp.com/{"controller":"com.utalk.hsing.ui.songfriends.FriendsSongActivity","property":{"extra_song_id":"'+sid+'"}}';
                //setTimeout(function(){
                   // window.location.href = "http://singnowapp.com/";
                //}, 3000);
		window.location.href = "http://singnowapp.com/goto_googleplay";
            }
        }else {
            $('pcMask').style.display = 'block';
            $('pc').className = 'wobble';
        }
    }
}
$('pcMask').onclick = function () {
    $('pcMask').style.display = 'none';
    $('pc').className = '';
}
$('imask').onclick = function () {
    $('maskBox').style.display = 'none';
}
$('androidBtn').onclick = function () {
    $('pcMask').style.display = 'none';
    $('pc').className = '';
    $('j-popup').style.display = 'block';
}
$('cancle').onclick = function () {
    $('j-popup').style.display = 'none';
}


