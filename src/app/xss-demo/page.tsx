"use client";

import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function XSSDemoPage() {
  const [input, setInput] = useState('<img src=x onerror=alert("XSS")>');

  const vulnerableContent = { __html: input };
  const secureContent = { __html: DOMPurify.sanitize(input) };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-red-500 mb-2">Cross-Site Scripting (XSS) Demo</h1>
          <p className="text-zinc-400">
            This page demonstrates the difference between vulnerable and secure rendering of user input.
          </p>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Enter Malicious HTML/Script:
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 bg-black border border-zinc-700 rounded-lg p-4 text-green-400 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="mt-2 text-xs text-zinc-500">
            Try: <code>&lt;img src=x onerror=alert("XSS")&gt;</code> or <code>&lt;b onmouseover=alert(1)&gt;Hover me!&lt;/b&gt;</code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vulnerable Section */}
          <div className="border border-red-900/50 bg-red-950/10 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
              <span className="mr-2">❌</span> Vulnerable Rendering
            </h2>
            <div className="prose prose-invert">
              <p className="text-sm text-zinc-400 mb-4">
                Uses <code>dangerouslySetInnerHTML</code> directly. The script executes!
              </p>
              <div 
                className="bg-black p-4 rounded border border-red-800 min-h-[100px]"
                dangerouslySetInnerHTML={vulnerableContent}
              />
            </div>
          </div>

          {/* Secure Section */}
          <div className="border border-green-900/50 bg-green-950/10 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center">
              <span className="mr-2">✅</span> Secure Rendering
            </h2>
            <div className="prose prose-invert">
              <p className="text-sm text-zinc-400 mb-4">
                Uses <code>DOMPurify.sanitize()</code> before rendering. Scripts are stripped.
              </p>
              <div 
                className="bg-black p-4 rounded border border-green-800 min-h-[100px]"
                dangerouslySetInnerHTML={secureContent}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-950/20 border border-blue-900/50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-blue-400 mb-2">Why this matters?</h3>
          <p className="text-zinc-300 text-sm">
            XSS allows attackers to execute arbitrary JavaScript in your users' browsers. 
            This can lead to session hijacking (stealing cookies), redirecting users to phishing sites, 
            or performing actions on their behalf.
          </p>
          <div className="mt-4 p-4 bg-black rounded border border-blue-900/30">
            <h4 className="text-sm font-semibold text-zinc-400 mb-2">Secure Pattern Code:</h4>
            <pre className="text-xs text-green-400 overflow-x-auto">
              {`import DOMPurify from 'isomorphic-dompurify';

// ❌ BAD
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
