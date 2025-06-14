import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import { JSONSchema, FormData, ValidationError } from '../types';
import { validateFormData } from '../utils/validation';
import { downloadJSON } from '../utils/fileHelpers';
import Field from './Field';
import ArrayField from './ArrayField';
import ObjectField from './ObjectField';

interface FormRendererProps {
  schema: JSONSchema;
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  initialData = {},
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showSchema, setShowSchema] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Re-validate when form data changes to handle conditional logic
  useEffect(() => {
    if (touchedFields.size > 0) {
      const validationErrors = validateFormData(schema, formData);
      setErrors(validationErrors);
    }
  }, [formData, schema, touchedFields]);

  const handleFieldChange = (name: string, value: string | number | boolean | FormData | (string | number | boolean | FormData)[]) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Clear state of fields that might be removed due to conditional logic
    const currentSchema = getEffectiveSchema(schema, newFormData);
    const removedFields = Object.keys(formData).filter(key => 
      key !== name && !currentSchema.properties?.[key]
    );
    
    if (removedFields.length > 0) {
      const cleanedData = { ...newFormData };
      removedFields.forEach(field => {
        delete cleanedData[field];
      });
      setFormData(cleanedData);
      
      // Remove touched state for removed fields
      setTouchedFields(prev => {
        const newTouched = new Set(prev);
        removedFields.forEach(field => newTouched.delete(field));
        return newTouched;
      });
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouchedFields(prev => new Set(prev).add(name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const effectiveSchema = getEffectiveSchema(schema, formData);
    const validationErrors = validateFormData(effectiveSchema, formData);
    setErrors(validationErrors);
    
    // Mark all visible fields as touched
    const allFields = getAllFieldPaths(effectiveSchema);
    setTouchedFields(new Set(allFields));
    
    if (validationErrors.length === 0) {
      onSubmit(formData);
    } else {
      // Scroll to first error
      const firstError = validationErrors[0];
      const errorElement = document.querySelector(`[data-field="${firstError.field}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleExport = () => {
    const exportData = {
      schema,
      data: formData
    };
    downloadJSON(exportData, `form-state-${Date.now()}.json`);
  };

  const getFieldError = (fieldName: string) => {
    const error = errors.find(err => err.field === fieldName || err.field.startsWith(fieldName + '.') || err.field.startsWith(fieldName + '['));
    return touchedFields.has(fieldName) || touchedFields.has(fieldName.split('.')[0]) || touchedFields.has(fieldName.split('[')[0]) ? error?.message : undefined;
  };

  const getAllFieldPaths = (schema: JSONSchema, prefix = ''): string[] => {
    const paths: string[] = [];
    
    if (schema.properties) {
      Object.keys(schema.properties).forEach(key => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        paths.push(fullPath);
        
        const property = schema.properties![key];
        if (property.type === 'object' && property.properties) {
          paths.push(...getAllFieldPaths({ type: 'object', properties: property.properties }, fullPath));
        }
      });
    }
    
    return paths;
  };

  // Get the effective schema based on conditional logic
  const getEffectiveSchema = (baseSchema: JSONSchema, currentData: FormData): JSONSchema => {
    if (!baseSchema.if || !baseSchema.then) {
      return baseSchema;
    }

    try {
      // Evaluate the if condition
      const conditionMet = evaluateCondition(baseSchema.if, currentData);
      
      // Apply then or else branch
      const conditionalBranch = conditionMet ? baseSchema.then : baseSchema.else;
      
      if (!conditionalBranch) {
        return baseSchema;
      }

      // Merge the conditional properties with the base schema
      const effectiveSchema: JSONSchema = {
        ...baseSchema,
        properties: {
          ...baseSchema.properties,
          ...conditionalBranch.properties
        },
        required: [
          ...(baseSchema.required || []),
          ...(conditionalBranch.required || [])
        ]
      };

      // Remove properties that shouldn't be shown
      if (conditionalBranch.properties) {
        const branchToHide = conditionMet ? baseSchema.else : baseSchema.then;
        if (branchToHide?.properties) {
          Object.keys(branchToHide.properties).forEach(key => {
            if (!baseSchema.properties?.[key]) {
              delete effectiveSchema.properties![key];
            }
          });
        }
      }

      return effectiveSchema;
    } catch (error) {
      console.warn('Error evaluating conditional schema:', error);
      return baseSchema;
    }
  };

  // Evaluate if condition against current form data
  const evaluateCondition = (condition: any, data: FormData): boolean => {
    if (!condition || !condition.properties) {
      return false;
    }

    return Object.entries(condition.properties).every(([key, value]: [string, any]) => {
      const fieldValue = data[key];
      
      if (value.const !== undefined) {
        return fieldValue === value.const;
      }
      
      if (value.enum) {
        return value.enum.includes(fieldValue);
      }
      
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    });
  };

  if (!schema.properties) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-center text-gray-600">Invalid schema: no properties defined</p>
        </div>
      </div>
    );
  }

  // Get the effective schema for rendering
  const effectiveSchema = getEffectiveSchema(schema, formData);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {schema.title || 'Dynamic Form'}
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export Form
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.entries(effectiveSchema.properties || {}).map(([name, property]) => {
            const fieldValue = formData[name];
            const isRequired = effectiveSchema.required?.includes(name);
            const fieldError = getFieldError(name);

            if (property.type === 'array') {
              return (
                <ArrayField
                  key={name}
                  name={name}
                  property={property}
                  value={(fieldValue as (string | number | boolean | FormData)[]) || []}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={fieldError}
                  required={isRequired}
                />
              );
            }

            if (property.type === 'object') {
              return (
                <ObjectField
                  key={name}
                  name={name}
                  property={property}
                  value={(fieldValue as FormData) || {}}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={fieldError}
                  required={isRequired}
                  getFieldError={getFieldError}
                />
              );
            }

            return (
              <div key={name} data-field={name}>
                <Field
                  name={name}
                  property={property}
                  value={(fieldValue as string | number | boolean) || (property.type === 'boolean' ? false : '')}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={fieldError}
                  required={isRequired}
                />
              </div>
            );
          })}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
      </div>

      {/* Collapsible Schema Viewer */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={() => setShowSchema(!showSchema)}
          className="w-full text-left text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {showSchema ? '▼' : '▶'} View JSON Schema
        </button>
        {showSchema && (
          <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default FormRenderer;