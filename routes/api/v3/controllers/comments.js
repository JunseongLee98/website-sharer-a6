import express from 'express';

var router = express.Router();

import { waitForConnection } from '../../../../models.js';

// Helper function to get username from session
function getUsername(session) {
    const account = session.account;
    if (!account) return null;
    const idTokenClaims = account.idTokenClaims || {};
    return account.username || 
           idTokenClaims.preferred_username || 
           idTokenClaims.email || 
           idTokenClaims.upn || 
           account.localAccountId || 
           null;
}

// GET /api/v3/comments
router.get('/', async (req, res) => {
    try {
        const { postID } = req.query;
        
        if (!postID) {
            return res.status(400).json({
                status: "error",
                error: "postID query parameter is required"
            });
        }

        // Wait for MongoDB connection
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: "Database connection failed"
            });
        }

        // Find all comments for the given post
        const comments = await req.models.Comment.find({ post: postID }).sort({ created_date: -1 });

        // Return comments as json array
        res.json(comments);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            error: error.message || error.toString()
        });
    }
});

// POST /api/v3/comments
router.post('/', async (req, res) => {
    try {
        const session = req.session;
        
        // Check if user is logged in
        if (!session.isAuthenticated || !session.account) {
            return res.status(401).json({
                status: "error",
                error: "not logged in"
            });
        }

        const username = getUsername(session);
        if (!username) {
            return res.status(401).json({
                status: "error",
                error: "not logged in"
            });
        }

        const { postID, newComment } = req.body;
        
        if (!postID || !newComment) {
            return res.status(400).json({
                status: "error",
                error: "postID and newComment are required"
            });
        }

        // Wait for MongoDB connection
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: "Database connection failed"
            });
        }

        // Create and save a new comment
        const comment = new req.models.Comment({
            username: username,
            comment: newComment,
            post: postID,
            created_date: new Date()
        });

        await comment.save();

        return res.json({ status: "success" });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            error: error.message || error.toString()
        });
    }
});

export default router;

