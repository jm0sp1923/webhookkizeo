import fetch from 'node-fetch';

const obtenExportId = async (formId, apiKey) => {
    try {
      const response = await fetch(`https://www.kizeoforms.com/rest/v3/forms/${formId}/exports`, {
        method: 'GET',
        headers: { Authorization: apiKey}
      });
  
      const data = await response.json();
      if (data.status === 'ok' && data.exports.length > 0) {
        let exportId = data.exports[0].id;
        console.log('Export ID:', exportId);
        return exportId; // Devuelve el exportId correctamente
      } else {
        throw new Error('No se encontraron exportaciones o el estado no es "ok".');
      }
    } catch (error) {
      console.error('Error al obtener el exportId:', error.message);
      throw new Error(`Error al obtener el exportId: ${error.message}`);
    }
  };
  
 export { obtenExportId };