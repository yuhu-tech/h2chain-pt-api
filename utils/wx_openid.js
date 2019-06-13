const request = require('request')
const config = require('../conf/config')

/*
    查询获取openid函数
    传入参数：int
        1 表示获取酒店端openid
        2 表示获取顾问端openid
        3 表示获取PT端openid
*/

function getOpenId(jsCode, num) {
    return new Promise((resolve, reject) => {
        var appid = ''
        var secret = ''
        if (num === 1) {
            appid = config.Appids.hotel
            secret = config.Secrets.hotel
        } else if (num === 2) {
            appid = config.Appids.adviser
            secret = config.Secrets.adviser
        } else if (num === 3) {
            appid = config.Appids.pt
            secret = config.Secrets.pt
        } else {
            resolve()
        }

        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${jsCode}&grant_type=authorization_code`

        request(url, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                //console.log(body)
                const openid = JSON.parse(body).openid;
                resolve(openid)
            } else {
                reject(error)
            }
        });
    })
}

function getSessionKey(jsCode, num) {
    return new Promise((resolve, reject) => {
        var appid = ''
        var secret = ''
        if (num === 1) {
            appid = config.Appids.hotel
            secret = config.Secrets.hotel
        } else if (num === 2) {
            appid = config.Appids.adviser
            secret = config.Secrets.adviser
        } else if (num === 3) {
            appid = config.Appids.pt
            secret = config.Secrets.pt
        } else {
            resolve()
        }

        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${jsCode}&grant_type=authorization_code`

        request(url, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                //console.log(body)
                const openid = JSON.parse(body).session_key;
                resolve(session_key)
            } else {
                reject(error)
            }
        });
    })
}


module.exports = {
    getOpenId,
    getSessionKey
}
