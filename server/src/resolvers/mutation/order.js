const {getUserId} = require('../../utils')
const messages = require('../../../../grpc/examples/node/static_codegen/hotelgrpc/mutation_pb');
const services = require('../../../../grpc/examples/node/static_codegen/hotelgrpc/mutation_grpc_pb');
const grpc = require('../../../../grpc/examples/node/node_modules/grpc')
const math  =  require('math')
const client  = new services.MutationClient('127.0.0.1:50051',grpc.credentials.createInsecure());
const order = {
    async registerorder(parent,args,ctx,info){
    var request = new messages.RegistryRequest();
        request.setOrderid(args.registerorder.orderid);        //报名订单的id
    const id =  getUserId(ctx)
        request.setPtid(id);
        request.setAdviserid('001');                            
    var myDate = new Date();
    var now = myDate.getTime()/1000
        request.setApplytime(math.round(now));                       //报名时间，精确到秒
        request.setSignintime(-1);                          //签到时间
        request.setPtstatus(args.registerorder.register);                       //PT状态，后端已经写好了第一次报名确认后，状态：1    
        request.setRegistrationchannel('Wechat');  //报名渠道,目前定义的通过字符串表示，后面可以用数字嘠射
    client.registryOrder(request,function(err,response){
        console.log(response.array)
    });
    var error = true
    return error
  },

  async modifyptoforder(parent,args,ctx,info){
    try {
    const id = getUserId(ctx)
    var request = new messages.ModifyPtRequest();
        request.setOrderid(args.orderid);       // OrderID 必传
        request.setPtid(id);                                   // 筛选条件，不用时传空
        console.log(args.ptstatus)
        //we can only change the status of 4 to 3 in pt 
        request.setTargetstatus(args.ptstatus);                           // PT 目标状态 筛选条件，不同传 -1  
        request.setSourcestatus(4);                           // PT 原始状态  
    client.modifyPTOfOrder(request,function(err,response){
    })
        return true
       } catch (error) {
         throw (error)
      }
  }
}

module.exports = { order }
