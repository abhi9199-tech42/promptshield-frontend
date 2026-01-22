'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ActivityLog } from '../types';

interface AnalyticsProps {
  logs: ActivityLog[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs }) => {
  // Process data for chart
  // Reverse to show oldest to newest left to right
  const data = [...logs].reverse().map(log => {
    let timeStr = 'Invalid Date';
    try {
      if (log.created_at) {
        const date = new Date(log.created_at.endsWith('Z') ? log.created_at : log.created_at + 'Z');
        if (!isNaN(date.getTime())) {
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    } catch (e) {
      console.error("Date parsing error", e);
    }
    
    return {
      id: log.id,
      time: timeStr,
      raw: log.raw_tokens,
      compressed: log.compressed_tokens,
      savings: (log.savings_ratio * 100).toFixed(1),
    };
  });

  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No activity history available yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Token Reduction Chart */}
      <div className="h-[300px] w-full bg-gray-900/30 p-4 rounded-lg border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Token Reduction History</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} label={{ value: 'Tokens', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
              itemStyle={{ color: '#f3f4f6' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="raw" name="Raw Tokens" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="compressed" name="Compressed Tokens" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings Trend Chart */}
      <div className="h-[250px] w-full bg-gray-900/30 p-4 rounded-lg border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Savings Ratio Trend (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              name="Savings %" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Efficiency Leaderboard */}
      <div className="w-full bg-gray-900/30 p-4 rounded-lg border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Efficiency Leaderboard (Top 5)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Provider</th>
                <th className="px-4 py-2">Savings</th>
                <th className="px-4 py-2">Latency</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {[...logs]
                .sort((a, b) => b.savings_ratio - a.savings_ratio)
                .slice(0, 5)
                .map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                    <td className="px-4 py-2 font-mono text-xs">{log.id}</td>
                    <td className="px-4 py-2 capitalize">{log.provider}</td>
                    <td className="px-4 py-2 text-emerald-400 font-medium">
                      {(log.savings_ratio * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2">{log.latency_ms.toFixed(2)}ms</td>
                    <td className="px-4 py-2 text-xs">
                      {(() => {
                        try {
                          if (!log.created_at) return 'N/A';
                          const date = new Date(log.created_at.endsWith('Z') ? log.created_at : log.created_at + 'Z');
                          return !isNaN(date.getTime()) ? date.toLocaleString() : 'Invalid Date';
                        } catch (e) { return 'Invalid Date'; }
                      })()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
