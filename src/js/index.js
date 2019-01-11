import Sharejs from './Sharejs';
import * as PIXI from 'pixi.js';
import Vconsole from 'vconsole';
import Loader from './Loader/Loader';

import Soundjs from './media/Soundjs';
import SoundMc from './media/SoundMc';
import Video from './media/Video';
import LoadingMc from './Loader/LoadingMc';
import Scene1 from './Scene/Scene1';

import * as ChcUtils from 'chcutils';

import io from 'socket.io-client';

let app;
let stage;
let sound;
let soundMc;
let video;

let playA = false;
let playB = false;
let roomID = null;

//====================================分享部分=========================
let share = new Sharejs();
share.shareObj = {
    sharePath: location.href, //分享地址
    shareImg: "http://www.blueteapot.cn/tdh/h5Demo/images/myIcon.jpg", //分享图片
    shareTitle: 'h5 demo', //分享title
    shareDesc: "test" //分享描述
}
share.init();

//================================socket部分============================
let socketSrc = window.location.hostname;
let socket;

//================================判断是不是playA=====================
var OsUtil = new ChcUtils.OsUtil();
roomID = OsUtil.getQueryString('id') || null;
if (roomID == null) {
    playA = true;
} else {
    playB = true;
    socketHandler();
}


//初始化背景音乐
initSound();

//初始化视频
initVideo();

//初始化pixi
initPixi();

var vconsole = new Vconsole();

//===============================初始化背景音乐==================================//
function initSound() {
    sound = new Soundjs('myMusic', true, true);
}

function soundMcIn() {
    soundMc = new SoundMc(sound);
    soundMc.init();
    app.stage.addChild(soundMc);
    soundMc.begin();
    soundMc.x = app.view.width - soundMc.wid - 50;
    soundMc.y = 50;
}

//================================初始化视频=====================================//
function initVideo() {
    video = new Video();
    video.emiter.on(video.VIDEO_PLAY, () => {
        console.log('event 视频开始播了');
        soundMc.mute();
    });
    video.emiter.on(video.VIDEO_END, () => {
        console.log('event 视频播完了');
        soundMc.unmute();
    });
}

//===============================初始化pixi======================================//
function initPixi() {
    const wid = window.innerWidth;
    const hei = window.innerHeight;

    app = new PIXI.Application(640, 640 / (wid / hei), {
        backgroundColor: 0x1099bb,
        preserveDrawingBuffer: true,
        antialias: true,
    });

    document.getElementById('pixiStage').appendChild(app.view);
    app.view.id = 'pixiCanvas';
    stage = new PIXI.Container();
    app.stage.addChild(stage);

    loading();
    start();
}

//=====================================loading部分==================================//
let loadingMc;

function loading() {
    //先加载加载界面
    let loading_asset = [
        {name: 'myIcon', url: './images/myIcon.jpg'}
    ];
    const loader = new Loader({manifest: loading_asset});
    loader.start();
    loader.on('onComplete', () => {
        loadingMc = new LoadingMc();
        stage.addChild(loadingMc);
        loadingMc.x = app.view.width / 2 - loadingMc.wid / 2;
        loadingMc.y = app.view.height / 2 - loadingMc.hei / 2;
        loadingMc.begin();

        loadMain(); //加载主资源
    });
}

let mainLoader;

function loadMain() {
    let loading_asset = [
        {name: 'assets', url: './images/assets.json'},
        {name: 'boss', url: './images/boss.png'}
    ];

    mainLoader = new Loader({manifest: loading_asset, easing: 0.1});
    mainLoader.start();
    mainLoader.on('onProgress', (pro) => {
        //console.log(pro);
        loadingMc.text.text = pro + '%';
    });
    mainLoader.on('onComplete', () => {
        mainLoader = null;
        stage.removeChild(loadingMc);
        loadingMc = null;

        soundMcIn();
        lunchIn();
    });
}

//==============================lunch部分=======================
let lunch;

function lunchIn() {
    lunch = new Scene1(app);
    lunch.init();
    stage.addChild(lunch);
    lunch.x = app.view.width / 2 - lunch.wid / 2;
    lunch.y = app.view.height / 2 - lunch.hei / 2;
    lunch.begin();
    lunch.on(lunch.SCENE_IN, () => {
        console.log('lunch in');
    });

    lunch.on(lunch.VIDEO_PLAY, () => {
        if (playA == true) {
            //如果是playA，则点按钮后连服务端
            socketHandler(); //连接服务端
        } else if (playB = true) {
            //如果是playB，则点按钮后
            //向同房间的playA发送消息
            let obj = {
                msg: 'hello playA!' + roomID
            };
            socket.emit('playB_msg', obj);

            //向同房间所有客户端发送消息
            let all_room_obj = {
                msg: 'hello same room' + roomID
            };
            socket.emit('room_msg', all_room_obj);

            //向服务器所有客户端发送消息
            let all_obj = {
                msg: 'hello world' + roomID
            }
            socket.emit('all_msg', all_obj);
        }
    });
}

//================================连接服务器==================================
function socketHandler() {
    console.log(socketSrc);
    socket = io.connect(socketSrc + ':3030');

    //服务端回应连接成功，返回房间号
    socket.on("receive_conn", (__roomID) => {
        //如果没获取过房间号，则将返回的房间号赋过去
        if (roomID == null) roomID = __roomID;

        if (playA == true) {
            playAFn(); //玩家A逻辑
        } else if (playB == true) {
            playBFn(); //玩家B逻辑
        }
    });


}

function playAFn() {
    //生成带房间号的地址
    let str = window.location.origin + '/index.html?id=' + roomID;
    console.log(str);

    //playA创建并加入房间
    socket.emit('create_room', roomID);

    //接收playB说的话
    socket.on('playB_msg_A', function (data) {
        console.log(data.msg);
    });

    //接收该房间广播的消息
    socket.on('room_msg_say', function (msg) {
        console.log(msg);
    });

    //接收服务器广播的消息
    socket.on('all_msg_say', function (msg) {
        console.log(msg);
    });
}

function playBFn() {
    //playB请求加入房间（分组）
    socket.emit('join_room', roomID);

    //接收该房间广播的消息
    socket.on('room_msg_say', function (msg) {
        console.log(msg);
    });

    //接收服务器广播的消息
    socket.on('all_msg_say', function (msg) {
        console.log(msg);
    });
}

function update() {
    if (mainLoader) mainLoader.update();
}

function start() {
    requestAnimationFrame(start);
    update();
}