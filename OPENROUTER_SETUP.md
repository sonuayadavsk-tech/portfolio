# OpenRouter API + MCP Setup Guide

## What's Been Set Up

✅ **OpenRouter API Integration** - Uses Claude 3.5 Sonnet model
✅ **MCP MongoDB Server** - Reads your portfolio data
✅ **MCP GitHub Server** - (Optional) Can read your repository files
✅ **Enhanced Chat Route** - Combines all context for intelligent responses

---

## Configuration Steps

### Step 1: Install Dependencies

```powershell
cd backend
npm install
```

This installs:
- `axios` - For OpenRouter API calls
- `octokit` - For GitHub integration (optional)
- `node-fetch` - For additional HTTP support

### Step 2: Update GitHub Configuration (Optional)

If you want the AI to understand your repository code, add GitHub token:

1. Go to: https://github.com/settings/tokens
2. Create a new token with `repo` and `read:user` scopes
3. Add to backend/.env:

```
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=dynamic-portfolio-showcase
```

### Step 3: Verify OpenRouter API Key

Check your backend/.env has:

```
OPENROUTER_API_KEY=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
```

✅ Already configured!

---

## How It Works

```
USER: "Tell me about your MERN projects"
   ↓
BACKEND:
  1. Reads from MongoDB (portfolio data)
  2. Builds context with all your:
     - Skills (organized by category)
     - Experience entries
     - Projects with descriptions
     - Contact information
  3. Sends to OpenRouter API with Claude model
  4. Claude analyzes context + generates response
   ↓
RESPONSE: Detailed answer about your MERN expertise
```

---

## What the AI Now Understands

✅ **Your Skills**: All 23 skills across 4 categories
✅ **Your Experience**: Web Dev Intern, Cloud Intern, IEEE Publication, B.Tech
✅ **Your Projects**: CarrerHub and other projects
✅ **Your Contact**: Email, phone, location, social links
✅ **Interview Questions**: Can answer based on your expertise
✅ **Code Explanations**: Can explain React, Node, MongoDB, Java concepts

---

## Running the Updated Backend

```powershell
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB Connected
🚀 Server running on http://localhost:5000
```

---

## Testing the New Chat

### Test 1: Portfolio Question
```powershell
$body = @{message="What experience do you have with MongoDB?"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method POST -ContentType "application/json" -Body $body
```

### Test 2: Skill Question
```powershell
$body = @{message="Explain your MERN stack skills"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method POST -ContentType "application/json" -Body $body
```

### Test 3: Interview Question
```powershell
$body = @{message="What are common React hooks and when to use them?"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method POST -ContentType "application/json" -Body $body
```

---

## API Costs

- **Claude 3.5 Sonnet**: ~$0.001 per message (very cheap!)
- **Monthly estimate**: ~$1-5 for moderate usage
- **No hidden fees**: You control exactly what's sent

---

## Advanced: Optional GitHub Integration

To make the AI analyze your actual code:

1. Add GitHub credentials to .env (see Step 2 above)
2. The system can then read your:
   - React components (.tsx files)
   - Node.js backend code (.js files)
   - Java files (.java)
   - Configuration files

The AI will understand your actual code structure and patterns!

---

## Troubleshooting

### "OpenRouter API error"
- Verify `OPENROUTER_API_KEY` is correct
- Check internet connection
- Ensure API key has valid credits

### "MongoDB connection error"
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas connection status

### "Portfolio data not found"
- Ensure admin profile has been saved at least once
- Visit admin dashboard to verify data exists

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Verify .env configuration
3. ✅ Run `npm run dev`
4. ✅ Test from frontend chatbot
5. (Optional) Add GitHub token for code understanding

All set! Your AI now has comprehensive knowledge of your portfolio! 🚀
