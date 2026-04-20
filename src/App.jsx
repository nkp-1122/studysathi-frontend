import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import NotesLibraryPage from './pages/NotesLibraryPage';
import NoteSearchPage from './pages/NoteSearchPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import VivaSearchPage from './pages/VivaSearchPage';
import PreviousQuestionsPage from './pages/PreviousQuestionsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CoursePage from './pages/CoursePage';
import BranchResourcePage from './pages/BranchResourcePage';
import ResourcePlaceholderPage from './pages/ResourcePlaceholderPage';
import SemesterResourcePage from './pages/SemesterResourcePage';
import YearResourcePage from './pages/YearResourcePage';
import InfoPage from './pages/InfoPage';
import SiteFooter from './components/SiteFooter';
import SignupPrompt from './components/SignupPrompt';
import { clearAuthSession, readStoredUser, saveAuthSession } from './utils/authStorage';

function App() {
  const [user, setUser] = useState(() => readStoredUser());

  const handleAuthSuccess = (authPayload) => {
    const nextUser = saveAuthSession(authPayload);
    setUser(nextUser);
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <div className="notes-app">
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/notes/library" element={<NotesLibraryPage />} />
        <Route path="/notes" element={<NotesLibraryPage />} />
        <Route path="/notes/explore" element={<NoteSearchPage />} />
        <Route path="/login" element={<LoginPage onSuccess={handleAuthSuccess} />} />
        <Route path="/signup" element={<SignupPage onSuccess={handleAuthSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin" element={<AdminPage user={user} />} />
        <Route path="/admin/users" element={<AdminUsersPage user={user} />} />
        <Route path="/viva" element={<VivaSearchPage />} />
        <Route path="/pyq" element={<PreviousQuestionsPage />} />
        <Route path="/pyq.html" element={<PreviousQuestionsPage />} />
        <Route path="/course/:courseKey" element={<CoursePage />} />
        <Route path="/year/:yearId" element={<YearResourcePage />} />
        <Route path="/year/:yearId/:resourceKey/branches" element={<BranchResourcePage />} />
        <Route path="/year/:yearId/:resourceKey/semesters" element={<SemesterResourcePage />} />
        <Route
          path="/syllabus"
          element={
            <ResourcePlaceholderPage
              resourceKey="syllabus"
              title="Syllabus"
              description="Common-for-all-branches syllabus section for quick access and future uploads."
            />
          }
        />
        <Route
          path="/quantum"
          element={
            <ResourcePlaceholderPage
              resourceKey="quantum"
              title="Quantum"
              description="Quantum section for important questions, unit-wise help, and compact exam preparation material."
            />
          }
        />
        <Route path="/contact" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/help" element={<InfoPage variant="help" />} />
        <Route path="/terms" element={<InfoPage variant="terms" />} />
        <Route path="/privacy" element={<InfoPage variant="privacy" />} />
        <Route path="/assignments" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<HomePage user={user} onLogout={handleLogout} />} />
      </Routes>
      <SignupPrompt user={user} />
      <SiteFooter />
    </div>
  );
}

export default App;
