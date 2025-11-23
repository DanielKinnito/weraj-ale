import React from 'react'

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="mb-4 text-slate-600 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="mb-4">
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Weraj Ale ("we," "us" or "our"), concerning your access to and use of the Weraj Ale website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. User Representations</h2>
                <p className="mb-4">
                    By using the Site, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>All registration information you submit will be true, accurate, current, and complete.</li>
                    <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                    <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                    <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. User Contributions</h2>
                <p className="mb-4">
                    The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
                </p>
                <p className="mb-4">
                    Contributions may be viewable by other users of the Site and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Contact Us</h2>
                <p className="mb-4">
                    In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at support@weraj-ale.com.
                </p>
            </section>
        </div>
    )
}
