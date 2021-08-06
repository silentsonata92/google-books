const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models')
const { signToken } = require('../utils/auth.js')

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')

        return userData
      }

      throw new AuthenticationError('Not logged in')
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      console.log(args)
      const user = await User.create(args)
      const token = signToken(user)

      return { token, user }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email })

      if (!user) {
        throw new AuthenticationError('Incorrect credentials')
      }

      const correct = await user.isCorrectPassword(password)

      if (!correct) {
        throw new AuthenticationError('Incorrect credentials')
      }

      const token = signToken(user)
      return { token, user }
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const uUser = await User.findOneAndUpdate({ _id: context.user._id }, { $push: { savedBooks: bookData } }, { new: true })
        return uUser
      }
      throw new AuthenticationError('Not logged in!')
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const uUser = await User.findOneAndUpdate({ _id: context.user._id }, { $pull: { savedBooks: { bookId } } }, { new: true })
        return uUser
      }
      throw new AuthenticationError('Not logged in!')
    }
  }
}

module.exports = resolvers
