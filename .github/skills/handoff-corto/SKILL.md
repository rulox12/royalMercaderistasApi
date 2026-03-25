---
name: handoff-corto
description: "Create a compact API session handoff to start a fresh chat with minimal tokens. Use for compactar contexto, resumir sesion, cerrar chat y continuar backend."
argument-hint: "Indica el objetivo de backend que quieres continuar"
user-invocable: true
---
# Handoff Corto

## Objetivo
Generar un resumen compacto pero suficiente para abrir un chat nuevo sin perder contexto importante.

## Salida obligatoria
Entregar exactamente estas secciones y nada mas:

1. Objetivo actual (1 linea)
2. Estado actual (max 6 lineas)
3. Archivos clave (max 6 rutas)
4. Decisiones tomadas (max 4 lineas)
5. Pendiente inmediato (max 3 lineas)
6. Primer comando/paso a ejecutar (1 linea)
7. Riesgos o validaciones faltantes (max 3 lineas)

## Reglas
- Maximo 30 lineas totales.
- Priorizar claridad y accion sobre detalle historico.
- Sin historial antiguo que no afecte el siguiente paso.
- Priorizar acciones concretas y verificables.
