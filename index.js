const express=require("express");
const socketio=require("socket.io");
const http=require('http');
const Util=require('util');
var greatest=null;
var user_count=0;
var greatest_list=[];
var app=express();
var server=http.Server(app);
var io=socketio(server);

var config={
    host:process.env.HOST||"127.0.0.1",
    port:process.env.PORT||8081
}
last_promise=new Promise(function(resolve,reject){resolve()});
function startCompare(obj){
    last_promise=last_promise.then(function(){return new Promise((resolve,rejected)=>{
        compare(greatest,obj,function(err,data){
            if(err) return rejected();
            console.log(data);
            if(!(data.result)){
                setResult(obj);
            }/*else{
                var current_greatest=greatest;
                last_promise=last_promise.then(new Promise((resolve2,rejected2)=>{
                    console.log("Check equal...")
                    compare(obj,current_greatest,function(err2,data2){
                        if(current_greatest==greatest && data2.result){
                            greatest_list.push(obj.name);
                            io.emit("gc change top",{"name":greatest_list});
                        }
                        resolve2();
                    });
                }))
            }*/
            resolve(data);
        });
    });}).then(function(data){
        if(data.result) return new Promise((resolve,rejected)=>{
                    var current_greatest=greatest;
                    console.log("Check equal...")
                    compare(obj,current_greatest,function(err2,data2){
                        if(current_greatest==greatest && data2.result){
                            greatest_list.push(obj.name);
                            io.emit("gc change top",{"name":greatest_list});
                        }
                        resolve();
                    });
        });
    } 

    );
}

function setResult(obj){
    greatest=obj;
    greatest_list=[greatest.name]
    io.emit("gc change top",{"name":greatest_list});
}

function compare(obj1,obj2,callback){
    obj1.incmp=obj2;
    obj2.incmp=obj1;
    obj1.cmpcb=callback;
    obj2.cmpcb=callback;
    obj1.emit("compare requestpubkey");
}

function onConnect(socket){
    console.log("Hi!");
    socket.emit("gc change top",{"name":greatest_list});
    socket.on("gc login",function(data){
        console.log(data.name+" login")
        socket.name=data.name;
        if(greatest==null){
            console.log("First!")
            setResult(socket);
            //greatest=socket;
            //io.emit("gc change top",{"name":data.name});
        }else{
            startCompare(socket);
        }
    });
    socket.on("compare sendpubkey",function(data){
        socket.incmp.emit("compare requestc",data);
    });
    socket.on("compare sendc",function(data){
        socket.incmp.emit("compare requestarr",data)
    });
    socket.on("compare sendarr",function(data){
        socket.incmp.emit("compare requestresult",data)
    });
    socket.on("compare sendresult",function(data){
        callback=socket.cmpcb;
        socket.cmpcb=undefined;
        socket.incmp.cmpcb=undefined;
        socket.incmp.incmp=undefined;
        socket.incmp=undefined;
        callback(null,data);
    });

}




io.on('connection',onConnect);

app.get('/',function(req,res){
    res.sendfile("index.html");
});
app.use("/static",express.static("public"));

server.listen(config,function(){
    console.log("Server listening at "+config.host+":"+config.port);

})
