import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit', '<rootDir>/quality'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__mocks__/**'],
  coverageDirectory: 'reports/coverage-unit',
};

export default config;
