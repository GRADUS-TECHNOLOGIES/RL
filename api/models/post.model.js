import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            // Validación condicional para que sea requerido solo si no es revista
            validate: {
                validator: function (value) {
                    return this.isMagazine || (value && value.length > 0);
                },
                message: 'Content is required unless the post is a magazine',
            },
        },
        title: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
            default:
                'https://static.semrush.com/blog/uploads/media/17/48/17484f6f167c8596d4f7c97aa884172f/blog-post-templates.svg',
        },
        category: {
            type: String,
            default: 'uncategorized',
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        pdf: {
            type: String,
            default: '',
            validate: {
                validator: function (value) {
                    return !this.isMagazine || (value && value.length > 0);
                },
                message: 'El PDF es necesario para revistas',
            },
        },
        isMagazine: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
