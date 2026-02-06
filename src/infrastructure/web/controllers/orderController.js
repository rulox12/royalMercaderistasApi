const CreateOrderUseCase = require('../../../application/useCases/order/createOrder');
const GetOrderUseCase = require('../../../application/useCases/order/getOrder');
const GetOrdersUseCase = require('../../../application/useCases/order/getOrders');
const CreateOrderDetailsUseCase = require('../../../application/useCases/order/createOrderDetailsUseCase');
const GetManyOrdersUseCase = require('../../../application/useCases/order/getManyOrdersUseCase');
const GetNotReceivedOrdersUseCase = require('../../../application/useCases/order/GetNotReceivedOrdersUseCase');
const GetNotReceivedOrdersByShopAndRangeUseCase = require('../../../application/useCases/order/GetNotReceivedOrdersByShopAndRangeUseCase');
const getOrdersByDateWithDetails = require('../../../application/useCases/order/getOrdersByDateWithDetails');
const CalculateSalesUseCase = require('../../../application/useCases/order/CalculateSalesUseCase');
const CompareOrdersByMonthYearUseCase = require('../../../application/useCases/order/CompareOrdersByMonthYearUseCase');
const ComparePlatformsUseCase = require('../../../application/useCases/order/ComparePlatformsUseCase');
const ComparePlatformCitiesUseCase = require('../../../application/useCases/order/ComparePlatformCitiesUseCase');

require('next/dist/build/utils');

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { shopId, userId, orders, cityId, platformId, details } = req.body;
            const createdOrders = [];
            for (const orderDate in orders) {
                const products = orders[orderDate];
                const createdOrder = await CreateOrderUseCase.execute(shopId, orderDate, userId, cityId, platformId, details);
                const createdOrderDetails = await CreateOrderDetailsUseCase.execute(createdOrder._id, products);
                createdOrders.push({ order: createdOrder, orderDetails: createdOrderDetails });
            }

            res.status(201).json({ createdOrders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrder: async (req, res) => {
        try {
            const shopId = req.params.shopId;
            const shop = await GetOrderUseCase.execute(shopId);

            if (!shop) {
                return res.status(404).json({ message: "Order no encontrada" });
            }

            res.status(200).json(shop);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrders: async (req, res) => {
        try {
            const { page = 1, limit = 30, shopId, ...filters } = req.query;
            const ordersData = await GetOrdersUseCase.execute(filters, parseInt(page), parseInt(limit), shopId);

            if (!ordersData.orders || ordersData.orders.length === 0) {
                return res.status(404).json({ message: "No se encontraron órdenes" });
            }

            res.status(200).json(ordersData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrdersByDate: async (req, res) => {
        try {
            const { date } = req.body;
            const orders = await getOrdersByDateWithDetails.execute(date);

            if (!orders || orders.length === 0) {
                return res.status(404).json({ message: "No se encontraron ordenes" });
            }

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrdersByDatesAndShop: async (req, res) => {
        try {
            const { dates, shopId } = req.body;
            const orders = await GetManyOrdersUseCase.execute(dates, shopId);

            if (!orders || orders.length === 0) {
                return res.status(404).json({ message: "No se encontraron ordenes" });
            }

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrdersByUser: async (req, res) => {
        try {
            const { userId } = req.params;

        } catch (error) {

        }
    },

    getNotReceivedOrders: async (req, res) => {
        try {
            const { date } = req.params;
            const notReceivedShops = await GetNotReceivedOrdersUseCase.execute(date);

            return res.json({ date, notReceivedShops });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al obtener órdenes no recibidas" });
        }
    },

    getNotReceivedOrdersByShopAndRange: async (req, res) => {
        try {
            const { shopId, startDate, endDate } = req.params;

            const notReceivedShops = await GetNotReceivedOrdersByShopAndRangeUseCase.execute(shopId, startDate, endDate);

            return res.json({ shopId, startDate, endDate, notReceivedShops });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al obtener órdenes no recibidas" });
        }
    },

    calculateSales: async (req, res) => {
        try {
            const { shopId, date } = req.query;
            console.log("Calculando ventas para la tienda:", shopId, "en la fecha:", date);

            if (!shopId || !date) {
                return res.status(400).json({ message: "Faltan parámetros obligatorios: shopId y date" });
            }

            const result = await CalculateSalesUseCase.execute(shopId, date);

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    },

    compareByMonthYear: async (req, res) => {
        try {
            console.log("📥 Entró a compareByMonthYear con query:", req.query);

            const { shopId, monthA, yearA, monthB, yearB } = req.query;
            const report = await CompareOrdersByMonthYearUseCase.execute(shopId, monthA, yearA, monthB, yearB);
            res.status(200).json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    comparePlatforms: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Debe enviar startDate y endDate en la query' });
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            const report = await ComparePlatformsUseCase.execute(start, end);

            return res.json(report);
        } catch (error) {
            console.error('Error en compare-platforms:', error);
            return res.status(500).json({ error: 'Error interno al generar el reporte por plataformas' });
        }
    },

    comparePlatformCities: async (req, res) => {
        try {
            const {platformId, monthA, yearA, monthB, yearB} = req.query;

            if (!platformId || !monthA || !yearA || !monthB || !yearB) {
                return res.status(400).json({
                    error: 'Debe enviar platformId, monthA, yearA, monthB y yearB en la query'
                });
            }

            const report = await ComparePlatformCitiesUseCase.execute(
                platformId,
                Number(monthA),
                Number(yearA),
                Number(monthB),
                Number(yearB)
            );

            return res.json(report);
        } catch (error) {
            console.error('Error en compare-platform-cities:', error);
            return res.status(500).json({error: 'Error interno al generar el reporte por ciudades'});
        }
    }
};

module.exports = orderController;
