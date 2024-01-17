const CreateBigOrderUseCase = require('../../../application/useCases/bigOrder/createBigOrder');
const GetOrdersByDateWithDetails = require('../../../application/useCases/order/getOrdersByDateWithDetails');
const GetBigOrdersUseCase = require('../../../application/useCases/bigOrder/getBigOrders');
const GetBigOrderUseCase = require('../../../application/useCases/bigOrder/getBigOrder');

const bigOrderController = {
  createBigOrder: async (req, res) => {
    try {
      const { date } = req.body;

      const createdBigOrder = await CreateBigOrderUseCase.execute(date);
      const orders = await GetOrdersByDateWithDetails.execute(date);

      res.status(201).json({ createdBigOrder, orders });
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
};

module.exports = bigOrderController;
