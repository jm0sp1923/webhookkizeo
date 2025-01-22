import { spawn } from "child_process";

function ejecutarSubidaSharePoint(siteUrl, destinationFolder, tipoDiligencia, fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    console.log("Iniciando ejecución del script Python...");
    console.log("Site URL:", siteUrl);
    console.log("Destination Folder:", destinationFolder);
    console.log("Tipo de diligencia:", tipoDiligencia);
    console.log("File Name:", fileName);

    const pythonProcess = spawn("python3", [
      "utils/pythonScripts/subirArchivo.py",
      siteUrl,
      destinationFolder,
      tipoDiligencia,
      fileName,
    ]);

    // Pasar el contenido del archivo PDF como entrada estándar al script Python
    pythonProcess.stdin.write(fileBuffer);
    pythonProcess.stdin.end();

    let output = "";

    // Capturar la salida estándar del script Python
    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Capturar errores del script Python
    pythonProcess.stderr.on("data", (data) => {
      console.error("Error del script Python:", data.toString());
    });

    // Manejar el cierre del proceso
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`Script Python finalizado con éxito. Salida: ${output}`);
        resolve(output.trim()); // Resolver con la URL generada
      } else {
        console.error(`El script Python falló con código: ${code}`);
        reject(new Error(`El script Python falló con código: ${code}`));
      }
    });
  });
}

export { ejecutarSubidaSharePoint };
