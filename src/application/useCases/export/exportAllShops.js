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

            startDateObj.setUTCHours(0, 0, 0, 0);
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

            if (orderDetailToExport === 'PEDI') {
                orderDetailToExport = 'PEDI';
            }

            const orders = await this.orderRepository.getAll(filters, 1, 10000);

            const groupedDetailsByShop = {};
            const productNames = new Set();
            const productsWithPosition = [];

            orders.orders.forEach(order => {
                const shopName = order.shop.name;

                if (!groupedDetailsByShop[shopName]) {
                    groupedDetailsByShop[shopName] = {};
                }


                order.orderDetails.forEach(detail => {
                    const productName = detail.product.name;
                    const valueToExport = parseFloat(detail[orderDetailToExport]);
                    const productPosition = detail.product.position;

                    productNames.add(productName);

                    if (!groupedDetailsByShop[shopName][productName]) {
                        groupedDetailsByShop[shopName][productName] = 0;
                    }

                    if(valueToExport){
                        groupedDetailsByShop[shopName][productName] += valueToExport;
                    }
                    
                    if (!productsWithPosition.some(p => p.name === productName)) {
                        productsWithPosition.push({ name: productName, position: productPosition });
                    }
                });
            });

            productsWithPosition.sort((a, b) => a.position - b.position);


            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Todas las Tiendas');

            const columns = [{header: 'Producto', key: 'productName', width: 30}];
            for (const shopName in groupedDetailsByShop) {
                if (groupedDetailsByShop.hasOwnProperty(shopName)) {
                    columns.push({header: shopName, key: shopName, width: 20});
                }
            }

            worksheet.columns = columns;

            productsWithPosition.forEach(product => {
                const row = { productName: product.name };
                for (const shopName in groupedDetailsByShop) {
                    if (groupedDetailsByShop.hasOwnProperty(shopName)) {
                        row[shopName] = groupedDetailsByShop[shopName][product.name] || 0;
                    }
                }
                worksheet.addRow(row);
            });

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
