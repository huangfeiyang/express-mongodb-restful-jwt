const express = require('express');
var route = express.Router();
const userModel = require('../models/user');
const setToken = require('../util/ver');

route.get('/', async (req, res) =>{
    try{
        const result = await userModel.findAll();
        res.json(result);
    } catch (err) {
        res.status(404).send();
    }
});

route.post('/', async (req, res) => {
    try{
        let newUserInfo = await userModel.save(req.body);
        console.log("保存信息", req.body);
        res.status(201).json(newUserInfo);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});
route.post('/login', async (req, res) => {
    try{
        let Info = await userModel.findOne(req.body.name);
        console.log(Info);
        let newUserInfo = Info[0];
        console.log(newUserInfo.name);
        console.log('req:', req.body.name);
        if(newUserInfo.name == req.body.name) {
            console.log("登陆信息", req.body);
            let token = await setToken.setToken(req.body.name);
            res.status(201).json({
                token:token
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});

route.put('/:id', async (req, res) => {
    try{
        let upDateInfo = await userModel.upDate(req.params.id, req.body);
        res.json(upDateInfo);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});

route.delete('/:id', async (req, res) => {
    try{
        let delResult = await userModel.delete(req.params.id);
        console.log(delResult);
        console.log(typeof(delResult));
        res.status(204).send("删除成功" + delResult.toString());
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});

module.exports = route;