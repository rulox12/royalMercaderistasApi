const CreateBigOrderUseCase = require("../../../application/useCases/bigOrder/createBigOrder");
const GetOrdersByDateWithDetails = require("../../../application/useCases/order/getOrdersByDateWithDetails");
const UpdateOrdersStatusUseCase = require("../../../application/useCases/order/UpdateOrdersStatusUseCase");
const GetBigOrdersUseCase = require("../../../application/useCases/bigOrder/getBigOrders");
const GetBigOrderUseCase = require("../../../application/useCases/bigOrder/getBigOrder");
const GetBigOrderByDateAndCity = require("../../../application/useCases/bigOrder/getBigOrderByDateAndCity");
const UpdateBigOrderUserCase = require("../../../application/useCases/bigOrder/updateBigOrder");
const ExcelJS = require("exceljs");
const OrderModel = require("../../persistence/models/OrderModel");
const BigOrderModel = require("../../persistence/models/BigOrderModel");
const path = require('path');

const bigOrderController = {
    createBigOrder: async (req, res) => {
        try {
            const {date, cityId, platformId} = req.body;

            const createdBigOrder = await CreateBigOrderUseCase.execute(date, cityId, platformId);
            const orders = await GetOrdersByDateWithDetails.execute(date, cityId, platformId);

            const orderIds = orders?.map(order => order.order._id);

            if (orderIds.length > 0) {
                await UpdateOrdersStatusUseCase.execute(orderIds, "Approved");
            }


            res.status(201).json({createdBigOrder, orders});
        } catch (error) {
            res.status(500).json({errors: error.message});
        }
    },

    updateBigOrder: async (req, res) => {
        try {
            const {bigOrderId, products, userId} = req.body;

            const bigOrder = await GetBigOrderUseCase.execute(bigOrderId);
            await UpdateBigOrderUserCase.execute(bigOrder, products, userId);

            res.status(201).json({message: "Actualizado con exito"});
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    getBigOrders: async (req, res) => {
        try {
            const {page = 1, limit = 30, ...filters} = req.query;
            const bigOrders = await GetBigOrdersUseCase.execute(filters, parseInt(page), parseInt(limit));

            if (!bigOrders || bigOrders.length === 0) {
                return res.status(404).json({message: "No se encontraron pedidos"});
            }

            res.status(200).json(bigOrders);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    getBigOrderByDateAndShop: async (req, res) => {
        try {
            const {date, cityId, platformId} = req.query;

            const bigOrders = await GetBigOrderByDateAndCity.execute(date, cityId, platformId);

            if (!bigOrders || bigOrders.length === 0) {
                return res.status(404).json({message: "No se encontraron pedidos"});
            }

            res.status(200).json(bigOrders);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    getBigOrder: async (req, res) => {
        try {
            const {id} = req.params;
            const bigOrder = await GetBigOrderUseCase.execute(id);

            if (!bigOrder || bigOrder.length === 0) {
                return res.status(404).json({message: "No se encontraron pedidos"});
            }

            res.status(200).json(bigOrder);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    exportToExcel: async (req, res) => {
        try {
            const platformId = req.body.platformId;
            const bigOrder = await BigOrderModel.findOne({
                '_id': req.body.bigOrderId,
                platformId
            });

            const date = bigOrder.date;
            const cityId = bigOrder.cityId;
            const startDate = new Date(date);

            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setUTCDate(startDate.getUTCDate() + 1);
            const orders = await OrderModel.find({
                date: {$gte: startDate, $lt: endDate},
                cityId,
                platform: platformId
            }).populate({
                path: 'orderDetails.product',
                populate: {
                    path: 'supplierId'
                }
            }).populate('cityId');

            if (!orders.length) {
                console.log(
                    "No se encontraron órdenes para la fecha y ciudad proporcionadas."
                );
                return;
            }

            const groupedDetailsBySupplier = {};

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Order Details");

            worksheet.columns = [
                {header: "Proveedor", key: "supplier", width: 30},
                {header: "Producto", key: "product", width: 30},
                {header: "Cantidad", key: "quantity", width: 10},
                {header: "Ciudad", key: "city", width: 10},
            ];

            let cityName = orders[0].cityId.name;
            for (const order of orders) {
                for (const detail of order.orderDetails) {
                    const product = detail.product;
                    const supplier = product.supplierId.name;
                    const productName = product.name;
                    const quantity = detail.PEDI_REAL ? parseFloat(detail.PEDI_REAL) : 0;
                    if (!groupedDetailsBySupplier[supplier]) {
                        groupedDetailsBySupplier[supplier] = {};
                    }

                    if (!groupedDetailsBySupplier[supplier][productName]) {
                        groupedDetailsBySupplier[supplier][productName] = 0;
                    }

                    groupedDetailsBySupplier[supplier][productName] += quantity;
                }
            }

            for (const supplier in groupedDetailsBySupplier) {
                if (groupedDetailsBySupplier.hasOwnProperty(supplier)) {
                    const details = groupedDetailsBySupplier[supplier];
                    for (const productName in details) {
                        if (details.hasOwnProperty(productName)) {
                            const quantity = details[productName];
                            worksheet.addRow({supplier, product: productName, quantity, city: cityName});
                        }
                    }
                    worksheet.addRow({supplier: '', product: '', quantity: '', city: ''});
                }
            }

            const filePath = path.resolve(__dirname, "order_details.xlsx");
            await workbook.xlsx.writeFile(filePath);

            res.sendFile(filePath);
        } catch (error) {
            console.error("Error al exportar detalles de la orden a Excel:", error);
        }
    },

};

module.exports = bigOrderController;
