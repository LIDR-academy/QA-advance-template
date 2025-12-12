# QA End-to-End Testing Framework - Civitatis Exercise

Suite completa de pruebas multicapa para sistema de reservas de actividades turísticas.

## Características

- **Contract Testing** con Karate
- **UI E2E Testing** con WebdriverIO + Cucumber
- **Mutation Testing** con Stryker
- **Property-Based Testing** con fast-check
- **Especificación OpenAPI** completa
- **Modelos de dominio** con TypeScript
- **Playbook automatizado** de ejecución

## Requisitos Previos

- Node.js >= 18
- Java 17+ (para Karate)
- Chrome/Chromium (para tests de UI)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/LIDR-academy/ejercicio-civitatis-qa-.git
cd ejercicio-civitatis-qa-
```

### 2. Instalar dependencias de Node.js

```bash
npm install
```

### 3. Descargar Karate JAR

Descarga la versión 1.4.1 de Karate:

```bash
curl -L -o karate.jar https://github.com/karatelabs/karate/releases/download/v1.4.1/karate-1.4.1.jar
```

O manualmente desde: https://github.com/karatelabs/karate/releases

## Ejecución de Tests

### Playbook Completo (Todos los tests)

```bash
./run-qa-playbook.sh
```

Este comando ejecutará secuencialmente:
1. Contract Tests (Karate)
2. Property-Based Tests
3. Unit Tests
4. Mutation Testing
5. UI E2E Tests (WDIO)
6. Análisis y correlación de resultados

### Tests Individuales

#### Contract Testing (Karate)

```bash
npm run test:karate
# o usando el slash command de Claude Code
/karate
```

#### Property-Based Testing

```bash
npm run test:pbt
# o
/pbt
```

#### Mutation Testing

```bash
npm run mutation
# o
/mutation
```

#### UI E2E Tests

```bash
npm run test:ui
# o
/ui
```

#### Análisis de Reportes

```bash
/analyze
```

## Estructura del Proyecto

```
ejercicio-civitatis-qa-/
├── .claude/
│   └── commands/          # Slash commands de Claude Code
├── karate/
│   └── reservations.feature   # Contract tests
├── openapi/
│   └── reservations.yaml      # Especificación OpenAPI 3.0
├── src/
│   ├── domain/
│   │   └── reservations/      # Domain models
│   └── utils/                 # Utilities (Email, Currency)
├── tests/
│   └── unit/                  # Unit tests
├── quality/
│   ├── pbt.spec.ts           # Property-based tests
│   └── stryker.conf.json     # Mutation testing config
├── wdio/
│   ├── features/             # Cucumber features
│   ├── pages/                # Page objects
│   └── step-definitions/     # Step implementations
├── data/
│   └── reservations.bundle.json  # Test data bundle
└── reports/                  # Generated reports (git-ignored)
```

## Comandos Claude Code

Este proyecto incluye comandos personalizados para Claude Code:

- `/karate` - Ejecuta tests de contrato con Karate
- `/ui` - Ejecuta tests UI con WDIO
- `/pbt` - Ejecuta Property-Based Testing
- `/mutation` - Ejecuta Mutation Testing
- `/bundle` - Genera bundle de datos de prueba
- `/analyze` - Analiza y correlaciona reportes
- `/qaE2E` - Ejecuta el flujo completo de QA

## Reportes

Los reportes se generan en `reports/` después de cada ejecución:

- `reports/karate/` - Reportes HTML de Karate
- `reports/wdio/` - Reportes JUnit de WDIO
- `reports/mutation/` - Reportes de Stryker
- `reports/pbt/` - Resultados de PBT
- `reports/qa-summary.json` - Resumen consolidado

## Servidor Mock

Para desarrollo y testing, puedes usar el servidor mock incluido:

```bash
node server.cjs
```

El servidor correrá en `http://localhost:4010` y simula la API según la especificación OpenAPI.

## Tecnologías

- **Testing Framework**: Jest
- **Contract Testing**: Karate 1.4.1
- **E2E Testing**: WebdriverIO 9.x
- **BDD**: Cucumber
- **Mutation Testing**: Stryker
- **PBT**: fast-check
- **TypeScript**: 5.x
- **API Spec**: OpenAPI 3.0.3

## Documentación Adicional

- [Playbook de Ejecución](./PLAYBOOK_EXECUTION.md)
- [Especificación OpenAPI](./openapi/reservations.yaml)
- [Configuración QA](./QA_EndToEnd_Playbook.yaml)

## Análisis de Calidad

Este proyecto incluye análisis automatizado de inconsistencias entre capas:

- Detección de brechas entre mock y implementación real
- Validación de oráculos en tests
- Identificación de casos límite no cubiertos
- Recomendaciones de mejora prioritarias

Ejecuta `/analyze` para ver el reporte completo.

## Licencia

MIT

## Autor

Proyecto desarrollado como ejercicio de QA End-to-End para LIDR Academy.
