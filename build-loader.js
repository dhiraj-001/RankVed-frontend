import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const loaderPath = path.join(__dirname, 'public', 'chatbot-loader.js');
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🔧 Building chatbot loader with frontend URL:', frontendUrl);

try {
  // Read the loader file
  let loaderContent = fs.readFileSync(loaderPath, 'utf8');
  
  // Replace the placeholder with the actual frontend URL
  loaderContent = loaderContent.replace(/FRONTEND_URL_PLACEHOLDER/g, frontendUrl);
  
  // Write the updated content back
  fs.writeFileSync(loaderPath, loaderContent, 'utf8');
  
  console.log('✅ Chatbot loader built successfully!');
  console.log('📁 Updated file:', loaderPath);
} catch (error) {
  console.error('❌ Error building chatbot loader:', error);
  process.exit(1);
} 