const ExportGenericUseCase = require('../../../application/useCases/export/exportGeneric');
const ExportAllShops = require('../../../application/useCases/export/exportAllShops');

const exportController = {
  genericExport: async (req, res) => {
    try {
      const { startDate, endDate, orderDetailToExport, city } = req.body;

      if (!startDate || !endDate || !orderDetailToExport || !city) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios: startDate, endDate, orderDetailToExport, city' });
      }

      const filePath = await ExportGenericUseCase.execute(startDate, endDate, orderDetailToExport, city);

      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  allShopsExport: async (req, res) => {
    try {
      const { startDate, endDate, orderDetailToExport, city } = req.body;

      if (!startDate || !endDate || !orderDetailToExport || !city) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios: startDate, endDate, orderDetailToExport, city' });
      }

      const filePath = await ExportAllShops.execute(startDate, endDate, orderDetailToExport, city);

      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = exportController;
