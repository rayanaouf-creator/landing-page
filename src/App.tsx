import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Book } from './pages/Book';
import { Work } from './pages/Work';
import { ERPNextPage } from './pages/ERPNext';
import { Iso9001Page } from './pages/Iso9001';
import { TeamPage } from './pages/TeamPage';
import { ServicesPage } from './pages/ServicesPage';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#44ACAB]/30 selection:text-[#1b6b6a]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/work" element={<Work />} />
        <Route path="/erpnext" element={<ERPNextPage />} />
        <Route path="/iso9001" element={<Iso9001Page />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

