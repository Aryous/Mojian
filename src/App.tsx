// @req R5.1 — 降低认知负担：路由结构定义核心用户流 (Landing → Dashboard → TemplateSelect → Editor)
import { BrowserRouter, Routes, Route } from 'react-router'
import { LandingPage } from '@/ui/pages/LandingPage'
import { DashboardPage } from '@/ui/pages/DashboardPage'
import { EditorPage } from '@/ui/pages/EditorPage'
import { TemplateSelectPage } from '@/ui/pages/TemplateSelectPage'
import '@/ui/tokens/index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/new" element={<TemplateSelectPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
