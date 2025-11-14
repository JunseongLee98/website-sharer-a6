import mongoose from 'mongoose';

// Connect to MongoDB Atlas - Replace with your actual connection string
// IMPORTANT: Set MONGODB_URI in Render → Environment tab, not here!
// The connection string below is just a fallback and should not be used in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wnstjd98_db_user:%3CSyjs220120%21%3E@cluster0.zoxmbfy.mongodb.net/websharer?retryWrites=true&w=majority';

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI environment variable is not set!');
    console.warn('Please set MONGODB_URI in Render → Environment tab');
} else {
    console.log('MONGODB_URI is set (connection string hidden for security)');
}

// Connection options to prevent timeout errors
const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    // Note: bufferCommands defaults to true, which allows Mongoose to queue operations
    // until connection is established. This prevents errors when operations are called
    // before connection completes.
};

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGODB_URI, mongooseOptions).catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.error('Error details:', err);
    console.error('Please check:');
    console.error('1. MONGODB_URI is set in Render → Environment tab');
    console.error('2. Connection string format is correct');
    console.error('3. Password in connection string is URL-encoded');
    console.error('4. MongoDB Atlas Network Access allows 0.0.0.0/0 (all IPs)');
});

const db = mongoose.connection;

// Connection event handlers
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

// Helper function to wait for MongoDB connection
export const waitForConnection = () => {
    return new Promise((resolve, reject) => {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            reject(new Error('MONGODB_URI environment variable is not set. Please set it in Render → Environment tab.'));
            return;
        }

        const currentState = mongoose.connection.readyState;
        console.log(`MongoDB connection state: ${currentState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);

        if (currentState === 1) {
            // Already connected
            console.log('MongoDB already connected');
            resolve();
            return;
        }
        
        if (currentState === 0) {
            // Not connected yet - connection might have failed
            console.log('MongoDB not connected, checking if connection was attempted...');
            // Try to connect again if not already attempting
            if (!mongoose.connection.readyState) {
                mongoose.connect(MONGODB_URI, mongooseOptions).catch(err => {
                    reject(new Error(`MongoDB connection failed: ${err.message}. Check MONGODB_URI and Network Access settings.`));
                });
            }
        }

        // Set up event listeners
        const timeout = setTimeout(() => {
            reject(new Error(`MongoDB connection timeout after 30 seconds. Current state: ${mongoose.connection.readyState}. Check MONGODB_URI and MongoDB Atlas Network Access (should allow 0.0.0.0/0).`));
        }, 30000);

        db.once('open', () => {
            clearTimeout(timeout);
            console.log('MongoDB connection established');
            resolve();
        });

        db.once('error', (err) => {
            clearTimeout(timeout);
            console.error('MongoDB connection error:', err);
            reject(new Error(`MongoDB connection error: ${err.message}. Check connection string format and Network Access settings.`));
        });
    });
};

// Define Post schema
const postSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        default: []
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

// Define Comment schema
const commentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

// Create Post model
const Post = mongoose.model('Post', postSchema);

// Create Comment model
const Comment = mongoose.model('Comment', commentSchema);

// Export models object
const models = {
    Post: Post,
    Comment: Comment
};

export default models;

