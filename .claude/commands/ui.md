---
description: 💻 Ejecuta la suite WDIO + Cucumber para validar oráculos multicapa.
---

Corre WebdriverIO con TypeScript usando la configuración en wdio/wdio.conf.ts.
Ejecuta el feature wdio/features/reservation.feature con step-definitions.
Asegúrate de:
  - Activar intercept de red con CDP para POST /reservations.
  - Validar expected.network.status, expected.ui.toast y expected.state.listDelta.
Guarda el reporte en quality/reports/wdio/ y genera resumen en Markdown.
