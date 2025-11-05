import Ajv, { ErrorObject } from 'ajv';
import { X402Schema, SchemaField } from '@/types/service';

const ajv = new Ajv({ allErrors: true });

/**
 * Convert x402 bodyFields format to JSON Schema
 */
export function convertToJSONSchema(bodyFields: Record<string, SchemaField>): object {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  Object.entries(bodyFields).forEach(([key, field]) => {
    properties[key] = {
      type: field.type,
      description: field.description
    };

    if (field.enum) properties[key].enum = field.enum;
    if (field.default !== undefined) properties[key].default = field.default;
    if (field.minLength) properties[key].minLength = field.minLength;
    if (field.maxLength) properties[key].maxLength = field.maxLength;
    if (field.minimum !== undefined) properties[key].minimum = field.minimum;
    if (field.maximum !== undefined) properties[key].maximum = field.maximum;
    if (field.pattern) properties[key].pattern = field.pattern;
    if (field.format) properties[key].format = field.format;

    if (field.required) {
      required.push(key);
    }
  });

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false
  };
}

/**
 * Validate input data against schema
 */
export function validateInput(
  data: any,
  schema: X402Schema['input']
): { valid: boolean; errors: ErrorObject[] } {
  if (!schema.bodyFields && !schema.queryParams) {
    return { valid: true, errors: [] };
  }

  const fields = schema.bodyFields || schema.queryParams || {};
  const jsonSchema = convertToJSONSchema(fields);

  const validate = ajv.compile(jsonSchema);
  const valid = validate(data);

  return {
    valid,
    errors: validate.errors || []
  };
}

/**
 * Validate output data against schema
 */
export function validateOutput(
  data: any,
  schema: any
): { valid: boolean; errors: ErrorObject[] } {
  if (!schema) {
    return { valid: true, errors: [] };
  }

  // If schema is already JSON Schema format
  if (schema.type || schema.properties) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return {
      valid,
      errors: validate.errors || []
    };
  }

  // If schema is simple object format (like { message: "string", ... })
  // Convert to JSON Schema
  const properties: Record<string, any> = {};

  Object.entries(schema).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Handle "string | null" format
      const types = (value as string).split('|').map(t => t.trim());
      if (types.length > 1) {
        properties[key] = {
          anyOf: types.map(t => ({ type: t }))
        };
      } else {
        properties[key] = { type: value };
      }
    } else if (typeof value === 'object') {
      properties[key] = value;
    }
  });

  const jsonSchema = {
    type: 'object',
    properties,
    additionalProperties: true
  };

  const validate = ajv.compile(jsonSchema);
  const valid = validate(data);

  return {
    valid,
    errors: validate.errors || []
  };
}

/**
 * Get human-readable error messages
 */
export function formatValidationErrors(errors: ErrorObject[]): string[] {
  return errors.map(err => {
    const path = err.instancePath || 'root';
    const message = err.message || 'Invalid value';
    return `${path}: ${message}`;
  });
}

/**
 * Parse input schema to extract field definitions
 */
export function parseInputSchema(schema: X402Schema['input']): {
  method: 'GET' | 'POST';
  fields: Record<string, SchemaField>;
  hasParams: boolean;
} {
  return {
    method: schema.method || 'POST',
    fields: (schema.bodyFields || schema.queryParams || {}) as Record<string, SchemaField>,
    hasParams: !!(schema.bodyFields || schema.queryParams)
  };
}

/**
 * Get default values from schema
 */
export function getDefaultValues(fields: Record<string, SchemaField>): Record<string, any> {
  const defaults: Record<string, any> = {};

  Object.entries(fields).forEach(([key, field]) => {
    if (field.default !== undefined) {
      defaults[key] = field.default;
    }
  });

  return defaults;
}
