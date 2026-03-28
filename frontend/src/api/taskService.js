import { supabase } from './supabase';

export const taskService = {
  // Отримати всі задачі поточного користувача
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false }); // Нові зверху
    
    if (error) throw error;
    return data;
  },

  // Створити нову задачу
  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single(); // Повертаємо створений об'єкт
    
    if (error) throw error;
    return data;
  },

  // Оновити статус або текст задачі
  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Видалити задачу
  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};