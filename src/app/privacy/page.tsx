export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">1. Information We Collect</h2>
          <p className="text-zinc-300 leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, subscribe to our service, 
            or contact us for support. This may include your email address, name, and payment information. We also collect 
            data regarding your usage of our API and services to improve performance and security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">2. How We Use Your Information</h2>
          <p className="text-zinc-300 leading-relaxed">
            We use the information we collect to operate, maintain, and improve our services, to process transactions, 
            to send you technical notices and support messages, and to detect, investigate, and prevent fraudulent transactions 
            and other illegal activities.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">3. Cookies and Tracking</h2>
          <p className="text-zinc-300 leading-relaxed">
            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. 
            Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct 
            your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">4. Data Security</h2>
          <p className="text-zinc-300 leading-relaxed">
            The security of your data is important to us, but remember that no method of transmission over the Internet, 
            or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
            your Personal Data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">5. Changes to This Privacy Policy</h2>
          <p className="text-zinc-300 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <div className="pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
