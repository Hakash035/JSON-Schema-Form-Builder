import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormProvider, useForm } from './context/FormContext';
import { ToastContainer } from './components/Toast';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import Success from './pages/Success';
import Schema from './pages/Schema';
import SubmissionDetail from './pages/SubmissionDetail';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useForm();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/schema" element={<Schema />} />
          <Route path="/schema/:schemaId" element={<Schema />} />
          <Route path="/submission/:id" element={<SubmissionDetail />} />
        </Routes>
      </Router>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

function App() {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
}

export default App;