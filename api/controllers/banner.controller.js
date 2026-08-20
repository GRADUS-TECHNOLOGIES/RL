import Banner from '../models/banner.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to create a banner'));
    }
    if (!req.body.title || !req.body.mediaUrl || !req.body.linkUrl) {
        return next(errorHandler(400, 'Title, media and link URL are required'));
    }

    try {
        const newBanner = new Banner({ ...req.body });
        const savedBanner = await newBanner.save();
        res.status(201).json(savedBanner);
    } catch (error) {
        next(error);
    }
};

export const getBanners = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;

        const banners = await Banner.find({
            ...(req.query.isActive && { isActive: req.query.isActive === 'true' }),
        })
            .sort({ updatedAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalBanners = await Banner.countDocuments();

        res.status(200).json({ banners, totalBanners });
    } catch (error) {
        next(error);
    }
};

export const updateBanner = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to update this banner'));
    }
    try {
        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.bannerId,
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    mediaUrl: req.body.mediaUrl,
                    mediaType: req.body.mediaType,
                    linkUrl: req.body.linkUrl,
                    linkLabel: req.body.linkLabel,
                    isActive: req.body.isActive,
                },
            },
            { new: true }
        );
        if (!updatedBanner) return next(errorHandler(404, 'Banner no encontrado'));
        res.status(200).json(updatedBanner);
    } catch (error) {
        next(error);
    }
};

export const deleteBanner = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to delete this banner'));
    }
    try {
        await Banner.findByIdAndDelete(req.params.bannerId);
        res.status(200).json('El banner ha sido eliminado');
    } catch (error) {
        next(error);
    }
};
