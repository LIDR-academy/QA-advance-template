#!/usr/bin/env node

/**
 * JSON Schema Validation Script
 * Validates data files against JSON schemas using AJV
 * Usage: node validate.mjs <schema-file> <data-file>
 */

import { readFileSync } from 'fs';
import { resolve, relative } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Validates a JSON data file against a JSON schema
 * @param {string} schemaPath - Path to JSON schema file
 * @param {string} dataPath - Path to data file to validate
 * @returns {boolean} - True if validation passes, false otherwise
 */
function validateJSON(schemaPath, dataPath) {
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
    verbose: true,
    validateFormats: true
  });

  addFormats(ajv);

  let schema, data;

  try {
    schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  } catch (error) {
    console.error(`\n❌ Failed to read or parse schema file: ${schemaPath}`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }

  try {
    data = JSON.parse(readFileSync(dataPath, 'utf-8'));
  } catch (error) {
    console.error(`\n❌ Failed to read or parse data file: ${dataPath}`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }

  const relativeSchema = relative(process.cwd(), schemaPath);
  const relativeData = relative(process.cwd(), dataPath);

  console.log(`\n🔍 Validating data against schema...`);
  console.log(`   Schema: ${relativeSchema}`);
  console.log(`   Data:   ${relativeData}\n`);

  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    console.error(`❌ Invalid schema file: ${schemaPath}`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }

  const valid = validate(data);

  if (valid) {
    console.log(`✅ Validation passed!\n`);
    return true;
  }

  console.error(`❌ Validation failed!\n`);
  console.error(`Found ${validate.errors.length} error(s):\n`);

  validate.errors.forEach((error, index) => {
    console.error(`Error #${index + 1}:`);
    console.error(`  Location:    ${error.instancePath || '(root)'}`);
    console.error(`  Schema Path: ${error.schemaPath}`);
    console.error(`  Keyword:     ${error.keyword}`);
    console.error(`  Message:     ${error.message}`);

    if (error.params) {
      const params = Object.entries(error.params)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        })
        .join(', ');
      console.error(`  Params:      ${params}`);
    }

    if (error.data !== undefined) {
      const dataStr = typeof error.data === 'object'
        ? JSON.stringify(error.data, null, 2).split('\n').map(line => `               ${line}`).join('\n').trim()
        : error.data;
      console.error(`  Received:    ${dataStr}`);
    }

    console.error('');
  });

  return false;
}

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('\n❌ Missing required arguments\n');
  console.error('Usage: node validate.mjs <schema-file> <data-file>\n');
  console.error('Example:');
  console.error('  node validate.mjs schemas/bundle.schema.json data/reservations.bundle.json\n');
  process.exit(1);
}

const [schemaFile, dataFile] = args;

const schemaPath = resolve(process.cwd(), schemaFile);
const dataPath = resolve(process.cwd(), dataFile);

const isValid = validateJSON(schemaPath, dataPath);

process.exit(isValid ? 0 : 2);
