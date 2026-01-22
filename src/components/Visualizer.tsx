import React from 'react';
import { AnalysisSegment } from '../types';

interface VisualizerProps {
  analysis?: AnalysisSegment[];
}

export const Visualizer: React.FC<VisualizerProps> = ({ analysis }) => {
  if (!analysis || analysis.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 italic">
        No semantic analysis data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analysis.map((segment, idx) => (
        <div 
          key={idx} 
          className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors"
        >
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            {/* ROOT Chip */}
            <div className="flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900">
              <span className="mr-1 opacity-70">ROOT:</span>
              {segment.root}
            </div>

            {/* META Chip (if exists) */}
            {segment.meta && (
              <div className="flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-950 text-purple-400 border border-purple-900">
                <span className="mr-1 opacity-70">META:</span>
                {segment.meta}
              </div>
            )}

            {/* OPS Chips */}
            {segment.ops.map((op, i) => (
              <div 
                key={`op-${i}`} 
                className="flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-900"
              >
                <span className="mr-1 opacity-70">OP:</span>
                {op}
              </div>
            ))}
          </div>

          {/* ROLES Grid */}
          {Object.entries(segment.roles).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(segment.roles).map(([role, entity], i) => (
                <div 
                  key={`role-${i}`} 
                  className="flex items-center px-3 py-2 rounded bg-amber-950/30 border border-amber-900/50 text-sm"
                >
                  <span className="text-amber-500 font-bold text-xs uppercase mr-2 min-w-[3rem]">
                    {role}
                  </span>
                  <span className="text-amber-100 truncate" title={entity}>
                    {entity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
