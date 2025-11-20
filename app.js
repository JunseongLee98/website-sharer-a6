import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import models from './models.js';
import MsIdExpress from 'microsoft-identity-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Azure AD Authentication configuration (optional)
// Only initialize if all required environment variables are set
let msid = null;
if (process.env.CLIENT_ID && process.env.TENANT_ID && process.env.CLIENT_SECRET) {
    const appSettings = {
        appCredentials: {
            clientId: process.env.CLIENT_ID,
            tenantId: process.env.TENANT_ID,
            clientSecret: process.env.CLIENT_SECRET
        },
        authRoutes: {
            redirect: process.env.REDIRECT_URI || `/redirect`,
            unauthorized: "/unauthorized",
            frontChannelLogout: "/sso_logout"
        },
        protectedResources: {
            graphAPI: {
                endpoint: "https://graph.microsoft.com/v1.0/me",
                scopes: ["User.Read"]
            }
        }
    };

    // Initialize Azure AD authentication
    msid = new MsIdExpress.WebAppAuthClientBuilder(appSettings).build();
    app.use(msid.initialize());
    console.log('Azure AD authentication initialized');
} else {
    console.warn('Azure AD authentication not configured. CLIENT_ID, TENANT_ID, and CLIENT_SECRET environment variables are required.');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers to prevent XSS attacks
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self';");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Add models to request
app.use((req, res, next) => {
    req.models = models;
    next();
});

// API routes - must come before static middleware
try {
    const apiV1Router = (await import('./routes/api/v1/apiv1.js')).default;
    app.use('/api/v1', apiV1Router);
} catch (error) {
    console.error('Failed to load API v1 routes:', error);
}

try {
    const apiV2Router = (await import('./routes/api/v2/apiv2.js')).default;
    app.use('/api/v2', apiV2Router);
} catch (error) {
    console.error('Failed to load API v2 routes:', error);
}

try {
    const apiV3Router = (await import('./routes/api/v3/apiv3.js')).default;
    app.use('/api/v3', apiV3Router);
} catch (error) {
    console.error('Failed to load API v3 routes:', error);
}

// Authentication routes (only if Azure AD is configured)
if (msid) {
    app.get('/signin',
        msid.signIn({
            postLoginRedirect: "/",
        }),
    );

    app.get('/signout',
        msid.signOut({
            postLogoutRedirect: "/",
        }),
    );
} else {
    // Placeholder routes if Azure AD is not configured
    app.get('/signin', (req, res) => {
        res.status(503).send('Azure AD authentication is not configured. Please set CLIENT_ID, TENANT_ID, and CLIENT_SECRET environment variables.');
    });

    app.get('/signout', (req, res) => {
        res.redirect('/');
    });
}

// Unauthorized route
app.get('/unauthorized', (req, res) => {
    res.status(401).send('Unauthorized');
});

// Static files and root route - must come after API routes
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default app;
