import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { JSONSchema, ValidationError } from '../types';

const ajv = new Ajv({ 
  allErrors: true, 
  strict: false,
  validateFormats: true
});
addFormats(ajv);

export const validateJSONSchema = (schema: any): { isValid: boolean; errors: string[] } => {
  try {
    if (!schema || typeof schema !== 'object') {
      return { isValid: false, errors: ['Schema must be an object'] };
    }

    if (schema.type !== 'object') {
      return { isValid: false, errors: ['Root schema type must be "object"'] };
    }

    if (!schema.properties || typeof schema.properties !== 'object') {
      return { isValid: false, errors: ['Schema must have a "properties" object'] };
    }

    if (!schema.title || typeof schema.title !== 'string') {
      return { isValid: false, errors: ['Schema must have a "title" string'] };
    } 

    // Validate that all properties have valid types
    const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
    const errors: string[] = [];

    const validateProperty = (prop: any, path: string) => {
      if (!prop.type || !validTypes.includes(prop.type)) {
        errors.push(`Property "${path}" must have a valid type (${validTypes.join(', ')})`);
        return;
      }

      if (prop.type === 'array') {
        if (!prop.items) {
          errors.push(`Array property "${path}" must have an "items" definition`);
        } else {
          validateProperty(prop.items, `${path}.items`);
        }
      }

      if (prop.type === 'object') {
        if (prop.properties) {
          Object.entries(prop.properties).forEach(([key, nestedProp]) => {
            validateProperty(nestedProp, `${path}.${key}`);
          });
        }
      }
    };

    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      validateProperty(prop, key);
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    return { isValid: false, errors: ['Invalid schema format'] };
  }
};

export const validateFormData = (schema: JSONSchema, data: Record<string, any>): ValidationError[] => {
  try {
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    
    if (isValid) {
      return [];
    }

    const errors: ValidationError[] = [];
    
    if (validate.errors) {
      validate.errors.forEach((error) => {
        let field = error.instancePath ? error.instancePath.substring(1) : 'root';
        
        // Handle missing property errors
        if (error.keyword === 'required' && error.params?.missingProperty) {
          field = error.instancePath ? 
            `${error.instancePath.substring(1)}.${error.params.missingProperty}` : 
            error.params.missingProperty;
        }

        // Convert array notation from AJV format
        field = field.replace(/\//g, '.').replace(/\[(\d+)\]/g, '[$1]');
        
        let message = error.message || 'Invalid value';
        
        // Custom error messages for better UX
        switch (error.keyword) {
          case 'required':
            const missingField = error.params?.missingProperty || field;
            const fieldTitle = getFieldTitle(schema, missingField);
            message = `${fieldTitle} is required`;
            break;
          case 'minLength':
            message = `Must be at least ${error.params?.limit} characters`;
            break;
          case 'maxLength':
            message = `Must be no more than ${error.params?.limit} characters`;
            break;
          case 'minimum':
            message = `Must be at least ${error.params?.limit}`;
            break;
          case 'maximum':
            message = `Must be no more than ${error.params?.limit}`;
            break;
          case 'minItems':
            message = `Must have at least ${error.params?.limit} items`;
            break;
          case 'maxItems':
            message = `Must have no more than ${error.params?.limit} items`;
            break;
          case 'pattern':
            message = 'Invalid format';
            break;
          case 'enum':
            message = `Must be one of: ${error.params?.allowedValues?.join(', ')}`;
            break;
          case 'type':
            message = `Must be a ${error.params?.type}`;
            break;
          case 'format':
            message = `Invalid ${error.params?.format} format`;
            break;
          case 'if':
            // Skip if/then/else validation errors as they're handled by the conditional logic
            return;
        }
        
        errors.push({ field, message });
      });
    }
    
    return errors;
  } catch (error) {
    console.error('Validation error:', error);
    return [{ field: 'root', message: 'Validation failed' }];
  }
};

// Helper function to get field title from schema
const getFieldTitle = (schema: JSONSchema, fieldPath: string): string => {
  const pathParts = fieldPath.split('.');
  let currentSchema: any = schema;
  
  for (const part of pathParts) {
    if (currentSchema.properties && currentSchema.properties[part]) {
      currentSchema = currentSchema.properties[part];
    } else {
      return fieldPath; // Fallback to field path if not found
    }
  }
  
  return currentSchema.title || fieldPath;
};

export const isValidJSON = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};