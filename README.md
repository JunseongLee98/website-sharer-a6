# Website Sharer - URL Preview with Database

A web application that allows users to share website links, preview them using OpenGraph metadata, and store them in a MongoDB database.

## A3

### Deployed Website
**GitHub Repository**: https://github.com/JunseongLee98/website-sharer-a3
**Render URL**: https://website-sharer-a3.onrender.com (To be deployed)

### Additional User Information
I added a **username** field as the creative component. Users must enter their username when posting a URL, and this information is:
- Saved to the MongoDB database
- Displayed with each post in the shared posts section
- Required for all new posts

### Help Received
No other students helped directly with this code.

## Features
  
### URL Preview
- Extract and display OpenGraph metadata (title, description, image, site name, type, locale)
- Beautiful card-based preview with hover effects
- Fallback to HTML title tag if OpenGraph title is missing
- Error handling for invalid URLs

### Database Integration
- MongoDB database to store shared URLs
- Post schema includes: URL, description, username, and creation date
- RESTful API endpoints for creating and retrieving posts

### User Interface
- Modern Bootstrap-based design
- Form validation and user feedback
- Real-time status messages
- Responsive layout

## API Endpoints

### v1 API (Original)
- `GET /api/v1/urls/preview?url=<target_url>` - Generate URL preview

### v2 API (New with Database)
- `GET /api/v2/urls/preview?url=<target_url>` - Generate URL preview
- `POST /api/v2/posts` - Create a new post (requires url, description, username)
- `GET /api/v2/posts` - Retrieve all posts with previews

## Technical Implementation
- **Frontend**: HTML, CSS, JavaScript with fetch API
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Dependencies**: 
  - node-fetch for HTTP requests
  - node-html-parser for HTML parsing
  - mongoose for MongoDB integration

## Running Locally
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up MongoDB Atlas:
   - Go to [MongoDB Atlas](https://www.mongodb.com/free-cloud-database)
   - Create a free account and cluster
   - Create a database user
   - Get your connection string
   - Update the `MONGODB_URI` in `models.js` with your connection string
4. Start the server: `npm start`
5. Open your browser to `http://localhost:3000`

## Security Features
- **XSS Protection**: All HTML content from URLs is sanitized to prevent malicious JavaScript execution
- **Content Security Policy**: Headers prevent unauthorized script execution
- **Input Validation**: All user inputs are validated and sanitized
- **Error Handling**: Graceful handling of database connection failures

## Deployment
The application is deployed on Render.com (or Azure) with MongoDB Atlas for the database. The connection string is configured to use environment variables for security.

### MongoDB Atlas Setup for Deployment
1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Add your IP address to the whitelist (or use 0.0.0.0/0 for Render)
4. Get your connection string
5. Set the `MONGODB_URI` environment variable in Render with your connection string

## A4

### Deployed Website (Custom Domain + HTTPS)
- URL: https://junseonglee.me

### What Changed in A4
- XSS mitigations added on the client when rendering `username`, `description`, and status messages using HTML escaping.
- Safer preview rendering: plain error strings are inserted via `textContent` instead of `innerHTML`.
- Deployment instructions updated for custom domain and HTTPS.

### Custom Domain & HTTPS (Render)
1. Purchase/claim a domain (e.g., from `https://nc.me`).
2. In Render, open your Web Service → Settings → Custom Domains → Add Custom Domain.
3. Copy the provided DNS records and add them at your domain registrar:
   - Typically a CNAME from `www` → your Render subdomain, and optionally an A/ALIAS for apex.
4. Wait for DNS to propagate; Render will auto-provision TLS (HTTPS) via Let’s Encrypt.
5. Set your primary domain in Render and verify the site loads over HTTPS.

### Custom Domain & HTTPS (Azure App Service alternative)
1. Deploy Node app to Azure App Service.
2. In App Service → Custom domains → Add custom domain → Verify via TXT/CNAME.
3. Map domain (CNAME or A record) at registrar to your Azure app hostname.
4. Enable HTTPS: TLS/SSL settings → Private Key Certificates (App Service Managed) → Create binding.
5. Confirm site loads over HTTPS at the custom domain.

## A5

### Deployed Website
- URL: https://website-sharer-a3-lfis.onrender.com

### What Changed in A5
- Added authentication and session management using Azure AD (Microsoft Identity Platform)
- Implemented login and logout functionality
- Created v3 API with authentication requirements
- Modified Post schema to automatically store username from authenticated session
- Added user identity endpoint to check login status
- Added username filtering to posts endpoint

### Authentication Setup
- Uses `express-session` for session management
- Uses `microsoft-identity-express` for Azure AD authentication
- Requires Azure AD App Registration with:
  - Client ID (CLIENT_ID)
  - Tenant ID (TENANT_ID)
  - Client Secret (CLIENT_SECRET)
  - Redirect URI configured in Azure AD (e.g., `https://website-sharer-a3-lfis.onrender.com/redirect`)

### Environment Variables Required
- `CLIENT_ID` - Azure AD Application (client) ID
- `TENANT_ID` - Azure AD Tenant ID
- `CLIENT_SECRET` - Azure AD Client Secret
- `REDIRECT_URI` - Redirect URI for authentication (e.g., `/redirect` or full URL)
- `SESSION_SECRET` - Secret key for session encryption
- `MONGODB_URI` - MongoDB connection string

### v3 API Endpoints
- `GET /api/v3/users/myIdentity` - Get current user identity (returns logged in status and user info)
- `POST /api/v3/posts` - Create a new post (requires authentication, username from session)
- `GET /api/v3/posts` - Retrieve all posts with previews (includes username field)
- `GET /api/v3/posts?username=<username>` - Retrieve posts filtered by username
- `GET /api/v3/urls/preview?url=<target_url>` - Generate URL preview

### Authentication Routes
- `GET /signin` - Sign in with Azure AD
- `GET /signout` - Sign out and clear session
- `GET /unauthorized` - Unauthorized access page

## A6

### Deployed Website
- URL: [To be added after deployment]

### What Changed in A6
- Added likes functionality: users can like and unlike posts
- Added comments functionality: users can view and post comments on posts
- Added delete functionality: users can delete their own posts
- Modified Post schema to include `likes` array field
- Created Comment schema/model with username, comment, post reference, and created_date
- Updated GET /api/v3/posts to return all fields including `id` (from `_id`) and `likes`
- Added POST /api/v3/posts/like endpoint to like a post
- Added POST /api/v3/posts/unlike endpoint to unlike a post
- Added DELETE /api/v3/posts endpoint to delete posts (only creator can delete)
- Created comments.js controller with:
  - GET /api/v3/comments?postID=<id> - Get all comments for a post
  - POST /api/v3/comments - Post a new comment (requires authentication)
- Updated client UI to show likes count, like/unlike buttons, comments section, and delete buttons

### A6 API Endpoints

#### Posts Endpoints
- `GET /api/v3/posts` - Get all posts (now includes `id`, `url`, `description`, `username`, `likes`, `created_date`, `htmlPreview`)
- `POST /api/v3/posts/like` - Like a post (requires authentication, postID in body)
- `POST /api/v3/posts/unlike` - Unlike a post (requires authentication, postID in body)
- `DELETE /api/v3/posts` - Delete a post (requires authentication, only creator can delete, postID in body)

#### Comments Endpoints
- `GET /api/v3/comments?postID=<id>` - Get all comments for a specific post
- `POST /api/v3/comments` - Create a new comment (requires authentication, postID and newComment in body)

### Database Schema Changes

#### Post Schema
- `url` (String, required)
- `description` (String, required)
- `username` (String, required)
- `likes` (Array of Strings, default: [])
- `created_date` (Date, default: Date.now)

#### Comment Schema
- `username` (String, required)
- `comment` (String, required)
- `post` (ObjectId reference to Post, required)
- `created_date` (Date, default: Date.now)

## A7

### Deployed Website
- URL: [To be added after deployment]

### What Changed in A7
- Added user information functionality: users can view and edit their profile information
- Created UserInfo database schema and model with fields:
  - `username` (unique identifier)
  - `bio` (text description about the user)
  - `favoriteColor` (user's favorite color)
  - `website` (personal website URL)
  - `created_date` and `updated_date` (timestamps)
- Added endpoints for loading and saving user info:
  - `GET /api/v3/users/info?username=<username>` - Get user information
  - `PUT /api/v3/users/info` - Update user information (requires authentication, can only update own info)
- Updated userInfo.html to display user information and provide edit form for own profile
- Implemented client-side functions to load and save user info via AJAX calls

### A7 API Endpoints

#### User Info Endpoints
- `GET /api/v3/users/info?username=<username>` - Get user information (returns default values if user info doesn't exist)
- `PUT /api/v3/users/info` - Update user information (requires authentication, only can update own info)

### Database Schema Changes

#### UserInfo Schema
- `username` (String, required, unique)
- `bio` (String, default: '')
- `favoriteColor` (String, default: '')
- `website` (String, default: '')
- `created_date` (Date, default: Date.now)
- `updated_date` (Date, default: Date.now)
