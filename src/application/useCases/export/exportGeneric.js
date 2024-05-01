const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ExportGenericUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(startDate, endDate, orderDetailToExport, city) {
    const filters = {
      date: {
        $gte: startDate,
        $lte: endDate
      },
      cityId: city
    }
    
    const orders = await this.orderRepository.getAll(filters)

    const groupedDetailsByProduct = {};

    orders.forEach(order => {
      order.orderDetails.forEach(detail => {
        const productName = detail.product.name;
        const valueToExport = detail[orderDetailToExport];
        if (!groupedDetailsByProduct[productName]) {
          groupedDetailsByProduct[productName] = [];
        }
        groupedDetailsByProduct[productName].push(valueToExport);
      });
    });

    const dataToExport = [];
    for (const productName in groupedDetailsByProduct) {
      if (groupedDetailsByProduct.hasOwnProperty(productName)) {
        const values = groupedDetailsByProduct[productName];
        const totalValue = values.reduce((acc, curr) => acc + parseFloat(curr), 0);
        dataToExport.push({ productName, totalValue });
      }
    }

    return dataToExport;
  }
}

module.exports = new ExportGenericUseCase(new OrderRepository());
