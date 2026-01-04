# PromptPower

A simple web app for optimizing AI prompts using Google Gemini. Type in a basic prompt and get back a better, more detailed version that works great with any AI tool.

## Demo

https://github.com/user-attachments/assets/af24f28c-83d4-4cf3-b742-ca95c1cdf006

## Table of Contents

- [What is this](#what-is-this)
- [Features](#features)
- [Security Features](#security-features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## What is this

PromptPower helps you write better prompts for AI chatbots. Instead of spending time figuring out how to phrase your questions perfectly, just type what you want and let the app optimize it for you. The optimized prompts work with ChatGPT, Claude, Gemini, or any other AI tool.

## Features

- **Prompt Optimization** - Takes your rough prompt and makes it clearer and more effective
- **History** - Saves your last 5 optimized prompts so you can go back to them later
- **Copy Button** - Click to copy the optimized prompt with a smooth animation
- **Keyboard Shortcut** - Press Ctrl+Enter (or Cmd+Enter on Mac) to optimize without clicking
- **Dark Theme** - Clean black interface that's easy on the eyes
- **Persistent Storage** - Your history stays even after you close the browser

## Security Features

Built with production-ready security measures to protect your data and prevent abuse:

- **Rate Limiting** - IP-based rate limiting prevents API abuse (10 requests per minute per user). Stops malicious users from overloading the service and exhausting API quotas.

- **Input Validation** - All user inputs are validated on both client and server side. Checks for minimum/maximum length, detects malicious patterns like script injection attempts, and sanitizes data before processing.

- **API Key Protection** - Gemini API key is stored server-side only in environment variables. Never exposed to the client browser or included in any API responses. Protected by .gitignore to prevent accidental commits.

- **XSS Prevention** - Prevents cross-site scripting attacks through input sanitization and safe output encoding. Dangerous HTML/JavaScript patterns are detected and blocked before processing.

- **Error Handling** - Generic error messages shown to users to prevent information leakage. Detailed errors logged server-side only. No stack traces or sensitive data exposed in responses.

- **CORS Protection** - API endpoints restricted to authorized domains only. Prevents unauthorized websites from making requests to your API.

These security implementations follow industry best practices and make the application safe for production deployment.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Google Gemini API

## Setup

You'll need Node.js 18 or higher and a Google Gemini API key.

1. Clone this repo:
```bash
git clone https://github.com/yourusername/promptpower.git
cd promptpower
```

2. Install everything:
```bash
npm install
```

3. Make a file called `.env.local` in the main folder and add:
```
GEMINI_API_KEY=your_api_key_here
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your API key from https://makersuite.google.com/app/apikey

4. Start it up:
```bash
npm run dev
```

5. Go to http://localhost:3000

## How to Use

1. Type your prompt in the text box
2. Hit the OPTIMIZE button or press Ctrl+Enter
3. The optimized version shows up below
4. Click COPY to grab it
5. Click HISTORY to see your previous prompts
6. Click CLEAR ALL if you want to delete everything

## Project Structure

```
promptpower/
├── src/
│   ├── app/
│   │   ├── api/optimize/route.ts    # API endpoint
│   │   ├── layout.tsx                # Main layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Styles
│   ├── components/
│   │   ├── PromptOptimizer.tsx       # Main component
│   │   └── CopyButton.tsx            # Copy button
│   └── lib/
│       ├── validators.ts             # Input checking
│       └── rateLimiter.ts            # Rate limiting
├── extension/                        # Chrome extension
└── .env.local                        # Your API key (not pushed to git)
```

## Environment Variables

| Variable | What it does | Default |
|----------|-------------|---------|
| GEMINI_API_KEY | Your Google Gemini API key | Required |
| RATE_LIMIT_MAX_REQUESTS | How many requests allowed per minute | 10 |
| RATE_LIMIT_WINDOW_MS | Time window for rate limit in milliseconds | 60000 |
| NEXT_PUBLIC_APP_URL | Your app URL | http://localhost:3000 |

## License

MIT
