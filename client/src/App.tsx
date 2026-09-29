import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';

import { LandingPage } from './pages/LandingPage.js';
import { SignInPage } from './pages/SignInPage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { AppShell } from './components/layout/AppShell.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { NewDecisionPage } from './pages/NewDecisionPage.js';
import { DecisionWorkspacePage } from './pages/DecisionWorkspacePage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { PersonalSpacePage } from './pages/PersonalSpacePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/sign-in" element={<SignInPage />} />
            <Route path="/auth/sign-up" element={<SignUpPage />} />

            {/* Authenticated Application Routes wrapped in AppShell */}
            <Route path="/app" element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="decisions/new" element={<NewDecisionPage />} />
              <Route path="decisions/:decisionId" element={<DecisionWorkspacePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="personal-space" element={<PersonalSpacePage />} />
              <Route path="personal-space/new" element={<PersonalSpacePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
