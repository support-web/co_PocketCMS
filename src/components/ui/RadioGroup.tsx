'use client';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
}

export function RadioGroup({ name, value, onChange, options, label }: RadioGroupProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              value === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-5 w-5 text-primary-500 focus:ring-primary-500"
            />
            <div className="ml-3">
              <span className="block text-base font-medium text-gray-900">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500 mt-1">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
