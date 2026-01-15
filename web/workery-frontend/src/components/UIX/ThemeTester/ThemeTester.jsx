// File: src/components/UIX/ThemeTester/ThemeTester.jsx
// UIX Mobile Optimizations Applied
// Demo component to test UIX theme system

import React from 'react';
import { useUIXTheme, UIX_THEMES } from '../themes/useUIXTheme.jsx';
import Button from '../Button/Button';
import ViewButton from '../ViewButton/ViewButton';

function ThemeTester() {
  const { currentTheme, switchTheme, themeName, availableThemes } = useUIXTheme();

  const _sampleData = [
    { id: '1', name: 'Sample Item 1', description: 'This is a test item' },
    { id: '2', name: 'Sample Item 2', description: 'Another test item' }
  ];

  const _columns = [
    { key: 'name', label: 'Name', width: 'w-48' },
    { key: 'description', label: 'Description', width: 'flex-1' },
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-32',
      render: (item) => (
        <ViewButton basePath="/test" itemId={item.id} />
      )
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">UIX Theme System Test</h2>
        <p className="text-gray-600 mb-4">
          Current Theme: <strong>{themeName}</strong> ({currentTheme})
        </p>

        {/* Theme Switcher */}
        <div className="flex space-x-4 mb-8">
          {availableThemes.map(theme => (
            <Button
              key={theme}
              variant={currentTheme === theme ? "primary" : "secondary"}
              onClick={() => switchTheme(theme)}
            >
              {theme === UIX_THEMES.BLUE ? 'Blue Theme' : 'Red Theme'}
            </Button>
          ))}
        </div>

        {/* Button Examples */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold mb-4">Button Examples</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="primary" gradient>Gradient Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </div>

        {/* ViewButton Examples */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold mb-4">ViewButton Examples</h3>
          <div className="flex flex-wrap gap-4">
            <ViewButton basePath="/test" itemId="1" />
            <ViewButton basePath="/test" itemId="2" text="Details" />
            <ViewButton basePath="/test" itemId="3" text="View More" />
          </div>
        </div>

        {/* Theme Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Theme Information</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Available Themes:</strong> {availableThemes.join(', ')}</p>
            <p><strong>Current Theme:</strong> {currentTheme}</p>
            <p><strong>Theme Name:</strong> {themeName}</p>
            <p><strong>How to use:</strong> Wrap your components with UIXThemeProvider to enable theming</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeTester;