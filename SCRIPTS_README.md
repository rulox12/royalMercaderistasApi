# 📊 Guía de Ejecución de Scripts de Cálculo

Este documento explica cómo ejecutar los scripts para calcular **ventas**, **recibidas** y **rentabilidad** en el proyecto.

## 📋 Requisitos

- Node.js 14+
- MongoDB corriendo y accesible
- Archivo `.env` configurado en la raíz del proyecto con `MONGODB_URI`

## 🚀 Ejecución Rápida

### Usando Make (Recomendado)

Desde la raíz del proyecto:

```bash
# Ver todos los comandos disponibles
make help

# Ejecutar test de ventas (día anterior -2)
make test-sales

# Ejecutar rangos personalizados
make received-range START=2026-01-01 END=2026-02-19
make sales-range START=2026-01-01 END=2026-01-31
make rentability-range START=2026-01-01 END=2026-02-19

# Ejecutar todo en orden (ventas → recibidas → rentabilidad)
make full-process START=2026-01-01 END=2026-02-19
```

### Directamente con Node.js

Si no tienes Make instalado, ejecuta directamente:

```bash
# Cálculo de ventas
node src/scripts/migration/calculateSalesRange.js "2026-01-01" "2026-01-31"

# Cálculo de recibidas
node src/scripts/migration/calculateReceivedRange.js "2026-01-01" "2026-02-19"

# Cálculo de rentabilidad
node src/scripts/migration/calculateRentabilityRange.js "2026-01-01" "2026-02-19"
```

---

## 📅 Scripts Disponibles

### 1️⃣ **Cálculo de Ventas (VENT)**

Calcula la cantidad de productos vendidos por día.

**Fórmula:** `VENT = INVE_inicial - AVER - INVE_final + RECI`

#### Uso:
```bash
# Con Make
make sales-range START=2026-01-01 END=2026-01-31

# Directamente
node src/scripts/migration/calculateSalesRange.js "2026-01-01" "2026-01-31"
```

#### Ejemplo Real:
```bash
# Calcular ventas de enero completo (2026)
make sales-range START=2026-01-01 END=2026-01-31
```

---

### 2️⃣ **Cálculo de Recibidas (RECI)**

Actualiza la cantidad de productos recibidos/ingresados por tienda.

**Nota:** Se ejecuta después de ventas para reflejar el inventario actualizado.

#### Uso:
```bash
# Con Make
make received-range START=2026-01-01 END=2026-02-19

# Directamente
node src/scripts/migration/calculateReceivedRange.js "2026-01-01" "2026-02-19"
```

#### Ejemplo Real:
```bash
# Calcular recibidas de enero a 19 de febrero
make received-range START=2026-01-01 END=2026-02-19
```

---

### 3️⃣ **Cálculo de Rentabilidad (RENT)**

Calcula la ganancia por producto vendido.

**Fórmula:** `RENT = (salePrice - cost) × VENT`

#### Uso:
```bash
# Con Make
make rentability-range START=2026-01-01 END=2026-02-19

# Directamente
node src/scripts/migration/calculateRentabilityRange.js "2026-01-01" "2026-02-19"
```

#### Ejemplo Real:
```bash
# Calcular rentabilidad de enero a 19 de febrero
make rentability-range START=2026-01-01 END=2026-02-19
```

---

## 🔄 Ejecución Completa (Recomendado)

Para calcular **ventas, recibidas y rentabilidad** en el orden correcto:

```bash
make full-process START=2026-01-01 END=2026-02-19
```

Esto ejecuta automáticamente:
1. Cálculo de ventas
2. Cálculo de recibidas
3. Cálculo de rentabilidad

---

## 📝 Ejemplos Prácticos

### Ejemplo 1: Calcular enero completo
```bash
make january-sales
make january-received
make january-rentability
```

O en un solo comando:
```bash
make full-process START=2026-01-01 END=2026-01-31
```

### Ejemplo 2: Calcular rango personalizado
```bash
# Calcular desde 1 de diciembre 2025 hasta 28 de febrero 2026
make full-process START=2025-12-01 END=2026-02-28
```

### Ejemplo 3: Solo ventas de un rango
```bash
make sales-range START=2026-02-10 END=2026-02-19
```

---

## ⚠️ Formatos Obligatorios

Todos los scripts usan el formato de fecha **YYYY-MM-DD**:

| Correcto | Incorrecto |
|----------|-----------|
| `2026-01-15` | `15-01-2026` |
| `2026-02-01` | `02/01/2026` |
| `2025-12-31` | `31/12/2025` |

---

## 🧪 Test Scripts (Día Anterior)

Para probar el cálculo del día anterior (-2 para ventas/rentabilidad, -1 para recibidas):

```bash
make test-sales      # Prueba ventas día -2
make test-received   # Prueba recibidas día -1
make test-rentability # Prueba rentabilidad día -2
```

O directamente:
```bash
node src/scripts/Job/testRunJobSales.js
node src/scripts/Job/testRunJobReceived.js
node src/scripts/Job/testRunJobRetability.js
```

---

## 🔍 Salida Esperada

Cuando ejecutas un script, verás algo como:

```
📈 Calculando ventas desde 2026-01-01 hasta 2026-01-31...
🏪 Tiendas a procesar: 5

🗓️  Procesando 2026-01-01...
  ✅ Ventas calculadas para tienda 65b53be6a7800ae2f947a5bb
  ✅ Ventas calculadas para tienda 65b53be6a7800ae2f947a5bc
  ...

🎉 Cálculo de ventas completado: 155 éxitos, 0 errores
```

---

## ❌ Solución de Problemas

### "MONGODB_URI no definido"
Asegúrate de que `.env` existe en la raíz y contiene:
```env
MONGODB_URI=mongodb://localhost:27017/test
```

### "Fecha inválida"
Verifica que uses formato **YYYY-MM-DD**:
```bash
# ❌ Incorrecto
make sales-range START=01-01-2026 END=01-31-2026

# ✅ Correcto
make sales-range START=2026-01-01 END=2026-01-31
```

### "No se encontró la orden"
Es normal si no hay datos para ese día/tienda. El script reportará:
```
⚠️ Error en tienda XXX: No se encontró la orden para la tienda y fecha indicadas.
```

---

## 📊 Diagrama de Flujo

```
START
  │
  ├─→ [1] Cálculo de VENTAS (VENT)
  │       └─→ VENT = INVE_inicial - AVER - INVE_final + RECI
  │
  ├─→ [2] Cálculo de RECIBIDAS (RECI)
  │       └─→ RECI = actualización de inventario recibido
  │
  ├─→ [3] Cálculo de RENTABILIDAD (RENT)
  │       └─→ RENT = (salePrice - cost) × VENT
  └─→ END
```

---

## 💡 Tips

- **Ejecuta en orden:** Primero ventas, luego recibidas, luego rentabilidad
- **Reutiliza comandos:** Guarda los comandos frecuentes en un script bash
- **Monitorea progreso:** La salida muestra éxitos y errores en tiempo real
- **Rango amplio:** Puedes calcular meses enteros sin problema; solo tardará más

---

## 📞 Soporte

Si tienes preguntas o errores, verifica:
1. Conexión a MongoDB (`MONGODB_URI` correcta)
2. Formato de fechas (YYYY-MM-DD)
3. Permisos en el directorio de proyecto
4. Versión de Node.js (14+)

