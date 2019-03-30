const { getUserId } = require('../utils')
const {need, orderbyorderid, orderbydate,order2,order3}= require('./mock')

console.log(need)
console.log(orderbyorderid)
console.log[order2,order3]


const query = {
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    console.log(id)
    const users = await ctx.prisma.users({where:{ id }})
    console.log(users[0])
    return users[0]
  },

  async need (parent,args,ctx,info) {
    const id = getUserId(ctx)
    const mneed = need
    console.log(mneed)
    return mneed
  },

  async search (parent, args, ctx, info){
    const id = getUserId(ctx)
    console.log(id)
    if (args.orderid != "" && args.orderid != undefined ){
     const morder = [orderbyorderid]
     console.log(morder)
     console.log(args.orderid)
      return morder
    }
        else {
        const order = [order2,order3]
          console.log(order)
          return order
        }
  }

}

module.exports = { query }
