import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './Pages/Home.jsx'
import App from './Pages/App.jsx'
import NavBar from './components/custom/NavBar.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<App />} />
    </Routes>
  </BrowserRouter>
)