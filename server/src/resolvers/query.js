const { getUserId } = require('../utils')
const {returnuserpayload,myorders,userpayload,need,orderbyorderid,orderbydate,order2,order3,user,historyorders,oningorders,refusedorders}= require('./mock')
//var  request  = require('../request')
const handles = require('../resolvers/handle/pt')

console.log(need)
console.log(orderbyorderid)
console.log[order2,order3]

const query = {
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    console.log(id)
    const users = await ctx.prismaClient.users({where:{id}})
    console.log(users)
    const personalmsgs = await ctx.prismaClient.personalmsgs({where:{user:{id:id}}})
    console.log(user[0])
    const result = {
      wechat: users[0].wechat,
      personalmsg: personalmsgs[0]
    }
    return(result)
   },

  async search (parent, args, ctx, info){
    var initialid = getUserId(ctx)
    if (args.state == 2){
      return handles.GetHistoryOrders(initialid)
    }
        else if (args.isregistered == 1) {
          id = "some,"+ initialid
          return handles.PTGetOrderList(initialid,id)
          // here is to transfer pt id 
        }
          else if (args.isregistered == 0) {
            id = "none," + initialid
            return handles.PTGetOrderList(initialid,id)
        }
  }
}

module.exports = { query }
