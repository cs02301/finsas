import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { error } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      error('Error', 'Por favor completa todos los campos');
      return;
    }

    const success = await login(formData.email, formData.password);
    if (!success) {
      error('Error de autenticación', 'Email o contraseña incorrectos');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        icon={Mail}
        placeholder="tu@email.com"
        required
      />

      <div className="relative">
        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Iniciar Sesión
      </Button>

      <div className="text-center space-y-2">
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </form>
  );
};