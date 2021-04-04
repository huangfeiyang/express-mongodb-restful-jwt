const { ObjectId } = require('mongodb');

const userCollection = require('../config/mongoDbConnection').getCollection("userCollection");

exports.save = async (userInfo) => {
    try{
        let col = await userCollection();
        let result = await col.insertOne(userInfo);
        return result.ops && result.ops[0];//返回添加成功的所有文档和第一个文档
    } catch (err) {
        console.log(err);
        throw "添加信息出错";
    }
}

exports.findAll = async () => {
    try{
        let col = await userCollection();
         return col.find({}).toArray();
    } catch (err) {
        console.log(err);
        throw "查找失败";
    }
}
exports.findOne = async (username) => {
    try{
        let col = await userCollection();
         return col.find({name:username}).toArray();
    } catch (err) {
        console.log(err);
        throw "查找失败";
    }
}


exports.upDate = async (id, userInfo) => {
    try{
        let col = await userCollection();
        let result = await col.findOneAndUpdate(
                { _id: ObjectId(id) },
                { $set: userInfo },
                { returnOriginal: false }//返回更新后的数据
            );
        return result.value;
    } catch (err) {
        console.log(err);
        throw "更新失败";
    }
};

exports.delete = async (id) => {
    try{
        let col = await userCollection();
        let delResult = await col.deleteOne({ _id: ObjectId(id) });
        return delResult.value;
    } catch (err) {
        console.log(err);
        throw "删除失败";
    }
};