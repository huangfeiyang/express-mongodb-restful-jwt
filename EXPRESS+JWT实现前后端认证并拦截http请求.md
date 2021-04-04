# EXPRESS+JWT实现前后端认证并拦截http请求

> 目录结构 
>
> > 1. jwt基础知识
> >
> > 2. jwt应用场景
> >
> > 3. express实现jwt
> >
> >    > 1. 后端拦截器
> >    > 2. 前端拦截器
> >
> > 4. 总结+面试

## 一、 jwt优缺点

#### 	针对前后端身份认证有几种手段：session、cookies。其中session就是服务端在客户端cookies种下的session_id,服务端保存session_id所对应的当前用户的所有状态信息。每次客户端请求服务端都要带上cookies中的session_id，服务端判断是否有具体的用户信息。

+ cookies安全性不好，攻击者可以通过获取本地cookies进行欺骗或者利用cookies进行CSRF攻击
+ cookies在多个域名下，会存在跨域问题
+ session的信息是保存在服务端上面的，当我们node.js在stke部署多台机器的时候，需要解决共享session，所以引出来session持久化问题，所以session不支持分布式架构，无法支持横向扩展，只能通过数据库来保存会话数据实现共享。如果持久层失败会出现认证失败

#### jwt前置知识补充：

#### 1. jwt是什么

##### 	jwt是json web token的简称，服务器不会保存会话数据，即为服务器无状态，更容易扩展。基本原理是服务器认证身份后，生成一个JSON对象，经过编码后返回给用户。

##### 																										jwt认证流程

![ä¸æè®²è§£JWTç¨æ·è®¤è¯å¨æµç¨](https://pic4.zhimg.com/v2-6aa301bacd5033409c9531a5c25e62da_1440w.jpg?source=172ae18b)

#### 2. jwt数据结构

##### 	jwt包含了使用`.`风格的三个部分

##### 	Header头部

​	`{"alg":"HS256", "type":"JWT"}`

​	*//algorithm => HMAC SHA256*

​	*//type => JWT*

##### 	Payload 负载、载荷，JWT规定了7个官方字段

+ 1. iss （issuer）：                  签发人
  2. exp（expiration time）：过期时间
  3. sub（subje）：                 主题
  4. aud（audience）：          受众
  5. nbf（Not Before）：       生效时间
  6. iat（Issued At）：            签发时间
  7. jti（JWT ID）：                  编号

#### Signature 签名

##### 	对前两部分header和payload进行签名，防止数据篡改

#### 3. 编码(encode)和解码(decode)

##### 		一般编解码是为了方便以字节的方式表示数据，便于存储和网络传输。整个jwt串会被置于http的header或者url中，为了不出现乱码解析错误等意外，编码是有必要的。在jwt中以.分割的三个部分都经过base64编码，在得知编码方式后，整个jwt就是明文了，所以不能把敏感信息放在payload中。

#### 4. jwt token泄露

##### 	使用https加密应用，或者记录访问者的ip，这些于jwt都无关，属于其他的安全问题。

#### 5. secret如何设计

##### 	每隔三天手动更换secret或者设置与用户相关的信息作为secret（暂时还没想到好的办法）。

#### 6. 注销和修改密码

##### 	传统的 session+cookie 方案用户点击注销，服务端清空 session 即可，因为状态保存在服务端。但 jwt 的方案就比较难办了，因为 jwt 是无状态的，服务端通过计算来校验有效性。没有存储起来，所以即使客户端删除了 jwt，但是该 jwt 还是在有效期内，只不过处于一个游离状态。分析下痛点：注销变得复杂的原因在于 jwt 的无状态。以下几个方案，视具体的业务来决定能不能接受。

+ 仅仅清空客户端的 cookie，这样用户访问时就不会携带 jwt，服务端就认为用户需要重新登录。这是一个典型的假注销，对于用户表现出退出的行为，实际上这个时候携带对应的 jwt 依旧可以访问系统。单可以根据设置短暂的消亡时间来避免这个问题。
+ 清空或修改服务端的用户对应的 secret，这样在用户注销后，jwt 本身不变，但是由于 secret 不存在或改变，则无法完成校验。这也是为什么将 secret 设计成和用户相关的原因。
+ 借助第三方存储自己管理 jwt 的状态，可以以 jwt 为 key，实现去 redis 一类的缓存中间件中去校验存在性。方案设计并不难，但是引入 redis 之后，就把无状态的 jwt 硬生生变成了有状态了，违背了 jwt 的初衷。实际上这个方案和 session 都差不多了。
  修改密码则略微有些不同，假设号被到了，修改密码（是用户密码，不是 jwt 的 secret）之后，盗号者在原 jwt 有效期之内依旧可以继续访问系统，所以仅仅清空 cookie 自然是不够的，这时，需要强制性的修改 secret。

#### 7. 续签问题

##### 每次请求刷新jwt（此问题暂时没有解决），可以参考https://blog.csdn.net/mrlin6688/article/details/107566084



## 二、 jwt应用场景

### 1. 一次性验证

#### 	比如用户注册后需要发一封邮件让其激活账户，通常邮件中需要有一个链接，这个链接需要具备以下的特性：能够标识用户，该链接具有时效性（通常只允许几小时之内激活），不能被篡改以激活其他可能的账户…这种场景就和 jwt 的特性非常贴近，jwt 的 payload 中固定的参数：iss 签发者和 exp 过期时间正是为其做准备的。

### 2. restful api的无状态认证

#### 	使用 jwt 来做 restful api 的身份认证也是值得推崇的一种使用方案。客户端和服务端共享 secret；过期时间由服务端校验，客户端定时刷新；签名信息不可被修改…spring security oauth jwt 提供了一套完整的 jwt 认证体系，以经验来看：使用 oauth2 或 jwt 来做 restful api 的认证都没有大问题，oauth2 功能更多，支持的场景更丰富，后者实现简单。



## 三、 express实现jwt

### 1、 后端设置

### 安装所有依赖并保存在package.josn文件中

`npm i jsonwebtoken --save` //用于生成jwt发送给客户端

`npm i express-jwt --save` //用于校验jwt

### 在util文件夹下建立common.js，添加生成jwt和校验的方法

 ```javascript
const jwt = require('jsonwebtoken');
var signKey = 'hello';//自己设定的
//设置token
exports.setToken = async (username) => {
    return new Promise((resolve, reject) => {
        let token = jwt.sign({
            name:username,
        }, signKey, { expiresIn:'1h' });//设置token失效时间为一小时
        resolve(token);
    })
};
//验证token
exports.verToken = async (token) => {
    return new Promise((resolve, reject) => {
        let info = jwt.verify(token.split(' ')[1], signKey);
        resolve(info);
    })
};
 ```

### 在router下添加登陆验证成功返回token的代码

```javascript
const express = require('express');
var route = express.Router();
const userModel = require('../models/user');
const setToken = require('../util/common');

route.post('/login', async (req, res) => {
    try{
        let Info = await userModel.findOne(req.body.name);//这边是去mongo数据库判断用户信息
        console.log(Info);
        let newUserInfo = Info[0];
        console.log(newUserInfo.name);
        console.log('req:', req.body.name);
        if(newUserInfo.name == req.body.name) {
            console.log("登陆信息", req.body);
            let token = await setToken.setToken(req.body.name);//设置需要返回的token
            res.status(201).json({
                token:token
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});
```



### 在app.js里引入express-jwt

```javascript
const express = require('express');
const app = express();
const routes = require('./routes');//你自己的路由
const port = 8888;
const verToken = require('./util/common');
const expressJwt = require('express-jwt');

app.use(express.json());//中间件 请求前响应后做特定操作

app.all('*', (req, res, next) => {
    console.log(req.get('Authorization'));
    let token = req.headers['authorization'];
    if(token == undefined){
        return next();//切记next只能有一次返回，否则会报错'不可在发送给客户端数据后再设置响应头'。next作用是传递给下一个中间件
    } else {
        //解码返回payload
        verToken.verToken(token).then((data)=> {
            req.data = data;
            return next();
        }).catch((error)=>{
            console.log(error);
            return next();
        })
    }
})
//校验jwt
app.use(expressJwt({
    secret: 'hello',
    algorithms:['HS256']//必须选择某个算法，默认HS256
  }).unless({
    path: ['/user/login']//除了这个地址，其他的URL都需要验证
  }));
//判断校验失败类型，并返回信息
app.use((err, req, res, next) => {
    if(err.name == 'UnauthorizedError'){
        console.log(err);
        res.status(401).send(err.inner.message);
    }
})

routes(app);

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
```

### 2、 前端VUE设置拦截器，添加响应头Authorization

### 笔者是用axios做的拦截器

```javascript
import Vue from 'vue'
import axios from 'axios'
import store from '../store'

axios.interceptors.request.use(
    config => {
        // store.state.token
        if (store.getters.token) {
            console.log(store.getters[0]);//后端返回的token我这边存储在自定义的getters里了
            config.headers.Authorization = "Bearer " + store.getters.token;//注意请求头中的格式，要有空格
        }
        return config
    },
    err => {
        return Promise.reject(err)
    },
)
```

## 四、 JWT常见面试题

#### 参考来源https://blog.csdn.net/MINGJU2020/article/details/103039418?utm_medium=distribute.pc_relevant_t0.none-task-blog-2~default~BlogCommendFromMachineLearnPai2~default-1.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2~default~BlogCommendFromMachineLearnPai2~default-1.control



 



