import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SchemaProperty, FormData } from '../types';
import Field from './Field';
import ObjectField from './ObjectField';

interface ArrayFieldProps {
  name: string;
  property: SchemaProperty;
  value: (string | number | boolean | FormData)[];
  onChange: (name: string, value: (string | number | boolean | FormData)[]) => void;
  onBlur: (name: string) => void;
  error?: string;
  required?: boolean;
}

const ArrayField: React.FC<ArrayFieldProps> = ({
  name,
  property,
  value,
  onChange,
  onBlur,
  error,
  required
}) => {
  const handleAddItem = () => {
    const newItem = getDefaultValue(property.items);
    onChange(name, [...value, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(name, newValue);
    onBlur(name);
  };

  const handleItemChange = (index: number, itemValue: string | number | boolean | FormData) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange(name, newValue);
  };

  const handleItemBlur = () => {
    onBlur(name);
  };

  const getDefaultValue = (itemSchema?: SchemaProperty): string | number | boolean | FormData => {
    if (!itemSchema) return '';
    
    switch (itemSchema.type) {
      case 'boolean':
        return false;
      case 'number':
      case 'integer':
        return 0;
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return '';
    }
  };

  const canAddMore = !property.maxItems || value.length < property.maxItems;
  const hasMinItems = property.minItems && value.length < property.minItems;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {property.title || name}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!canAddMore}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {value.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No items added yet. Click "Add Item" to get started.
          </p>
        ) : (
          value.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-white p-3 rounded border">
              <div className="flex-1">
                {property.items?.type === 'object' ? (
                  <ObjectField
                    name={`${name}[${index}]`}
                    property={property.items}
                    value={item as FormData}
                    onChange={(_, itemValue) => handleItemChange(index, itemValue)}
                    onBlur={handleItemBlur}
                    showTitle={false}
                  />
                ) : (
                  <Field
                    name={`${name}[${index}]`}
                    property={property.items!}
                    value={item as string | number | boolean}
                    onChange={(_, itemValue) => handleItemChange(index, itemValue)}
                    onBlur={handleItemBlur}
                    showLabel={false}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {property.description && !error && (
        <p className="mt-1 text-sm text-gray-500">{property.description}</p>
      )}
      
      {hasMinItems && (
        <p className="mt-1 text-sm text-orange-600">
          Minimum {property.minItems} item{property.minItems !== 1 ? 's' : ''} required
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ArrayField;