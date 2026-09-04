import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Book } from './pages/Book';
import { Work } from './pages/Work';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#44ACAB]/30 selection:text-[#1b6b6a]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/work" element={<Work />} />
      </Routes>
      <Footer />
    </div>
  );
}

