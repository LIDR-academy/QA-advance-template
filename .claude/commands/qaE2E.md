---
description: 🚀 Ejecuta todo el flujo QA End-to-End con IA orquestada.
---

Ejecuta el playbook QA_EndToEnd_Playbook.yaml paso a paso:
  1. 🧩 mock-manager → inicia mock server (Prism)
  2. 🧠 data-curator → genera y valida el bundle
  3. ⚙ contract-runner → corre Karate
  4. 💻 ui-runner → corre WDIO
  5. 🔬 mutation-runner → ejecuta Stryker
  6. 🔄 pbt-runner → ejecuta fast-check
  7. 📊 qa-analyzer → correlaciona resultados
Resume métricas finales:
  - Éxitos / fallos
  - Mutation score
  - Casos PBT detectados
  - Recomendaciones del QA Analyzer