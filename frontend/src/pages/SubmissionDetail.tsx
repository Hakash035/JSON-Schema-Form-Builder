import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { getSubmissionDetails } from '../utils/apiClient';
import { useForm } from '../context/FormContext';
import { SubmissionDetails } from '../types';

const SubmissionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useForm();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);
  const [showSchema, setShowSchema] = useState(false);

  const loadSubmission = async (_id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSubmissionDetails(_id);
      setSubmission(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load submission';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    loadSubmission(id);
  }, [id]);

  // const handleRestoreToForm = () => {
  //   if (!submission) return;
    
  //   setSchema(submission.schema);
  //   setFormData(submission.data);
  //   addToast('Form restored successfully!', 'success');
  //   navigate('/form');
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
            <p className="text-gray-600">{error || 'The requested submission could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </button>
          
          {/* <button
            onClick={handleRestoreToForm}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restore to Form
          </button> */}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.schemaTitle}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Submission ID: #{submission.id}</span>
              <span>Date: {submission.date}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Data</h2>
            {Object.entries(submission.data).map(([key, value]) => (
              <div key={key} className="border-b border-gray-100 pb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {submission.schema.properties[key]?.title || key}
                </div>
                <div className="text-gray-900">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value?.toString() || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => setShowData(!showData)}
              className="flex items-center gap-2 w-full text-left text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {showData ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              View Submitted JSON
            </button>
            {showData && (
              <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(submission.data, null, 2)}
              </pre>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => setShowSchema(!showSchema)}
              className="flex items-center gap-2 w-full text-left text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {showSchema ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              View Associated Schema
            </button>
            {showSchema && (
              <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(submission.schema, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;