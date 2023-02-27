const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const User = require("./TypeDefs/UserType");
const Post = require("./TypeDefs/PostType");
const Comment = require("./TypeDefs/CommentType");
const UserLogic = require("../code/user");
const PostLogic = require("../code/post");
const CommentLogic = require("../code/comment");

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: new GraphQLList(User.Type),
      args: {
        id: { type: GraphQLInt },
        phoneNumber: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(root, args) {
        console.log("Get Users");
        const result = await UserLogic.Queries.retrieve(args);
        return result;
      },
    },
    post: {
      type: new GraphQLList(Post.Type),
      args: {
        id: { type: GraphQLInt },
        conditionUserId: { type: GraphQLInt },
        userId: { type: GraphQLInt },
        page: { type: new GraphQLNonNull(GraphQLInt) },
        perPage: { type: new GraphQLNonNull(GraphQLInt) },
        postTypes: { type: GraphQLInt },
      },
      async resolve(root, args) {
        console.log("Get Posts");
        const { page, perPage, userId, ...postFilters } = args;

        const result = await PostLogic.Queries.retrieve(
          page,
          perPage,
          userId,
          postFilters
        );

        return result;
      },
    },
    comment: {
      type: new GraphQLList(Comment.Type),
      args: {
        id: { type: GraphQLInt },
        postId: { type: GraphQLInt },
        page: { type: new GraphQLNonNull(GraphQLInt) },
        perPage: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(root, args) {
        console.log("Get Comments");
        const { page, perPage, ...postFilters } = args;

        const result = await CommentLogic.Queries.retrieve(
          page,
          perPage,
          postFilters
        );
        return result;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: User.ResultType,
      args: {
        input: { type: new GraphQLNonNull(User.InputTypes.Add) },
      },
      async resolve(root, args) {
        console.log("Add User");
        const result = await UserLogic.Queries.create(args.input);
        return result;
      },
    },
    editUser: {
      type: User.ResultType,
      args: {
        phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
        input: { type: new GraphQLNonNull(User.InputTypes.Edit) },
      },
      async resolve(root, args) {
        const req = {
          fields: args.input,
          condition: { phoneNumber: args.phoneNumber },
        };

        console.log("Update User");
        const result = await UserLogic.Queries.update(req);
        return result;
      },
    },
    deleteUser: {
      type: User.ResultType,
      args: {
        phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(root, args) {
        console.log("Delete User");
        const result = await UserLogic.Queries.delete(args);
        return result;
      },
    },

    addPost: {
      type: Post.ResultType,
      args: {
        input: { type: new GraphQLNonNull(Post.InputTypes.Add) },
      },
      async resolve(root, args) {
        console.log("Add Post");
        const result = await PostLogic.Queries.create(args.input);
        return result;
      },
    },
    editPost: {
      type: Post.ResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        input: { type: new GraphQLNonNull(Post.InputTypes.Edit) },
      },
      async resolve(root, args) {
        const req = {
          fields: args.input,
          condition: { id: args.id },
        };

        console.log("Update Post");
        const result = await PostLogic.Queries.update(req);
        return result;
      },
    },
    postLike: {
      type: Post.ResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        isLike: { type: new GraphQLNonNull(GraphQLBoolean) },
      },
      async resolve(root, args) {
        const req = {
          condition: { id: args.id },
        };

        console.log(`${args.isLike ? "Like" : "Unlike"} Post`);
        const result = await PostLogic.Queries.like(args, req);
        return result;
      },
    },
    deletePost: {
      type: Post.ResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(root, args) {
        console.log("Delete Post");
        const result = await PostLogic.Queries.delete(args);
        return result;
      },
    },

    addComment: {
      type: Comment.ResultType,
      args: {
        input: { type: new GraphQLNonNull(Comment.InputTypes.Add) },
      },
      async resolve(root, args) {
        console.log("Add Comment");
        const result = await CommentLogic.Queries.create(args.input);
        return result;
      },
    },
    editComment: {
      type: Comment.ResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        input: { type: new GraphQLNonNull(Comment.InputTypes.Edit) },
      },
      async resolve(root, args) {
        const req = {
          fields: args.input,
          condition: { id: args.id },
        };

        console.log("Update Comment");
        const result = await CommentLogic.Queries.update(req);
        return result;
      },
    },
    deleteComment: {
      type: Comment.ResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(root, args) {
        console.log("Delete Comment");
        const result = await CommentLogic.Queries.delete(args);
        return result;
      },
    },
  },
});

module.exports = new GraphQLSchema({ query: RootQuery, mutation: Mutation });
