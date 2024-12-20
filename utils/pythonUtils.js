import { spawn } from 'child_process';

function ejecutarSubidaSharePoint(siteUrl, destinationFolder, fileName) {
  console.log("Iniciando ejecución del script Python...");
  console.log("Site URL:", siteUrl);
  console.log("Destination Folder:", destinationFolder);
  console.log("File Name:", fileName);
  

  const pythonProcess = spawn("python", [
    "subirArchivo.py",
    siteUrl,
    destinationFolder,
    fileName,

  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log("Respuesta del script Python:", data.toString());
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error("Error del script Python:", data.toString());
  });

  pythonProcess.on("close", (code) => {
    console.log(`Script Python finalizado con código: ${code}`);
  });
}

export { ejecutarSubidaSharePoint };