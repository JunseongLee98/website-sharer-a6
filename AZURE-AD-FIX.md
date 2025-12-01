# Quick Fix for Azure AD Login Issue

## Problem
The login feature isn't working because the redirect URI doesn't match between your app and Azure AD.

## Solution: Set the Redirect URI Manually in Render

Instead of relying on auto-detection, let's set it explicitly:

### Step 1: Add Environment Variable in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `website-sharer-a6` web service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add this:
   - **Key:** `REDIRECT_URI`
   - **Value:** `https://website-sharer-a6.onrender.com/redirect`
   - ⚠️ Make sure it's **HTTPS** (not HTTP)
6. Click **Save Changes**
7. Render will automatically redeploy

### Step 2: Add the Same URI to Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Azure Active Directory** → **App Registrations**
3. Find your app ID: `3293beca-8b62-4fa0-8b14-a927493f0c87`
4. Click on your application
5. In the left menu, click **Authentication**
6. Under **Platform configurations** → **Web** → **Redirect URIs**
7. Click **+ Add URI** (or **Add a platform** if you don't have Web platform yet)
8. Enter: `https://website-sharer-a6.onrender.com/redirect`
9. Click **Save**

### Step 3: Verify in Render Logs

After Render redeploys (takes 2-3 minutes):

1. Go to **Logs** tab in Render
2. Look for this line:
   ```
   Using configured redirect URI: https://website-sharer-a6.onrender.com/redirect
   ```
3. If you see this, the fix is working!

### Step 4: Test the Login

1. Go to: `https://website-sharer-a6.onrender.com`
2. Try to sign in
3. It should redirect to Azure AD login page
4. After login, it should redirect back to your app

---

## If It Still Doesn't Work

### Check Azure AD Configuration:

1. **Verify the redirect URI is exactly:**
   ```
   https://website-sharer-a6.onrender.com/redirect
   ```
   - Must be HTTPS
   - Must end with `/redirect`
   - Must match exactly (no trailing slashes, etc.)

2. **Check other Azure AD settings:**
   - Go to your app in Azure Portal
   - **Authentication** → **Implicit grant and hybrid flows**
   - Make sure **ID tokens** is checked
   - Click **Save** if you made changes

3. **Verify Client Secret hasn't expired:**
   - Go to **Certificates & secrets**
   - Check if your client secret has expired
   - If expired, create a new one and update `CLIENT_SECRET` in Render

### Check Render Environment Variables:

Make sure these are all set in Render:
- ✅ `CLIENT_ID` - Your Azure AD application ID
- ✅ `TENANT_ID` - Your Azure AD tenant ID
- ✅ `CLIENT_SECRET` - Your Azure AD client secret (the value, not the ID)
- ✅ `REDIRECT_URI` - `https://website-sharer-a6.onrender.com/redirect`
- ✅ `MONGODB_URI` - Your MongoDB connection string
- ✅ `SESSION_SECRET` - Any random string

---

## Alternative: Use the Manual Redirect URI Template

If your Render URL is different, use this template:

**Render Environment Variable:**
```
REDIRECT_URI=https://[YOUR-SERVICE-NAME].onrender.com/redirect
```

**Azure AD Redirect URI:**
```
https://[YOUR-SERVICE-NAME].onrender.com/redirect
```

Replace `[YOUR-SERVICE-NAME]` with your actual Render service name.

---

## Common Mistakes

❌ Using HTTP instead of HTTPS
❌ Forgetting the `/redirect` at the end
❌ Typos in the URL
❌ Not saving changes in Azure AD
❌ Not waiting for Render to redeploy
❌ Client secret expired in Azure AD

---

## Expected Behavior

When everything is configured correctly:

1. User clicks "Sign In" on your website
2. Redirects to Azure AD login page (login.microsoftonline.com)
3. User enters Microsoft credentials
4. Azure AD redirects back to: `https://website-sharer-a6.onrender.com/redirect`
5. App processes the login
6. User is redirected to homepage, now logged in

If any step fails, check the Render logs for error messages.
