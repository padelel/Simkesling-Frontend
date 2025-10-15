const { exec } = require('child_process');

// Perintah yang akan kita jalankan adalah 'npm start'
// yang akan memicu 'next start' dari package.json
const command = 'npm start';

// Eksekusi perintah
const child = exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        // Keluar dengan error jika npm start gagal
        process.exit(1);
    }
});

// Salurkan output (log) dari 'next start' ke log utama cPanel
// Ini sangat penting untuk debugging di masa depan
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

console.log(`> Starting Next.js application via 'npm start'...`);