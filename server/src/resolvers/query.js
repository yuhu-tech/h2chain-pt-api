const { getUserId } = require('../utils')
const {returnuserpayload,myorders,userpayload,need,orderbyorderid,orderbydate,order2,order3,user,historyorders,oningorders,refusedorders}= require('./mock')
//var  request  = require('../request')


console.log(need)
console.log(orderbyorderid)
console.log[order2,order3]

const query = {
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    console.log(id)
    const wechat = "45678900112"
    const users = await ctx.prisma.users({where:{wechat}})
    const personalmsgs = await ctx.prisma.personalmsgs({where:{user:{wechat:wechat}}})
    const result = {
      wechat: users[0].wechat,
      personalmsg: personalmsgs[0]
    }
    return(result)
   },

  async search (parent, args, ctx, info){
    const id = getUserId(ctx)
    console.log(id)
    if (args.state == 2 ){
      return historyorders
    }
        else  {
          return myorders
        }
  }
}

module.exports = { query }
