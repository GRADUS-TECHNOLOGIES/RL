// Limpia una cadena de origen externo (headers, campos del body) antes de
// guardarla: elimina caracteres de control (previene log injection / entradas
// que rompan el formato de logs derivados) y la capa a una longitud máxima.
export const cleanString = (value, maxLength = 500) => {
    if (typeof value !== 'string' || value.length === 0) return null;
    // eslint-disable-next-line no-control-regex
    const stripped = value.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (!stripped) return null;
    return stripped.slice(0, maxLength);
};
