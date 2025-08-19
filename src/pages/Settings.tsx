import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

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
    </div>
  );
};

export default Settings;
