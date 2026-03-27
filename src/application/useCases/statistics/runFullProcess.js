const path = require("path");
const { spawn } = require("child_process");

class RunFullProcessUseCase {
  isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  runNodeScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [scriptPath, ...args], {
        cwd: path.resolve(__dirname, "../../../.."),
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
            `Script falló con código ${code}. ${stderr || stdout || "Sin detalle"}`
          )
        );
      });
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
        name: "sales",
        file: path.resolve(__dirname, "../../../scripts/migration/calculateSalesRange.js"),
      },
      {
        name: "received",
        file: path.resolve(__dirname, "../../../scripts/migration/calculateReceivedRange.js"),
      },
      {
        name: "rentability",
        file: path.resolve(__dirname, "../../../scripts/migration/calculateRentabilityRange.js"),
      },
    ];

    const output = [];

    for (const script of scripts) {
      const result = await this.runNodeScript(script.file, [startDate, endDate]);
      output.push({
        step: script.name,
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    return {
      ok: true,
      startDate,
      endDate,
      steps: output,
    };
  }
}

module.exports = new RunFullProcessUseCase();