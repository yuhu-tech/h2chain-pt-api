const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('./resolvers')
const { prismaClient } = require('../../../h2chain-datamodel/server/client/src/generated/prisma-client')


const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prismaClient
  })
})

const options = {port:4002}
server.start(options,({port}) => console.log('Server is running on http://localhost:4002'))
