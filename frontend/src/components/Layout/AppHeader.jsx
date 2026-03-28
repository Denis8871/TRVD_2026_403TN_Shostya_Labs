import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// Залишаємо тільки ОДИН імпорт, який включає всі потрібні іконки:
import { Sun, Moon, Shield, LogOut, CheckSquare, User } from 'lucide-react';

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header style={{ 
      backgroundColor: 'var(--surface)', 
      borderBottom: '1px solid var(--border)', 
      padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Link to="/tasks" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={24} color="var(--primary)" />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>Task Manager</h1>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Виправлено: Кнопка профілю замість простого тексту */}
          <Link to="/profile" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px', gap: '8px', border: 'none', backgroundColor: 'transparent' }} title="Мій профіль">
            <User size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user?.email}</span>
          </Link>
          
          {user?.user_metadata?.full_name?.toLowerCase().includes('admin') && (
             <Link to="/admin" className="btn btn-icon" title="Адмін-панель">
               <Shield size={18} />
             </Link>
          )}

          <button className="btn btn-icon" onClick={toggleTheme} title="Змінити тему">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '13px', gap: '6px' }} title="Вийти">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}