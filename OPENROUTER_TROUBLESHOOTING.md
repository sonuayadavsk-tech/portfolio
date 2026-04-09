# OpenRouter Account Setup Issues

## Error: "User not found" (401)

This means your OpenRouter API key isn't properly linked to an active account.

---

## Complete OpenRouter Setup Steps

### Step 1: Create Account
1. Visit: **https://openrouter.ai**
2. Click **"Sign up"**
3. Choose **"Sign up with Google"** (fastest)
4. Complete Google authentication

### Step 2: Verify Email & Setup Billing
1. After signup, go to **Dashboard**
2. Click **"Settings"** (gear icon)
3. Add payment method (Stripe)
   - OpenRouter requires valid payment method
   - Free tier with $5 credit for new accounts
   - You won't be charged if you stay under $5

### Step 3: Get API Key
1. Go to **"Keys"** section
2. Click **"Create New Key"**
3. Give it a name: `portfolio-assistant`
4. Copy the full key (starts with `sk-or-v1-`)

### Step 4: Verify Key Works
1. Test key here: https://openrouter.ai/playground
2. Send test message
3. If it works, you're good!

### Step 5: Update Backend
```
OPENROUTER_API_KEY=sk-or-v1-your_complete_key_here
```

**Restart backend:**
```powershell
npm run dev
```

---

## Alternative: Use Groq API (No Payment Required!)

If OpenRouter isn't working, we can switch to **Groq** (free, no credit card):

### Quick Groq Setup:
1. Go to: https://console.groq.com
2. Sign up with GitHub
3. Create API key
4. Update backend/.env:
```
USE_GROQ=true
GROQ_API_KEY=your_key
```

Groq is **completely free** and very fast!

---

## Troubleshooting OpenRouter

| Error | Solution |
|-------|----------|
| "User not found" | Account not fully set up. Check billing settings. |
| "Invalid API key" | Key is incomplete or malformed. |
| "Insufficient credits" | Add payment method. New accounts get $5 credit. |
| "Rate limit exceeded" | Waiting too long between requests. Try again. |

---

## Questions?
- OpenRouter Help: https://openrouter.ai/docs
- Groq Help: https://console.groq.com/docs
- Check backend logs: `npm run dev` output