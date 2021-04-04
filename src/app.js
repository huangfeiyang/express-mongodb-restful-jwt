const express = require('express');
const app = express();
const routes = require('./routes');
const port = 8888;
const verToken = require('./util/ver');
const expressJwt = require('express-jwt');

app.use(express.json());//中间件 请求前响应后做特定操作
app.all('*', (req, res, next) => {
    console.log(req.get('Authorization'));
    let token = req.headers['authorization'];
    if(token == undefined){
        return next();
    } else {
        verToken.verToken(token).then((data)=> {
            req.data = data;
            return next();
        }).catch((error)=>{
            console.log(error);
            return next();
        })
    }
})


app.use(expressJwt({
    secret: 'hello',
    algorithms:['HS256']
  }).unless({
    path: ['/user/login']//除了这个地址，其他的URL都需要验证
  }));

app.use((err, req, res, next) => {
    if(err.name == 'UnauthorizedError'){
        console.log(err);
        res.status(401).send(err.inner.message);
    }
})
routes(app);

// app.get('/', (req, res) =>{
//     res.send('Hello world!');
// });


// app.post('/', (req, res) => {
//     console.log("收到请求体", req.body);
//     res.status(201).send();
// });

// app.put('/:id', (req, res) => {
//     console.log("收到请求参数id为:", req.params.id);
//     console.log("收到请求体", req.body);
//     res.status(200).send();
// })

// app.delete('/:id', (req, res) => {
//     console.log("收到请求参数id为:", req.params.id);
//     res.status(204).send();
// });

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});