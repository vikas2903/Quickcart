import mongoose from "mongoose";

const MONGOURL = 'mongodb+srv://app-user:FB3VFTEtc9QsG5sL@d2c-apps.i8giy1w.mongodb.net/?appName=d2c-apps';

// Set up event listeners only once
let listenersInitialized = false;

const connectDatabase = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return; // Already connected
    }

    // Check if currently connecting
    if (mongoose.connection.readyState === 2) {
      // Wait for the connection to complete
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);
        
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        mongoose.connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      return;
    }

    // Initialize event listeners only once
    if (!listenersInitialized) {
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB Connected Successfully');
      });

      listenersInitialized = true;
    }

    // Connect to MongoDB
    await mongoose.connect(MONGOURL, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Don't exit the process - let the request handle the error
    // This allows the app to continue functioning even if DB is temporarily unavailable
    throw error;
  }
};

export default connectDatabase;
