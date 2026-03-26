import { BrowserRouter, Routes, Route } from 'react-router'
import { HomePage } from '@/ui/pages/HomePage'
import { EditorPage } from '@/ui/pages/EditorPage'
import { TemplateSelectPage } from '@/ui/pages/TemplateSelectPage'
import '@/ui/tokens/index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<TemplateSelectPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
