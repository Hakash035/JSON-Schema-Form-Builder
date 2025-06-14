import React from 'react';
import { SchemaProperty, FormData } from '../types';
import Field from './Field';
import ArrayField from './ArrayField';

interface ObjectFieldProps {
  name: string;
  property: SchemaProperty;
  value: FormData;
  onChange: (name: string, value: FormData) => void;
  onBlur: (name: string) => void;
  error?: string;
  required?: boolean;
  showTitle?: boolean;
  getFieldError?: (fieldName: string) => string | undefined;
}

const ObjectField: React.FC<ObjectFieldProps> = ({
  name,
  property,
  value,
  onChange,
  onBlur,
  error,
  required,
  showTitle = true,
  getFieldError
}) => {
  const handleFieldChange = (fieldName: string, fieldValue: string | number | boolean | FormData | (string | number | boolean | FormData)[]) => {
    const newValue = { ...value, [fieldName]: fieldValue };
    onChange(name, newValue);
  };

  const handleFieldBlur = (fieldName: string) => {
    onBlur(`${name}.${fieldName}`);
  };

  if (!property.properties) {
    return null;
  }

  return (
    <div className="mb-6">
      {showTitle && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {property.title || name}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
        {Object.entries(property.properties).map(([fieldName, fieldProperty]) => {
          const fieldPath = `${name}.${fieldName}`;
          const fieldValue = value[fieldName];
          const isRequired = property.required?.includes(fieldName);
          const fieldError = getFieldError ? getFieldError(fieldPath) : undefined;

          if (fieldProperty.type === 'array') {
            return (
              <ArrayField
                key={fieldName}
                name={fieldName}
                property={fieldProperty}
                value={(fieldValue as (string | number | boolean | FormData)[]) || []}
                onChange={handleFieldChange}
                onBlur={() => handleFieldBlur(fieldName)}
                error={fieldError}
                required={isRequired}
              />
            );
          }

          if (fieldProperty.type === 'object') {
            return (
              <ObjectField
                key={fieldName}
                name={fieldName}
                property={fieldProperty}
                value={(fieldValue as FormData) || {}}
                onChange={handleFieldChange}
                onBlur={() => handleFieldBlur(fieldName)}
                error={fieldError}
                required={isRequired}
                getFieldError={getFieldError}
              />
            );
          }

          return (
            <Field
              key={fieldName}
              name={fieldName}
              property={fieldProperty}
              value={(fieldValue as string | number | boolean) || (fieldProperty.type === 'boolean' ? false : '')}
              onChange={handleFieldChange}
              onBlur={() => handleFieldBlur(fieldName)}
              error={fieldError}
              required={isRequired}
            />
          );
        })}
      </div>

      {property.description && !error && (
        <p className="mt-1 text-sm text-gray-500">{property.description}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ObjectField;