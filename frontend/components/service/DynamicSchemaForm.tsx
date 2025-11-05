'use client';

import { useState } from 'react';
import { SchemaField } from '@/types/service';
import { getDefaultValues } from '@/lib/schema-utils';

interface DynamicSchemaFormProps {
  fields: Record<string, SchemaField>;
  onSubmit: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export function DynamicSchemaForm({ fields, onSubmit, disabled }: DynamicSchemaFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(getDefaultValues(fields));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(fields).map(([key, field]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}

          {field.enum ? (
            <select
              name={key}
              value={formData[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              required={field.required}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-x402-primary focus:border-transparent"
            >
              <option value="">Select...</option>
              {field.enum.map((option: any) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'boolean' ? (
            <input
              type="checkbox"
              name={key}
              checked={formData[key] || false}
              onChange={(e) => handleChange(key, e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-x402-primary focus:ring-x402-primary border-gray-300 rounded"
            />
          ) : field.type === 'number' || field.type === 'integer' ? (
            <input
              type="number"
              name={key}
              value={formData[key] || ''}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              min={field.minimum}
              max={field.maximum}
              required={field.required}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-x402-primary focus:border-transparent"
            />
          ) : (
            <input
              type={field.format === 'email' ? 'email' : field.format === 'url' ? 'url' : 'text'}
              name={key}
              value={formData[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              required={field.required}
              disabled={disabled}
              placeholder={field.default || ''}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-x402-primary focus:border-transparent"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={disabled}
        className="w-full px-4 py-2 bg-x402-primary text-white rounded-lg hover:bg-x402-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? 'Testing...' : 'Submit'}
      </button>
    </form>
  );
}
