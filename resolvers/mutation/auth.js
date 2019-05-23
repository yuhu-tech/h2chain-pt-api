const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUserId, getOpenId } = require('../../utils/utils')
const { CreateAccount }  = require('../../token/ali_token/handle/mutation/mutation')

const auth = {
  async login(parent, args, ctx, info) {
    var wechat = await getOpenId(args.jscode,3)
    console.log(wechat)
    const users = await ctx.prismaClient.users({ where: { wechat : wechat } })
    //在表中找openid，如果找不到，就注册绑定，如果找到了，就直接返回
    var user = users[0]
    if (user == undefined || user == null ) {
      console.log("can't find this user, registering...")
      var user = await ctx.prismaClient.createUser({ wechat: wechat })
      var personalmsg = await ctx.prismaClient.createPersonalmsg(
        {
          name: "",
          phonenumber: "",
          idnumber: "",
          gender: 1,
          height: 0,
          weight: 0,
          status: 2,
          ptadd:"0xsdjawrhuowajfweradnakjhfdasj22dawed",
          privatekey:"mocked privatekey",
          publickey:"mocked publickey",
          user: { connect: { wechat: wechat } }
        }
      )
      //为用户创建钱包
      keys =  await CreateAccount(personalmsg.id)
      var updatekeys = await ctx.prismaClient.updatePersonalmsg(
        {
          data: {
            privatekey:keys.privatekey,
            publickey:keys.publickey,
          },
          where: { id : personalmsg.id }
        }
      )
      console.log(keys)
    }
    return {
      token: jwt.sign({ userId: user.id }, 'jwtsecret123'),
      user
    }
  },

  async modifypersonalmsg(parent, args, ctx, info) {
    const id = getUserId(ctx)
    const users = await ctx.prismaClient.users({ where: { id } })
    const personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: id } } })
    try {
      if (users.length == 0) {
        console.log("can't find this user")
      }
      else {
        const returning = await ctx.prismaClient.updatePersonalmsg(
          {
            data: {
              name: args.personalmsg.name,
              phonenumber: args.personalmsg.phonenumber,
              idnumber: args.personalmsg.idnumber,
              gender: args.personalmsg.gender,
              height: args.personalmsg.height,
              weight: args.personalmsg.weight,
              status: args.personalmsg.status
            },
            where: { id: personalmsgs[0].id }
          }
        )
      }
      return true
    } catch (error) {
      throw (error)
    }
  },
}



module.exports = { auth }
