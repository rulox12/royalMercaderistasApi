const CreateBigOrderUseCase = require('../../../application/useCases/bigOrder/createBigOrder');
const GetOrdersByDateWithDetails = require('../../../application/useCases/order/getOrdersByDateWithDetails');
const GetBigOrdersUseCase = require('../../../application/useCases/bigOrder/getBigOrders');
const GetBigOrderUseCase = require('../../../application/useCases/bigOrder/getBigOrder');
const getBigOrderByDateAndCity = require('../../../application/useCases/bigOrder/getBigOrderByDateAndCity');
const UpdateBigOrderUserCase = require('../../../application/useCases/bigOrder/updateBigOrder');

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
      
      res.status(201).json({message: 'Actualizado con exito'});
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
};

module.exports = bigOrderController;
