const ExcelJS = require('exceljs');
const ShopModel = require("../../../infrastructure/persistence/models/ShopModel");
const ListProductModel = require("../../../infrastructure/persistence/models/ListProductModel");
const OrderModel = require("../../../infrastructure/persistence/models/OrderModel");

class LargeDataset {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.averiaColumns = []; // Asegúrate de que estos índices sean correctos
        this.pedidoColumns = []; // Asegúrate de que estos índices sean correctos
        this.ventaColumns = []; // Asegúrate de que estos índices sean correctos
        this.dates = [];
    }

    async execute(startDate, endDate, cityId, platformId) {
        try {
            const formattedStartDate = this.formatDate(startDate);
            const formattedEndDate = this.formatDate(endDate);

            const startDateObj = new Date(formattedStartDate);
            const endDateObj = new Date(formattedEndDate);
            startDateObj.setUTCHours(0, 0, 0, 0);
            endDateObj.setUTCHours(23, 59, 59, 999);

            const shops = await ShopModel.find({ platformId, cityId });

            if (shops.length === 0) {
                throw new Error('No se encontraron tiendas para la plataforma y ciudad especificadas.');
            }

            const listProducts = await this.getProductsList(shops[0].listId);
            const orders = await this.getOrders(startDateObj, endDateObj, shops);
            const ordersMap = this.groupOrdersByShopAndDate(orders);

            const worksheet = this.workbook.addWorksheet('Mega Export');
            this.populateWorksheet(worksheet, shops, listProducts, ordersMap, startDateObj, endDateObj);

            return this.workbook;

        } catch (error) {
            console.error(error);
            return error;
        }
    }

    formatDate(dateString) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }

    async getProductsList(listId) {
        return await ListProductModel.find({ listId }).populate('productId');
    }

    async getOrders(startDate, endDate, shops) {
        return await OrderModel.find({
            shop: { $in: shops.map(shop => shop._id) },
            date: { $gte: startDate, $lte: endDate },
        }).populate('orderDetails.product');
    }

    groupOrdersByShopAndDate(orders) {
        const ordersMap = new Map();
        for (const order of orders) {
            const shopId = order.shop.toString();
            const dateKey = order.date.toISOString().split('T')[0];

            if (!ordersMap.has(shopId)) {
                ordersMap.set(shopId, new Map());
            }

            const shopOrders = ordersMap.get(shopId);
            if (!shopOrders.has(dateKey)) {
                shopOrders.set(dateKey, order);
            }
        }
        return ordersMap;
    }

    populateWorksheet(worksheet, shops, listProducts, ordersMap, startDateObj, endDateObj) {
        let currentDate = new Date(startDateObj);
        const dates = [];

        while (currentDate <= endDateObj) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Asegúrate de que las fechas se añadan correctamente
        const dateColumns = dates.length * 7; // Número total de columnas para las fechas y los datos

        for (const shop of shops) {
            worksheet.addRow([`Tienda: ${shop.name}`]);
            worksheet.addRow([`De: ${this.formatDateDisplay(startDateObj)} a ${this.formatDateDisplay(endDateObj)}`]);
            worksheet.addRow(['DESCRIPCIÓN PRODUCTO', '', ...Array(dateColumns).fill('')]);

            this.addHeaders(worksheet, dates);
            this.addRowsForProducts(worksheet, listProducts, shop, ordersMap, dates);
        }
    }

    formatDateDisplay(dateObj) {
        return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    }

    addHeaders(worksheet, dates) {
        const headerRow = [''];
        const subHeaders = [];

        dates.forEach(() => {
            headerRow.push('', ...Array(6).fill(''));
            subHeaders.push('PEDIDO', 'INVENTARIO - INICIAL', 'AVERIA', 'LOTE', 'PEDIDO - RECIBIDO', 'FINAL', 'VENTA');
        });

        // Añadir encabezados de columnas
        worksheet.addRow(headerRow);
        worksheet.addRow(['', ...subHeaders]);

        // Aplicar estilos a los encabezados
        this.applyHeaderStyles(worksheet.lastRow);
        this.applyHeaderStyles(worksheet.getRow(worksheet.lastRow.number - 1));
    }

    applyHeaderStyles(row) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000FF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (colNumber > 1) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            }
        });
    }

    addRowsForProducts(worksheet, listProducts, shop, ordersMap, dates) {
        for (const listProduct of listProducts) {
            const row = [listProduct.productId.name];

            for (let i = 0; i < dates.length; i++) {
                const date = dates[i];
                const {
                    totalPEDI,
                    totalINVE,
                    totalAVER,
                    totalLOTE,
                    totalRECI,
                    totalFINAL,
                    totalVENTA,
                } = this.calculateTotals(shop, listProduct, ordersMap, date, i, dates);

                row.push(totalPEDI, totalINVE, totalAVER, totalLOTE, totalRECI, totalFINAL, totalVENTA);
            }

            const lastRow = worksheet.addRow(row);
            this.applyRowStyles(lastRow);
        }
    }

    calculateTotals(shop, listProduct, ordersMap, date, index, dates) {
        let totalINVE = 0;
        let totalAVER = 0;
        let totalLOTE = 0;
        let totalPEDI = 0;
        let totalRECI = 0;
        let totalFINAL = 0;
        let totalVENTA = 0;

        const shopOrders = ordersMap.get(shop._id.toString());
        const order = shopOrders ? shopOrders.get(date) : null;
        const orderDetail = order
            ? order.orderDetails.find(detail => detail.product._id.toString() === listProduct.productId._id.toString())
            : null;

        if (orderDetail) {
            totalINVE = parseInt(orderDetail.INVE) || 0;
            totalAVER = parseInt(orderDetail.AVER) || 0;
            totalLOTE = parseInt(orderDetail.LOTE) || 0;
            totalPEDI = parseInt(orderDetail.PEDI) || 0;
            totalRECI = parseInt(orderDetail.RECI) || 0;
        }

        const pedidoRecibido = totalRECI > 0 ? totalRECI : totalPEDI;
        totalFINAL = totalINVE + pedidoRecibido - totalAVER;

        let nextDayInventory = 0;
        if (index + 1 < dates.length) {
            const nextDate = dates[index + 1];
            const nextDayOrder = shopOrders ? shopOrders.get(nextDate) : null;
            const nextDayDetail = nextDayOrder
                ? nextDayOrder.orderDetails.find(detail => detail.product._id.toString() === listProduct.productId._id.toString())
                : null;
            nextDayInventory = nextDayDetail ? nextDayDetail.INVE || 0 : 0;
        }
        totalVENTA = totalFINAL - nextDayInventory;

        return { totalPEDI, totalINVE, totalAVER, totalLOTE, totalRECI, totalFINAL, totalVENTA };
    }

    applyRowStyles(row) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    }
}

module.exports = new LargeDataset();