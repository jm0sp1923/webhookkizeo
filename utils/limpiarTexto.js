function cleanText(text) {
    if (text) {
      return text
        .toString()
        .replace(/[\r\n]+/g, ' ')  // Reemplazar saltos de línea por un solo espacio
        .replace(/\s+/g, ' ')      // Reemplazar espacios múltiples por un solo espacio
        .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres no alfanuméricos (opcional)
        .trim();                  // Eliminar espacios al principio y al final
    }
    return text;
  };

export default cleanText;