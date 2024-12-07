// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// let cached = (global as any).mongoose || { conn: null, promise: null };

// export const connectToDatabase = async () => {
//   if (cached.conn) return cached.conn;

//   if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

//   cached.promise =
//     cached.promise ||
//     mongoose.connect(MONGODB_URI, {
//       dbName: "eventful",
//       bufferCommands: false,
//     });

//   cached.conn = await cached.promise;

//   return cached.conn;
// };


import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Global variable to store the connection cache.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  // If there's already a cached connection, return it.
  if (cached.conn) {
    return cached.conn;
  }

  // If no cached promise exists, create one to establish the connection.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "eventful", // Specify your database name
      bufferCommands: false, // Disable mongoose buffering to avoid serverless issues
      useNewUrlParser: true, // Use new URL parser to avoid warnings
      useUnifiedTopology: true, // Use Unified Topology engine
    });
  }

  try {
    // Await the connection promise and cache it.
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset the promise cache on failure
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }

  return cached.conn;
};
