const ExcelJS = require("exceljs");
const path = require("path");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ExportAllShops {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  formatDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  async execute(startDate, endDate, orderDetailToExport, city) {
    try {
      let filters = {};
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);

      const startDateObj = new Date(formattedStartDate);
      const endDateObj = new Date(formattedEndDate);

      startDateObj.setUTCHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00 del día
      endDateObj.setUTCHours(0, 0, 0, 0);

      if (city !== "123") {
        filters = {
          date: {
            $gte: startDateObj,
            $lte: endDateObj
          },
          cityId: city
        };
      } else {
        filters = {
          date: {
            $gte: startDateObj,
            $lte: endDateObj
          }
        };
      }

      const orders = await this.orderRepository.getAll(filters);

      const groupedDetailsByShop = {};

      orders.forEach(order => {
        const shopName = order.shop.name;

        if (!groupedDetailsByShop[shopName]) {
          groupedDetailsByShop[shopName] = {};
        }

        order.orderDetails.forEach(detail => {
          const productName = detail.product.name;
          const valueToExport = parseFloat(detail[orderDetailToExport]);

          if (!groupedDetailsByShop[shopName][productName]) {
            groupedDetailsByShop[shopName][productName] = 0;
          }

          groupedDetailsByShop[shopName][productName] += valueToExport;
        });
      });

      const workbook = new ExcelJS.Workbook();

      for (const shopName in groupedDetailsByShop) {
        if (groupedDetailsByShop.hasOwnProperty(shopName)) {
          const worksheet = workbook.addWorksheet(shopName);

          worksheet.columns = [
            { header: "Producto", key: "productName", width: 30 },
            { header: "Total", key: "total", width: 20 },
          ];

          const shopData = groupedDetailsByShop[shopName];

          for (const productName in shopData) {
            if (shopData.hasOwnProperty(productName)) {
              worksheet.addRow({ productName, total: shopData[productName] });
            }
          }
        }
      }

      const filePath = path.resolve(__dirname, "order_details.xlsx");
      await workbook.xlsx.writeFile(filePath);
      console.log(`Los detalles de la orden se han exportado a Excel en ${filePath}.`);

      return filePath;
    } catch (error) {
      console.error(error);
      throw new Error('Error while fetching orders: ' + error.message);
    }
  }

  
}

module.exports = new ExportAllShops(new OrderRepository());
