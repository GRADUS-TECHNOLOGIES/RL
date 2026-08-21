// Script de un solo uso: rellena `publishDate` en los posts existentes que no
// lo tienen (creados antes de que este campo existiera), usando su `createdAt`.
// Necesario porque `getposts` ahora filtra por `publishDate <= ahora`, y un
// documento sin ese campo no cumple esa condición y desaparecería del sitio.
//
// Uso: node api/scripts/backfillPublishDate.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/post.model.js';

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const pending = await Post.countDocuments({ publishDate: { $exists: false } });
    console.log(`Posts sin publishDate: ${pending}`);

    if (pending > 0) {
        const result = await Post.updateMany(
            { publishDate: { $exists: false } },
            [{ $set: { publishDate: '$createdAt' } }]
        );
        console.log(`Posts actualizados: ${result.modifiedCount}`);
    } else {
        console.log('Nada que hacer.');
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('Error en el backfill:', err);
    process.exit(1);
});
