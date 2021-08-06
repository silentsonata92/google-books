const express = require('express')
const { join } = require('path')
const db = require('./config/connection')
const { ApolloServer } = require('apollo-server-express')

const { typeDefs, resolvers } = require('./schemas')
const { authMiddleware } = require('./utils/auth.js')

const app = express()
const PORT = process.env.PORT || 3001
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

server.applyMiddleware({ app })
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'client', 'build')))
}

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'client', 'build', 'index.html'))
})

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`))
})
