# PromptPower - Quick Setup Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
The Gemini API key is already configured in `.env.local`. If you need to update it:
```bash
# Edit .env.local
GEMINI_API_KEY=your_new_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

## ✅ Verify Installation

1. **Homepage loads** - You should see the PromptPower landing page
2. **Enter a prompt** - Type something like "write a function to sort an array"
3. **Click "Optimize Prompt"** - You should get an optimized version
4. **Click "Copy to Clipboard"** - The optimized prompt should be copied

## 🔧 Troubleshooting

### API Key Issues

If you see "Service temporarily unavailable" errors:

1. **Verify API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate a new API key if needed
   - Update `.env.local` with the new key
   - Restart the dev server

2. **Check API Quota**
   - Free tier: 15 requests/minute
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Check your Gemini API usage and quotas

3. **Verify API Access**
   Test your API key directly:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY"
   ```

### Rate Limiting

If you hit rate limits:
- Wait 60 seconds for the limit to reset
- Or increase limits in `.env.local`:
  ```env
  RATE_LIMIT_MAX_REQUESTS=20
  RATE_LIMIT_WINDOW_MS=60000
  ```

## 📦 Chrome Extension Setup

1. **Build Web App First**
   ```bash
   npm run build
   npm start
   ```

2. **Load Extension**
   - Open Chrome: `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Test Extension**
   - Visit [ChatGPT](https://chat.openai.com)
   - Look for "Optimize with PromptPower" button
   - Type a prompt and click the button

## 🎯 Next Steps

1. **Read the full README** - [README.md](README.md)
2. **Review security features** - All OWASP best practices implemented
3. **Deploy to production** - See deployment guide in README
4. **Customize** - Adjust rate limits, styling, or add features

## 📝 Important Notes

- **API Key Security**: Never commit `.env.local` to git
- **Rate Limiting**: Configured to 10 requests/minute per IP
- **Security**: All OWASP Top 10 protections implemented
- **Production**: Update extension API URLs before publishing

## 🆘 Support

For issues:
1. Check server logs in terminal
2. Check browser console (F12)
3. Review the troubleshooting section
4. Check the full README for detailed docs

---

**Built with Next.js 15, TypeScript, and Google Gemini AI**
