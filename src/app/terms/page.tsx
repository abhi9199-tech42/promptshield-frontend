export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">1. Acceptance of Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            By accessing or using PromptShield ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, you must not use our Service. These terms constitute a legally binding agreement 
            between you and PromptShield regarding your use of the website and services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">2. Description of Service</h2>
          <p className="text-zinc-300 leading-relaxed">
            PromptShield provides AI prompt optimization and security tools. We reserve the right to modify, suspend, 
            or discontinue the Service at any time without notice. We shall not be liable to you or any third party 
            for any modification, suspension, or discontinuance of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">3. User Accounts</h2>
          <p className="text-zinc-300 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities 
            that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">4. Limitation of Liability</h2>
          <p className="text-zinc-300 leading-relaxed">
            TO THE FULLEST EXTENT PERMITTED BY LAW, PROMPTSHIELD AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, 
            USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS 
            OR USE THE SERVICE; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; OR (iii) UNAUTHORIZED ACCESS, 
            USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">5. Indemnification</h2>
          <p className="text-zinc-300 leading-relaxed">
            You agree to indemnify and hold harmless PromptShield and its officers, directors, employees, and agents from 
            and against any claims, disputes, demands, liabilities, damages, losses, and costs and expenses, including, 
            without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your 
            access to or use of the Service or your violation of these Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">6. Governing Law</h2>
          <p className="text-zinc-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
            PromptShield operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <div className="pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
