import React, { createContext, useContext, useState } from 'react';
import { JSONSchema, FormData, ToastMessage } from '../types';

interface FormContextType {
  schema: JSONSchema | null;
  setSchema: (schema: JSONSchema | null) => void;
  schemaId: string | null;
  setSchemaId: (id: string | null) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schema, setSchema] = useState<JSONSchema | null>(null);
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <FormContext.Provider value={{
      schema,
      setSchema,
      schemaId,
      setSchemaId,
      formData,
      setFormData,
      toasts,
      addToast,
      removeToast
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};