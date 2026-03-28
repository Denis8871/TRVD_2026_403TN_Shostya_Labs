import { useEffect, useState } from 'react';
import AppHeader from '../components/Layout/AppHeader';
import { supabase } from '../api/supabase';
import { Lock, ShieldAlert, Unlock } from 'lucide-react';

export default function AdminPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // НОВІ СТАНИ ДЛЯ ПАРОЛЯ
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      alert('Помилка: ' + error.message);
    } else {
      setProfiles(data);
    }
    setLoading(false);
  };

  // Завантажуємо юзерів тільки ЯКЩО панель розблокована
  useEffect(() => {
    if (isUnlocked) {
      fetchUsers();
    }
  }, [isUnlocked]);

  const toggleBlockStatus = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !currentStatus })
      .eq('id', userId);

    if (error) {
      alert('Помилка оновлення статусу: ' + error.message);
    } else {
      setProfiles(profiles.map(p => 
        p.id === userId ? { ...p, is_blocked: !currentStatus } : p
      ));
    }
  };

  // ОБРОБНИК ВВОДУ ПАРОЛЯ
  const handleUnlock = (e) => {
    e.preventDefault();
    // Встановлюємо пароль для адмінки (можеш змінити на свій)
    if (password === 'admin2026') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Невірний пароль доступу!');
      setPassword('');
    }
  };

  // 1. ЕКРАН БЛОКУВАННЯ (якщо пароль ще не введено)
  if (!isUnlocked) {
    return (
      <div>
        <AppHeader />
        <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '50%', marginBottom: '20px' }}>
              <Lock size={32} color="var(--primary)" />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              Доступ закрито
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
              Ця сторінка призначена лише для адміністраторів системи.
            </p>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль..."
                required
                style={{ textAlign: 'center', letterSpacing: '2px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
                <Unlock size={18} /> Розблокувати
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // 2. САМА АДМІН-ПАНЕЛЬ (якщо пароль вірний)
  return (
    <div>
      <AppHeader />
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert size={28} color="var(--primary)" />
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Адмін-панель</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Управління користувачами та безпекою системи.</p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Завантаження даних...</div>
        ) : (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>ID</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Ім'я</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Роль</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Статус</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(profile => (
                  <tr key={profile.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {profile.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500', color: 'var(--text-main)' }}>
                      {profile.full_name || 'Без імені'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="badge" style={{ backgroundColor: profile.role === 'admin' ? 'var(--primary)' : 'var(--bg-color)', color: profile.role === 'admin' ? 'white' : 'var(--text-muted)' }}>
                        {profile.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: profile.is_blocked ? 'var(--danger)' : 'var(--success)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {profile.is_blocked ? '🚫 Заблокований' : '✅ Активний'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => toggleBlockStatus(profile.id, profile.is_blocked)}
                        className={`btn ${profile.is_blocked ? 'btn-outline' : 'btn-danger'}`}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {profile.is_blocked ? 'Розблокувати' : 'Заблокувати'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}