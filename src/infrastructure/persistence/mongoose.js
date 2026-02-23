const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from project root so scripts work regardless of current working directory.
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  console.warn(`⚠️ MONGODB_URI no definido. Intentando cargar .env en: ${envPath}`);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
  console.log("Conexión a MongoDB establecida");
});
