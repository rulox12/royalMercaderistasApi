const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

// Cargar .env en el contexto actual
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

class RunFullProcessUseCase {
  isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  runNodeScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
      // Pasar las variables de entorno actuales al proceso hijo
      const env = {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "production",
      };

      const child = spawn(process.execPath, [scriptPath, ...args], {
        cwd: path.resolve(__dirname, "../../../../"),
        env,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        reject(error);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
          return;
        }

        reject(
          new Error(
            `Script falló con código ${code}. Stderr: ${stderr || stdout || "Sin detalle"}`
          )
        );
      });

      // Timeout de 5 minutos por script
      setTimeout(() => {
        child.kill();
        reject(new Error("Script excedió timeout de 5 minutos"));
      }, 5 * 60 * 1000);
    });
  }

  async execute(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error("START y END son obligatorios");
    }

    if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
      throw new Error("Formato inválido. Usa YYYY-MM-DD");
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new Error("START debe ser menor o igual que END");
    }

    const scripts = [
      {
        name: "ventas",
        file: path.resolve(__dirname, "../../../../src/scripts/migration/calculateSalesRange.js"),
      },
      {
        name: "recibidas",
        file: path.resolve(__dirname, "../../../../src/scripts/migration/calculateReceivedRange.js"),
      },
      {
        name: "rentabilidad",
        file: path.resolve(__dirname, "../../../../src/scripts/migration/calculateRentabilityRange.js"),
      },
    ];

    const output = [];
    let successCount = 0;
    let errorCount = 0;

    for (const script of scripts) {
      try {
        const result = await this.runNodeScript(script.file, [startDate, endDate]);
        output.push({
          step: script.name,
          status: "✅ Éxito",
          ok: true,
          stdout: result.stdout,
        });
        successCount++;
      } catch (error) {
        output.push({
          step: script.name,
          status: "❌ Falló",
          ok: false,
          error: error.message,
        });
        errorCount++;
      }
    }

    return {
      ok: successCount > 0,
      startDate,
      endDate,
      summary: {
        total: scripts.length,
        success: successCount,
        failed: errorCount,
        message: `${successCount} completado(s), ${errorCount} fallido(s)`,
      },
      steps: output,
    };
  }
}

module.exports = new RunFullProcessUseCase();