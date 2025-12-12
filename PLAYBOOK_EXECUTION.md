# QA Playbook Execution Guide

## Ejecución Automática (Sin Intervención)

Para ejecutar el playbook completo de QA sin paradas ni intervención manual, usa el script automatizado:

```bash
./run-qa-playbook.sh
```

Este script ejecutará automáticamente todos los pasos del playbook:
1. ✅ Inicia el servidor mock (Prism)
2. ✅ Valida el bundle de datos de prueba
3. ✅ Ejecuta tests de contrato (Karate)
4. ✅ Ejecuta tests E2E UI (WebDriverIO)
5. ✅ Ejecuta mutation testing (Stryker)
6. ✅ Ejecuta property-based testing (fast-check)
7. ✅ Analiza y correlaciona todos los resultados
8. ✅ Limpia y detiene servidores

### Salida del Script

El script proporciona:
- Mensajes de progreso con colores para cada paso
- Resumen final de resultados
- Reporte completo en `reports/findings.md`
- Logs detallados en `logs/`

### Tiempo de Ejecución

- **Modo Normal**: ~1-2 minutos
- **Con Mutation Testing completo**: ~9 segundos (optimizado)

## Ejecución Manual (Paso a Paso)

Si prefieres ejecutar cada paso manualmente, sigue estos comandos:

### 1. Iniciar Servidores

```bash
# Mock server
npx prism mock openapi/reservations.yaml --port 4010 --host 127.0.0.1 &

# Web server para UI tests
node server.cjs &
```

### 2. Validar Datos

```bash
npm run validate:bundle
```

### 3. Tests de Contrato (Karate)

```bash
java -jar karate.jar --configdir karate karate/reservations.feature --output reports/karate
```

### 4. Tests UI (WebDriverIO)

```bash
BASE_URL=http://127.0.0.1:4010 npx wdio run wdio/wdio.conf.ts
```

### 5. Mutation Testing

```bash
npm run mutation
```

### 6. Property-Based Testing

```bash
npm run test:pbt
```

### 7. Limpieza

```bash
pkill -f 'prism mock'
pkill -f 'node server.cjs'
rm -f .env.mock
```

## Optimizaciones de Performance

### Property-Based Testing

Los tests PBT están configurados para ajustar automáticamente el número de ejecuciones según el contexto:

- **Modo Normal**: 100 runs por property (validación exhaustiva)
- **Modo Mutation Testing**: 5 runs por property (validación rápida)

Esto se detecta automáticamente mediante la variable de entorno `STRYKER=true`.

### Configuración

La configuración de runs está en `quality/pbt.spec.ts`:

```typescript
const NUM_RUNS = {
  standard: isMutationTesting ? 5 : 100,
  medium: isMutationTesting ? 5 : 50,
  small: isMutationTesting ? 3 : 30,
};
```

### Resultados

Con estas optimizaciones:
- ⚡ Mutation testing: 9 segundos (antes: timeout)
- 📊 Mutation score: 95.16%
- ✅ Todos los tests pasan correctamente

## Troubleshooting

### Puerto 4010 ocupado

```bash
lsof -ti:4010 | xargs kill
```

### Puerto 8080 ocupado

```bash
lsof -ti:8080 | xargs kill
```

### Logs detallados

Todos los logs están en `logs/`:
- `prism.log` - Servidor mock
- `karate-run.log` - Tests Karate
- `wdio-execution.log` - Tests WDIO
- `stryker-run.log` - Mutation testing
- `pbt-execution.log` - Property-based testing

## Integración CI/CD

Para integrar en CI/CD, simplemente ejecuta:

```bash
./run-qa-playbook.sh
```

El script retorna código de salida 0 si todo pasa correctamente.

### Variables de Entorno Opcionales

```bash
PBT_MODE=NIGHTLY PBT_SEED=42 ./run-qa-playbook.sh
```

- `PBT_MODE`: PR | NIGHTLY (default: PR)
- `PBT_SEED`: Seed para reproducibilidad (default: 42)
