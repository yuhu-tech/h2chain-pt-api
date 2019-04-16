const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {returnuserpayload,orderbyorderid,orderbydate,order2,order3,user,userpayload,registerpayload}= require('../mock')
const {getUserId} = require('../../utils')
const request = require('async-request')
/*
var url = 'http://192.168.0.102:3000/home?name=xmg'

// 发送Get请求
// 第一个参数:请求的完整URL,包括参数
// 第二个参数:请求结果回调函数,会传入3个参数,第一个错误,第二个响应对象,第三个请求数据
request(url,function (error, response, data) {

    console.log(data)

});
*/



const auth = {
  async login(parent, args, ctx, info) {
   console.log("jscode "+args.jscode)
   const appid= "wx0f2ab26c0f65377d"
   const secret = "53a4ab65ab0e4c40f97eb70e238bc1d4"
   var url = "https://api.weixin.qq.com/sns/jscode2session?appid="+appid+"&secret="+secret+"&js_code="+args.jscode+"&grant_type=authorization_code";
   var data = await request(url,function(error,response,data){})
   var wechat = JSON.parse(data.body).openid
   const users = await ctx.prismaClient.users({where:{wechat}})
       //在表中找openid，如果找不到，就注册绑定，如果找到了，就直接返回
       if (users.length == 0)
       {
       console.log("can't find this user, registering...")
       const user = await ctx.prismaClient.createUser({wechat:wechat})
       //另外，要注册一个personalmsg，和该id关联
       const personalmsg = await ctx.prismaClient.createPersonalmsg(
           {
             name:"",
             phonenumber:"",
             idnumber:"",
             gender:1,
             height:0,
             weight:0,
             status:2,
             user:{connect:{wechat:wechat}}
          }
       )
      console.log(personalmsg)
    }
    return {
      token: jwt.sign({ userId: user.openid }, 'jwtsecret123'),
      user
    }
  },
  
  async modifypersonalmsg(parent,args,ctx,info) {
    const wechat = getUserId(ctx)
    console.log(wechat)
    const users = await ctx.prismaClient.users({where:{wechat}})
    const personalmsgs = await ctx.prismaClient.personalmsgs({where:{user:{wechat:wechat}}})
    console.log(personalmsgs[0])
    if (users.length == 0)
    {
      console.log("can't find this user")
    }
    else {
          const returning = await ctx.prismaClient.updatePersonalmsg(
            { data: {
                  name: args.personalmsg.name,
                  phonenumber: args.personalmsg.phonenumber,
                  idnumber: args.personalmsg.idnumber,
                  gender: args.personalmsg.gender,
                  height: args.personalmsg.height,
                  weight: args.personalmsg.weight,
                  status: args.personalmsg.status
                },
            where:{id:personalmsgs[0].id}
             }
          )
    }
    console.log(registerpayload)
    return registerpayload
   },
    //如果users不为空
    //获取args内的信息并更新到Users
    //否则返回错误：未找到该用户

  async registerorder(parent,args,ctx,info){
    return registerpayload
  }
}



module.exports = { auth }
