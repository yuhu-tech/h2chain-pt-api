var messages = require('../../grpc/query/query_pb');
var services = require('../../grpc/query/query_grpc_pb');
var grpc = require('grpc');
const config = require('../../conf/config')
var client = new services.QueryOrderClient(config.localip, grpc.credentials.createInsecure())


// PT端订单页面

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

async function GetHistoryOrders(ctx, initialid, id, orderid, datetime) {
    try {
        var request = new messages.QueryRequest();
        if (orderid != null && orderid != undefined) { request.setOrderid(orderid) }
        request.setPtid(id);
        request.setStatus(3)
        var response = await queryOrder(request);
        var res = JSON.parse(response.array[0])
        var historyorders = []
        for (var i = 0; i < res.orderOrigins.length; i++) {
            var obj = {}
            var adviser = {}
            //finished to retrieve adviser message to show to pts
            var adviserId = res.orderOrigins[i].adviserId
            var advisers = await ctx.prismaHr.users({ where: { id: adviserId } })
            var adviserProfiles = await ctx.prismaHr.profiles({ where: { user: { id: adviserId } } })
            adviser['name'] = advisers[0].name
            adviser['phone'] = adviserProfiles[0].phone
            adviser['companyname'] = adviserProfiles[0].companyname
            adviser['introduction'] = adviserProfiles[0].introduction

            var originorder = {}
            originorder['orderid'] = res.orderOrigins[i].id
            originorder['occupation'] = res.orderOrigins[i].job
            originorder['datetime'] = res.orderOrigins[i].datetime
            originorder['duration'] = res.orderOrigins[i].duration / 3600
            originorder['mode'] = res.orderOrigins[i].mode
            originorder['orderstate'] = res.orderOrigins[i].status - 1
            if (res.orderOrigins[i].orderAdviserModifies.length != 0) {
                if (res.orderOrigins[i].orderAdviserModifies[0].isFloat) {
                    //we judge if we will tranfer male and female number by the mode
                    if (res.orderOrigins[i].mode == 0) {
                        originorder['male'] = 0
                        originorder['female'] = 0
                        originorder['count'] = Math.ceil(res.orderOrigins[i].count * 1.05)
                    } else {
                        originorder['male'] = Math.ceil(res.orderOrigins[i].countMale * 1.05)
                        originorder['female'] = Math.ceil((res.orderOrigins[i].count - res.orderOrigins[i].countMale) * 1.05)
                        originorder['count'] = originorder['male'] + originorder['female']
                    }
                } else {
                    if (res.orderOrigins[i].mode == 0) {
                        originorder['male'] = 0
                        originorder['female'] = 0
                        originorder['count'] = res.orderOrigins[i].count
                    } else {
                        originorder['male'] = res.orderOrigins[i].countMale
                        originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
                        originorder['count'] = originorder['male'] + originorder['female']
                    }
                }
            } else {
                if (res.orderOrigins[i].mode == 0) {
                    originorder['male'] = 0
                    originorder['female'] = 0
                    originorder['count'] = res.orderOrigins[i].count
                } else {
                    originorder['male'] = res.orderOrigins[i].countMale
                    originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
                    originorder['count'] = originorder['male'] + originorder['female']
                }
            }

            var postorder = {}
            if (res.orderOrigins[i].orderAdviserModifies.length != 0) {
                postorder['salary'] = res.orderOrigins[i].orderAdviserModifies[0].hourlySalary
                postorder['workcontent'] = res.orderOrigins[i].orderAdviserModifies[0].workCount // 这里有一个命名错误，是由于datamodel.graphql 里面字段错误造成的，后续会改
                postorder['attention'] = res.orderOrigins[i].orderAdviserModifies[0].attention
            }

            var hotel = {}
            //finished to retrieve adviser message to show to pts
            var hotelId = res.orderOrigins[i].hotelID
            var hotels = await ctx.prismaHotel.users({ where: { id: hotelId } })
            var hotelProfiles = await ctx.prismaHotel.profiles({ where: { user: { id: hotelId } } })
            hotel['hotelname'] = hotelProfiles[0].name
            hotel['hotelphone'] = hotelProfiles[0].phone
            hotel['hotelintroduction'] = hotelProfiles[0].introduction
            hotel['hoteladdress'] = hotelProfiles[0].address


            // 查询当前订单下该PT的状态
            try {
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtid(initialid);
                var response = await queryPt(request)
                obj['ptorderstate'] = response.array[0][0][7]

            // we will retrieve every pts who has registered
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtstatus(13);
                var response = await queryPt(request)
                obj['countyet'] = response.array[0].length
                if (obj['maleyet'] == undefined) { obj['maleyet'] = 0 }
                if (obj['femaleyet'] == undefined) { obj['femaleyet'] = 0 }
                for (var k = 0; k < obj['countyet']; k++) {
                var ptid = response.array[0][k][0]
                var personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: ptid } } })
                // to judge if there is a male or female
                if (JSON.parse(personalmsgs[0].gender) == 1) {
                 obj['maleyet'] = obj['maleyet'] + 1
                } else if (JSON.parse(personalmsgs[0].gender) == 2) {
                 obj['femaleyet'] = obj['femaleyet'] + 1
                }
              }

            } catch (error) {
                throw error
            }

            obj['adviser'] = adviser
            obj['originorder'] = originorder
            obj['postorder'] = postorder
            obj['hotel'] = hotel

            historyorders.push(obj)
        }
        return historyorders
    } catch (error) {
        throw error
    }
}


async function PTGetOrderList(ctx, initialid, id, orderid, datetime) {
    try {
        var request = new messages.QueryRequest();
        if (orderid != null && orderid != undefined) { request.setOrderid(orderid) }
        if (datetime != null && datetime != undefined) { request.setDate(datetime) }
        request.setPtid(id);//get pt id
        request.setStatus(2)
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
                    modifiedorderObj['changedduration'] = res.orderOrigins[i].orderHotelModifies[j].duration / 3600
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
            originorder['duration'] = res.orderOrigins[i].duration / 3600
            originorder['mode'] = res.orderOrigins[i].mode
            originorder['orderstate'] = res.orderOrigins[i].status - 1
            if (res.orderOrigins[i].orderAdviserModifies.length != 0) {
                if (res.orderOrigins[i].orderAdviserModifies[0].isFloat) {
                    //we judge if we will tranfer male and female number by the mode
                    if (res.orderOrigins[i].mode == 0) {
                        originorder['male'] = 0
                        originorder['female'] = 0
                        originorder['count'] = Math.ceil(res.orderOrigins[i].count * 1.05)
                    } else {
                        originorder['male'] = Math.ceil(res.orderOrigins[i].countMale * 1.05)
                        originorder['female'] = Math.ceil((res.orderOrigins[i].count - res.orderOrigins[i].countMale) * 1.05)
                        originorder['count'] = originorder['male'] + originorder['female']
                    }
                } else {
                    if (res.orderOrigins[i].mode == 0) {
                        originorder['male'] = 0
                        originorder['female'] = 0
                        originorder['count'] = res.orderOrigins[i].count
                    } else {
                        originorder['male'] = res.orderOrigins[i].countMale
                        originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
                        originorder['count'] = originorder['male'] + originorder['female']
                    }
                }
            } else {
                if (res.orderOrigins[i].mode == 0) {
                    originorder['male'] = 0
                    originorder['female'] = 0
                    originorder['count'] = res.orderOrigins[i].count
                } else {
                    originorder['male'] = res.orderOrigins[i].countMale
                    originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
                    originorder['count'] = originorder['male'] + originorder['female']
                }
            }

            var adviser = {}
            //FINISHED to retrieve adviser name,phone,companyname,and introduction
            var adviserId = res.orderOrigins[i].adviserId
            var advisers = await ctx.prismaHr.users({ where: { id: adviserId } })
            var adviserProfiles = await ctx.prismaHr.profiles({ where: { user: { id: adviserId } } })
            adviser['name'] = advisers[0].name
            adviser['phone'] = adviserProfiles[0].phone
            adviser['companyname'] = adviserProfiles[0].companyname
            adviser['introduction'] = adviserProfiles[0].introduction

            var hotel = {}
            //FINISHED to retrieve hotel messages to show to pts
            var hotelId = res.orderOrigins[i].hotelID
            var hotels = await ctx.prismaHotel.users({ where: { id: hotelId } })
            var hotelProfiles = await ctx.prismaHotel.profiles({ where: { user: { id: hotelId } } })
            hotel['hotelname'] = hotelProfiles[0].name
            hotel['hotelphone'] = hotelProfiles[0].phone
            hotel['hotelintroduction'] = hotelProfiles[0].introduction
            hotel['hoteladdress'] = hotelProfiles[0].address

            var postorder = {}
            if (res.orderOrigins[i].orderAdviserModifies.length != 0) {
                postorder['orderid'] = res.orderOrigins[i].id
                postorder['salary'] = res.orderOrigins[i].orderAdviserModifies[0].hourlySalary
                postorder['workcontent'] = res.orderOrigins[i].orderAdviserModifies[0].workCount   // 这里有一个命名错误，是由于datamodel.graphql 里面字段错误造成的，后续会改
                postorder['attention'] = res.orderOrigins[i].orderAdviserModifies[0].attention
            }

            // 查询当前订单下该PT的状态
            // if we are searching what the pt has registered we have to search ptorderstate
            if (id.indexOf("some") >= 0 && orderid == undefined) {
                try {
                    var request = new messages.QueryPTRequest();
                    request.setOrderid(res.orderOrigins[i].id);
                    request.setPtid(initialid);
                    var response = await queryPt(request)
                    obj['ptorderstate'] = response.array[0][0][7]
                } catch (error) {
                    throw error
                }
            }

            // 查询当前已报名的男女人数
            // 调用queryPTOfOrder()接口查询，某个订单下已报名PT的总人数
            try {
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtstatus(13);
                var response = await queryPt(request)
                obj['countyet'] = response.array[0].length
                //initial obj[maleyet] and obj[femaleyet]
                if (obj['maleyet'] == undefined) { obj['maleyet'] = 0 }
                if (obj['femaleyet'] == undefined) { obj['femaleyet'] = 0 }
                for (var k = 0; k < obj['countyet']; k++) {
                    var ptid = response.array[0][k][0]
                    var personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: ptid } } })
                    // to judge if there is a male or female to aviod deleting sql leading some the pts who has already registered
                    if (personalmsgs[0] != undefined){
                    if (personalmsgs[0].gender == 1) {
                        obj['maleyet'] = obj['maleyet'] + 1
                    } else {
                        obj['femaleyet'] == obj['femaleyet'] + 1
                    }
                    }
                }
                // ptid  response.array[0][0][0]
            } catch (error) {
                throw error
            }

            obj['modifiedorder'] = modifiedorder
            obj['originorder'] = originorder
            obj['adviser'] = adviser
            obj['hotel'] = hotel
            obj['postorder'] = postorder
            obj['state'] = res.orderOrigins[i].status - 1


            orderList.push(obj)
        }
        return orderList
    } catch (error) {
        throw error
    }
}


module.exports = { PTGetOrderList, queryOrder, queryPt, GetHistoryOrders }
