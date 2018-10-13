const graphql = require("graphql");
const Post = require("../models/post");
const Comment = require("../models/comment");


const { GraphQLObjectType,
        GraphQLID,
        GraphQLString,
        GraphQLInt,
        GraphQLSchema,
        GraphQLList,
        GraphQLNonNull,
      } = graphql;

const PostType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        link: { type: GraphQLString },
        upvotes: { type: GraphQLInt },
        comments: {
           type: new GraphQLList(CommentType),
           resolve(parent, args){
                return Comment.find({postId: parent.id});
            }
        }
    })
});

const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        id: { type: GraphQLID },
        body: { type: GraphQLString },
        author: { type: GraphQLString },
        upvotes: { type: GraphQLInt },
        post: {
            type: PostType,
            resolve(parent, args){
               return Post.findById(parent.postId);
            }
        }
    })
});

const RootType = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        post: {
            type: PostType,
            args: {id: { type: GraphQLID}},
            resolve(parent, args){
                return Post.findById(args.id);
            }
        },
        comment: {
            type: CommentType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Comment.findById(args.id);
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent,args){
                return Post.find({});
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent,args){
                return Comment.find({});
            }
        },
    }

});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addPost: {
            type: PostType,
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                link: { type: GraphQLNonNull(GraphQLString) },
                upvotes: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve(parent, args){
                let post = new Post({
                    title: args.title,
                    link: args.link,
                    upvotes: args.upvotes,
                });
                return post.save();
            }
        },
        addComment: {
            type: CommentType,
            args: {
                body: { type: GraphQLNonNull(GraphQLString) },
                author: { type: GraphQLNonNull(GraphQLString) },
                upvotes: { type: GraphQLNonNull(GraphQLInt) },
                postId: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                let comment = new Comment({
                    body: args.body,
                    author: args.author,
                    upvotes: args.upvotes,
                    postId: args.postId
                });
                return comment.save();
            }
        },
        deletePost: {
            type: PostType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args){
                console.log(args.id);
                const post = Post.findByIdAndRemove(args.id);
                return post;
            }
        },
        deleteComment: {
            type: CommentType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args){
               const comment = Comment.findByIdAndRemove( args.id);
               return comment;
            }
        },
        updatePost: {
            type: PostType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                title: { type: GraphQLNonNull(GraphQLString) },
                link: { type: GraphQLNonNull(GraphQLString) },
                upvotes: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve(parent, args){
                let newPost = {
                    title: args.title,
                    link: args.link,
                    upvotes: args.upvotes,
                };

                Post.findByIdAndUpdate(args.id, newPost);
                return Post.findById(args.id);
            }
        }       
    }
});

module.exports = new GraphQLSchema({
    query: RootType,
    mutation: Mutation
})