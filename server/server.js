var http = require("http"),
    io = require("socket.io");
var app = http.createServer(),
    io = io.listen(app);
app.listen(3030.);

io.sockets.on("connection", function (socket) {
    var myurl = socket.request.headers.referer;
    var dateNum = (new Date()).valueOf(); //生成时间戳，作为房间号
    var roomID = null;

    console.log('连上了：' + myurl + dateNum);

    //返回连接成功
    socket.emit('receive_conn', dateNum);

    //创建一个房间，并加入此房间
    socket.on('create_room', function (__roomID) {
        console.log('玩家创建并加入房间' + __roomID);
        socket.join(__roomID);
        roomID = __roomID;
    });

    //加入指定房间
    socket.on('join_room', function (__roomID) {
        console.log('玩家加入房间' + __roomID);
        socket.join(__roomID);
        roomID = __roomID;

        console.log(io.sockets.adapter.rooms); //获取所有房间的信息
        console.log(io.sockets.adapter.rooms[roomID]); //获取指定房间的socket实例
        console.log('length:::::' + io.sockets.adapter.rooms[roomID].length); //获取指定房间的socket实例的个数
    });

    //玩家B向玩家A说话
    socket.on('playB_msg', function (data) {
        console.log(':::::::' + roomID);
        console.log('玩家B向玩家A说了：' + data.msg);
        socket.broadcast.to(roomID).emit('playB_msg_A', data); //向除自己外的同房间的客户端发送消息
    });

    //玩家向同房间所有玩家说话
    socket.on('room_msg', function (data) {
        console.log('玩家向同房间所有人说了：' + data.msg);
        io.sockets.in(roomID).emit('room_msg_say', data.msg); //向同房间的所有客户端发送消息
    });

    //玩家向服务器的所有玩家说话
    socket.on('all_msg', function (data) {
        console.log('玩家向服务器的所有人说了：' + data.msg);
        io.sockets.emit('all_msg_say', data.msg); //向服务器的所有客户端发消息
    });


    /*//玩家B进入
    socket.on('join_num', function (data) {
        console.log(':::::::' + dateNum);
        console.log('玩家都进入了，roomID=' + data);
    });

    //玩家B说话了
    socket.on('playB_msg', function (data) {
        console.log(':::::::' + dateNum);
        console.log('玩家B说话了：' + data.msg);
        io.sockets.emit('playB_msg_A', data); //向所有客户端发送消息
        //socket.broadcast.emit('playB_msg_A', data); //向除自己外的客户端发送消息
    });*/

    //有人断开链接
    socket.on('disconnect', function () {
        console.log('有人断开链接了');
    });
});