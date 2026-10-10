import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BackgroundVideo from './components/BackgroundVideo.jsx';
import CartBar from './components/CartBar.jsx';
import CartPanel from './components/CartPanel.jsx';
import Header from './components/Header.jsx';
import Logo from './components/Logo.jsx';
import Modals from './components/Modals.jsx';
import Checkout from './pages/Checkout.jsx';
import Home from './pages/Home.jsx';
import Order from './pages/Order.jsx';
import Restaurant from './pages/Restaurant.jsx';
import { useStore } from './store.jsx';

export default function App() {
  const { toast, t } = useStore();
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
          <Logo />
          <p>{t("Jizzax viloyati, Do'stlik tumani · Namuna loyiha: narxlar va buyurtmalar haqiqiy emas.")}</p>
          <BackgroundVideo />
        </div>
      </footer>
      {shopping && <CartBar />}
      <CartPanel />
      <Modals />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
