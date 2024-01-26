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

require("./src/infrastructure/persistence/mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
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

const nextStaticPath = path.join(__dirname, "./../royalMercaderistasFrontend/.next");
app.use(express.static(nextStaticPath));

const indexPath = path.resolve(__dirname, "./../royalMercaderistasFrontend/.next/server/pages/index.html");
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});