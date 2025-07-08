# 🚨 IMMEDIATE SECURITY ACTIONS REQUIRED

## Current Status
- ✅ Auth code removed from master branch
- ✅ Private branch structure created
- ⚠️ **OAuth credentials still exposed and need rotation**
- ⚠️ Other public branches still have auth code

## Action 1: Rotate OAuth Credentials (DO THIS NOW!)

### Steps:
1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Navigate to: APIs & Services → Credentials
   - Find your OAuth 2.0 Client ID
   - Click "RESET SECRET"
   - Copy the new secret

2. **Update .env.local**
   ```bash
   # Replace the compromised secret with your new one
   GOOGLE_CLIENT_SECRET="[PASTE YOUR NEW SECRET HERE]"
   ```

3. **Update Vercel**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Update GOOGLE_CLIENT_SECRET
   - Redeploy

## Action 2: Clean Other Public Branches

After rotating credentials, clean the other branches:

```bash
# For each branch:
git checkout feature/3d-visualization
git rm -rf app/api/auth lib/auth
git commit -m "security: Remove auth code from public branch"

git checkout feature/experiments  
git rm -rf app/api/auth lib/auth
git commit -m "security: Remove auth code from public branch"

git checkout feature/literature-system
git rm -rf app/api/auth lib/auth
git commit -m "security: Remove auth code from public branch"
```

## Action 3: Push Changes

```bash
# Push all cleaned branches
git push origin master
git push origin feature/3d-visualization
git push origin feature/experiments
git push origin feature/literature-system
git push origin private/auth-system
```

## Action 4: Verify Security

After completing above:
1. Test authentication with new credentials
2. Verify old credentials no longer work
3. Check that auth code is only in private/auth-system branch
4. Update team on new security procedures

## ⏰ Timeline
- **NOW**: Rotate OAuth credentials
- **Next 30 min**: Clean all public branches
- **Next hour**: Push all changes and verify
- **Today**: Update team documentation

Remember: The exposed credentials are active until you rotate them!