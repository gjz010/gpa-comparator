const NodeRSA=require("node-rsa");
const crypt = require('crypto');
const constants=require('constants');
function generateKeys(){
    var key=new NodeRSA({b:512},{"encryptionScheme":{scheme:"pkcs1",padding:constants.RSA_NO_PADDING}})
    return key;
}

function stageZero(key){
    return key.exportKey('pkcs1-public');
}
function subtract(x,j){
    var i=63;
    var sub=j;
    while(x[i]<sub && i>=0){
        var tmp=x[i]-sub;
        var borrow=0;
        while(tmp<0){
            tmp=tmp+256;
            borrow+=1;
        }
        x[i]=tmp;
        sub=borrow;
        i--;
    }
    if(i>=0) x[i]-=sub;
}
function inc(x){
    var i=63;
    var add=1;
    while(x[i]==255 && i>=0){
        x[i]=0;
        i--;
    }
    if(i>=0) x[i]++;
}
function modulus(x,m){
    var result=0;
    for(var i=0;i<64;i++){
        result=(result*256+x[i])%m;
    }
    return result;
}
function stageOne(pubkey,j){
    var key=new NodeRSA();
    key.setOptions({"encryptionScheme":{scheme:"pkcs1",padding:constants.RSA_NO_PADDING}});
    key.importKey(pubkey);
    var x=Buffer.concat([new Buffer(1),crypt.randomBytes(63)]);
    var K=key.decryptPublic(x);
    var c=new Buffer(K);
    subtract(c,j);
    return {"x":x.toString("base64"),"c":c.toString("base64")};
}

function stageTwo(key,c,p,i){
    var arr=[];
    arr.length=401;
    var buf=new Buffer(c,"base64");
    var ac=key.encryptPrivate(buf);
    arr[0]=modulus(ac,p);
    for(var t=1;t<=400;t++){
        inc(buf);
        ac=key.encryptPrivate(buf);
        arr[t]=modulus(ac,p);
        if(t>i) arr[t]++;
    }
    return arr;
}

//if i>=j
function stageThree(x,p,arr,j){
    x=new Buffer(x,'base64');
    return modulus(x,p)==arr[j];
}


function test(){
    console.log("Test begin.")
    var i=Math.floor(Math.random()*401);
    var j=Math.floor(Math.random()*401);
    console.log("i="+i+" j="+j)
    var key=generateKeys();
    var pubkey=stageZero(key);
    var obj=stageOne(pubkey,j)
    var x=obj.x;
    var c=obj.c;
    var arr=stageTwo(key,c,65537,i);
    var result=stageThree(x,65537,arr,j)
    console.log("i>=j: "+result)
}


module.exports={
    "generateKeys":generateKeys,
    "exportPublicKey":stageZero,
    "generateC":stageOne,
    "listAllX":stageTwo,
    "check":stageThree,
    "test":test
}


