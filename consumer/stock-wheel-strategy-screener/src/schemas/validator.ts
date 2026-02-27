import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMAS_DIR = path.resolve(__dirname, '../../agents/schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadSchema(filename: string): object {
  const filepath = path.join(SCHEMAS_DIR, filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

// Pre-load all schemas
const schemas: Record<string, ValidateFunction> = {};

export function getValidator(schemaName: string): ValidateFunction {
  if (!schemas[schemaName]) {
    const schema = loadSchema(schemaName);
    schemas[schemaName] = ajv.compile(schema);
  }
  return schemas[schemaName];
}

export function validate(schemaName: string, data: unknown): { valid: boolean; errors: string[] } {
  const validator = getValidator(schemaName);
  const valid = validator(data);
  if (!valid) {
    const errors = (validator.errors || []).map(
      (e) => `${e.instancePath || '/'}: ${e.message}`
    );
    return { valid: false, errors };
  }
  return { valid: true, errors: [] };
}
