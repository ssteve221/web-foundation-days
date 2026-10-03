// ---------- Starting data ----------
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const VALID_CATEGORIES = ["personal", "work", "study"];

// ---------- Functions ----------

// Returns every note whose text contains `word`, ignoring case.
function searchNotes(word) {
  const target = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(target));
}

// Returns the note with the most characters, or null if there are none.
function longestNote() {
  if (notes.length === 0) {
    return null; // handle the empty array first
  }
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// Returns an object counting notes per category.
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category] === undefined) {
      counts[note.category] = 1; // first time we see this category
    } else {
      counts[note.category]++;
    }
  }
  return counts;
}

// Returns a sentence like "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noun = total === 1 ? "note" : "notes";

  if (total === 0) {
    return `0 ${noun}.`;
  }

  // Fixed category order keeps the sentence predictable
  const parts = VALID_CATEGORIES
    .filter((category) => counts[category] > 0)
    .map((category) => `${counts[category]} ${category}`);

  return `${total} ${noun}: ${parts.join(", ")}.`;
}

// True if a note with the same text exists (ignoring case and extra spaces).
function isDuplicate(text) {
  const clean = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const target = clean(text);
  return notes.some((note) => clean(note.text) === target);
}

// Adds a note if valid. Returns true when added, false otherwise (and logs why).
function addNote(text, category) {
  if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 200) {
    console.log("Not added: text must be 1-200 characters.");
    return false;
  }
  if (isDuplicate(text)) {
    console.log("Not added: that note already exists.");
    return false;
  }
  if (!VALID_CATEGORIES.includes(category)) {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }

  // Next id = highest existing id + 1 (safe even if notes are removed later)
  const nextId = notes.length === 0 ? 1 : Math.max(...notes.map((n) => n.id)) + 1;
  notes.push({ id: nextId, text: text.trim(), category });
  return true;
}

// ---------- Tests ----------
// Run in order: addNote tests change the notes array, so they come last.

console.log("--- searchNotes ---");
console.log(searchNotes("MILK"));
// [ { id: 1, text: "Buy milk and bread", category: "personal" } ]
console.log(searchNotes("the"));
// 2 notes: id 2 ("Finish the Day 3 assignment") and id 3 ("Email the project report to Grace")
console.log(searchNotes("xyz"));
// [] (edge case: no results)

console.log("--- longestNote ---");
console.log(longestNote());
// { id: 3, text: "Email the project report to Grace", category: "work" }
const backup = notes; // save the real array so we can test the empty case
notes = [];
console.log(longestNote());
// null (edge case: empty array)
notes = backup;

console.log("--- countByCategory ---");
console.log(countByCategory());
// { personal: 2, study: 2, work: 1 } (key order follows first appearance in notes)
notes = [];
console.log(countByCategory());
// {} (edge case: empty array)
notes = backup;

console.log("--- getSummary ---");
console.log(getSummary());
// "5 notes: 2 personal, 1 work, 2 study."
notes = [backup[0]];
console.log(getSummary());
// "1 note: 1 personal." (edge case: singular "note")
notes = [];
console.log(getSummary());
// "0 notes." (edge case: empty array)
notes = backup;

console.log("--- isDuplicate ---");
console.log(isDuplicate("buy milk and bread"));
// true (different case)
console.log(isDuplicate("  BUY   milk  and bread  "));
// true (extra spaces and different case)
console.log(isDuplicate("Buy eggs"));
// false

console.log("--- addNote ---");
console.log(addNote("Buy eggs", "personal"));
// true
console.log(addNote("  buy EGGS ", "personal"));
// logs "Not added: that note already exists." then false
console.log(addNote("", "work"));
// logs "Not added: text must be 1-200 characters." then false
console.log(addNote("x".repeat(201), "work"));
// logs "Not added: text must be 1-200 characters." then false (201 characters)
console.log(addNote("Plan weekend trip", "fun"));
// logs "Not added: category must be personal, work or study." then false
console.log(addNote("Prepare slides", "work"));
// true
console.log(getSummary());
// "7 notes: 3 personal, 2 work, 2 study."
console.log(notes[notes.length - 1]);
// { id: 7, text: "Prepare slides", category: "work" }
