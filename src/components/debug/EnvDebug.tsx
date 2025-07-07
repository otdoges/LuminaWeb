import React from 'react';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export function EnvDebug() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const envVars = [
    {
      name: 'VITE_SUPABASE_URL',
      value: supabaseUrl,
      required: true,
      description: 'Your Supabase project URL'
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      value: supabaseAnonKey,
      required: true,
      description: 'Your Supabase anonymous/public API key'
    }
  ];

  const allRequired = envVars.filter(env => env.required).every(env => env.value);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-2 mb-3">
        {allRequired ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Environment Variables
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        {envVars.map((env) => (
          <div key={env.name} className="flex items-center gap-2 text-sm">
            {env.value ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {env.name}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {env.value ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      {!allRequired && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Create a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> file in your project root</li>
              <li>Add the required environment variables:</li>
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs font-mono">
            <div>VITE_SUPABASE_URL=your_project_url_here</div>
            <div>VITE_SUPABASE_ANON_KEY=your_anon_key_here</div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Get these values from your Supabase dashboard:</p>
            <a 
              href="https://app.supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600"
            >
              Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
            <p className="mt-1">→ Your Project → Settings → API</p>
          </div>
        </div>
      )}
    </div>
  );
} 