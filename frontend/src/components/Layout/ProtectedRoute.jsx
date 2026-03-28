import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Якщо користувач не авторизований, редирект на сторінку логіну
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Якщо авторизований, рендеримо дочірній компонент (сторінку)
  return children;
};