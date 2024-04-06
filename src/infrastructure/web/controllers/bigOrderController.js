const CreateBigOrderUseCase = require("../../../application/useCases/bigOrder/createBigOrder");
const GetOrdersByDateWithDetails = require("../../../application/useCases/order/getOrdersByDateWithDetails");
const GetBigOrdersUseCase = require("../../../application/useCases/bigOrder/getBigOrders");
const GetBigOrderUseCase = require("../../../application/useCases/bigOrder/getBigOrder");
const getBigOrderByDateAndCity = require("../../../application/useCases/bigOrder/getBigOrderByDateAndCity");
const UpdateBigOrderUserCase = require("../../../application/useCases/bigOrder/updateBigOrder");
const ExcelJS = require("exceljs");
const OrderModel = require("../../persistence/models/OrderModel");
const OrderDetails = require("../../persistence/models/OrderDetailsModel");
const BigOrderModel = require("../../persistence/models/BigOrderModel");
const path = require('path');

const bigOrderController = {
  createBigOrder: async (req, res) => {
    try {
      const { date, cityId } = req.body;

      const createdBigOrder = await CreateBigOrderUseCase.execute(date, cityId);
      const orders = await GetOrdersByDateWithDetails.execute(date, cityId);

      res.status(201).json({ createdBigOrder, orders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateBigOrder: async (req, res) => {
    try {
      const { bigOrderId, products, userId } = req.body;

      const bigOrder = await GetBigOrderUseCase.execute(bigOrderId);
      await UpdateBigOrderUserCase.execute(bigOrder, products, userId);

      res.status(201).json({ message: "Actualizado con exito" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getBigOrders: async (req, res) => {
    try {
      const bigOrders = await GetBigOrdersUseCase.execute();

      if (!bigOrders || bigOrders.length === 0) {
        return res.status(404).json({ message: "No se encontraron pedidos" });
      }

      res.status(200).json(bigOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getBigOrderByDateAndShop: async (req, res) => {
    try {
      const { date, cityId } = req.query;

      const bigOrders = await getBigOrderByDateAndCity.execute(date, cityId);

      if (!bigOrders || bigOrders.length === 0) {
        return res.status(404).json({ message: "No se encontraron pedidos" });
      }

      res.status(200).json(bigOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getBigOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const bigOrder = await GetBigOrderUseCase.execute(id);

      if (!bigOrder || bigOrder.length === 0) {
        return res.status(404).json({ message: "No se encontraron pedidos" });
      }

      res.status(200).json(bigOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  exportToExcel: async (req, res) => {
    try {
      const bigOrder = await BigOrderModel.findById(req.body.bigOrderId);

      const date = bigOrder.date;
      const cityId = bigOrder.cityId;

      const orders = await OrderModel.find({ date, cityId });

      if (!orders.length) {
        console.log(
          "No se encontraron órdenes para la fecha y ciudad proporcionadas."
        );
        return;
      }

      const groupedDetails = {};

      for (const order of orders) {
        const orderDetails = await OrderDetails.find({
          order: order._id,
        }).populate({
          path: "product",
          populate: {
            path: "supplierId",
          }
        });
        for (const detail of orderDetails) {
          const product = detail.product;
          const supplierId = product.supplierId._id.toString();
          const key = `${supplierId}_${product._id}`;
          if (!groupedDetails[key]) {
            groupedDetails[key] = {
              supplier: product.supplierId.name,
              product: product.name,
              quantity: detail.PEDI_REAL ? parseFloat(detail.PEDI_REAL) : 0,
            };
          } else {
            groupedDetails[key].quantity += detail.PEDI_REAL ? parseFloat(detail.PEDI_REAL) : 0;
          }
        }
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Order Details");

      worksheet.columns = [
        { header: "Proveedor", key: "supplier", width: 30 },
        { header: "Producto", key: "product", width: 30 },
        { header: "Cantidad", key: "quantity", width: 10 },
      ];

      const groupedData = {};
      for (const key in groupedDetails) {
        const groupId = key.split("_")[0];
        if (!groupedData[groupId]) {
          groupedData[groupId] = [];
        }
        groupedData[groupId].push(groupedDetails[key]);
      }

      for (const key in groupedData) {
        if (groupedData.hasOwnProperty(key)) {
          const details = groupedData[key];
          for (const detail of details) {
            worksheet.addRow(detail);
          }
          worksheet.addRow({supplier: '', product: '', quantity: '' });
        }
      }

      const filePath = path.resolve(__dirname, "order_details.xlsx");
      await workbook.xlsx.writeFile(filePath);
      console.log(
        `Los detalles de la orden se han exportado a Excel en ${filePath}.`
      );

      res.sendFile(filePath);
    } catch (error) {
      console.error("Error al exportar detalles de la orden a Excel:", error);
    }
  },


};

module.exports = bigOrderController;
