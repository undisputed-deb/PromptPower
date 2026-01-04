# Gemini API Key Setup & Troubleshooting

## ✅ FIXED: Model Updated to gemini-2.5-flash

The application now uses **`gemini-2.5-flash`** instead of `gemini-2.0-flash-exp` for better quota limits and stability.

---

## 🔧 What Was Changed

**Files Modified**:
- [`src/lib/gemini.ts`](src/lib/gemini.ts) - Updated to use `gemini-2.5-flash` model

**Why This Fix Works**:
- The experimental model (`gemini-2.0-flash-exp`) has very limited free tier quotas
- The stable model (`gemini-2.5-flash`) has better quotas and is production-ready
- Free tier limits: 15 requests/minute, 1,500 requests/day

---

## 📝 API Key Setup Guide

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key" or "Create API Key"
3. Copy your API key (starts with `AIzaSy...`)

### Step 2: Configure Environment Variable

Edit `.env.local` in the project root:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Dev Server

```bash
# Stop any running server
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

---

## 🧪 Test Your API Key

### Quick Test (Command Line)
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY"
```

**Expected Response**: JSON with generated text

### Test in Application

1. Open http://localhost:3000
2. Enter a prompt: "write a function to sort an array"
3. Click "Optimize Prompt"
4. You should get an optimized version back

---

## ⚠️ Common Errors & Solutions

### Error: "429 - Quota Exceeded"

**Cause**: You've hit the free tier rate limit

**Solutions**:
1. **Wait 60 seconds** - Free tier allows 15 requests/minute
2. **Check your usage**: https://ai.dev/usage?tab=rate-limit
3. **Upgrade to paid tier** (if needed): https://console.cloud.google.com/

**Rate Limits (Free Tier)**:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

### Error: "503 - Service Unavailable"

**Cause**: The experimental model had quota issues

**Solution**: ✅ **Already Fixed** - We switched to `gemini-2.5-flash`

### Error: "404 - Model Not Found"

**Cause**: API key doesn't have access to the model

**Solutions**:
1. Generate a new API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure you're using the latest API (v1beta)
3. Use `gemini-2.5-flash` (current stable model)

### Error: "401 - Invalid API Key"

**Cause**: API key is incorrect or deactivated

**Solutions**:
1. Copy API key again from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure there are no extra spaces in `.env.local`
3. Restart dev server after changing the key

### Error: "400 - Bad Request"

**Cause**: Malformed request or invalid input

**Solutions**:
1. Check that your prompt is between 3-5000 characters
2. Avoid special characters that might break JSON
3. Check browser console for detailed errors

---

## 🔍 Available Gemini Models

As of January 2026, these models support `generateContent`:

**Recommended for Production**:
- ✅ **`gemini-2.5-flash`** - Latest stable (CURRENT)
- `gemini-2.5-pro` - More capable but slower
- `gemini-2.0-flash` - Stable alternative

**Experimental** (limited quotas):
- `gemini-2.0-flash-exp` - Experimental features
- `gemini-exp-1206` - Latest experimental
- `gemini-3-flash-preview` - Preview of next gen

**To check available models**:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

---

## 📊 Monitoring API Usage

### Check Current Usage
Visit: https://ai.dev/usage?tab=rate-limit

### View Quota Details
Visit: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### Enable Billing (Optional)
For higher limits, set up billing in [Google Cloud Console](https://console.cloud.google.com/)

---

## 🎯 Rate Limiting in Your App

The application has **built-in rate limiting** to protect your API quota:

**Settings** (in `.env.local`):
```env
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
```

This means:
- Users can make 10 requests per minute (per IP)
- After 10 requests, they'll see "Rate limit exceeded"
- Limit resets after 60 seconds

**Adjust for Production**:
```env
# More restrictive (save quota)
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MS=60000

# More permissive (better UX)
RATE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_WINDOW_MS=60000
```

---

## 🚀 Production Checklist

Before deploying:

- [ ] API key is valid and has quota available
- [ ] `.env.local` is in `.gitignore` (✅ already done)
- [ ] Production environment variables set on Vercel/hosting
- [ ] Rate limiting configured appropriately
- [ ] Error handling tested
- [ ] Monitoring/logging enabled

**For Vercel Deployment**:
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Add `GEMINI_API_KEY` with your key
4. Redeploy

---

## 💡 Best Practices

### Security
- ✅ Never commit API keys to git
- ✅ Use environment variables only
- ✅ Restrict API key permissions if possible
- ✅ Monitor usage for unexpected spikes

### Quota Management
- Implement client-side caching
- Add request debouncing
- Use rate limiting (already implemented)
- Consider upgrading to paid tier for production

### Error Handling
- Show user-friendly error messages (already implemented)
- Log detailed errors server-side only (already implemented)
- Implement retry logic for transient errors
- Monitor error rates

---

## 📞 Support Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Rate Limits Guide**: https://ai.google.dev/gemini-api/docs/rate-limits
- **API Key Management**: https://makersuite.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com/
- **Quotas Dashboard**: https://ai.dev/usage

---

## ✅ Current Status

**Model**: `gemini-2.5-flash` (stable, production-ready)
**Status**: ✅ **WORKING**
**Free Tier Limits**: 15 req/min, 1,500 req/day
**App Rate Limit**: 10 req/min per IP

**Your application is now ready to use!**

To start:
```bash
npm run dev
# Visit http://localhost:3000
```

---

*Last Updated: January 2026*
*Model: gemini-2.5-flash*
