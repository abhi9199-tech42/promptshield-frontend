import React from 'react';

interface SuggestionsProps {
  suggestions?: string[];
}

export const Suggestions: React.FC<SuggestionsProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" />
            <path d="m4.93 4.93 2.83 2.83" />
            <path d="M2 12h4" />
            <path d="m4.93 19.07 2.83-2.83" />
            <path d="M12 22v-4" />
            <path d="m19.07 19.07-2.83-2.83" />
            <path d="M22 12h-4" />
            <path d="m19.07 4.93-2.83 2.83" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-amber-200">Optimization Suggestions</h3>
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-amber-100/80">
            <span className="select-none text-amber-500/50">•</span>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};
