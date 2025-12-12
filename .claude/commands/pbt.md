---
description: 🔄 Ejecuta Property-Based Testing con fast-check.
---

Corre pruebas de propiedades definidas en quality/pbt/*.spec.ts.
Usa fast-check con seeds deterministas en PR y aleatorias en nightly.
Propiedades esperadas:
  - adults siempre ≥ 1
  - currency siempre 3 letras
  - amount nunca negativo
Muestra un resumen de combinaciones ejecutadas y violaciones detectadas.
Guarda resultados en quality/reports/pbt-findings.md.
