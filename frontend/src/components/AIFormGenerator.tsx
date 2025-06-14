import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateSchemaWithAI } from '../utils/apiClient';
import { isValidJSON, validateJSONSchema } from '../utils/validation';
import { useForm } from '../context/FormContext';

interface AIFormGeneratorProps {
  onSchemaGenerated: (schema: object) => void;
  onError: (message: string) => void;
}

const AIFormGenerator: React.FC<AIFormGeneratorProps> = ({ onSchemaGenerated, onError }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useForm()

  const validateSchema = (text: string) => {
    if (!text.trim()) {
      return false;
    }

    if (!isValidJSON(text)) {
      addToast('Please Try again, Something went wrong', 'error')
      return false;
    }

    try {
      const parsed = JSON.parse(text);
      const validation = validateJSONSchema(parsed);
      if(validation.errors.length > 0) {
        addToast('Please Try again, Something went wrong', 'error')
        return false;
      }
      return true;
    } catch (error) {
      addToast('Please Try again, Something went wrong', 'error')
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onError('Please describe the form you want to create');
      return;
    }

    setIsGenerating(true);
    try {
      const schema = await generateSchemaWithAI(prompt);
      if(!validateSchema(JSON.stringify(schema))) {
        return;
      }
      onSchemaGenerated(schema);
      setPrompt(''); // Clear the prompt on success
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate schema');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generate with AI</h3>
          <p className="text-sm text-gray-600">Describe your form and let AI create the schema</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your form... For example: 'Create a job application form with personal details, work experience'"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isGenerating}
            maxLength={500}
          />
          
          <p className="text-xs text-gray-500 mt-1">
            Press Cmd/Ctrl + Enter to generate quickly
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Schema...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Schema
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Pro tip:</strong> Be specific about field types, validation rules, and conditional logic you need.
        </p>
      </div>
    </div>
  );
};

export default AIFormGenerator;