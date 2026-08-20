import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        mediaUrl: {
            type: String,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            default: 'image',
        },
        linkUrl: {
            type: String,
            required: true,
        },
        linkLabel: {
            type: String,
            default: 'Ver más',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Sirve la consulta pública más frecuente: banners activos, más reciente primero
bannerSchema.index({ isActive: 1, updatedAt: -1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
