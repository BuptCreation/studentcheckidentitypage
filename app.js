var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ws=require("nodejs-websocket")
var model = require("./model/model")

var server=ws.createServer(function (conn) {
  conn.on("text",function (str) {
    console.log(str)
    var data = JSON.parse(str);
    console.log(data)
    var textno = data.textno;     //记录文章号
    var studentno = data.studentno;     //记录学生账号
    var name=[];            //记录学生的名字
    var thedescription;        //记录文章描述
    var groupno=null;            //记录文章的组别号
    var id=[];              //记录学生的id号
    model.connect(function (db,client) {
      db.collection("mapping").find({textno:textno}).toArray(function (err,ret) {   //找到指定的组号
        if(err){
                  console.log("从mapping中读取指定文章的作者信息出现了错误!")
                  conn.sendText(JSON.stringify({error:"error"}))
        }else{
              groupno=ret[0].groupno
              db.collection("user").find({groupno:groupno}).toArray(function (err,ret) {
                if(err){
                    console.log("读取小组信息出现了错误！")
                }else{
                    ret.map(function (item,index) {

                        name.push(item.username);
                        console.log(name)
                        id.push(item.id)
                        console.log(id)
                    })
                }
          })
            db.collection("article").find({textno:textno}).toArray(function (err,ret) { //找到文章的描述信息
                if(err){
                  console.log("读取文章信息出现了错误!")
                }else{
                  thedescription=ret[0].description;
                  var thestring=JSON.stringify({error:"none",articledescription:thedescription,groupno:groupno,name:name,id:id})
                  conn.sendText(thestring);
                }
            })
        }
      })
    })
  })              //对接收到的字符串进行相应的处理

  conn.on("close",function () {
    console.log("链接已经断开了")
  })

  conn.on("error",function (err) {
    console.log("websocket连接出错了!",err);
  })

}).listen(3335)



console.log("listening at port 3335")
