import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import CartPanel from './components/CartPanel.jsx';
import CartBar from './components/CartBar.jsx';
import Modals from './components/Modals.jsx';
import Home from './pages/Home.jsx';
import Restaurant from './pages/Restaurant.jsx';
import Checkout from './pages/Checkout.jsx';
import Order from './pages/Order.jsx';
import { useStore } from './store.jsx';

export default function App() {
  const { toast } = useStore();
  const { pathname } = useLocation();
  const shopping = pathname === '/' || pathname.startsWith('/r/');

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/:id" element={<Restaurant />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order" element={<Order />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        <div className="container footer-in">
          <span className="footer-logo">Dasturxon</span>
          <p>Namuna loyiha. Oshxonalar, narxlar va buyurtmalar haqiqiy emas.</p>
        </div>
      </footer>
      {shopping && <CartBar />}
      <CartPanel />
      <Modals />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
