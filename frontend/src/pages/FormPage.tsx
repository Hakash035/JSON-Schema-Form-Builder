import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import FormRenderer from '../components/FormRenderer';
import { submitForm } from '../utils/apiClient';
import { FormData } from '../types';
import { ArrowLeft } from 'lucide-react';

const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const { schema, formData, setFormData, addToast, schemaId } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setFormData(data);
    
    try {
      await submitForm(data, schema, schemaId);
      addToast('Form submitted successfully!', 'success');
      setFormData({});
      navigate('/success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schema) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Schema Loaded</h2>
          <p className="text-gray-600 mb-6">Please load a schema first to use the form builder.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Schema Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schema Input
        </button>
      </div>
      
      <FormRenderer
        schema={schema}
        initialData={formData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default FormPage;