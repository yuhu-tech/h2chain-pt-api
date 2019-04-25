const { getUserId,getSessionKey } = require('../utils')
const handles = require('../resolvers/handle/pt')
const WXBizDataCrypt = require('../WXBizDataCrypt')
const config = require('../../conf/config')

const query = {
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    const users = await ctx.prismaClient.users({where:{id}})
    const personalmsgs = await ctx.prismaClient.personalmsgs({where:{user:{id:id}}})
    const result = {
      wechat: users[0].wechat,
      personalmsg: personalmsgs[0]
    }
    return(result)
   },

  async search (parent, args, ctx, info){
    var initialid = getUserId(ctx)
    if (args.state == 2){
       id = "some," + initialid 
      return handles.GetHistoryOrders(ctx,initialid,id)
    }
        else if (args.isregistered == 1) {
          id = "some,"+ initialid
          return handles.PTGetOrderList(ctx,initialid,id)
        }
          else if (args.isregistered == 0) {
            id = "none," + initialid
            return handles.PTGetOrderList(ctx,initialid,id)
          }
  },

  async getPhoneNumber(parent,args,ctx,info) {
    var sessionKey = await getSessionKey(args.jscode,3)
    var encryptedData = args.encryptedData
    var iv = args.iv
    var pc = new WXBizDataCrypt(appId,sessionKey)
    var data = pc.decryptData(encryptedData,iv)
    return data.phoneNumber
  }
}

module.exports = { query }
