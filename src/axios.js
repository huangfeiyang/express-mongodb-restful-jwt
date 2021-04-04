const axios = require('axios');
const service = axios.create({
    baseURL:'http://localhost:8888',
});

service.interceptors.request.use(config => {
    // config.headers.post['Content-Type'] = 'application/x-www-fromurlencodeed'
    if (true) {
        // console.log('token存在') // 如果token存在那么每个请求头里面全部加上token
        config.headers['Authorization'] = 'bearer ';
    }
    return config
    }, error => {
    console.log(error) // for debug
    Promise.reject(error)
})

service.get('/user').then((req, res) => {
    console.log(req, res);
});