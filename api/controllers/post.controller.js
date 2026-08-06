import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";
import { sanitizeContent } from "../utils/sanitize.js";
import { generateUniqueSlug } from "../utils/slug.js";

export const create = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to create a post'));
    }
    if (!req.body.title) {
        return next(errorHandler(400, 'Title is required'));
    }

    if (req.body.isMagazine) {
        if (!req.body.pdf) {
            return next(errorHandler(400, 'PDF file is required for magazine posts'));
        }
    } else {
        if (!req.body.image || !req.body.content) {
            return next(errorHandler(400, 'Image and content are required for article posts'));
        }
    }

    try {
        // Generar un slug único (añade -2, -3... si ya existe uno con el mismo título)
        const slug = await generateUniqueSlug(Post, req.body.title);

        // Crear el nuevo post (sanitizar el contenido HTML antes de persistir)
        const newPost = new Post({
            ...req.body,
            content: sanitizeContent(req.body.content),
            slug,
            userId: req.user.id,
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost); // Respuesta exitosa
    } catch (error) {
        next(error);
    }
};

export const getposts = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === 'asc' ? 1 : -1;

        // Consulta dinámica
        const posts = await Post.find({
            ...(req.query.userId && { userId: req.query.userId }),
            ...(req.query.category && { category: req.query.category }),
            ...(req.query.slug && { slug: req.query.slug }),
            ...(req.query.postId && { _id: req.query.postId }),
            ...(req.query.searchTerm && {
                $or: [
                    { title: { $regex: req.query.searchTerm, $options: 'i' } },
                    { content: { $regex: req.query.searchTerm, $options: 'i' } },
                ],
            }),
            ...(req.query.isMagazine && { pdf: { $exists: true, $ne: '' } }), // Filtrar revistas
        })
            .sort({ updatedAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        // Contar el total de posts
        const totalPost = await Post.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        const lastMonthPosts = await Post.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        });

        res.status(200).json({
            posts,
            totalPost,
            lastMonthPosts,
        });
    } catch (error) {
        next(error);
    }
};

export const deletepost = async (req, res, next) => {
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You\'re not allowed to delete this post'));
    }
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json('The post has benn deleted');
    } catch (error) {
        next(error);
    }
};

export const updatepost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return next(errorHandler(404, 'Post no encontrado'));

        // ✅ Solo el dueño o el admin puede actualizar
        if (!req.user.isAdmin && req.user.id !== post.userId.toString()) {
            return next(errorHandler(403, 'No tienes permiso para editar este post'));
        }

        // Validar campos requeridos (como en create)
        if (!req.body.title) {
            return next(errorHandler(400, 'El título es obligatorio'));
        }

        if (req.body.isMagazine) {
            if (!req.body.pdf) {
                return next(errorHandler(400, 'El PDF es obligatorio para revistas'));
            }
        } else {
            if (!req.body.image || !req.body.content) {
                return next(errorHandler(400, 'La imagen y contenido son obligatorios para artículos'));
            }
        }

        // Actualiza el slug si cambió el título (excluye el propio post de la verificación)
        const newSlug = await generateUniqueSlug(Post, req.body.title, post._id);

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId,
            {
                $set: {
                    title: req.body.title,
                    content: sanitizeContent(req.body.content),
                    category: req.body.category,
                    image: req.body.image,
                    pdf: req.body.pdf,
                    slug: newSlug,
                },
            },
            { new: true }
        );

        res.status(200).json(updatedPost);
    } catch (error) {
        next(error);
    }
};