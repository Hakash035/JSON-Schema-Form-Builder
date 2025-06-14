import axios from 'axios';
import { FormData, Submission, JSONSchema, SchemaData, SubmissionDetails } from '../types';

const API_BASE = import.meta.env.VITE_API_URL; // Using a real API for demo

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const submitForm = async (data: FormData, schema: JSONSchema | null, schemaId: string | null): Promise<{ success: boolean; id?: string }> => {
  try {
    // Simulate form submission
    const response = await apiClient.post('/submit-form', {
      schema_id: schemaId || null,
      schema_json : schema,
      form_data: data
    });
    
    return { success: true, id: response.data.submission_id };
  } catch (error) {
    console.error('Form submission failed:', error);
    throw new Error('Failed to submit form. Please try again.');
  }
};

export const getSchemas = async (skip:number, limit: number): Promise<SchemaData[]> => {
  try {
    // Simulate getting schemas
    const response = await apiClient.get(`/list-schemas?skip=${skip}&limit=${limit}`);

    return response.data.map((schema: any) => ({
      id: schema.id.toString(),
      date: schema.created_at.split('T')[0],
      schemaTitle: schema.name,
      schema: schema.schema_json
    }));
  } catch (error) {
    console.error('Failed to fetch schemas:', error);
    throw new Error('Failed to load schemas. Please try again.');
  }
};

export const getSubmissions = async (schemaId: string, skip: number, limit: number): Promise<Submission[]> => {
  try {
    // Simulate getting submissions
    const response = await apiClient.get(`/submissions/${schemaId}?skip=${skip}&limit=${limit}`);
    
    return response.data.map((post: any) => ({
      id: post.id.toString(),
      date: post.submitted_at.split('T')[0],
      data: post.form_data,
    }));
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    throw new Error('Failed to load submissions. Please try again.');
  }
};

export const getSubmissionDetails = async (id: string): Promise<SubmissionDetails> => {
  try {
    const response = await apiClient.get(`/submission/${id}`);
    const post = response.data;
    
    return {
      id: post.id.toString(),
      date: post.submitted_at.split('T')[0],
      data: post.form_data,
      schema: post.schema_json,
      schemaTitle: post.name
    };
  } catch (error) {
    console.error('Failed to fetch submission:', error);
    throw new Error('Failed to load submission. Please try again.');
  }
};

export const getSubmissionsCount = async(schemaId: string | null): Promise<number> => {
  const response = await apiClient.get(`/submissions-count/?schema_id=${schemaId}`);
  return response.data.totalRecords
}

export const getSchemasCount = async(): Promise<number> => {
  const response = await apiClient.get('/schemas-count');
  return response.data.totalRecords
}

export const generateSchemaWithAI = async(prompt: string): Promise<string> => {
  try {
    const response = await apiClient.post(`/ai-response`, {
      prompt: prompt
    });

    return response.data.response;
  } catch (error: any) {
    console.error('AI schema generation failed:', error.response.data.detail);
    if (error.response.data.detail) {
      let errorMessage = error.response.data.detail;
      throw new Error(errorMessage);
    }
    throw new Error('Failed to generate schema with AI. Please try again.');
  }
};