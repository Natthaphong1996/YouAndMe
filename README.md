# YouAndMe - Countdown & Memories

A responsive, seasonal countdown web application built for you.

## Features
- **Countdown**: Real-time countdown to April 24, 2029.
- **Progress Bar**: Visualizes the journey (2026-2029).
- **Seasonal Themes**: Automatically changes dates based on Supabase data (Sakura, Rainy, Winter).
- **Daily Messages**: Fetches a special message for each day.
- **Memories**: View past daily messages in a paginated history list.

## Tech Stack
- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5.3
- Supabase (PostgreSQL)
- Vercel Ready

## Setup & Deployment

### 1. Database Setup (Supabase)
This project requires two tables in Supabase:
- `themes`: Stores seasonal theme configurations.
- `daily_messages`: Stores daily messages.

(The migrations have typically been applied by the AI assistant).

### 2. Local Extension
Simply open `index.html` in your browser or use a local server like Live Server.

### 3. Deploy to Vercel
1. Upload this folder to GitHub.
2. Import the project in Vercel.
3. Your site will be live!

### Environment Variables
For a purely static site (HTML/JS), the Supabase keys are client-side.
Currently they are configured in `script.js`.
Ensure your Supabase `anon` key policies allowing public SELECT access (RLS is enabled).

## Customization
- **Themes**: Add new rows to the `themes` table with names like `sakura`, `rainy`, `winter` (mapped to CSS styles).
- **Messages**: Add rows to `daily_messages` with the date.

## Privacy
Since there is no login, anyone with the URL can view the countdown. RLS policies are set to Read-Only for the public.
