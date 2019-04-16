var messages = require('../../../../grpc/examples/node/static_codegen/src/query_pb');
var services = require('../../../../grpc/examples/node/static_codegen/src/query_grpc_pb');
var grpc = require('../../../../grpc/examples/node/node_modules/grpc');
var client = new services.QueryOrderClient('127.0.0.1:50051', grpc.credentials.createInsecure())


// 酒店端订单页面

function queryOrder(request) {
    return new Promise((resolve, reject) => {
        client.queryOrder(request, (err, date) => {
            if (err) reject(err);
            resolve(date);
        })
    })
}

function queryPt(request) {
    return new Promise((resolve, reject) => {
        client.queryPTOfOrder(request, (err, date) => {
            if (err) reject(err);
            resolve(date);
        })
    })
}


async function HotelGetOrderList(id) {
    try {
        var request = new messages.QueryRequest();
        request.setHotelid(id);
        request.setStatus(12)
        var response = await queryOrder(request);
        var res = JSON.parse(response.array[0])
        var orderList = []
        for (var i = 0; i < res.orderOrigins.length; i++) {
            var obj = {}

            var modifiedorder = []
            if (res.orderOrigins[i].orderHotelModifies.length != 0) {
                for (var j = 0; j < res.orderOrigins[i].orderHotelModifies.length; j++) {
                    var modifiedorderObj = {}
                    modifiedorderObj['orderid'] = res.orderOrigins[i].id
                    modifiedorderObj['changeddatetime'] = res.orderOrigins[i].orderHotelModifies[j].dateTime
                    modifiedorderObj['changedduration'] = res.orderOrigins[i].orderHotelModifies[j].duration
                    modifiedorderObj['changedmode'] = res.orderOrigins[i].orderHotelModifies[j].mode
                    modifiedorderObj['changedcount'] = res.orderOrigins[i].orderHotelModifies[j].count
                    modifiedorderObj['changedmale'] = res.orderOrigins[i].orderHotelModifies[j].countMale
                    modifiedorderObj['changedfemale'] = res.orderOrigins[i].orderHotelModifies[j].count - res.orderOrigins[i].orderHotelModifies[j].countMale
                    modifiedorder.push(modifiedorderObj)
                }

            }

            var originorder = {}
            originorder['orderid'] = res.orderOrigins[i].id
            originorder['occupation'] = res.orderOrigins[i].job
            originorder['datetime'] = res.orderOrigins[i].datetime
            originorder['duration'] = res.orderOrigins[i].duration
            originorder['mode'] = res.orderOrigins[i].mode
            originorder['count'] = res.orderOrigins[i].count
            originorder['male'] = res.orderOrigins[i].countMale
            originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
            originorder['orderstate'] = res.orderOrigins[i].status - 1

            var adviser = {}
            adviser['name'] = res.orderOrigins[i].adviserId // 这里全部留了 adviserId 通过这个获取adviser信息
            adviser['phone'] = res.orderOrigins[i].adviserId
            adviser['companyname'] = res.orderOrigins[i].adviserId

            obj['modifiedorder'] = modifiedorder
            obj['originorder'] = originorder
            obj['adviser'] = adviser
            obj['state'] = res.orderOrigins[i].status

            // 查询当前已报名的男女人数
            // 调用queryPTOfOrder()接口查询，某个订单下已报名PT的总人数
            try {
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtid('');
                request.setRegistrationchannel('');
                request.setPtstatus(1);
                var response = await queryPt(request)
                obj['countyet'] = response.array[0].length
                // ptid  response.array[0][0][0]
                obj['maleyet'] = 2
                obj['femaleyet'] = 1
            } catch (error) {
                throw error
            }

            orderList.push(obj)
        }
      console.log(orderList)
      return orderList
      //console.log(res.orderOrigins[0])
    } catch (error) {
        throw error
    }
  }


module.exports = { queryOrder,queryPt,HotelGetOrderList }


