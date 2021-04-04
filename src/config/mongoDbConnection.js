const MongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017";

const dbName = "taoli";

let _db = null;//连接到mongo后返回的数据库实例

async function connectBd() {
    try{
        if(!_db) {
            const client = new MongoClient(url, {useUnifiedTopology: true});//避免警告服务发现和监控引擎报错”过时“
            await client.connect();
            _db = await client.db(dbName);
        }
    } catch (err) {
        console.log("数据库连接出错");
        throw "数据库连接出错";
    }
    return _db;
}

exports.getCollection = collection => {
    let _col = null;
    return async () => {
        try{
            if(!_col) {
                const db = await connectBd();
                _col = await db.collection(collection);
            }
        } catch (err) {
            throw "选择 collection 出错";
        }
        return _col;
    }
};
