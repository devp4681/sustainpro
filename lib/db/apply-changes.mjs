/**
 * One-time database update script.
 * Place in lib/db directory to access the sql.js dependency.
 * Run with: node --experimental-specifier-resolution=node lib/db/apply-changes.mjs
 */
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '..', '..', 'sustainpro.db');

if (!existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  process.exit(1);
}

const SQL = await initSqlJs();
const fileBuffer = readFileSync(dbPath);
const db = new SQL.Database(fileBuffer);

const now = new Date().toISOString();

console.log('Applying database changes...\n');

// 1. Homepage: Remove "Advanced" from heroTitle
try {
  const homeRows = db.exec('SELECT id, hero_title FROM homepage_content LIMIT 1');
  if (homeRows.length > 0 && homeRows[0].values.length > 0) {
    const [id, heroTitle] = homeRows[0].values[0];
    if (heroTitle && String(heroTitle).includes('Advanced ')) {
      const newTitle = String(heroTitle).replace('Advanced ', '');
      db.run('UPDATE homepage_content SET hero_title = ?, updated_at = ? WHERE id = ?', [newTitle, now, id]);
      console.log('OK Homepage heroTitle: removed "Advanced"');
    } else {
      console.log('   Homepage heroTitle: already updated');
    }
  }
} catch (e) { console.error('Error updating homepage:', e.message); }

// 2. About Us
try {
  const aboutRows = db.exec('SELECT id FROM about_content LIMIT 1');
  if (aboutRows.length > 0 && aboutRows[0].values.length > 0) {
    const aboutId = aboutRows[0].values[0][0];
    
    const newWhoWeAreText = "SustainPro Process Solutions\u2122 LLP is a premium global engineering consultancy. We specialize in chemical engineering, process optimization, and sustainable industrial innovation. Our team of leading experts collaborates with industries to improve efficiency, minimize environmental impact, and advance innovative green technologies.";
    const newLeadershipText = "Led by academicians with strong expertise in chemical engineering and extensive experience in industry-focused research, consultancy, and R&D.";
    const newAdvisors = JSON.stringify([
      {
        name: "Sridhar Dalai",
        title: "Assistant Professor",
        institution: "School of Engineering and Applied Science, Ahmedabad University",
        photoUrl: "/sridhar_dalai.png",
        bio: "Expertise in chemical process engineering, process design and optimization, process simulation, scale-up, mass and energy integration, and industrial problem-solving. His professional experience includes applying engineering principles to improve process performance, resource utilization, and operational efficiency, with a strong focus on practical solutions for industry.",
        link: "https://ahduni.edu.in/faculty/sridhar-dalai/"
      },
      {
        name: "Dharamashi Rabari",
        title: "Associate Professor",
        institution: "School of Engineering and Applied Science, Ahmedabad University",
        photoUrl: "/dharamashi_rabari.png",
        bio: "Expertise in chemical process engineering, process simulation, optimization, separation processes, and thermodynamic analysis, with a focus on translating engineering principles into practical solutions for industrial process improvement. His professional experience includes applying these principles to process intensification for cleaner production, water treatment, catalysis, carbon footprint reduction, and sustainable industrial solutions.",
        link: "https://ahduni.edu.in/academics/schools-centres/school-of-engineering-and-applied-science/people-1/dharamashi-rabari/"
      }
    ]);
    db.run('UPDATE about_content SET who_we_are_text = ?, leadership_text = ?, advisors = ?, updated_at = ? WHERE id = ?',
      [newWhoWeAreText, newLeadershipText, newAdvisors, now, aboutId]);
    console.log('OK About Us: updated company name, description, leadership, and founders');
  }
} catch (e) { console.error('Error updating about:', e.message); }

// 3. Contact Us
try {
  const contactRows = db.exec('SELECT id FROM contact_info LIMIT 1');
  if (contactRows.length > 0 && contactRows[0].values.length > 0) {
    const contactId = contactRows[0].values[0][0];
    db.run('UPDATE contact_info SET address = ?, updated_at = ? WHERE id = ?',
      ["K-501, Samarthya Status,\nSabarmati, Ahmedabad, 380019, India", now, contactId]);
    console.log('OK Contact Us: updated address');
  }
} catch (e) { console.error('Error updating contact:', e.message); }

// 5. Modeling & Simulation details
try {
  const mRows = db.exec("SELECT id FROM services WHERE title = 'Modeling & Simulation' LIMIT 1");
  if (mRows.length > 0 && mRows[0].values.length > 0) {
    db.run('UPDATE services SET details = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(["Process Simulation", "CFD Modeling", "Digital Process Engineering", "Dynamic Modeling"]), now, mRows[0].values[0][0]]);
    console.log('OK Services: updated Modeling & Simulation details');
  }
} catch (e) { console.error('Error updating M&S:', e.message); }

// 6-7. Optimization & Troubleshooting -> Process Optimization
try {
  let optRows = db.exec("SELECT id FROM services WHERE title = 'Optimization & Troubleshooting' LIMIT 1");
  if (optRows.length > 0 && optRows[0].values.length > 0) {
    db.run('UPDATE services SET title = ?, details = ?, updated_at = ? WHERE id = ?',
      ["Process Optimization", JSON.stringify(["Plant Performance", "Energy Integration", "Mass Integration", "Water Integration"]), now, optRows[0].values[0][0]]);
    console.log('OK Services: renamed to "Process Optimization" and updated details');
  } else {
    optRows = db.exec("SELECT id FROM services WHERE title = 'Process Optimization' LIMIT 1");
    if (optRows.length > 0 && optRows[0].values.length > 0) {
      db.run('UPDATE services SET details = ?, updated_at = ? WHERE id = ?',
        [JSON.stringify(["Plant Performance", "Energy Integration", "Mass Integration", "Water Integration"]), now, optRows[0].values[0][0]]);
      console.log('OK Services: updated Process Optimization details (already renamed)');
    }
  }
} catch (e) { console.error('Error updating optimization:', e.message); }

// 8. Training & Professional Development details in services
try {
  const tRows = db.exec("SELECT id FROM services WHERE title = 'Training & Professional Development' LIMIT 1");
  if (tRows.length > 0 && tRows[0].values.length > 0) {
    db.run('UPDATE services SET details = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(["Industrial Workshops", "Chemical Engineering Refresher Course", "Technical training", "Technical Skill Development"]), now, tRows[0].values[0][0]]);
    console.log('OK Services: updated Training & Professional Development details');
  }
} catch (e) { console.error('Error updating training service:', e.message); }

// 10. Training Types
try {
  db.run('DELETE FROM training_types');
  db.run('INSERT INTO training_types (title, description, icon, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ["Industrial Workshops", "Hands-on training for plant engineers focusing on modelling and simulation, energy integration using software.", "Briefcase", 1, now, now]);
  db.run('INSERT INTO training_types (title, description, icon, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ["Chemical Engineering Refresher Course", "Strengthening fundamental chemical engineering knowledge through practical, industry-oriented refresher training.", "BookOpen", 2, now, now]);
  db.run('INSERT INTO training_types (title, description, icon, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ["Process Design course", "Building practical skills in process engineering design through industry-oriented concepts, methods, and applications.", "Pencil", 3, now, now]);
  db.run('INSERT INTO training_types (title, description, icon, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ["Technical Seminars", "Practical technical seminars on process safety, industrial operations, sustainability, and emerging engineering practices.", "Calendar", 4, now, now]);
  console.log('OK Training Types: replaced with new training types');
} catch (e) { console.error('Error updating training types:', e.message); }

// Save
try {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
  console.log('\nDatabase saved to disk successfully!');
} catch (e) {
  console.error('Error saving database:', e.message);
}

db.close();
console.log('All database changes applied successfully!');
