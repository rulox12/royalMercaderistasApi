const ExportGenericUseCase = require('../../../application/useCases/export/exportGeneric');
const ExportAllShops = require('../../../application/useCases/export/exportAllShops');
const LargeDataset = require('../../../application/useCases/export/largeDataset')
const ExcelJS = require('exceljs');
const ShopModel = require("../../../infrastructure/persistence/models/ShopModel");
const ListProductModel = require("../../../infrastructure/persistence/models/ListProductModel");
const OrderModel = require("../../../infrastructure/persistence/models/OrderModel");

const exportController = {
    genericExport: async (req, res) => {
        try {
            const {startDate, endDate, orderDetailToExport, city} = req.body;

            if (!startDate || !endDate || !orderDetailToExport || !city) {
                return res.status(400).json({error: 'Todos los campos son obligatorios: startDate, endDate, orderDetailToExport, city'});
            }

            const filePath = await ExportGenericUseCase.execute(startDate, endDate, orderDetailToExport, city);

            res.sendFile(filePath);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    allShopsExport: async (req, res) => {
        try {
            const {startDate, endDate, orderDetailToExport, city} = req.body;

            if (!startDate || !endDate || !orderDetailToExport || !city) {
                return res.status(400).json({error: 'Todos los campos son obligatorios: startDate, endDate, orderDetailToExport, city'});
            }

            const filePath = await ExportAllShops.execute(startDate, endDate, orderDetailToExport, city);

            res.sendFile(filePath);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },


    largeDataset: async (req, res) => {
        try {
            const formatDate = (dateString) => {
                const [day, month, year] = dateString.split('/');
                return `${year}-${month}-${day}`;
            };

            const {startDate, endDate, platformId, cityId} = req.body;
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            const startDateObj = new Date(formattedStartDate);
            const endDateObj = new Date(formattedEndDate);
            startDateObj.setUTCHours(0, 0, 0, 0);
            endDateObj.setUTCHours(23, 59, 59, 999);

            // Obtener tiendas de la plataforma
            const shops = await ShopModel.find({platformId, cityId});

            // Obtener la lista de productos una sola vez
            const listProducts = await ListProductModel.find({listId: shops[0].listId})
                .populate('productId');

            // Ordenar por 'productId.position' en orden descendente
            const sortedProducts = listProducts.sort((a, b) => {
                return a.productId.position - b.productId.position;
            });

            // Obtener todas las órdenes de una vez
            const orders = await OrderModel.find({
                shop: {$in: shops.map(shop => shop._id)}, date: {$gte: startDateObj, $lte: endDateObj},
            }).populate('orderDetails.product');

            // Agrupar las órdenes por tienda y fecha
            const ordersMap = new Map();
            for (const order of orders) {
                const shopId = order.shop.toString();
                const dateKey = order.date.toISOString().split('T')[0]; // "yyyy-mm-dd"
                if (!ordersMap.has(shopId)) {
                    ordersMap.set(shopId, new Map());
                }
                const shopOrders = ordersMap.get(shopId);
                if (!shopOrders.has(dateKey)) {
                    shopOrders.set(dateKey, order);
                }
            }

            // Configurar Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Mega Export');

            // Crear cabeceras para las tiendas y fechas
            let currentDate = new Date(startDateObj);

            // Array para almacenar las posiciones de las columnas de "AVERIA"
            let averiaColumns = [];
            let pedidoColumns = [];
            let ventaColumns = [];

            // Construir las filas del Excel para cada tienda
            for (const shop of shops) {
                const dates = [];

                worksheet.addRow([`Tienda: ${shop.name}`]); // Primera fila con el nombre del local
                worksheet.addRow([`De: ${startDate} a ${endDate}`]); // Segunda fila con el rango de fechas

                // Cabecera "Descripción del Producto"
                worksheet.addRow(['DESCRIPCIÓN PRODUCTO', '', ...Array(dates.length * 7).fill('')]);
                currentDate = new Date(startDateObj);

                // Mientras recorremos las fechas, las agregamos a la cabecera
                const headerRow = [''];
                const subHeaders = [];
                while (currentDate <= endDateObj) {
                    const formattedDate = `${currentDate.toLocaleDateString('es-ES', {weekday: 'long'})} ${currentDate.getDate()} de ${currentDate.toLocaleDateString('es-ES', {month: 'long'})} de ${currentDate.getFullYear()}`;

                    headerRow.push(formattedDate, ...Array(6).fill('')); // Rellenar para ocupar 7 celdas
                    subHeaders.push('PEDIDO', 'INICIAL', 'AVERIA', 'LOTE', 'RECIBIDO', 'FINAL', 'VENTA');

                    // Identificar la posición de la columna "AVERIA"
                    const averiaColIndex = headerRow.length - 4;
                    const pedidoColIndex = headerRow.length - 2; // "AVERIA" es la segunda subcabecera
                    const ventaColIndex = headerRow.length; // "AVERIA" es la segunda subcabecera
                    averiaColumns.push(averiaColIndex); // Guardar el índice de la columna de "AVERIA"
                    pedidoColumns.push(pedidoColIndex); // Guardar el índice de la columna de "PEDI"
                    ventaColumns.push(ventaColIndex); // Guardar el índice de la columna de "VENTA"

                    dates.push(currentDate.toISOString().split('T')[0]); // Guardar solo la parte de la fecha
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Agregar las cabeceras al worksheet
                const headerRowRef = worksheet.addRow(headerRow);
                const subHeaderRowRef = worksheet.addRow(['', ...subHeaders]);

                // Aplicar estilos a la fila de cabeceras y subcabeceras
                headerRowRef.eachCell((cell, colNumber) => {
                    cell.font = {bold: true, color: {argb: 'FFFFFFFF'}}; // Texto en blanco
                    cell.fill = {
                        type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF0000FF'}, // Fondo azul
                    };
                    cell.alignment = {vertical: 'middle', horizontal: 'center'}; // Alinear al centro

                    // Aplicar bordes para enmarcar cada fecha
                    if (colNumber > 1) { // Saltar las primeras celdas vacías si es necesario
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    }
                });

                subHeaderRowRef.eachCell((cell, colNumber) => {
                    cell.font = {bold: true, color: {argb: 'FFFFFFFF'}}; // Texto en blanco
                    cell.fill = {
                        type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF0070C0'}, // Fondo azul más claro
                    };
                    cell.alignment = {vertical: 'middle', horizontal: 'center'}; // Alinear al centro

                    // Aplicar bordes para enmarcar cada subcabecera
                    if (colNumber > 2) { // Saltar las primeras celdas vacías si es necesario
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    }
                });

                const totalsByDate = {};

                for (const listProduct of sortedProducts) {

                    const row = [listProduct.productId.name]; // Descripción del producto

                    for (let i = 0; i < dates.length; i++) {
                        const date = dates[i];

                        if (!totalsByDate[date]) {
                            totalsByDate[date] = {
                                totalPEDI: 0,
                                totalINVE: 0,
                                totalAVER: 0,
                                totalLOTE: 0,
                                totalREC: 0,
                                totalFINAL: 0,
                                totalVENTA: 0
                            };
                        }

                        let totalINVE = 0;
                        let totalAVER = 0;
                        let totalLOTE = 0;
                        let totalPEDI = 0;
                        let totalRECI = 0;
                        let totalFINAL = 0;
                        let totalVENTA = 0;

                        const shopOrders = ordersMap.get(shop._id.toString());
                        const order = shopOrders ? shopOrders.get(date) : null;

                        const orderDetail = order ? order.orderDetails.find(detail => detail.product._id.toString() === listProduct.productId._id.toString()) : null;
                        if (orderDetail) {
                            totalINVE = parseInt(orderDetail.INVE) || 0;
                            totalAVER = parseInt(orderDetail.AVER) || 0;
                            totalLOTE = parseInt(orderDetail.LOTE) || 0;
                            totalPEDI = parseInt(orderDetail.PEDI) || 0;
                            totalRECI = parseInt(orderDetail.RECI) || 0;
                        }

                        // Calcular "PEDIDO - RECIBIDO"
                        const pedidoRecibido = totalRECI > 0 ? totalRECI : totalPEDI;

                        // Calcular "FINAL"
                        totalFINAL = totalINVE + pedidoRecibido - totalAVER;

                        // Calcular "VENTA"
                        let nextDayInventory = 0;
                        if (i + 1 < dates.length) {
                            const nextDate = dates[i + 1];
                            const nextDayOrder = shopOrders ? shopOrders.get(nextDate) : null;
                            const nextDayDetail = nextDayOrder ? nextDayOrder.orderDetails.find(detail => detail.product._id.toString() === listProduct.productId._id.toString()) : null;
                            nextDayInventory = nextDayDetail ? nextDayDetail.INVE || 0 : 0;
                        }
                        totalVENTA = totalFINAL - nextDayInventory;

                        row.push(totalPEDI, totalINVE, totalAVER, totalLOTE, pedidoRecibido, totalFINAL, totalVENTA);

                        totalsByDate[date].totalPEDI += totalPEDI;
                        totalsByDate[date].totalINVE += totalINVE;
                        totalsByDate[date].totalAVER += totalAVER;
                        totalsByDate[date].totalLOTE += totalLOTE;
                        totalsByDate[date].totalREC += pedidoRecibido;
                        totalsByDate[date].totalFINAL += totalFINAL;
                        totalsByDate[date].totalVENTA += totalVENTA;
                    }

                    // Suponiendo que ya tienes el número de fechas
                    // Suponiendo que ya tienes el número de fechas
                    const numberOfDates = dates.length; // Asegúrate de que 'dates' tenga las fechas correctas
                    const lastRowNumber = worksheet.lastRow.number + 1; // Número de la fila donde se insertará la fórmula

                    // Inicializar un array para almacenar las referencias de las celdas
                    let sumCellsPedi = [];
                    let sumCellsIni = [];
                    let sumCellsAveria = [];
                    let sumCellsLote = [];
                    let sumCellsRecibido = [];
                    let sumCellsFinal = [];
                    let sumCellsVenta = [];

                    // Iterar para construir la referencia de celdas que se sumarán
                    for (let i = 0; i < numberOfDates; i++) {
                        const columnIndex = 2 + (i * 7); // 2 es el índice de la primera columna (PEDIDO)

                        // Obtenemos la letra de cada columna correspondiente a cada dato
                        const columnLetterPedi = getExcelColumnName(columnIndex);       // PEDIDO
                        const columnLetterIni = getExcelColumnName(columnIndex + 1);    // INICIAL
                        const columnLetterAveria = getExcelColumnName(columnIndex + 2); // AVERIA
                        const columnLetterLote = getExcelColumnName(columnIndex + 3);   // LOTE
                        const columnLetterRecibido = getExcelColumnName(columnIndex + 4); // RECIBIDO
                        const columnLetterFinal = getExcelColumnName(columnIndex + 5);  // FINAL
                        const columnLetterVenta = getExcelColumnName(columnIndex + 6);  // VENTA

                        // Guardar las referencias de celdas que se usarán en la fórmula de suma
                        sumCellsPedi.push(`${columnLetterPedi}${lastRowNumber}`);
                        sumCellsIni.push(`${columnLetterIni}${lastRowNumber}`);
                        sumCellsAveria.push(`${columnLetterAveria}${lastRowNumber}`);
                        sumCellsLote.push(`${columnLetterLote}${lastRowNumber}`);
                        sumCellsRecibido.push(`${columnLetterRecibido}${lastRowNumber}`);
                        sumCellsFinal.push(`${columnLetterFinal}${lastRowNumber}`);
                        sumCellsVenta.push(`${columnLetterVenta}${lastRowNumber}`);
                    }

                    // Crear las fórmulas de suma para cada columna
                    const formulaColumnPedi = `SUM(${sumCellsPedi.join(', ')})`;
                    const formulaColumnIni = `SUM(${sumCellsIni.join(', ')})`;
                    const formulaColumnAveria = `SUM(${sumCellsAveria.join(', ')})`;
                    const formulaColumnLote = `SUM(${sumCellsLote.join(', ')})`;
                    const formulaColumnRecibido = `SUM(${sumCellsRecibido.join(', ')})`;
                    const formulaColumnFinal = `SUM(${sumCellsFinal.join(', ')})`;
                    const formulaColumnVenta = `SUM(${sumCellsVenta.join(', ')})`;


                    row.push({formula: formulaColumnPedi});
                    row.push({formula: formulaColumnIni});
                    row.push({formula: formulaColumnAveria});
                    row.push({formula: formulaColumnLote});
                    row.push({formula: formulaColumnRecibido});
                    row.push({formula: formulaColumnFinal});
                    row.push({formula: formulaColumnVenta});

                    worksheet.addRow(row);

                    // Aplicar el color de fondo y formato a las columnas de "AVERIA"
                    const lastRow = worksheet.lastRow;
                    averiaColumns.forEach(colIndex => {
                        const cell = lastRow.getCell(colIndex);
                        cell.fill = {
                            type: 'pattern', pattern: 'solid', fgColor: {argb: 'fabf8f'}, // Naranja claro
                        };
                        cell.font = {color: {argb: 'FF000000'}}; // Texto en negro

                        // Aplicar bordes a las celdas
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    });

                    pedidoColumns.forEach(colIndex => {
                        const cell = lastRow.getCell(colIndex);
                        cell.fill = {
                            type: 'pattern', pattern: 'solid', fgColor: {argb: 'ffff99'}, // Naranja claro
                        };
                        cell.font = {color: {argb: 'FF000000'}}; // Texto en negro

                        // Aplicar bordes a las celdas
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    });

                    ventaColumns.forEach(colIndex => {
                        const cell = lastRow.getCell(colIndex);
                        cell.fill = {
                            type: 'pattern', pattern: 'solid', fgColor: {argb: 'ccffcc'}, // Naranja claro
                        };
                        cell.font = {color: {argb: 'FF000000'}}; // Texto en negro

                        // Aplicar bordes a las celdas
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    });
                }
                const rows = ['TOTAL'];

                for (const date in totalsByDate) {
                    const totals = totalsByDate[date];


                    const row = [
                        totals.totalPEDI,
                        totals.totalINVE,
                        totals.totalAVER,
                        totals.totalLOTE,
                        totals.totalREC,
                        totals.totalFINAL,
                        totals.totalVENTA
                    ];

                    rows.push(...row);
                }

                console.log(rows);

                worksheet.addRow(rows);
            }

            // Enviar el archivo Excel
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=mega_export.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).send('Error en el mega exporte');
        }
    }
};

function getExcelColumnName(columnIndex) {
    let columnName = '';
    while (columnIndex > 0) {
        const remainder = (columnIndex - 1) % 26;
        columnName = String.fromCharCode(65 + remainder) + columnName;
        columnIndex = Math.floor((columnIndex - 1) / 26);
    }
    return columnName;
}

module.exports = exportController;
