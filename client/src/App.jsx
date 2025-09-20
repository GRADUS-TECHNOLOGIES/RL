import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

//* IMPORT DE PAGINAS
import UnderConstructionPage2 from './pages/UnderConstPage.jsx'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UnderConstructionPage2 />} />
      </Routes>
    </Router>
  )
}

