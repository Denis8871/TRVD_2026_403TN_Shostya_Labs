import { useEffect, useState } from 'react';
import AppHeader from '../components/Layout/AppHeader';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Завантажуємо поточні дані профілю
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFullName(data.full_name || '');
          setRole(data.role || 'user');
        }
      } catch (err) {
        toast.error('Не вдалося завантажити профіль');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  // Зберігаємо нове ім'я
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Профіль успішно оновлено!');
    } catch (err) {
      toast.error('Помилка збереження: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AppHeader />
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
          <User size={32} color="var(--primary)" />
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Мій профіль</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Завантаження...</div>
        ) : (
          <div className="card">
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email (Тільки для читання) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Mail size={16} /> Email акаунта
                </label>
                <input 
                  type="text" 
                  value={user?.email || ''} 
                  disabled 
                  style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>

              {/* Роль (Тільки для читання) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Shield size={16} /> Роль у системі
                </label>
                <input 
                  type="text" 
                  value={role === 'admin' ? 'Адміністратор' : 'Користувач'} 
                  disabled 
                  style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>

              {/* Ім'я (Можна редагувати) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <User size={16} /> Повне ім'я
                </label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Введіть ваше ім'я..."
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', gap: '8px', padding: '10px' }}>
                  <Save size={18} />
                  {saving ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>
    </div>
  );
}