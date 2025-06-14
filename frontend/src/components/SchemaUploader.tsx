import React, { useState } from 'react';
import { FileUp, RefreshCw } from 'lucide-react';
import { validateJSONSchema, isValidJSON } from '../utils/validation';
import { readJSONFile, validateFormStateFile } from '../utils/fileHelpers';
import { JSONSchema, FormState } from '../types';

interface SchemaUploaderProps {
  onSchemaLoad: (schema: JSONSchema, schemaId?: string) => void;
  onFormStateLoad: (formState: FormState, schemaId?: string) => void;
  onError: (message: string) => void;
}

const SchemaUploader: React.FC<SchemaUploaderProps> = ({
  onSchemaLoad,
  onFormStateLoad,
  onError
}) => {
  const [schemaText, setSchemaText] = useState('');
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateSchema = (text: string) => {
    if (!text.trim()) {
      setJsonErrors([]);
      return;
    }

    if (!isValidJSON(text)) {
      setJsonErrors(['Invalid JSON format']);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const validation = validateJSONSchema(parsed);
      setJsonErrors(validation.errors);
    } catch (error) {
      setJsonErrors(['Failed to parse JSON']);
    }
  };

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSchemaText(text);
    validateSchema(text);
  };

  const handleLoadForm = () => {
    if (!schemaText.trim()) {
      onError('Please enter a JSON schema');
      return;
    }

    if (jsonErrors.length > 0) {
      onError('Please fix the schema errors before loading');
      return;
    }

    try {
      const schema = JSON.parse(schemaText);
      onSchemaLoad(schema);
    } catch (error) {
      onError('Failed to parse schema');
    }
  };

  const handleReset = () => {
    setSchemaText('');
    setJsonErrors([]);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const _data = await readJSONFile(file);
      const {schemaId, ...data} = _data
      if (validateFormStateFile(data)) {
        // It's a form state file
        onFormStateLoad(data, schemaId);
      } else if (validateJSONSchema(data).isValid) {
        // It's a schema file
        onSchemaLoad(data, schemaId);
      } else {
        onError('Invalid file format. Please upload a valid JSON schema or form state file.');
      }
    } catch (error) {
      onError('Failed to read file. Please ensure it\'s a valid JSON file.');
    } finally {
      setIsLoading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            JSON Schema Input
          </h1>
          {schemaText && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON Schema
          </label>
          <textarea
            value={schemaText}
            onChange={handleSchemaChange}
            className={`w-full h-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              jsonErrors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={`Enter your JSON schema here, for example:

{
  "type": "object",
  "title": "User Profile",
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name",
      "minLength": 2,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "title": "Email Address",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "title": "Age",
      "minimum": 18,
      "maximum": 120
    },
    "skills": {
      "type": "array",
      "title": "Skills",
      "items": {
        "type": "string",
        "enum": ["JavaScript", "Python", "React", "Node.js"]
      },
      "minItems": 1
    },
    "address": {
      "type": "object",
      "title": "Address",
      "properties": {
        "street": { "type": "string", "title": "Street" },
        "city": { "type": "string", "title": "City" },
        "zipCode": { "type": "string", "title": "ZIP Code", "pattern": "^[0-9]{5}$" }
      },
      "required": ["street", "city"]
    },
    "hasGithub": {
      "type": "boolean",
      "title": "Do you have a GitHub profile?"
    }
  },
  "required": ["name", "email", "age"],
  "if": {
    "properties": { "hasGithub": { "const": true } }
  },
  "then": {
    "properties": {
      "githubUrl": {
        "type": "string",
        "title": "GitHub URL",
        "pattern": "^https://github.com/.+"
      }
    },
    "required": ["githubUrl"]
  },
  "else": {
    "properties": {
      "techInterest": {
        "type": "string",
        "title": "What technology interests you most?",
        "enum": ["Frontend", "Backend", "Mobile", "DevOps", "AI/ML"]
      }
    }
  }
}`}
          />
          
          {jsonErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {jsonErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleLoadForm}
            disabled={!schemaText.trim() || jsonErrors.length > 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load Form
          </button>
          
          <div className="flex-1">
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              id="file-import"
              disabled={isLoading}
            />
            <label
              htmlFor="file-import"
              className={`flex items-center justify-center gap-2 w-full py-3 px-6 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-colors cursor-pointer ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FileUp className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-600">
                {isLoading ? 'Loading...' : 'Import Form State'}
              </span>
            </label>
          </div>
        </div>
        
        <div className="mt-6 space-y-3 text-sm text-gray-600">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📌 Important Info</h3>
            <p className="text-gray-700">
              This application supports JSON Schemas that follow the official <a className="text-blue-400" href='https://json-schema.org/' target='_blank'>json-schema.org</a> specification and conventions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaUploader;