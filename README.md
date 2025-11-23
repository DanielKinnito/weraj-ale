# Weraj Ale - Public Transport Route Sharing

Weraj Ale is a community-driven platform for sharing and discovering public transport routes in Ethiopia. Users can find prices, vehicle types, and routes for taxis, buses, and more.

## Features

- **Route Discovery**: View routes on an interactive map.
- **Route Submission**: Add new routes with start/end points, intermediate stops, price, and vehicle type.
- **Reviews**: Rate and review routes to help others.
- **Authentication**: Secure login via Google (Supabase Auth).
- **Dark Mode**: Fully supported dark mode interface.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **Map**: React Leaflet (OpenStreetMap)
- **Deployment**: Vercel

## Setup Instructions

1. **Clone the repository**:

    ```bash
    git clone https://github.com/DanielKinnito/weraj-ale.git
    cd weraj-ale
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Environment Variables**:
    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4. **Run locally**:

    ```bash
    npm run dev
    ```

## Deployment to Vercel

1. Push your code to GitHub.
2. Import the project in Vercel.
3. **Critical**: In Vercel Project Settings > Environment Variables, add:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Authentication Configuration

### Google Login Setup

1. Go to Supabase Dashboard > Authentication > Providers > Google.
2. Enable Google and add your Client ID and Secret (from Google Cloud Console).
3. **Redirect URIs**:
    - Local: `http://localhost:3000/auth/callback`
    - Production: `https://your-vercel-app.vercel.app/auth/callback`
    - Add these to **both** Supabase (URL Configuration) and Google Cloud Console (Authorized Redirect URIs).

### Customizing "Sign in to..."

To change the text "Sign in to <project-id>.supabase.co" on the Google consent screen:

1. **Custom Domain**: You need a custom domain for your Supabase project (Paid Add-on).
2. **Google Verification**: Verify your domain in Google Cloud Console and configure the OAuth consent screen with your app name and logo.
3. Once verified, the consent screen will show your App Name instead of the Supabase URL.

## Legal

- [Privacy Policy](/policy)
- [Terms of Service](/tos)
