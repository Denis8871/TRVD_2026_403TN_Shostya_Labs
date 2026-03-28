import { useEffect, useState } from 'react';
import AppHeader from '../components/Layout/AppHeader';
import TaskForm from '../components/Tasks/TaskForm';
import { taskService } from '../api/taskService';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Calendar, ArrowUp, ArrowRight, ArrowDown, Inbox, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); 
  
  // НОВЕ: Стан для пошуку
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) { alert('Помилка: ' + err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchTasks(); }, [user]);

  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        await taskService.updateTask(taskId, taskData);
        toast.success('Задачу успішно оновлено!'); // НОВЕ
      } else {
        await taskService.createTask({ ...taskData, user_id: user.id });
        toast.success('Нову задачу створено!'); // НОВЕ
      }
      await fetchTasks();
      setIsFormOpen(false);
      setTaskToEdit(null);
    } catch (err) { 
      toast.error('Помилка: ' + err.message); // НОВЕ
    }
  };

const handleDeleteTask = async (taskId) => {
    if (window.confirm('Видалити задачу?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        toast.success('Задачу видалено'); // НОВЕ
      } catch (err) { 
        toast.error('Помилка видалення: ' + err.message); // НОВЕ
      }
    }
  };
const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await taskService.updateTask(task.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      
      // Додаємо легке сповіщення при зміні статусу
      if (newStatus === 'done') toast.success('Відмінна робота!');
    } catch (err) { 
      toast.error('Помилка: ' + err.message); // НОВЕ
    }
  };
  // НОВЕ: Вираховуємо статистику для прогрес-бару
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // ОНОВЛЕНО: Фільтрація тепер враховує і статус, і текст пошуку
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' ? true : filter === 'active' ? task.status !== 'done' : task.status === 'done';
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (sortBy === 'deadline') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    return 0;
  });

  return (
    <div>
      <AppHeader />
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)' }}>Мої задачі</h2>
          {!isFormOpen && (
            <button className="btn btn-primary" onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }} style={{ gap: '6px' }}>
              <Plus size={16} /> Нова задача
            </button>
          )}
        </div>

        {/* НОВЕ: Віджет прогресу (показуємо, якщо є хоча б одна задача) */}
        {totalTasks > 0 && !isFormOpen && (
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
              <span style={{ color: 'var(--text-muted)' }}>Прогрес виконання</span>
              <span style={{ color: progressPercentage === 100 ? 'var(--success)' : 'var(--primary)' }}>
                {completedTasks} з {totalTasks} ({progressPercentage}%)
              </span>
            </div>
            {/* Сама смуга прогресу */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progressPercentage}%`, 
                backgroundColor: progressPercentage === 100 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 0.5s ease-in-out, background-color 0.5s ease'
              }}></div>
            </div>
          </div>
        )}

        {/* Панель керування: Фільтри + Пошук + Сортування */}
        {!isFormOpen && tasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            
            {/* Верхній ряд: Пошук і Сортування */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              
              {/* Рядок пошуку */}
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Знайти задачу..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '38px', margin: 0 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ margin: 0, padding: '8px 12px' }}>
                  <option value="newest">Новіші</option>
                  <option value="oldest">Старіші</option>
                  <option value="priority">За пріоритетом</option>
                  <option value="deadline">За дедлайном</option>
                </select>
              </div>
            </div>

            {/* Нижній ряд: Кнопки фільтрів */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`btn btn-outline ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Всі</button>
              <button className={`btn btn-outline ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Активні</button>
              <button className={`btn btn-outline ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Завершені</button>
            </div>
            
          </div>
        )}

        {isFormOpen && (
          <TaskForm taskToEdit={taskToEdit} onSave={handleSaveTask} onCancel={() => { setIsFormOpen(false); setTaskToEdit(null); }} />
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Завантаження...</div>
        ) : tasks.length === 0 && !isFormOpen ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Inbox size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-muted)' }}>У тебе ще немає задач</p>
            <button className="btn btn-primary" onClick={() => setIsFormOpen(true)} style={{ gap: '6px' }}>
               <Plus size={16} /> Створити першу
            </button>
          </div>
        ) : sortedAndFilteredTasks.length === 0 && !isFormOpen ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            За вашим запитом нічого не знайдено 🕵️‍♂️
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedAndFilteredTasks.map(task => (
              <div key={task.id} className={`card task-card ${task.status === 'done' ? 'done' : ''}`}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                  <input type="checkbox" className="custom-checkbox" checked={task.status === 'done'} onChange={() => handleToggleStatus(task)} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                      {task.title}
                    </h3>
                    {task.description && <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '14px' }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${task.priority}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {task.priority === 'high' ? <ArrowUp size={12} /> : task.priority === 'medium' ? <ArrowRight size={12} /> : <ArrowDown size={12} />}
                        {task.priority === 'high' ? 'Високий' : task.priority === 'medium' ? 'Середній' : 'Низький'}
                      </span>
                      {task.due_date && (
                        <span className="badge badge-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-icon" onClick={() => {setTaskToEdit(task); setIsFormOpen(true);}} title="Редагувати"><Edit2 size={18} /></button>
                  <button className="btn btn-danger btn-icon" onClick={() => handleDeleteTask(task.id)} title="Видалити"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}