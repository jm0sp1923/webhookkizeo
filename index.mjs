import fetch from 'node-fetch';
import { writeFile } from 'fs/promises'; // Importación al inicio

async function obtenerPdf() {
  const response = await fetch('https://forms.kizeo.com/rest/v3/forms/1022053/data/214121059/exports/1540559/pdf', {
    method: 'GET',
    headers: {
      Authorization: 'appi_kizeo_48ee84f9b7fe23279af7fdadf738c8982058bf44'
    }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el PDF: ${response.statusText}`);
  }

  // Obtener el nombre del archivo desde el encabezado 'x-filename-custom'
  const fileName = response.headers.get('x-filename-custom') ; // Usar el valor de 'x-filename-custom' o un valor por defecto

  // Convertir el contenido a un buffer
  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());

  // Guardar el archivo con el nombre obtenido
  await writeFile(fileName, buffer);
  console.log(`PDF descargado exitosamente como ${fileName}`);
}

obtenerPdf().catch(console.error);

function obtenerForms() {
  fetch('https://forms.kizeo.com/rest/v3/forms', {
    method: 'GET',
    headers: {
      Authorization: 'appi_kizeo_48ee84f9b7fe23279af7fdadf738c8982058bf44',
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      return response.json(); // Convierte la respuesta a JSON
    })
    .then(data => {
      console.log('Datos recibidos:', data); // Trabaja con los datos
    })
    .catch(error => console.error('Error:', error));
}
