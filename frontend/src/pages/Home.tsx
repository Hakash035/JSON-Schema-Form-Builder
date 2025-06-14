import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  CheckCircle, 
  Zap, 
  Settings, 
  GitBranch,
  FileText,
  Layers
} from 'lucide-react';
import { useForm } from '../context/FormContext';
import SchemaUploader from '../components/SchemaUploader';
import SchemaSuggestionCard from '../components/SchemaSuggestionCard';
import AIFormGenerator from '../components/AIFormGenerator';
import FeatureHighlight from '../components/FeatureHighlight';
import { schemaExamples } from '../utils/schemaExamples';
import { JSONSchema, FormState } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setSchema, setSchemaId, setFormData, addToast } = useForm();
  const [showSchemaInput, setShowSchemaInput] = useState(false);

  const handleSchemaLoad = (schema: JSONSchema, schemaId?: string) => {
    setSchema(schema);
    if (schemaId) {
      setSchemaId(schemaId);
    }
    setFormData({});
    addToast('Schema loaded successfully!', 'success');
    navigate('/form');
  };

  const handleFormStateLoad = (formState: FormState) => {
    setSchema(formState.schema);
    setFormData(formState.data);
    addToast('Form state imported successfully!', 'success');
    navigate('/form');
  };

  const handleError = (message: string) => {
    addToast(message, 'error');
  };

  const handleExampleClick = (schema: object, schemaId: string) => {
    handleSchemaLoad(schema as JSONSchema, schemaId);
  };

  const handleAIGenerated = (schema: object) => {
    addToast('Schema generated successfully!', 'success');
    handleSchemaLoad(schema as JSONSchema);
  };

  if (showSchemaInput) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto mb-6">
          <button
            onClick={() => setShowSchemaInput(false)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            ← Back to Home
          </button>
        </div>
        <SchemaUploader
          onSchemaLoad={handleSchemaLoad}
          onFormStateLoad={handleFormStateLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 pb-8 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Schema Form Builder
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Build JSON Schema forms dynamically, with live validation and AI-assisted generation. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setShowSchemaInput(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Paste Your Schema
              </button>
              
              <button
                onClick={() => navigate('/schema')}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center gap-2"
              >
                <Layers className="w-5 h-5" />
                View Schemas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 pt-0">
        {/* Schema Examples Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Try Examples</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore different schema patterns and features. Click any example to load it instantly and see how it works.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemaExamples.map((example) => (
              <SchemaSuggestionCard
                key={example.id}
                example={example}
                onClick={handleExampleClick}
              />
            ))}
          </div>
        </div>

        {/* AI Generator Section */}
        <div className="mb-16 mt-32">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate with AI</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Describe your form requirements and let AI create a complete JSON schema with validation rules and conditional logic.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <AIFormGenerator
              onSchemaGenerated={handleAIGenerated}
              onError={handleError}
            />
          </div>
        </div>


        {/* Feature Highlights */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What This Form Builder Supports</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built for developers who need powerful, flexible form generation with enterprise-grade validation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureHighlight
              icon={CheckCircle}
              title="Real-time Validation"
              description="Validates user input instantly using the AJV engine. Displays helpful error messages as users type."
              iconColor="text-green-500"
            />
            
            <FeatureHighlight
              icon={GitBranch}
              title="Conditional Logic"
              description="Dynamically show or hide fields and apply validation rules using if/then/else conditions in JSON Schema."
              iconColor="text-purple-500"
            />
            
            <FeatureHighlight
              icon={Settings}
              title="Pure JSON Schema"
              description="Fully compatible with JSON Schema. Use the same schema structure across frontend and backend without changes."
              iconColor="text-blue-500"
            />
            
            <FeatureHighlight
              icon={Zap}
              title="Rapid Prototyping"
              description="Built for rapid prototyping and testing. Export form states, import schemas, and iterate quickly."
              iconColor="text-yellow-500"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Build Your Form?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start with an example, generate with AI, or paste your own JSON schema. 
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleExampleClick(schemaExamples[0].schema, schemaExamples[0].id)}
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Try First Example
            </button>
            
            <button
              onClick={() => setShowSchemaInput(true)}
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Code className="w-5 h-5" />
              Start from Scratch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;