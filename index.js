const express=require("express");
const socketio=require("socket.io");
const http=require('http');
const cmp=require('./comparator');

var app=express();
var server=http.Server(app);
var io=socketio(server);

var config={
    host:process.env.HOST||"127.0.0.1",
    port:process.env.PORT||8081
}
function compare(obj1,obj2,callback){
    
    
}
function doSort(objlist,callback){
    return asyncMergeSort(objlist,compare,callback);
}
function onConnect(socket){
    socket.on("gc login",function(data){
        
    });
    socket.on("gc logout",function(data){
        
    });

    socket.on("gc ready",function(data){

    });

}




io.on('connection',onConnect);

server.listen(config,function(){
    console.log("Server listening at "+config.host+":"+config.port);

})
