const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../users.json');
const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const now = new Date();

const filtered = users.filter(user => {
  if (!user.lastActive) return true; // Behold brukere uten lastActive-felt
  const lastActive = new Date(user.lastActive);
  if (isNaN(lastActive)) return true; // Behold hvis datoen er ugyldig
  const diffMonths = (now - lastActive) / (1000 * 60 * 60 * 24 * 30);
  return diffMonths < 24;
});

fs.writeFileSync(usersPath, JSON.stringify(filtered, null, 2));
const deleted = users.length - filtered.length;
if (deleted > 0) {
  console.log(`Slettet ${deleted} brukere eldre enn 24 måneder.`);
} else {
  console.log('Ingen brukere slettet.');
}