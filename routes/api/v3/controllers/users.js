import express from 'express';
import { waitForConnection } from '../../../../models.js';

var router = express.Router();

// GET /api/v3/users/myIdentity
router.get('/myIdentity', (req, res) => {
    try {
        const session = req.session;
        
        // Check if user is logged in
        if (!session.isAuthenticated || !session.account) {
            return res.json({ status: "loggedout" });
        }

        // Extract user info from account object
        // MSAL AccountInfo may have username/name directly or in idTokenClaims
        const account = session.account;
        const idTokenClaims = account.idTokenClaims || {};
        
        // Get username - try account.username first, then idTokenClaims.preferred_username or email
        const username = account.username || 
                        idTokenClaims.preferred_username || 
                        idTokenClaims.email || 
                        idTokenClaims.upn || 
                        account.localAccountId || 
                        '';
        
        // Get name - try account.name first, then idTokenClaims.name
        let name = account.name || idTokenClaims.name || '';
        if (!name && (idTokenClaims.given_name || idTokenClaims.family_name)) {
            name = [idTokenClaims.given_name, idTokenClaims.family_name].filter(Boolean).join(' ');
        }

        // User is logged in, return user info
        const userInfo = {
            name: name.trim() || username,
            username: username
        };

        res.json({
            status: "loggedin",
            userInfo: userInfo
        });

    } catch (error) {
        console.error('Error in GET /api/v3/users/myIdentity:', error);
        res.status(500).json({
            status: "error",
            error: error.message || "An unexpected error occurred"
        });
    }
});

// GET /api/v3/users/info?username=<username>
router.get('/info', async (req, res) => {
    try {
        await waitForConnection();
        const { UserInfo } = req.models;
        const username = req.query.username;

        if (!username) {
            return res.status(400).json({
                status: "error",
                error: "Username parameter is required"
            });
        }

        // Find user info, or return default if not found
        let userInfo = await UserInfo.findOne({ username: username });
        
        if (!userInfo) {
            // Return default values if user info doesn't exist yet
            userInfo = {
                username: username,
                bio: '',
                favoriteColor: '',
                website: ''
            };
        } else {
            // Convert to plain object
            userInfo = userInfo.toObject();
        }

        res.json({
            status: "success",
            userInfo: userInfo
        });

    } catch (error) {
        console.error('Error in GET /api/v3/users/info:', error);
        res.status(500).json({
            status: "error",
            error: error.message || "An unexpected error occurred"
        });
    }
});

// PUT /api/v3/users/info
router.put('/info', async (req, res) => {
    try {
        const session = req.session;
        
        // Check if user is logged in
        if (!session.isAuthenticated || !session.account) {
            return res.status(401).json({
                status: "error",
                error: "Authentication required"
            });
        }

        // Get username from session
        const account = session.account;
        const idTokenClaims = account.idTokenClaims || {};
        const username = account.username || 
                        idTokenClaims.preferred_username || 
                        idTokenClaims.email || 
                        idTokenClaims.upn || 
                        account.localAccountId || 
                        '';

        if (!username) {
            return res.status(400).json({
                status: "error",
                error: "Unable to determine username from session"
            });
        }

        await waitForConnection();
        const { UserInfo } = req.models;

        // Extract user info from request body
        const { bio, favoriteColor, website } = req.body;

        // Update or create user info
        const userInfo = await UserInfo.findOneAndUpdate(
            { username: username },
            {
                username: username,
                bio: bio || '',
                favoriteColor: favoriteColor || '',
                website: website || '',
                updated_date: new Date()
            },
            {
                new: true,
                upsert: true, // Create if doesn't exist
                runValidators: true
            }
        );

        res.json({
            status: "success",
            userInfo: userInfo.toObject()
        });

    } catch (error) {
        console.error('Error in PUT /api/v3/users/info:', error);
        res.status(500).json({
            status: "error",
            error: error.message || "An unexpected error occurred"
        });
    }
});

export default router;

