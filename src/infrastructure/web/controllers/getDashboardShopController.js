const getDashboardUseCase = require('../../../application/useCases/shop/GetShopDashboardUseCase');

const shopDashboardController = {
  getDashboard: async (req, res) => {
    try {
      const {
        shopId,
        platformId,
        cityId,
        startDateA,
        endDateA,
        startDateB,
        endDateB,
        monthA,
        yearA,
        monthB,
        yearB
      } = req.query;

      let periodStartA = startDateA;
      let periodEndA = endDateA;
      let periodStartB = startDateB;
      let periodEndB = endDateB;

      if ((!periodStartA || !periodEndA || !periodStartB || !periodEndB) && monthA && yearA && monthB && yearB) {
        const rangeAStart = new Date(Number(yearA), Number(monthA) - 1, 1);
        const rangeAEnd = new Date(Number(yearA), Number(monthA), 0);
        const rangeBStart = new Date(Number(yearB), Number(monthB) - 1, 1);
        const rangeBEnd = new Date(Number(yearB), Number(monthB), 0);

        const toDateParam = (date) => {
          const offset = date.getTimezoneOffset();
          const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
          return adjusted.toISOString().split('T')[0];
        };

        periodStartA = toDateParam(rangeAStart);
        periodEndA = toDateParam(rangeAEnd);
        periodStartB = toDateParam(rangeBStart);
        periodEndB = toDateParam(rangeBEnd);
      }

      if (!periodStartA || !periodEndA || !periodStartB || !periodEndB) {
        return res.status(400).json({
          error: 'Parámetros requeridos: startDateA, endDateA, startDateB, endDateB'
        });
      }

      const result = await getDashboardUseCase.execute(
        shopId,
        periodStartA,
        periodEndA,
        periodStartB,
        periodEndB,
        {
          platformId,
          cityId,
        }
      );

      res.status(200).json(result);
    } catch (err) {
      console.error('Error en shopDashboardController:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = shopDashboardController;
