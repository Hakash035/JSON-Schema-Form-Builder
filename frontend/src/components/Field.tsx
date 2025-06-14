import React from 'react';
import { SchemaProperty } from '../types';

interface FieldProps {
  name: string;
  property: SchemaProperty;
  value: string | number | boolean;
  onChange: (name: string, value: string | number | boolean) => void;
  onBlur: (name: string) => void;
  error?: string;
  required?: boolean;
  showLabel?: boolean;
}

const Field: React.FC<FieldProps> = ({
  name,
  property,
  value,
  onChange,
  onBlur,
  error,
  required,
  showLabel = true
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let newValue: string | number | boolean = e.target.value;
    
    if (property.type === 'number' || property.type === 'integer') {
      newValue = e.target.value === '' ? '' : Number(e.target.value);
    } else if (property.type === 'boolean') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    onChange(name, newValue);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const getInputType = () => {
    switch (property.type) {
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'checkbox';
      default:
        if (property.format === 'email') return 'email';
        return 'text';
    }
  };

  const renderInput = () => {
    const baseClassName = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      error ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`;

    if (property.enum) {
      return (
        <select
          value={value.toString()}
          onChange={handleChange}
          onBlur={handleBlur}
          className={baseClassName}
          required={required}
        >
          <option value="">Select an option</option>
          {property.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (property.type === 'boolean') {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          {showLabel && (
            <label className="ml-2 text-sm text-gray-700">
              {property.title || name}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
      );
    }

    const inputProps: any = {
      type: getInputType(),
      value: value.toString(),
      onChange: handleChange,
      onBlur: handleBlur,
      className: baseClassName,
      placeholder: property.description || `Enter ${property.title || name}`,
      required: required,
    };

    if (property.type === 'number' || property.type === 'integer') {
      if (property.minimum !== undefined) inputProps.min = property.minimum;
      if (property.maximum !== undefined) inputProps.max = property.maximum;
      if (property.type === 'integer') inputProps.step = 1;
    }

    if (property.type === 'string') {
      if (property.minLength !== undefined) inputProps.minLength = property.minLength;
      if (property.maxLength !== undefined) inputProps.maxLength = property.maxLength;
      if (property.pattern) inputProps.pattern = property.pattern;
    }

    return <input {...inputProps} />;
  };

  if (property.type === 'boolean') {
    return (
      <div className="mb-6">
        {renderInput()}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {property.title || name}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {property.description && !error && (
        <p className="mt-1 text-sm text-gray-500">{property.description}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Field;