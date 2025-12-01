# Render Deployment Guide - Fixing Common Issues

This guide addresses the two main issues you might encounter when deploying to Render:

## Issue 1: Azure AD Redirect URI Mismatch ✅ FIXED

### The Error:
```
AADSTS50011: The redirect URI 'http://website-sharer-a6.onrender.com/redirect' specified in the request does not match the redirect URIs configured for the application
```

### Root Cause:
The application was using HTTP instead of HTTPS for the redirect URI, or the redirect URI wasn't properly configured in Azure AD.

### Solution (Automated):
The application now **automatically detects** the correct redirect URI when deployed on Render:
- It uses the `RENDER_EXTERNAL_URL` environment variable (automatically provided by Render)
- It constructs the proper HTTPS URL: `https://website-sharer-a6.onrender.com/redirect`

### What You Need to Do:

#### Option 1: Let the App Auto-Configure (Recommended)
The app will automatically use the correct HTTPS URL. You just need to add this URL to your Azure AD app registration:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Azure Active Directory** → **App Registrations**
3. Select your app (ID: `3293beca-8b62-4fa0-8b14-a927493f0c87`)
4. Go to **Authentication** → **Redirect URIs**
5. Click **Add a redirect URI**
6. Add: `https://website-sharer-a6.onrender.com/redirect` (use HTTPS, not HTTP)
7. Click **Save**

#### Option 2: Manually Set the Redirect URI
If you want to override the auto-detection, set this environment variable in Render:

**Environment Variable:**
- **Key:** `REDIRECT_URI`
- **Value:** `https://website-sharer-a6.onrender.com/redirect`

Then add the same URL to Azure AD as described above.

---

## Issue 2: Rate Limiting Errors ✅ FIXED

### The Error:
```
Error: Rate limited: Too many requests. Please try again in a few moments.
```

### Root Cause:
When fetching URL previews, the app was making too many requests too quickly, causing external websites to rate-limit or block the requests.

### Solution (Automated):
The application now includes multiple layers of protection:

1. **Caching:** URL previews are cached for 1 hour to reduce duplicate requests
2. **Rate Limiting:** Minimum 500ms delay between consecutive requests
3. **Retry Logic:** Smart retries with exponential backoff (2s → 4s → 8s)
4. **Retry-After Header:** Respects server-provided retry timing
5. **Longer Timeouts:** Increased timeout from 10s to 15s
6. **Better Error Messages:** User-friendly messages instead of technical errors

### What This Means for You:
- URL previews will be faster (cached results)
- Less likely to get rate-limited
- If rate-limited, the app will wait and retry automatically
- Users will see helpful error messages instead of cryptic errors

---

## Complete Render Deployment Checklist

### Required Environment Variables in Render:

1. **MONGODB_URI** (Required)
   - Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - ⚠️ Make sure password is URL-encoded

2. **Azure AD Variables** (Required for authentication)
   - **CLIENT_ID:** Your Azure AD application ID
   - **TENANT_ID:** Your Azure AD tenant ID
   - **CLIENT_SECRET:** Your Azure AD client secret
   - **REDIRECT_URI:** (Optional - auto-detected) `https://your-app.onrender.com/redirect`

3. **SESSION_SECRET** (Recommended for production)
   - Any random strong string
   - Example: `your-very-secure-random-string-change-this`

### MongoDB Atlas Configuration:

1. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (allow all IPs)
   - This is required for Render's dynamic IPs

2. **Database User:**
   - Ensure your database user has read/write permissions
   - Password should be URL-encoded in the connection string

### Azure AD Configuration:

1. **Redirect URIs:**
   - Add: `https://website-sharer-a6.onrender.com/redirect`
   - Use HTTPS (not HTTP)

2. **Client Secret:**
   - Make sure it hasn't expired
   - Copy the secret value (not the ID)

### Render Settings:

1. **Build Command:** `npm install`
2. **Start Command:** `npm start`
3. **Environment:** Node
4. **Auto-Deploy:** Enable (deploys on git push)

---

## Testing Your Deployment

After deploying, check:

1. ✅ Homepage loads: `https://website-sharer-a6.onrender.com`
2. ✅ Sign-in redirects to Azure AD correctly
3. ✅ After sign-in, redirects back to your app
4. ✅ URL previews work without rate limiting errors
5. ✅ Posts can be created and viewed
6. ✅ Likes and comments work

---

## Troubleshooting

### Still Getting Redirect URI Errors?

**Check the Render logs:**
```bash
# Look for this line in the logs:
Using Render redirect URI: https://website-sharer-a6.onrender.com/redirect
```

If you see this, copy that exact URL and add it to Azure AD.

### Still Getting Rate Limited?

1. **Check if multiple previews are loading at once**
   - The cache should prevent this, but if you're viewing many posts, wait a moment between page loads

2. **Check Render logs for details:**
   - Look for: `Rate limiting: waiting Xms before fetching`
   - This is normal and means the rate limiter is working

3. **If a specific website always fails:**
   - Some websites block server requests entirely
   - This is expected behavior
   - Users will see a friendly error message

### MongoDB Connection Fails?

1. **Verify MONGODB_URI is set in Render environment variables**
2. **Check MongoDB Atlas Network Access allows 0.0.0.0/0**
3. **Verify password is URL-encoded** (e.g., `@` becomes `%40`)
4. **Check database user has correct permissions**

---

## What Changed in the Code?

### Files Modified:

1. **app.js**
   - Auto-detects Render deployment via `RENDER_EXTERNAL_URL`
   - Constructs proper HTTPS redirect URI automatically
   - Logs the redirect URI being used for easy debugging

2. **routes/api/v2/utils/urlPreviews.js**
   - Added 1-hour caching for URL previews
   - Added rate limiting (500ms minimum between requests)
   - Improved retry logic with exponential backoff
   - Respects Retry-After headers from servers
   - Increased timeout to 15 seconds
   - Better error messages

3. **routes/api/v3/utils/urlPreviews.js**
   - Same improvements as v2

### No Breaking Changes:
- All existing functionality preserved
- Backward compatible with local development
- Works on Azure App Service and other platforms too

---

## Alternative: Deploy to Azure App Service

If you prefer Azure over Render, the app now supports both:

### Azure Auto-Detection:
The app detects Azure via `WEBSITE_HOSTNAME` environment variable and automatically constructs:
```
https://your-app.azurewebsites.net/redirect
```

### Azure Configuration:
Same as Render, but Azure provides `WEBSITE_HOSTNAME` automatically.

---

## Support

If you encounter any issues:

1. **Check Render logs** for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Check Azure AD redirect URI** matches exactly (including HTTPS)
4. **Verify MongoDB Atlas** network access and credentials

The application now includes comprehensive logging to help diagnose issues quickly.
