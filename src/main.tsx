import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { Toaster } from "@/components/ui/sonner";
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HomePage />
      <Toaster richColors theme="system" closeButton />
    </ErrorBoundary>
  </StrictMode>,
)