// Genera un slug único a partir de un título, añadiendo un sufijo numérico
// (-2, -3, ...) cuando ya existe un post con ese mismo slug base.
export const generateUniqueSlug = async (Post, title, excludePostId = null) => {
    const baseSlug = title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '-');

    const query = { slug: { $regex: `^${baseSlug}(-\\d+)?$` } };
    if (excludePostId) {
        query._id = { $ne: excludePostId };
    }

    const existingSlugs = new Set(
        (await Post.find(query).select('slug')).map((post) => post.slug)
    );

    if (!existingSlugs.has(baseSlug)) {
        return baseSlug;
    }

    let suffix = 2;
    while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
        suffix++;
    }
    return `${baseSlug}-${suffix}`;
};
