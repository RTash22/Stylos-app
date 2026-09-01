const fs = require('fs');
const glob = require('glob'); // Not installed globally, let's just use a recursive read
const path = require('path');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, filesList);
    } else if (name.endsWith('.ts') || name.endsWith('.tsx')) {
      filesList.push(name);
    }
  }
  return filesList;
}

const files = getFiles('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Role: barber -> peluquero
  content = content.replace(/'barber'/g, "'peluquero'");
  content = content.replace(/"barber"/g, '"peluquero"');
  // Avoid replacing in imports/paths like (barber)
  content = content.replace(/\(peluquero\)/g, "(barber)");
  content = content.replace(/app\/\(peluquero\)/g, "app/(barber)");

  // Appointment fields
  content = content.replace(/\.starts_at/g, '.start_time');
  content = content.replace(/\.ends_at/g, '.end_time');
  content = content.replace(/starts_at:/g, 'start_time:');
  content = content.replace(/ends_at:/g, 'end_time:');
  content = content.replace(/proposed_starts_at/g, 'proposed_start_time');
  content = content.replace(/proposed_ends_at/g, 'proposed_end_time');

  // Client / Profile fields
  content = content.replace(/\.phone/g, '.phone_e164');
  // Revert phone_e164 changes where it shouldn't be (like react-native Icons or variables that are strictly 'phone')
  // We'll see if tsc complains about phone_e164.

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
console.log('Regex replacements done.');
