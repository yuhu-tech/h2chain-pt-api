const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('./resolvers')
const { prisma } = require('../../../h2chain-datamodel/server/client/src/generated/prisma-client')


const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prisma
  })
})

server.start(() => console.log('Server is running on http://localhost:4000'))
