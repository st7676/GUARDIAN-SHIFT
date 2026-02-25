import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { pagesConfig } from './pages.config'
import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'

function App() {
  const { mainPage, Pages, Layout, noLayoutPages = [] } = pagesConfig

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          {Object.entries(Pages).map(([pageName, PageComponent]) => {
            // Create proper path - mainPage is "/" and others are "/pagename"
            const isMainPage = pageName === mainPage
            const path = isMainPage ? '/' : `/${pageName.toLowerCase()}`
            const shouldSkipLayout = noLayoutPages.includes(pageName)
            
            if (Layout && !shouldSkipLayout) {
              return (
                <Route
                  key={pageName}
                  path={path}
                  element={
                    <Layout currentPageName={pageName}>
                      <PageComponent />
                    </Layout>
                  }
                />
              )
            }
            
            return (
              <Route
                key={pageName}
                path={path}
                element={<PageComponent />}
              />
            )
          })}
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
