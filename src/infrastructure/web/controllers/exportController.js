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

            const {startDate, endDate, platformId} = req.body;
            let {cityId} = req.body;
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            const startDateObj = new Date(formattedStartDate);
            const endDateObj = new Date(formattedEndDate);
            startDateObj.setUTCHours(0, 0, 0, 0);
            endDateObj.setUTCHours(23, 59, 59, 999);

            let requestShop = {platformId};
            if (cityId !== '123') {
                requestShop['cityId'] = cityId;
            }

            const shops = await ShopModel.find(requestShop);

            const listProducts = await ListProductModel.find({listId: shops[0].listId}).populate('productId');

            const sortedProducts = listProducts.sort((a, b) => {
                return a.productId.position - b.productId.position;
            });

            const orders = await OrderModel.find({
                shop: {$in: shops.map(shop => shop._id)}, date: {$gte: startDateObj, $lte: endDateObj},
            }).populate('orderDetails.product');

            const dateRange = generateDateRange(startDateObj, endDateObj);

            const ordersMap = new Map();
            for (const order of orders) {
                const orderDate = new Date(order.date);
                if (orderDate.getUTCDay() === 0) continue; // Si es domingo, ignorar la orden

                const shopId = order.shop.toString();
                const dateKey = orderDate.toISOString().split('T')[0];
                if (!ordersMap.has(shopId)) {
                    ordersMap.set(shopId, new Map());
                }
                const shopOrders = ordersMap.get(shopId);
                if (!shopOrders.has(dateKey)) {
                    shopOrders.set(dateKey, order);
                }
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Mega Export');

            let currentDate = new Date(startDateObj);

            const columnHeaders = ['Producto'];
            const subHeaders = ['PEDIDO', 'INICIAL', 'AVERIA', 'LOTE', 'RECIBIDO', 'FINAL', 'VENTA'];

            dateRange.forEach((date, index) => {
                const startColumn = 2 + index * subHeaders.length;
                const endColumn = startColumn + subHeaders.length - 1;
                worksheet.mergeCells(1, startColumn, 1, endColumn); // Combina celdas para la fecha
                date = new Date(date);

                worksheet.getCell(1, startColumn).value = `${date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    timeZone: 'UTC'
                })} ${date.getUTCDate()} de ${date.toLocaleDateString('es-ES', {
                    month: 'long',
                    timeZone: 'UTC'
                })} de ${date.getUTCFullYear()}`;
                worksheet.getCell(1, startColumn).alignment = {horizontal: 'center', vertical: 'middle'};
                columnHeaders.push(...subHeaders);
            });

            worksheet.addRow(['Producto', ...dateRange.flatMap(() => subHeaders)]); // Añade la segunda fila con sub-encabezados
            worksheet.insertRow(1, columnHeaders); // Añade la primera fila de fechas

            worksheet.getRow(1).eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'FFFFCC00'},
                };
                cell.font = {bold: true, color: {argb: 'FF000000'}};
                cell.border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                    right: {style: 'thin'},
                };
            });

            worksheet.getRow(2).eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'FFD9EAD3'},
                };
                cell.font = {bold: true, color: {argb: 'FF000000'}};
                cell.border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                    right: {style: 'thin'},
                };
            });

            const productDataMap = new Map();

            for (const [shopId, dateMap] of ordersMap.entries()) {
                for (const [date, order] of dateMap.entries()) {
                    for (const orderDetail of order.orderDetails) {
                        const productId = orderDetail.product._id.toString();
                        if (!productDataMap.has(productId)) {
                            productDataMap.set(productId, {
                                product: orderDetail.product.name,
                                data: dateRange.map(() => ({
                                    PEDIDO: 0,
                                    INICIAL: 0,
                                    AVERIA: 0,
                                    LOTE: 0,
                                    RECIBIDO: 0,
                                    FINAL: 0,
                                    VENTA: 0,
                                })),
                            });
                        }

                        const dateIndex = dateRange.indexOf(date);
                        const productData = productDataMap.get(productId);

                        if (dateIndex !== -1) {
                            let nextDayInventory = 0;
                            if (dateIndex + 1 < dateRange.length) {
                                const nextDayOrder = ordersMap.get(shopId)?.get(dateRange[dateIndex + 1]);
                                const nextDayDetail = nextDayOrder?.orderDetails.find(detail => detail.product._id.toString() === productId);
                                nextDayInventory = nextDayDetail ? nextDayDetail.INVE || 0 : 0;
                            }
                            const totalINVE = parseInt(orderDetail.INVE) || 0;
                            const totalAVER = parseInt(orderDetail.AVER) || 0;
                            const totalLOTE = parseInt(orderDetail.LOTE) || 0;
                            const totalPEDI = parseInt(orderDetail.PEDI) || 0;
                            const totalRECI = parseInt(orderDetail.RECI) || 0;

                            const pedidoRecibido = totalRECI > 0 ? totalRECI : totalPEDI;

                            const totalFINAL = totalINVE + pedidoRecibido - totalAVER;

                            productData.data[dateIndex].PEDIDO += totalPEDI;
                            productData.data[dateIndex].INICIAL += totalINVE;
                            productData.data[dateIndex].AVERIA += totalAVER;
                            productData.data[dateIndex].LOTE += totalLOTE;
                            productData.data[dateIndex].RECIBIDO += pedidoRecibido;
                            productData.data[dateIndex].FINAL += totalFINAL;
                            productData.data[dateIndex].VENTA += 0;
                        }
                    }
                }
            }

            productDataMap.forEach(({product, data}) => {
                const row = [product];
                data.forEach(({PEDIDO, INICIAL, AVERIA, LOTE, RECIBIDO, FINAL, VENTA}) => {
                    row.push(PEDIDO, INICIAL, AVERIA, LOTE, RECIBIDO, FINAL, VENTA);
                });
                worksheet.addRow(row);
            });

            const totalRow = Array(columnHeaders.length).fill(0);

            // Iterar sobre cada fila de datos (excepto la fila de encabezados)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1 || rowNumber === 2) return; // Saltamos las filas de encabezados

                row.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        const cellValue = cell.value;
                        const numericValue = parseFloat(cellValue); // Convertir a número si es posible

                        if (!isNaN(numericValue)) {
                            totalRow[colNumber - 1] += numericValue; // Sumamos solo si es un número
                        }
                    }
                });
            });
            const totalRowLabel = 'TOTAL';
            const totalRowData = [totalRowLabel, ...totalRow.slice(1)]; // Agregar la etiqueta de "TOTAL" y luego los valores sumados
            worksheet.addRow(totalRowData);

            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'FFFFCC00'}
                };

                cell.font = {color: {argb: 'FF000000'}};

                cell.border = {
                    top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                };
            });

            const recibidoIndices = [];
            const averiaIndices = [];
            const ventaIndices = [];

            worksheet.getRow(1).eachCell((cell, colNumber) => {
                if (cell.value === 'RECIBIDO') recibidoIndices.push(colNumber);
                else if (cell.value === 'AVERIA') averiaIndices.push(colNumber);
                else if (cell.value === 'VENTA') ventaIndices.push(colNumber);
            });

            function colorColumns(row, columns, color) {
                columns.forEach(colNumber => {
                    const cell = row.getCell(colNumber);
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: color}
                    };

                    cell.font = {color: {argb: 'FF000000'}};

                    cell.border = {
                        top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                    };
                });
            }

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                colorColumns(row, recibidoIndices, 'ffff99');
                colorColumns(row, averiaIndices, 'fabf8f');
                colorColumns(row, ventaIndices, 'ccffcc');
            });

            let averiaColumns = [];
            let pedidoColumns = [];
            let ventaColumns = [];

            for (const shop of shops) {
                const dates = [];

                worksheet.addRow([`Tienda: ${shop.name}`]);
                worksheet.addRow([`De: ${startDate} a ${endDate}`]);

                worksheet.addRow(['DESCRIPCIÓN PRODUCTO', '', ...Array(dates.length * 7).fill('')]);
                currentDate = new Date(startDateObj);

                const headerRow = [''];
                const subHeaders = [];
                while (currentDate <= endDateObj) {
                    if (currentDate.getUTCDay() === 0) {
                        currentDate.setDate(currentDate.getDate() + 1); // Saltar al siguiente día
                        continue;
                    }

                    const formattedDate = `${currentDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        timeZone: 'UTC'
                    })} ${currentDate.getUTCDate()} de ${currentDate.toLocaleDateString('es-ES', {
                        month: 'long',
                        timeZone: 'UTC'
                    })} de ${currentDate.getUTCFullYear()}`;

                    headerRow.push(formattedDate, ...Array(6).fill('')); // Rellenar para ocupar 7 celdas
                    subHeaders.push('PEDIDO', 'INICIAL', 'AVERIA', 'LOTE', 'RECIBIDO', 'FINAL', 'VENTA');

                    const averiaColIndex = headerRow.length - 4;
                    const pedidoColIndex = headerRow.length - 2;
                    const ventaColIndex = headerRow.length;
                    averiaColumns.push(averiaColIndex);
                    pedidoColumns.push(pedidoColIndex);
                    ventaColumns.push(ventaColIndex);
                    dates.push(currentDate.toISOString().split('T')[0]);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                subHeaders.push('PEDIDO', 'INICIAL', 'AVERIA', 'LOTE', 'RECIBIDO', 'FINAL', 'VENTA',);
                const headerRowRef = worksheet.addRow(headerRow);
                const subHeaderRowRef = worksheet.addRow(['', ...subHeaders]);

                headerRowRef.eachCell((cell, colNumber) => {
                    cell.font = {bold: true, color: {argb: 'FFFFFFFF'}};
                    cell.fill = {
                        type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF0000FF'},
                    };
                    cell.alignment = {vertical: 'middle', horizontal: 'center'};

                    if (colNumber > 1) {
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    }
                });

                subHeaderRowRef.eachCell((cell, colNumber) => {
                    cell.font = {bold: true, color: {argb: 'FFFFFFFF'}};
                    cell.fill = {
                        type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF0070C0'},
                    };
                    cell.alignment = {vertical: 'middle', horizontal: 'center'};

                    if (colNumber > 2) {
                        cell.border = {
                            top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'}
                        };
                    }
                });

                const totalsByDate = {};

                for (const listProduct of sortedProducts) {
                    const row = [listProduct.productId.name];
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

                        const pedidoRecibido = totalRECI > 0 ? totalRECI : totalPEDI;

                        totalFINAL = totalINVE + pedidoRecibido - totalAVER;

                        let nextDayInventory = 0;
                        if (i + 1 < dates.length) {
                            const nextDate = dates[i + 1];
                            const nextDayOrder = shopOrders ? shopOrders.get(nextDate) : null;
                            const nextDayDetail = nextDayOrder ? nextDayOrder.orderDetails.find(detail => detail.product._id.toString() === listProduct.productId._id.toString()) : null;
                            nextDayInventory = nextDayDetail ? nextDayDetail.INVE || 0 : 0;
                        }
                        totalVENTA = totalFINAL - nextDayInventory;

                        const rowIndex = worksheet.rowCount + 1;

                        const colTotalINVE = getExcelColumnName(66 - 65 + i * 7 + 2);
                        const colPedidoRecibido = getExcelColumnName(66 - 65 + i * 7 + 5);
                        const colTotalAVER = getExcelColumnName(66 - 65 + i * 7 + 3);
                        const colTotalFinal = getExcelColumnName(66 - 65 + i * 7 + 6);
                        const colTotalNextDayINICIAL = getExcelColumnName(66 - 65 + i * 7 + 9);


                        const formulaTotalFinal = `=${colTotalINVE}${rowIndex}+${colPedidoRecibido}${rowIndex}-${colTotalAVER}${rowIndex}`;
                        const formulaTotalVenta = `=${colTotalFinal}${rowIndex}-${colTotalNextDayINICIAL}${rowIndex}`;

                        row.push(
                            totalPEDI,
                            totalINVE,
                            totalAVER,
                            totalLOTE,
                            pedidoRecibido,
                            {formula: formulaTotalFinal},
                            {formula: formulaTotalVenta},
                        );

                        totalsByDate[date].totalPEDI += totalPEDI;
                        totalsByDate[date].totalINVE += totalINVE;
                        totalsByDate[date].totalAVER += totalAVER;
                        totalsByDate[date].totalLOTE += totalLOTE;
                        totalsByDate[date].totalREC += pedidoRecibido;
                        totalsByDate[date].totalFINAL += totalFINAL;
                        totalsByDate[date].totalVENTA += totalVENTA;
                    }

                    const numberOfDates = dates.length;
                    const lastRowNumber = worksheet.lastRow.number + 1;

                    let sumCellsPedi = [];
                    let sumCellsIni = [];
                    let sumCellsAveria = [];
                    let sumCellsLote = [];
                    let sumCellsRecibido = [];
                    let sumCellsFinal = [];
                    let sumCellsVenta = [];

                    for (let i = 0; i < numberOfDates; i++) {
                        const columnIndex = 2 + (i * 7);

                        const columnLetterPedi = getExcelColumnName(columnIndex);
                        const columnLetterIni = getExcelColumnName(columnIndex + 1);
                        const columnLetterAveria = getExcelColumnName(columnIndex + 2);
                        const columnLetterLote = getExcelColumnName(columnIndex + 3);
                        const columnLetterRecibido = getExcelColumnName(columnIndex + 4);
                        const columnLetterFinal = getExcelColumnName(columnIndex + 5);  // FINAL
                        const columnLetterVenta = getExcelColumnName(columnIndex + 6);  // VENTA

                        sumCellsPedi.push(`${columnLetterPedi}${lastRowNumber}`);
                        sumCellsIni.push(`${columnLetterIni}${lastRowNumber}`);
                        sumCellsAveria.push(`${columnLetterAveria}${lastRowNumber}`);
                        sumCellsLote.push(`${columnLetterLote}${lastRowNumber}`);
                        sumCellsRecibido.push(`${columnLetterRecibido}${lastRowNumber}`);
                        sumCellsFinal.push(`${columnLetterFinal}${lastRowNumber}`);
                        sumCellsVenta.push(`${columnLetterVenta}${lastRowNumber}`);
                    }

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

                    const formulaColumnPediPlusRecibido = `${formulaColumnPedi} + ${formulaColumnRecibido}`;
                    row.push({formula: formulaColumnPediPlusRecibido});

                    worksheet.addRow(row);

                    function applyColumnStyles(row, columns, fillColor) {
                        columns.forEach(colIndex => {
                            const cell = row.getCell(colIndex);
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: {argb: fillColor}
                            };
                            cell.font = {color: {argb: 'FF000000'}}; // Texto en negro
                            cell.border = {
                                top: {style: 'thin'},
                                left: {style: 'thin'},
                                bottom: {style: 'thin'},
                                right: {style: 'thin'}
                            };
                        });
                    }

                    const lastRow = worksheet.lastRow;

                    applyColumnStyles(lastRow, averiaColumns, 'fabf8f');
                    applyColumnStyles(lastRow, pedidoColumns, 'ffff99');
                    applyColumnStyles(lastRow, ventaColumns, 'ccffcc');
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

                worksheet.addRow(rows);
            }

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

const generateDateRange = (startDate, endDate) => {
    const dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        if (currentDate.getUTCDay() !== 0) { // 0 es domingo
            dateArray.push(currentDate.toISOString().split('T')[0]);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
};

module.exports = exportController;
