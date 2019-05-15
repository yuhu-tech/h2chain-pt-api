const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('../resolvers')
const { prismaHotel } = require('../../h2chain-datamodel/hotel/src/generated/prisma-client')
const { prismaHr } = require('../../h2chain-datamodel/hr/src/generated/prisma-client')
const { prismaClient } = require('../../h2chain-datamodel/client/src/generated/prisma-client')
const { timer } = require('../../h2chain-pt-api/msg/access_token/schedule/timer')
const server = new GraphQLServer({
  typeDefs: './server/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prismaHotel,
    prismaHr,
    prismaClient
  })
})
//we add all prismas into ctx

timer()
setInterval(timer,3600*1000)
console.log("the timer has been set up")

const options = { port: 4002 }
server.start(options, ({ port }) => console.log('Server is running on http://localhost:4002'))
