const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {returnuserpayload,orderbyorderid,orderbydate,order2,order3,user,userpayload,registerpayload}= require('../mock')
const {getUserId} = require('../../utils')
const request = require('async-request')

const auth = {
  async login(parent, args, ctx, info) {
   console.log("jscode "+args.jscode)
   const appid= "wx0f2ab26c0f65377d"
   const secret = "a5c1eff8b135ade83871f0b230b06ba9"
   var url = "https://api.weixin.qq.com/sns/jscode2session?appid="+appid+"&secret="+secret+"&js_code="+args.jscode+"&grant_type=authorization_code";
   var data = await request(url,function(error,response,data){})
   var wechat = JSON.parse(data.body).openid
   console.log(wechat)
   console.log(wechat)
   const users = await ctx.prismaClient.users({where:{wechat}})
       //在表中找openid，如果找不到，就注册绑定，如果找到了，就直接返回
   var user = users[0]
       if (user == undefined)
       {
       console.log("can't find this user, registering...")
       var user = await ctx.prismaClient.createUser({wechat:wechat})
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
        console.log(user)
        }
        console.log(user)
        return {
          token: jwt.sign({ userId: user.id }, 'jwtsecret123'),
          user
        }
      },
  
  async modifypersonalmsg(parent,args,ctx,info) {
    const id = getUserId(ctx)
    console.log(id)
    const users = await ctx.prismaClient.users({where:{id}})
    const personalmsgs = await ctx.prismaClient.personalmsgs({where:{user:{id:id}}})
    console.log(personalmsgs[0])
    if (users.length == 0)
    {
      console.log("can't find this user")
    }
    else { 
          console.log(args.personalmsg)
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
