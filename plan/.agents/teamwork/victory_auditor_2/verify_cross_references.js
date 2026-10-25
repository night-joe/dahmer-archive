const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..', '..');
const ctxPath = path.join(projectRoot, '02_context_content_plan_v03_final_locked.txt');
const tlPath = path.join(projectRoot, '05_timeline_content_plan_v04_final_locked.txt');
const vicPath = path.join(projectRoot, '04_victims_content_plan_v05_final_locked.txt');
const ovPath = path.join(projectRoot, '01_overview_content_plan_v02.txt');

const ctxContent = fs.readFileSync(ctxPath, 'utf8');
const tlContent = fs.readFileSync(tlPath, 'utf8');
const vicContent = fs.readFileSync(vicPath, 'utf8');
const ovContent = fs.readFileSync(ovPath, 'utf8');

console.log('=== VERIFYING OUTGOING TIMELINE ANCHORS FROM CONTEXT ===');
const tlAnchorRegex = /#event-[a-z0-9\-]+/g;
const ctxTlAnchors = [...new Set(ctxContent.match(tlAnchorRegex) || [])];
console.log('Unique #event-* anchors in Context plan:', ctxTlAnchors.length);

let missingInTimeline = [];
ctxTlAnchors.forEach(a => {
  if (!tlContent.includes(a)) {
    missingInTimeline.push(a);
  }
});
console.log('Missing in Timeline v04:', missingInTimeline);

console.log('\n=== VERIFYING INCOMING LINKS TO CONTEXT ===');
// Search for /context#... in timeline and overview
const incomingTlMatches = tlContent.match(/\/context#[a-zA-Z0-9\-_]+/g) || [];
console.log('Incoming links from Timeline v04:', incomingTlMatches);
let missingInCtxFromTl = [];
incomingTlMatches.forEach(link => {
  const anchor = link.split('#')[1];
  if (!ctxContent.includes('#' + anchor)) {
    missingInCtxFromTl.push(link);
  }
});
console.log('Broken incoming links from Timeline:', missingInCtxFromTl);

const incomingOvMatches = ovContent.match(/\/context#[a-zA-Z0-9\-_]+/g) || [];
console.log('Incoming links from Overview v02:', incomingOvMatches);
let missingInCtxFromOv = [];
incomingOvMatches.forEach(link => {
  const anchor = link.split('#')[1];
  if (!ctxContent.includes('#' + anchor)) {
    missingInCtxFromOv.push(link);
  }
});
console.log('Broken incoming links from Overview:', missingInCtxFromOv);

console.log('\n=== VERIFYING CANONICAL DISPATCH ALIASES IN CONTEXT ===');
const requiredAliases = [
  '#ctx-econ-deindustrialization',
  '#ctx-seg-indices',
  '#ctx-oxford-apts',
  '#ctx-mpd-governance',
  '#ctx-ernest-lacy',
  '#ctx-lgbtq-history',
  '#ctx-less-dead',
  '#ctx-synthesis',
  '#ctx-bio-early-life',
  '#ctx-edu-military',
  '#ctx-west-allis',
  '#ctx-ambrosia-chocolate',
  '#ctx-legal-pre1988'
];

let missingAliases = [];
requiredAliases.forEach(alias => {
  if (!ctxContent.includes(alias)) {
    missingAliases.push(alias);
  }
});
console.log('Missing #ctx-* aliases:', missingAliases);
