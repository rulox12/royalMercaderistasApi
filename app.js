const compression = require("compression");
const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./src/infrastructure/web/routes/userRoutes");
const roleRoutes = require("./src/infrastructure/web/routes/roleRoutes");
const platformRoutes = require("./src/infrastructure/web/routes/platformRoutes")
const productRoutes = require("./src/infrastructure/web/routes/productRoutes")
const listRoutes = require("./src/infrastructure/web/routes/listRoutes")
const cityRoutes = require("./src/infrastructure/web/routes/cityRoutes")
const shopRoutes = require("./src/infrastructure/web/routes/shopRoutes")
const orderRoutes = require("./src/infrastructure/web/routes/orderRoutes")
const authRoutes = require("./src/infrastructure/web/routes/authRoutes")
const bigOrderRoutes = require("./src/infrastructure/web/routes/bigOrderRoutes")
const supplierRoutes = require("./src/infrastructure/web/routes/supplierRoutes")
const statisticsRoutes = require("./src/infrastructure/web/routes/statisticsRoutes")
const exportRoutes = require("./src/infrastructure/web/routes/exportRoutes")
const categoryRoutes = require("./src/infrastructure/web/routes/categoryRoutes")
const jobs = require("./src/application/job/jobScheduler");

require("./src/infrastructure/persistence/mongoose");
const cors = require("cors");
const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://royalmercaderistasdemo20260310.loca.lt",
    "https://paying-eugene-wishlist-lucy.trycloudflare.com",
];

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (curl, server-to-server) with no Origin header.
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".loca.lt") ||
      origin.endsWith(".trycloudflare.com")
    ) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/big-orders', bigOrderRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/exports', exportRoutes)
app.use('/api/categories', categoryRoutes)

jobs();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});