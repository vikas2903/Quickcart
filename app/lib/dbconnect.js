import mongoose from "mongoose";

const connectDatabase = async () => {
  // const MONGOURL = process.env.MONGO_URL || process.env.MONGO_URI;
  
  // if (!MONGOURL) {
  //   console.error("MongoDB URL is not defined in environment variables");
  //   process.exit(1);
  // }

  try {
    await mongoose.connect('mongodb+srv://app-user:FB3VFTEtc9QsG5sL@d2c-apps.i8giy1w.mongodb.net/?appName=d2c-apps');
    
    // console.log("✅ MongoDB Connected Successfully "); 
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;
