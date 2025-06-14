import React from 'react';
import { Eye, Calendar, FileText, Plus } from 'lucide-react';
import { JSONSchema, SchemaData, Submission } from '../types';
import { useForm } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';

interface SubmissionsTableSubmission {
  type: "submission";
  submissions: Submission[];
  onViewSubmission: (id: string) => void;
  loading?: boolean;
  schemaId: string | undefined;
}

interface SubmissionsTableSchemaData {
  type: "schemaData";
  submissions: SchemaData[];
  onViewSubmission: (id: string) => void;
  loading?: boolean;
  schemaId: string | undefined;
}

const SubmissionsTable: React.FC<SubmissionsTableSubmission | SubmissionsTableSchemaData> = ({
  type,
  submissions,
  onViewSubmission,
  loading = false,
  schemaId
}) => {
  const navigate = useNavigate();
  const { setSchema, setSchemaId, setFormData } = useForm()

  const handleLoadForm = (schema: JSONSchema, _schemaId: string) => {
    setFormData({})
    setSchemaId(_schemaId)
    setSchema(schema)
    navigate('/form')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No {schemaId ? "Submissions" : "Schemas"} yet</h3>
        <p className="text-gray-600">Submit a form to see it appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {schemaId ? "Submission ID" : "Schema ID"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {!schemaId && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schema Title
              </th>}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{submission.id.slice(0, 10)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {submission.date}
                  </div>
                </td>
                {type === "schemaData" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(submission as SchemaData).schemaTitle}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-center gap-2">
                  <button
                    onClick={() => onViewSubmission(submission.id)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors border rounded-lg px-2 border-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {type === "schemaData" && (
                    <button
                      onClick={() => handleLoadForm((submission as SchemaData).schema, (submission as SchemaData).id)}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors border rounded-lg px-2 border-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Submit Response
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {submissions.map((submission) => (
          <div key={submission.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-900">
                #{submission.id}
              </div>
              <button
                onClick={() => onViewSubmission(submission.id)}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
            {type === "schemaData" && (
              <div className="text-sm text-gray-600 mb-1">
                {(submission as SchemaData).schemaTitle}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {submission.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionsTable;