const fs = require('fs');
const events = JSON.parse(fs.readFileSync('./events_03.json', 'utf8'));

const byDay = {};
for (const e of events) {
  const match = e.date.match(/March (\d+)/);
  if (match) {
    const day = parseInt(match[1]);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(e);
  }
}

// Filter and pick 3 per day
const selected = {};
for (let d = 1; d <= 31; d++) {
  const valid = (byDay[d] || []).filter(e => e.sentence.length > 40 && !e.sentence.includes('appears on'));
  selected[d] = valid.slice(0, 3);
}

// Output selected events as intermediate JSON
fs.writeFileSync('./selected_march.json', JSON.stringify(selected, null, 2));
console.log('Written selected_march.json');
for (let d = 1; d <= 31; d++) {
  console.log(`Day ${d}: ${selected[d].length} events`);
  selected[d].forEach((e, i) => {
    // Clean sentence for display
    const clean = e.sentence.replace(/\(pictured\)/g, '').replace(/\(.*?pictured.*?\)/g, '').replace(/\(depicted\)/g, '');
    console.log(`  ${i+1}. [${e.year}] ${clean.substring(0, 100)}`);
  });
}
