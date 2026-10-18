/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { ProcessingPage } from './pages/ProcessingPage';
import {
  AboutPage,
  PrivacyPolicyPage,
  TermsPage,
  ContactPage,
} from './pages/StaticPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { getToolBySlug } from './data/toolsCatalog';

const PageLoadingFallback: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-[#1769FF]/15 mx-auto mb-4" />
    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
  </div>
);

const MainRouter: React.FC = () => {
  const { currentPath, settings, lang } = useApp();
  const isDark = settings.theme === 'dark';

  // Strip query string for route matching
  const cleanPath = currentPath.split('?')[0] || '/';

  let content: React.ReactNode;

  if (cleanPath === '/' || cleanPath === '') {
    content = <HomePage />;
  } else if (cleanPath === '/all-tools') {
    content = <AllToolsPage />;
  } else if (cleanPath === '/favorites') {
    content = <FavoritesPage />;
  } else if (cleanPath === '/settings') {
    content = <SettingsPage />;
  } else if (cleanPath === '/admin') {
    content = <AdminPage />;
  } else if (cleanPath === '/about') {
    content = <AboutPage />;
  } else if (cleanPath === '/privacy') {
    content = <PrivacyPolicyPage />;
  } else if (cleanPath === '/terms') {
    content = <TermsPage />;
  } else if (cleanPath === '/contact') {
    content = <ContactPage />;
  } else if (
    (cleanPath.startsWith('/tools/') || cleanPath.startsWith('/tool/')) &&
    cleanPath.endsWith('/process')
  ) {
    const slug = cleanPath
      .replace(/^\/(?:tools|tool)\//, '')
      .replace(/\/process$/, '')
      .trim();
    const tool = getToolBySlug(slug);
    content = tool ? <ProcessingPage slug={slug} /> : <NotFoundPage />;
  } else if (cleanPath.startsWith('/tools/') || cleanPath.startsWith('/tool/')) {
    const slug = cleanPath.replace(/^\/(?:tools|tool)\//, '').trim();
    const tool = getToolBySlug(slug);
    content = tool ? <ToolDetailPage slug={slug} /> : <NotFoundPage />;
  } else {
    content = <NotFoundPage />;
  }

  return (
    <div
      dir={lang === 'en' ? 'ltr' : 'rtl'}
      className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200 ${
        settings.reducedMotion ? 'reduce-motion' : ''
      } ${
        isDark
          ? 'dark bg-slate-950 text-[#F8FAFF]'
          : 'bg-[#F5F9FF] text-[#172B4D]'
      }`}
    >
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>{content}</Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
