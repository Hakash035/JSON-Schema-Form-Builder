import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SubmissionsTable from '../components/SubmissionsTable';
import { getSchemas, getSchemasCount, getSubmissions, getSubmissionsCount } from '../utils/apiClient';
import { useForm } from '../context/FormContext';
import { SchemaData, Submission } from '../types';

const Schema: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useForm();
  const { schemaId } = useParams()
  type DataType =
    | { type: 'submission'; data: Submission[] }
    | { type: 'schemaData'; data: SchemaData[] };

  const [data, setData] = useState<DataType>({
    type: 'schemaData',
    data: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0)
  const itemsPerPage = 10;


  const loadData = async () => {
    setLoading(true);
    setError(null);

    if (schemaId) {
      try {
        const data = await getSubmissions(schemaId, currentPage * itemsPerPage, itemsPerPage);
        setData({
          type: "submission",
          data
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load submissions';
        setError(message);
        addToast(message, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    try {
      const data = await getSchemas(currentPage * itemsPerPage, itemsPerPage);
      setData({
        type: "schemaData",
        data
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load schemas';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDataCount = async () => {
    setLoading(true);
    setError(null);

    if (schemaId) {
      try {
        const data = await getSubmissionsCount(schemaId);
        setTotalRecords(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load submissions';
        setError(message);
        addToast(message, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await getSchemasCount();
      setTotalRecords(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load schemas';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schemaId) {
      setData({
        type: 'submission',
        data: [],
      });
    }
    loadData();
  }, [schemaId, currentPage]);

  useEffect(() => {
    setCurrentPage(0)
    loadDataCount();
  }, [schemaId]);

  const handleViewSubmission = (id: string) => {
    schemaId ? navigate(`/submission/${id}`) : navigate(`/schema/${id}`);
  };

  const handleRetry = () => {
    loadData();
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load {schemaId ? "Submissions" : "Schemas"}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
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
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <button
            onClick={handleRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{schemaId ? "Form Submissions" : "Schemas"}</h1>
        
        {schemaId ? (
          <SubmissionsTable
            type="submission"
            schemaId={schemaId}
            submissions={data.data as Submission[]}
            onViewSubmission={handleViewSubmission}
            loading={loading}
          />
        ) : (
          <SubmissionsTable
            type="schemaData"
            schemaId={schemaId}
            submissions={data.data as SchemaData[]}
            onViewSubmission={handleViewSubmission}
            loading={loading}
          />
        )}


        {/* Pagination */}
        {totalRecords > 0 && (
          <div className="flex justify-center items-center p-4 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {Math.ceil(totalRecords / itemsPerPage)}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(totalRecords / itemsPerPage) - 1)
                )
              }
              disabled={currentPage === Math.ceil(totalRecords / itemsPerPage) - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Schema;