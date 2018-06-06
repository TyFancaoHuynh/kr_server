var flag=navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
(function(doc, win){
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function(){
            var clientWidth = docEl.clientWidth;
            if(clientWidth >= 750){
                clientWidth = 750;
            }
            if(!clientWidth) return;
            if (flag) {
                docEl.style.fontSize = 20 * (clientWidth / 375) + 'px';
            }else{
                docEl.style.fontSize=28+'px';
            }
        };
    if(!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
    setInterval(recalc, 500);
})(document, window);