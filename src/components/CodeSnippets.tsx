import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeSnippetsProps {
  rawText: string;
  provider: string;
  model: string;
}

export const CodeSnippets: React.FC<CodeSnippetsProps> = ({ rawText, provider, model }) => {
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'js'>('curl');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("http://localhost:8000");

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const API_URL = `${origin}/api/v1/execute`;

  const getCurlCode = () => {
    return `curl -X POST "${API_URL}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "${rawText.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    "provider": "${provider}",
    "model": "${model}"
  }'`;
  };

  const getPythonCode = () => {
    return `import requests

url = "${API_URL}"
payload = {
    "text": """${rawText}""",
    "provider": "${provider}",
    "model": "${model}"
}

response = requests.post(url, json=payload)
print(response.json())`;
  };

  const getJsCode = () => {
    return `const response = await fetch("${API_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "${rawText.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    provider: "${provider}",
    model: "${model}",
  }),
});

const data = await response.json();
console.log(data);`;
  };

  const getCode = () => {
    switch (activeLang) {
      case 'curl': return getCurlCode();
      case 'python': return getPythonCode();
      case 'js': return getJsCode();
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <div className="flex space-x-1">
          {(['curl', 'python', 'js'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                activeLang === lang
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'Node.js'}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-blue-300 whitespace-pre-wrap">
          {getCode()}
        </pre>
      </div>
    </div>
  );
};
