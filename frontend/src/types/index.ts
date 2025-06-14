export interface JSONSchema {
  type: 'object' | 'array';
  title?: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  items?: SchemaProperty;
  minItems?: number;
  maxItems?: number;
  if?: JSONSchema;
  then?: Partial<JSONSchema>;
  else?: Partial<JSONSchema>;
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  title?: string;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  enum?: (string | number)[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  minItems?: number;
  maxItems?: number;
  if?: SchemaProperty;
  then?: Partial<SchemaProperty>;
  else?: Partial<SchemaProperty>;
}

export interface FormData {
  [key: string]: string | number | boolean | FormData | FormData[] | (string | number | boolean)[];
}

export interface FormState {
  schema: JSONSchema;
  data: FormData;
}

export interface Submission {
  id: string;
  date: string;
  data: FormData;
}

export interface SubmissionDetails {
  id: string;
  date: string;
  data: FormData;
  schema: JSONSchema;
  schemaTitle?: string;
}

export interface SchemaData {
  id: string;
  date: string;
  schemaTitle?: string;
  schema: JSONSchema
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}