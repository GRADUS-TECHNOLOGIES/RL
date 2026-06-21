import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
        content: {
            type: String,
            required: true,
        },
        postId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        likes: {
            type: Array,
            default: [],
        },
        numberOfLikes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Índice para cargar comentarios de un post ordenados por fecha
commentSchema.index({ postId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;