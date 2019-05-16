const { getUserId } = require('../../utils/utils')
const messages = require('../../grpc/mutation/mutation_pb');
const services = require('../../grpc/mutation/mutation_grpc_pb');
const grpc = require('grpc');
const math = require('math');
const config = require('../../conf/config');
const formid = require('../../msg/msghandle/formid/redis')
const client = new services.MutationClient(config.localip, grpc.credentials.createInsecure());
const order = {
    async registerorder(parent, args, ctx, info) {
        var request = new messages.RegistryRequest();
        request.setOrderid(args.registerorder.orderid);        //报名订单的id
        const id = getUserId(ctx)
        var personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: id } } })
        if (personalmsgs[0].name == null || personalmsgs[0].name == undefined || personalmsgs[0].name == '') {
            throw new Error('cannot register order without making personalmessages')
        }
        request.setPtid(id);
        request.setAdviserid('001');
        var myDate = new Date();
        var now = myDate.getTime() / 1000
        request.setApplytime(math.round(now));                       //报名时间，精确到秒
        request.setSignintime(-1);                          //签到时间
        request.setPtstatus(args.registerorder.register);                       //PT状态，后端已经写好了第一次报名确认后，状态：1    
        request.setRegistrationchannel('Wechat');  //报名渠道,目前定义的通过字符串表示，后面可以用数字嘠射
        client.registryOrder(request, function (err, response) { console.log("报名成功")});
        // set formid which is created when pt registry order
        var userId = id
        var orderId = args.registerorder.orderid
        var formId = args.formid
        var setRes = await formid.setFormId(userId, orderId, formId)
        console.log('set formid after registrying :', setRes)
        return true
    },

    async modifyptoforder(parent, args, ctx, info) {
        try {
            const id = getUserId(ctx)
            var request = new messages.ModifyPtRequest();
            request.setOrderid(args.orderid);       // OrderID 必传
            request.setPtid(id);                                   // 筛选条件，不用时传空
            //we can only change the status of 4 to 3 in pt
            request.setTargetstatus(args.ptstatus);               // PT 目标状态 筛选条件，不同传 -1  
            request.setSourcestatus(4);                           // PT 原始状态  
            client.modifyPTOfOrder(request, function (err, response) {
            })

            // set formid which is created when pt registry order
            var userId = id
            var orderId = args.orderid
            var formId = args.formid
            var setRes = await formid.setFormId(userId, orderId, formId)
            console.log('set formid after re-registrying :', setRes)
            return true
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = { order }
