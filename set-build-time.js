const fs = require('fs');
const path = require('path');

const now = new Date();

const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

let hours = now.getHours();
const minutes = now.getMinutes().toString().padStart(2, '0');
const ampm = hours >= 12 ? 'pm' : 'am';

hours = hours % 12 || 12; // Convert to 12-hour format

const time = `${hours}:${minutes} ${ampm}`;

const formatted = `${date} - ${time}`;

const envPath = path.resolve(__dirname, '.env.build');
fs.writeFileSync(envPath, `REACT_APP_BUILD_TIME="${formatted}"\n`);

console.log('✅ Build time saved:', formatted);