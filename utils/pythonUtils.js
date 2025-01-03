import { spawn } from "child_process";

function ejecutarSubidaSharePoint(siteUrl, destinationFolder,tipoDiligencia, fileName, fileBuffer) {
  console.log("Iniciando ejecución del script Python...");
  console.log("Site URL:", siteUrl);
  console.log("Destination Folder:", destinationFolder);
  console.log("Tipo de diligencia:", tipoDiligencia);
  console.log("File Name:", fileName);

  const pythonProcess = spawn("python3", [
    "subirArchivo.py",
    siteUrl,
    destinationFolder,
    tipoDiligencia,
    fileName,
  ]);

  // Pasar el contenido del archivo PDF como entrada estándar al script Python
  pythonProcess.stdin.write(fileBuffer);
  pythonProcess.stdin.end();

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
