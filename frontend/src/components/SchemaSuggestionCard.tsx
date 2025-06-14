import React from 'react';
import { Code, Database, Layers, GitBranch, Zap } from 'lucide-react';
import { SchemaExample } from '../utils/schemaExamples';

interface SchemaSuggestionCardProps {
  example: SchemaExample;
  onClick: (schema: object, schemaId: string) => void;
}

const SchemaSuggestionCard: React.FC<SchemaSuggestionCardProps> = ({ example, onClick }) => {
  const getIcon = () => {
    switch (example.category) {
      case 'Basic':
        return <Code className="w-6 h-6 text-blue-500" />;
      case 'Advanced':
        return <Database className="w-6 h-6 text-purple-500" />;
      case 'Conditional':
        return <GitBranch className="w-6 h-6 text-green-500" />;
      default:
        return <Layers className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryColor = () => {
    switch (example.category) {
      case 'Basic':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      case 'Conditional':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      onClick={() => onClick(example.schema, example.id)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer border border-gray-100 hover:border-blue-200 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {example.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor()}`}>
              {example.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {example.description}
          </p>
          <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
            <span>Try this example</span>
            <Zap className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaSuggestionCard;