import { useState, useEffect } from 'react';
import { Edit2, PlusCircle } from 'lucide-react';

export default function TaskForm({ taskToEdit, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
    }
  }, [taskToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const taskData = { title, description, priority, due_date: dueDate || null };
    await onSave(taskData, taskToEdit?.id);
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {taskToEdit ? <><Edit2 size={20} className="text-primary"/> Редагувати задачу</> : <><PlusCircle size={20} className="text-primary"/> Нова задача</>}
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label>Назва (обов'язково):</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Напр., доробити лабораторну №5" />
        </div>
        
        <div>
          <label>Опис:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Додати деталі про задачу..." />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label>Пріоритет:</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Дедлайн (опціонально):</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Збереження...' : 'Зберегти задачу'}
          </button>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}