// Script de un solo uso: elimina el índice único obsoleto `title_1` de la
// colección `posts`. Necesario porque Mongoose no borra automáticamente los
// índices que se quitan del schema, solo crea los que faltan.
//
// Uso: node api/scripts/dropTitleIndex.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection('posts');

    const indexes = await collection.indexes();
    console.log('Índices actuales:', indexes.map((i) => i.name));

    const hasTitleIndex = indexes.some((i) => i.name === 'title_1');
    if (hasTitleIndex) {
        await collection.dropIndex('title_1');
        console.log('Índice title_1 eliminado correctamente.');
    } else {
        console.log('El índice title_1 no existe, nada que hacer.');
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('Error al eliminar el índice:', err);
    process.exit(1);
});
