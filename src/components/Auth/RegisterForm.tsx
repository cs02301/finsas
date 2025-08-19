import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';

export const RegisterForm: React.FC = () => {
  const { register, isLoading } = useAuth();
  const { error, success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      error('Error', 'Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      error('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const registerSuccess = await register(formData.email, formData.password, formData.name);
    if (registerSuccess) {
      success('¡Cuenta creada!', 'Tu cuenta ha sido creada exitosamente');
    } else {
      error('Error', 'No se pudo crear la cuenta');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre completo"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        icon={User}
        placeholder="Tu nombre"
        required
      />

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

      <Input
        label="Confirmar contraseña"
        type={showPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={Lock}
        placeholder="••••••••"
        required
      />

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Crear Cuenta
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
};