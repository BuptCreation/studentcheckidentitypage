var mongodbclient = require("mongodb").MongoClient
var url= "mongodb://localhost:27017"
var dbname="finally"

function connect(callback) {
    mongodbclient.connect(url,function (err,client) {
        if(err){
            console.log("数据库连接失败!")
        }else{
            console.log("数据库连接成功!")
            var db=client.db(dbname)
            callback&callback(db,client)
        }
    })
}

module.exports = {
    connect
}