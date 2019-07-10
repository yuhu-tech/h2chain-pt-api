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
        try {
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
            request.setInviterid(args.registerorder.inviterid); //设置推荐人渠道
            request.setType(args.registerorder.type); //设置报名类型 1:自有报名 2:顾问分享报名 3:代理分享报名
            await client.registryOrder(request, function (err, response) { if (response.array[0] == 2) { throw new Error("deplucated time") }});
            // set formid which is created when pt registry order
            var userId = id
            var orderId = args.registerorder.orderid
            var formId = args.formid
            var setRes = await formid.setFormId(userId, orderId, formId)
            console.log('set formid after registrying :', setRes)
            return true
        } catch (error) {
            throw (error)
        }
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
