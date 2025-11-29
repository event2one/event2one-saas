require('dotenv').config();
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('Checking .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file FOUND');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('Content length:', content.length);
    console.log('DATABASE_URL env var:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    if (process.env.DATABASE_URL) {
        console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 10) + '...');
    }
} else {
    console.log('.env file NOT FOUND');
    // List files in directory to see what's there
    console.log('Files in directory:');
    fs.readdirSync(__dirname).forEach(file => {
        console.log(file);
    });
}
