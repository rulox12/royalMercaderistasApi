.PHONY: help sales received rentability sales-range received-range rentability-range fill-prices clean

help:
	@echo "📋 Scripts disponibles para calcular ventas, recibidas y rentabilidad"
	@echo ""
	@echo "🎯 JOBS DIARIOS (automatizados):"
	@echo "  make test-sales              Prueba cálculo de ventas (día anterior -2)"
	@echo "  make test-received           Prueba cálculo de recibidas (día anterior -1)"
	@echo "  make test-rentability        Prueba cálculo de rentabilidad (día anterior -2)"
	@echo ""
	@echo "📅 CÁLCULOS POR RANGO (manual):"
	@echo "  make sales-range START=2026-01-01 END=2026-01-31"
	@echo "  make received-range START=2026-01-01 END=2026-02-19"
	@echo "  make rentability-range START=2026-01-01 END=2026-02-19"
	@echo "  make fill-prices START=2026-01-01 END=2026-01-31    # Rellena cost/salePrice faltantes"
	@echo ""
	@echo "🔄 EJEMPLOS DE USO:"
	@echo "  # Calcular ventas de enero completo"
	@echo "  make sales-range START=2026-01-01 END=2026-01-31"
	@echo ""
	@echo "  # Calcular recibidas de enero a 19 de febrero"
	@echo "  make received-range START=2026-01-01 END=2026-02-19"
	@echo ""
	@echo "  # Calcular rentabilidad del mismo rango"
	@echo "  make rentability-range START=2026-01-01 END=2026-02-19"
	@echo ""
	@echo "  # Rellenar precios faltantes de enero"
	@echo "  make fill-prices START=2026-01-01 END=2026-01-31"
	@echo ""
	@echo "⚠️  IMPORTANTE: Define START y END en formato YYYY-MM-DD"
	@echo ""

# Test jobs (single day, day-2 from today)
test-sales:
	@echo "🧪 Probando cálculo de ventas (día -2)..."
	node src/scripts/Job/testRunJobSales.js

test-received:
	@echo "🧪 Probando cálculo de recibidas (día -1)..."
	node src/scripts/Job/testRunJobReceived.js

test-rentability:
	@echo "🧪 Probando cálculo de rentabilidad (día -2)..."
	node src/scripts/Job/testRunJobRetability.js

# Range calculations
sales-range:
	@if [ -z "$(START)" ] || [ -z "$(END)" ]; then \
		echo "❌ Error: especifica START y END"; \
		echo "Uso: make sales-range START=2026-01-01 END=2026-01-31"; \
		exit 1; \
	fi
	@echo "📈 Calculando ventas desde $(START) hasta $(END)..."
	node src/scripts/migration/calculateSalesRange.js "$(START)" "$(END)"

received-range:
	@if [ -z "$(START)" ] || [ -z "$(END)" ]; then \
		echo "❌ Error: especifica START y END"; \
		echo "Uso: make received-range START=2026-01-01 END=2026-02-19"; \
		exit 1; \
	fi
	@echo "📦 Calculando recibidas desde $(START) hasta $(END)..."
	node src/scripts/migration/calculateReceivedRange.js "$(START)" "$(END)"

rentability-range:
	@if [ -z "$(START)" ] || [ -z "$(END)" ]; then \
		echo "❌ Error: especifica START y END"; \
		echo "Uso: make rentability-range START=2026-01-01 END=2026-02-19"; \
		exit 1; \
	fi
	@echo "💰 Calculando rentabilidad desde $(START) hasta $(END)..."
	node src/scripts/migration/calculateRentabilityRange.js "$(START)" "$(END)"

# Shortcuts for common ranges
january-sales:
	@echo "📈 Calculando ventas de enero 2026..."
	node src/scripts/migration/calculateSalesRange.js "2026-01-01" "2026-01-31"

january-received:
	@echo "📦 Calculando recibidas de enero a 19 febrero..."
	node src/scripts/migration/calculateReceivedRange.js "2026-01-01" "2026-02-19"

january-rentability:
	@echo "💰 Calculando rentabilidad de enero a 19 febrero..."
	node src/scripts/migration/calculateRentabilityRange.js "2026-01-01" "2026-02-19"

# Full process (all three in order)
full-process:
	@if [ -z "$(START)" ] || [ -z "$(END)" ]; then \
		echo "❌ Error: especifica START y END"; \
		echo "Uso: make full-process START=2026-01-01 END=2026-02-19"; \
		exit 1; \
	fi
	@echo "🚀 Iniciando proceso completo (ventas → recibidas → rentabilidad)..."
	@echo "📅 Rango: $(START) a $(END)"
	node src/scripts/migration/calculateSalesRange.js "$(START)" "$(END)" && \
	node src/scripts/migration/calculateReceivedRange.js "$(START)" "$(END)" && \
	node src/scripts/migration/calculateRentabilityRange.js "$(START)" "$(END)"

# Fill missing prices (cost and salePrice from ListProduct)
fill-prices:
	@if [ -z "$(START)" ] || [ -z "$(END)" ]; then \
		echo "❌ Error: especifica START y END"; \
		echo "Uso: make fill-prices START=2026-01-01 END=2026-01-31"; \
		exit 1; \
	fi
	@echo "💰 Rellenando precios faltantes desde $(START) hasta $(END)..."
	node src/scripts/migration/fillMissingPrices.js "$(START)" "$(END)"

clean:
	@echo "🧹 Limpiando logs y archivos temporales..."
	rm -f *.log

.PHONY: full-process
