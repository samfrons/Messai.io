# OAuth Credential Update Guide

## 🔐 Update Locations Checklist

After getting your new Google OAuth credentials from the Cloud Console, update them in these locations:

### 1. Local Development (.env.local)
```bash
# Update these lines in .env.local:
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_NEW_SECRET_HERE"
```

### 2. Vercel Production
1. Go to https://vercel.com/dashboard
2. Select your MESSAi project
3. Go to Settings → Environment Variables
4. Update:
   - `GOOGLE_CLIENT_ID` (if changed)
   - `GOOGLE_CLIENT_SECRET` (with new secret)
5. Redeploy to apply changes

### 3. Other Environments
Check and update if you have:
- `.env.production` (should not exist in repo)
- `.env.staging` 
- Any CI/CD configurations

## ⚠️ Important Notes

1. **Client ID usually stays the same** - Only the secret changes when you reset
2. **Keep the new secret secure** - Never commit it to git
3. **Test immediately** after updating to ensure auth still works

## 🧪 Testing Commands

After updating, test authentication:

```bash
# Start local dev server
npm run dev

# Test OAuth flow at:
# http://localhost:3003/auth/signin
```

## 📝 Verification Checklist

- [ ] New secret obtained from Google Cloud Console
- [ ] .env.local updated
- [ ] Vercel environment variables updated
- [ ] Local authentication tested
- [ ] Production authentication tested
- [ ] Old credentials no longer work