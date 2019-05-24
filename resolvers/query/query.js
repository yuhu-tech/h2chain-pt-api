const { getUserId, getSessionKey, getOpenId } = require('../../utils/utils')
const handles = require('../handle/pt')
const WXBizDataCrypt = require('../../utils/WXBizDataCrypt')
const config = require('../../conf/config')
const { QueryTransaction } = require('../../token/ali_token/handle/query/query')
const utils = require('../../token/ali_token/utils/utils')

const query = {
  async me(parent, args, ctx, info) {
    const id = getUserId(ctx)
    const users = await ctx.prismaClient.users({ where: { id } })
    const personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: id } } })
    const result = {
      wechat: users[0].wechat,
      personalmsg: personalmsgs[0]
    }
    return (result)
  },

  async mywallet(parent,args,ctx,info){
    const id = getUserId(ctx)
    const personalmsgs = await ctx.prismaClient.Personalmsgs({where:{user:{id:id}}})
    if (personalmsgs[0].phonenumber != undefined && personalmsgs[0].phonenumber != null){
      const veryid = personalmsgs[0].veryid
      var balances = await ctx.prismaClient.Balances({ where : { veryid : veryid }})
      var balance = balances[0]
      var Txs =  await ctx.prismaClient.Txs({where:{to:veryid}})
      return {
        balance:balance,
        transactions:Txses
      }
    } else {
        throw error ("cannot query your wallet until binding your phonenumber")
    }
  },

  async search(parent, args, ctx, info) {
    var initialid = getUserId(ctx)
    // 已报名详情
    if (args.orderid != null && args.orderid != undefined && args.state != 2 && args.isregistered == 1) {
      id = "some," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 未报名详情
    if (args.orderid != null && args.orderid != undefined && args.state != 2 && args.isregistered == 0) {
      id = "none," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 历史订单详情
    if (args.orderid != null && args.orderid != undefined && args.state == 2) {
      id = "some," + initialid
      return handles.GetHistoryOrders(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 历史订单列表
    if ((args.orderid == null || args.orderid == undefined) && args.state == 2) {
      id = "some," + initialid
      return handles.GetHistoryOrders(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 已报名列表
    if (args.isregistered == 1) {
      id = "some," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 未报名列表
    if (args.isregistered == 0) {
      id = "none," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 分享点击（单纯查询）
    if (args.orderid != null && args.orderid != undefined) {
      id = "none," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }

  },

  async getphonenumber(parent, args, ctx, info) {
    var sessionKey = await getSessionKey(args.jscode, 3)
    var iv = args.iv
    appid = config.Appids.testPt
    var pc = new WXBizDataCrypt(appid, sessionKey)
    var data = pc.decryptData(args.encryptedData, iv)
    return data.phoneNumber
  },

   async searchhash(parent,args,ctx,info) {
    var result  = await QueryTransaction(args.txhash)
    var res = await utils.Hex2Str(result.originData)
    var res = JSON.parse(res.str)
    res['chainname'] = '蚂蚁区块链h2chain项目'
    var contracts = await ctx.prismaHotel.contracts({where:{hash:args.txhash}})
    res['blocknumber'] = contracts[0].blocknumber
    res['contractaddress'] = '0x3a758e6e367a783c7e845a91421b6def99972445bcf127bc258c145704953dc6'
    return res
  }
}

module.exports = { query }
