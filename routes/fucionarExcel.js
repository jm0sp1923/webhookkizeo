import express from "express";
import multer from "multer";
import path from "path";
import { exec } from "child_process";
import fs from "fs";
import logger from "../utils/logger.js";  // Importar el logger

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/fucionarExcel", async (req, res) => {
  try {
    res.render("viewFucionarExcel");
  } catch (error) {
    logger.error("Error al cargar la página: " + error.message);  // Usar logger para errores
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
        logger.warn("Ambos archivos son requeridos."); // Usar logger para advertencias
        return res.status(400).json({
          success: false,
          message: "Ambos archivos son requeridos.",
        });
      }

      const archivoDatos = reporteAfianzado[0].path;
      const archivoBusqueda = baseCartera[0].path;
      const processedDir = path.resolve("processed");
      const outputFilePath = path.join(processedDir, "excel_fusionado.xlsx");
      const command = `python ./utils/pythonScripts/fusionar_excel.py "${archivoBusqueda}" "${archivoDatos}" "${outputFilePath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error ejecutando el script: ${error.message}`);  // Usar logger para errores
          return res.status(500).json({
            success: false,
            message: "Error al procesar los archivos.",
          });
        }

        logger.info(`Resultado del script: ${stdout}`);  // Usar logger para mensajes informativos
        res.json({
          success: true,
          message: "Archivos procesados exitosamente.",
          downloadUrl: `/processed/excel_fusionado.xlsx`,
        });

        fs.unlinkSync(archivoDatos);
        fs.unlinkSync(archivoBusqueda);
      });
    } catch (error) {
      logger.error("Error al procesar los archivos: " + error.message);  // Usar logger para errores
      res
        .status(500)
        .json({ success: false, message: "Error al procesar los archivos." });
    }
  }
);

router.use("/processed", express.static(path.resolve("processed")));

export default router;
