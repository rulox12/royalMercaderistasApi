const getDashboardUseCase = require('../../../application/useCases/shop/GetShopDashboardUseCase');

const shopDashboardController = {
  getDashboard: async (req, res) => {
    try {
      const { shopId, monthA, yearA, monthB, yearB } = req.query;

      if (!shopId || !monthA || !yearA || !monthB || !yearB) {
        return res.status(400).json({
          error: 'Parámetros requeridos: shopId, monthA, yearA, monthB, yearB'
        });
      }

      const result = await getDashboardUseCase.execute(
        shopId,
        parseInt(monthA, 10),
        parseInt(yearA, 10),
        parseInt(monthB, 10),
        parseInt(yearB, 10)
      );

      res.status(200).json(result);
    } catch (err) {
      console.error('Error en shopDashboardController:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = shopDashboardController;
