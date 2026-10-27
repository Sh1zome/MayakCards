import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { TestsProvider } from './context/TestsContext';
import TestsPage from './pages/TestsPage';
import TakeTestPage from './pages/TakeTestPage';
import ResultsPage from './pages/ResultsPage';
import StudyPage from './pages/StudyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminListPage from './pages/AdminListPage';
import AdminEditorPage from './pages/AdminEditorPage';

export default function App() {
  return (
    <TestsProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TestsPage />} />
            <Route path="test/:id" element={<TakeTestPage />} />
            <Route path="test/:id/results" element={<ResultsPage />} />
            <Route path="study" element={<StudyPage />} />
            <Route path="admin" element={<AdminLoginPage />} />
            <Route path="admin/tests" element={<AdminListPage />} />
            <Route path="admin/edit/:id" element={<AdminEditorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </TestsProvider>
  );
}
