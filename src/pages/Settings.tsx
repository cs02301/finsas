import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { startFromZero, loadDemoData } = useAuth();
  
  const handleStartFromZero = () => {
    if (typeof startFromZero !== 'function') {
      // ayuda rápida si el hook no está disponible
      alert('Función startFromZero no disponible.');
      return;
    }
  
    if (confirm('¿Seguro que quieres iniciar desde cero? Se borrarán los datos locales.')) {
      startFromZero();
      // recargar para que el estado inicial se aplique
      window.location.reload();
    }
  };
  
  const handleLoadDemoData = () => {
    if (typeof loadDemoData !== 'function') {
      alert('Función loadDemoData no disponible.');
      return;
    }
  
    if (confirm('Cargar datos de ejemplo? Esto sobrescribirá los datos locales.')) {
      loadDemoData();
      window.location.reload();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Tema</div>
            <div className="text-sm text-gray-500">Activa modo oscuro o claro</div>
          </div>
          <button onClick={toggleTheme} className="px-4 py-2 bg-blue-600 text-white rounded">{theme === 'dark' ? 'Oscuro' : 'Claro'}</button>
        </div>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded shadow max-w-md">
        <h2 className="font-semibold mb-2">Datos de inicio</h2>
        <p className="text-sm text-gray-500 mb-4">Elige si quieres empezar con datos de ejemplo o con todo vacío para ingresar tus propios datos.</p>
        <div className="flex space-x-3">
          <button onClick={handleStartFromZero} className="px-4 py-2 bg-gray-700 text-white rounded">Iniciar desde cero</button>

          <button onClick={handleLoadDemoData} className="px-4 py-2 bg-blue-600 text-white rounded">Cargar datos de ejemplo</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
