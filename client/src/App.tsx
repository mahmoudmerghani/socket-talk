import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage/LoginPage'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  )
}

export default App
