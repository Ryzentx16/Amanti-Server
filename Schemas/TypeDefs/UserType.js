const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
} = graphql;

const User = {
  Type: new GraphQLObjectType({
    name: "User",
    fields: () => ({
      id: { type: GraphQLInt },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      password: { type: GraphQLString },
      profileImage: { type: GraphQLString },
      phoneNumber: { type: GraphQLString },
      isOtpChecked: { type: GraphQLBoolean },
    }),
  }),

  InputTypes: {
    Add: new GraphQLInputObjectType({
      name: "AddUserInput",
      fields: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
        profileImage: { type: GraphQLString },
      },
    }),
    Edit: new GraphQLInputObjectType({
      name: "EditUserInput",
      fields: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        password: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        profileImage: { type: GraphQLString },
      },
    }),
  },

  ResultType: new GraphQLObjectType({
    name: "UserResult",
    fields: {
      success: { type: GraphQLBoolean },
      message: { type: GraphQLString },
      errors: { type: new GraphQLList(GraphQLString) },
    },
  }),
};

module.exports = User;
