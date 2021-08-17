var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ws=require("nodejs-websocket")
var model = require("./model/model")

var server=ws.createServer(function (conn) {
  conn.on("text",function (str) {
    var data = JSON.parse(str);
    if(data.type==="orignal"){
    var textno = data.textno;     //记录文章号
    var studentno = data.studentno;     //记录学生账号
    var name=[];            //记录学生的名字
    var thedescription;        //记录文章描述
    var groupno=null;            //记录文章的组别号
    var id=[];              //记录学生的id号
    var answerdata=[];
    model.connect(function (db,client) {
      db.collection("mapping").find({textno:textno}).toArray(function (err,ret) {   //找到指定的组号
        if(err){
                  console.log("从mapping中读取指定文章的作者信息出现了错误!")
                  conn.sendText(JSON.stringify({error:"error"}))
        }else{
                groupno=ret[0].groupno
                db.collection('dataarrays').find({textno:textno}).toArray(function (err,ret) {      //根据文章号把文章加载出来
                    if(err){
                        console.log("dataarrays查询组成echarts失败!")
                    }else{
                        console.log(ret)
                        if(ret!==null){
                            for(var i=0;i<ret[0].authors.length;i++){
                                answerdata.push({value:ret[0].contributions[i],name:ret[0].authors[i]})
                            }
                        }


                        db.collection("buptgroup").find({groupid: parseInt(groupno)}).toArray(function (err,ret) {    //根据组名把组员加载进来
                            if(err){
                                console.log("读取小组信息出现了错误！")
                            }else{
                                console.log(groupno)
                                console.log(ret)
                                for(var i=0;i<ret.length;i++){
                                    console.log(ret[i])
                                    name.push(ret[i].studentname)
                                    console.log(name)
                                    id.push(ret[i].studentno)
                                    console.log(id)
                                }

                                db.collection("article").find({textno:textno}).toArray(function (err,ret) { //找到文章的描述信息
                                    if(err){
                                        console.log("读取文章信息出现了错误!")
                                    }else{
                                        thedescription=ret[0].description;
                                        console.log(answerdata)
                                        // while(thedescription==null||groupno==null||name===[]||id===[]||answerdata===[]) {
                                        var thestring = JSON.stringify({
                                            error: "none",
                                            articledescription: thedescription,
                                            groupno: groupno,
                                            name: name,
                                            id: id,
                                            datas: answerdata
                                        });
                                        console.log(thestring)

                                        conn.sendText(thestring);
                                    }
                                })



                            }
                        })

                    }
                })

        }
      })

    })
    }else if(data.type==="fetchdata"){
        model.connect(function (db) {
            db.collection("dataarrays").find({textno:data.textno}).toArray(function (err,ret) {
                if(err){
                    console.log("获取dataarrays数据出现了问题!",err)
                }else{
                    var authors=[]
                    var contributions=[]
                    authors=ret[0].authors
                    contributions=ret[0].contributions
                    conn.sendText(JSON.stringify({authors:authors,contributions:contributions}))
                }
            })
        })
    }
  })              //对接收到的字符串进行相应的处理

  conn.on("close",function () {
    console.log("链接已经断开了")
  })

  conn.on("error",function (err) {
    console.log("websocket连接出错了!",err);
  })

}).listen(3335)

console.log("listening at port 3335")
