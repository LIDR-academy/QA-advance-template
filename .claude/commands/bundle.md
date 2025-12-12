---
description: 🧠 Genera el bundle de datos validados desde el contrato OpenAPI.
---

A partir del archivo de contrato OpenAPI ubicado en openapi/reservations.yaml,
genera un bundle JSON con al menos 6 casos (éxito, duplicado, payload grande,
validación, límites de amount).
Aplica reglas del schema:
  - currency: /^[A-Z]{3}$/
  - amount ≥ 0
  - adults ≥ 1
  - children ≥ 0
  - email válido
Devuelve el bundle en formato JSON y guárdalo en data/reservations_bundle.json.
Valida el schema con AJV y marca los casos inválidos.
