const bcrypt = require('bcryptjs');

const hash = '$2a$10$bsE0DloavSXzMueo5wokquUeTA4r1ntp.pP.aNlovX.nX6Q1G5quG';
const passwords = ['password123', 'password', 'ashmit', 'ashmit123', 'devvv'];

async function check() {
  for (const pw of passwords) {
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password "${pw}":`, match);
  }
}

check();
