const ExcelJS = require("exceljs");
const path = require("path");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ExportGenericUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    formatDate(dateString) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }

    async execute(startDate, endDate, orderDetailToExport, city) {
        let filters = {};
        try {
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

            const groupedDetailsByProduct = {};

            if (orderDetailToExport === 'PEDI') {
                orderDetailToExport = 'PEDI_REAL';
            }

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
                    const totalValue = values
                        .filter(value => value.trim() !== '')
                        .reduce((acc, curr) => acc + parseFloat(curr), 0);

                    dataToExport.push({ productName, totalValue });
                }
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Exported Data");

            worksheet.columns = [
                {header: "Producto", key: "productName", width: 30},
                {header: "Valor a Exportar", key: "valueToExport", width: 20},
            ];

            dataToExport.forEach((item) => {
                worksheet.addRow({productName: item.productName, valueToExport: item.totalValue});
            });

            const filePath = path.resolve(__dirname, "order_details.xlsx");
            await workbook.xlsx.writeFile(filePath);
            console.log(`Los detalles de la orden se han exportado a Excel en ${filePath}.`);

            return filePath;
        } catch (e) {
            console.log(e);
            throw new Error('Error while fetching orders: ' + e.message);
        }
    }
}

module.exports = new ExportGenericUseCase(new OrderRepository());
