// 使用 Mock
var Mock = require('mockjs')
var Random = Mock.Random
var json_merger = require('json_merger');

_occupations = Mock.mock({"occupations|5-10": ['@cword(2)']})
//console.log(_occupations)
_advisers  =  Mock.mock({"advisers|3-5":[{"companyname|5-5":'@cword(3)',"phone|18015565550-18015565999":0,"name":'@cname'}]})
//console.log(_advisers)
_needs =  {_occupations,_advisers}
//console.log(_needs)
//
//



const advisers = {"advisers": [{"companyname":"峨眉派","phone":"16621381222","name":"灭绝师太"},
                    {"companyname":"华山派","phone":"18915586833","name":"郝大通"},
                    {"companyname":"逍遥派","phone":"13337100991","name":"无崖子"},
                    {"companyname":"少林派","phone":"18015565633","name":"玄慈法师"},
                    {"companyname":"武当派","phone":"13961283422","name":"张三丰"}]}


const occupations ={"occupations":["打坐","运气","学习","服务","内功","施法"]}

const need = json_merger.merge(advisers,occupations)


const originorder1 = {"originorder":{
                    "orderid" : "orderid123",
                    "occupation" : "遛狗",
                    "datetime" : 100000,
                    "duration" : 2,
                    "mode" : 1,
                    "count" : 10,
                    "male":6,
                    "female" : 4,
                    "orderstate":1
}}

const adviser1 = {"adviser":{
  "name":"Jack",
  "phone":"16621381456",
  "companyname":"ABC HR Co"
}}

const adviser2 = {"adviser":{
  "name":"Tom",
  "phone":"162621381456",
  "companyname":"ABC HR Co"
}}

const adviser3 = {"adviser":{
  "name":"Brown",
  "phone":"16621381456",
  "companyname":"ABC HR Co"
}}
const modifiedorder1 = {"modifiedorder":[{
                    "changeddatetime" : "110000",
                    "changedduration" : "3",
                    "changedmode" : "1",
                    "changedcount" : "12",
                    "changedmale" : "5",
                    "changedfemale" : "7"
}]}

const maleyet1 = {"maleyet":3}
const femaleyet1 = {"femaleyet":2}
const countyet1 = {"countyet":5}

const originorder2 = {"originorder": {
                    "orderid":"order234",
                    "occupation" : "做饭",
                    "datetime" : 200000,
                    "duration" : 3,
                    "mode" : 1,
                    "count" : 10,
                    "male":6,
                    "female" : 4,
                    "orderstate": 1

}}

const modifiedorder2 ={"modifiedorder": [
  {
                    "orderid":"order234",
                    "changeddatetime" : "210000",
                    "changedduration" : "4",
                    "changedmode" : "1",
                    "changedcount" : "12",
                    "changedmale" : "5",
                    "changedfemale" : "7"
},
  {
                    "orderid": "order234",
                    "changeddatetime" : "210001",
                    "changedduration" : "5",
                    "changedmode" : "1",
                    "changedcount" : "12",
                    "changedmale" : "5",
                    "changedfemale" : "7"
}
]}
const maleyet2 = {"maleyet":2}
const femaleyet2 = {"femaleyet":1}
const countyet2= {"countyet":3}

const originorder3 = {"originorder": {
                    "orderid":"order345",
                    "occupation" : "买菜",
                    "datetime" : 100000,
                    "duration" : 4,
                    "mode" : 1,
                    "count" : 10,
                    "male":6,
                    "female" : 4,
                    "orderstate": 0
}}

const modifiedorder3 = {"modifiedorder":[{
                    "changeddatetime" : "210005",
                    "changedduration" : "4",
                    "changedmode" : "1",
                    "changedcount" : "12",
                    "changedmale" : "5",
                    "changedfemale" : "7"
}]}
const maleyet3 = {"maleyet":0}
const femaleyet3 ={"femaleyet":0}
const countyet3 = {"countyet":"0"}



var tmp = json_merger.merge(modifiedorder1,originorder1)
var tmp = json_merger.merge(tmp,maleyet1)
var tmp = json_merger.merge(tmp,femaleyet1)
var tmp = json_merger.merge(tmp,countyet1)
var tmp = json_merger.merge(tmp,adviser1)
var orderbyorderid  = tmp
//var orderbyorderid = {originorder1,modifiedorder1,femaleyet1,maleyet1,countyet1,adviser1}
console.log(orderbyorderid)

var tmp = json_merger.merge(modifiedorder2,originorder2)
var tmp = json_merger.merge(tmp,maleyet2)
var tmp = json_merger.merge(tmp,femaleyet2)
var tmp = json_merger.merge(tmp,countyet2)
var tmp = json_merger.merge(tmp,adviser2)
var order2  = tmp

var tmp = json_merger.merge(modifiedorder3,originorder3)
var tmp = json_merger.merge(tmp,maleyet3)
var tmp = json_merger.merge(tmp,femaleyet3)
var tmp = json_merger.merge(tmp,countyet3)
var tmp = json_merger.merge(tmp,adviser3)
var order3  = tmp


var orderbydate = JSON.stringify([order2,order3])
var orderbyid   = JSON.stringify([orderbyorderid])






module.exports = { need, orderbyorderid, orderbydate,order2,order3 }






