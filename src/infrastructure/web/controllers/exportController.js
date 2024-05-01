const ExcelJS = require("exceljs");
const ExportGenericUseCase = require('../../../application/useCases/export/exportGeneric');
const path = require('path');

const exportController = {
  genericExport: async (req, res) => {
    try {
      const { startDate, endDate, orderDetailToExport, city } = req.body;
      
      // Ejecutar el caso de uso para obtener los datos a exportar
      const data = await ExportGenericUseCase.execute(startDate, endDate, orderDetailToExport, city);
      
      // Crear un nuevo libro de Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Exported Data");

      // Añadir encabezados a las columnas
      worksheet.columns = [
        { header: "Producto", key: "productName", width: 30 },
        { header: "Valor a Exportar", key: "valueToExport", width: 20 }
      ];

      // Añadir filas con los datos obtenidos
      data.forEach(item => {
        worksheet.addRow({ productName: item.productName, valueToExport: item.totalValue });
      });
      const filePath = path.resolve(__dirname, "order_details.xlsx");
      await workbook.xlsx.writeFile(filePath);
      console.log(
        `Los detalles de la orden se han exportado a Excel en ${filePath}.`
      );

      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = exportController;
