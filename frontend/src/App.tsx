import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/session/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
