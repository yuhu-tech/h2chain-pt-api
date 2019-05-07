const { getUserId, getSessionKey, getOpenId } = require('../../utils/utils')
const handles = require('../handle/pt')
const WXBizDataCrypt = require('../../utils/WXBizDataCrypt')
const config = require('../../conf/config')

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

  async search(parent, args, ctx, info) {
    var initialid = getUserId(ctx)
    // 已报名详情
    if (args.orderid != null && args.orderid != undefined && args.state != 2 && args.isregistered == 1 ) {
      id = "some," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 未报名详情
    if (args.orderid != null && args.orderid != undefined && args.state != 2 && args.isregistered == 0 ) {
      id = "none," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
    }
    // 历史订单详情
    if (args.orderid != null && args.orderid != undefined && args.state == 2 ) {
      id = "some," + initialid
      return handles.PTGetOrderList(ctx, initialid, id, args.orderid, args.datetime)
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
    // 为报名列表
    if (args.isregistered == 0) {
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
  }
}

module.exports = { query }
