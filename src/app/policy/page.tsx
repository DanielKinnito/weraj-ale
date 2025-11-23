import React from 'react'

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4 text-slate-600 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                    Welcome to Weraj Ale ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <p className="mb-4">
                    We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website (such as posting routes or reviews), or otherwise when you contact us.
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; and other similar information.</li>
                    <li><strong>Social Media Login Data:</strong> We provide you with the option to register with us using your existing social media account details, like your Google account.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">
                    We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>To facilitate account creation and logon process.</li>
                    <li>To post testimonials or reviews.</li>
                    <li>To request feedback.</li>
                    <li>To enable user-to-user communications.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Contact Us</h2>
                <p className="mb-4">
                    If you have questions or comments about this policy, you may email us at support@weraj-ale.com.
                </p>
            </section>
        </div>
    )
}
