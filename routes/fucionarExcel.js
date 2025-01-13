import express from "express";
import multer from "multer";
import path from "path";
import { exec } from "child_process";
import fs from "fs";

const router = express.Router();

// Configuración de Multer para manejar la carga de archivos
const upload = multer({ dest: "uploads/" });

router.get("/fucionarExcel", async (req, res) => {
  try {
    res.render("viewFucionarExcel");
  } catch (error) {
    res.status(500).send("Error al cargar la página");
  }
});

router.post(
  "/fucionarExcel",
  upload.fields([
    { name: "reporteAfianzado", maxCount: 1 },
    { name: "baseCartera", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { reporteAfianzado, baseCartera } = req.files;
      if (!reporteAfianzado || !baseCartera) {
        return res.status(400).json({
          success: false,
          message: "Ambos archivos son requeridos.",
        });
      }

      const archivoDatos = reporteAfianzado[0].path;
      const archivoBusqueda = baseCartera[0].path;

      const scriptPath = path.resolve("fusionar_excel.py");
      const outputFilePath = path.resolve(
        "/processed/excel_fusionado.xlsx"
      );

      const command = `python "${scriptPath}" "${archivoBusqueda}" "${archivoDatos}" "${outputFilePath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error ejecutando el script Python: ${error.message}`);
          console.error(`Comando ejecutado: ${command}`);
          return res.status(500).json({
            success: false,
            message: "Error al procesar los archivos.",
          });
        }

        if (stderr) {
          console.error(`Error del script Python: ${stderr}`);
        }

        console.log(`Resultado del script: ${stdout}`);

        res.json({
          success: true,
          message: "Archivos procesados exitosamente.",
          downloadUrl: `/processed/excel_fusionado.xlsx`,
        });
        

        // Limpieza de archivos temporales
        fs.unlinkSync(archivoDatos);
        fs.unlinkSync(archivoBusqueda);
      });
    } catch (error) {
      console.error("Error al procesar los archivos:", error);
      res
        .status(500)
        .json({ success: false, message: "Error al procesar los archivos." });
    }
  }
);

// Ruta para servir los archivos procesados
router.use("/processed", express.static(path.resolve("processed")));

export default router;
