const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('./db');






//--------------------verse searcher -------------------------
router.get('/api/verse-search', async (req, res) => {
  const query = req.query.query;
  if (!query)
    return res.status(400).json({ error: "Search query is required." });
  try {
    const response = await axios.get(`https://bible-api.com/${encodeURIComponent(query)}`);
    if (response.data && response.data.text) {
      res.json({
        verses: [{ text: response.data.text, reference: response.data.reference }]
      });
    } else {
      res.json({ verses: [] });
    }
  } catch (error) {
    console.error("Failed to search for Bible verses:", error);
    res.status(500).json({ error: "Not a valid search." });
  }
});

const allowedVerses = [
    "Philippians 4:13",
    "Jeremiah 29:11",
    "Isaiah 40:31",
    "Psalm 23:1",
    "Matthew 11:28",
    "Proverbs 3:5-6",
    "Romans 8:28",
    "Joshua 1:9",
    "2 Corinthians 5:7",
    "Psalm 46:10",
    "Isaiah 41:10",
    "Deuteronomy 31:6",
    "Romans 12:12",
    "Psalm 34:17",
    "1 Peter 5:7",
    "Matthew 6:33",
    "Galatians 6:9",
    "Isaiah 43:2",
    "Psalm 37:4",
    "Romans 15:13",
    "Psalm 91:11",
    "Hebrews 11:1",
    "1 Corinthians 16:14",
    "Psalm 119:105",
    "John 14:27",
    "Proverbs 18:10",
    "2 Timothy 1:7",
    "Psalm 55:22",
    "Isaiah 26:3",
    "Matthew 19:26",
    "Lamentations 3:22-23",
    "Romans 5:8",
    "Psalm 121:1-2",
    "1 John 4:19",
    "Jeremiah 33:3",
    "John 3:16",
    "Psalm 23:4",
    "Philippians 1:6",
    "Romans 8:31",
    "Isaiah 40:29",
    "Ephesians 2:10",
    "Psalm 139:14",
    "Matthew 11:29",
    "Psalm 27:1",
    "John 15:5",
    "Proverbs 16:3",
    "James 1:5",
    "Colossians 3:23",
    "Psalm 100:4",
    "2 Corinthians 12:9",
    "Isaiah 30:21",
    "John 8:12",
    "Psalm 19:14",
    "Luke 1:37",
    "Romans 10:9",
    "Psalm 34:8",
    "1 Thessalonians 5:16-18",
    "Matthew 5:14",
    "Philippians 4:6-7",
    "Isaiah 54:17",
    "Psalm 133:1",
    "Galatians 5:22-23",
    "Micah 6:8",
    "John 10:10",
    "Psalm 118:24",
    "Romans 14:19",
    "Proverbs 17:17",
    "James 4:10",
    "1 Corinthians 10:13",
    "Hebrews 13:5",
    "Psalm 16:11",
    "Mark 12:30-31",
    "Ephesians 3:20",
    "John 1:5",
    "Romans 8:18",
    "Psalm 30:5",
    "Proverbs 3:3-4",
    "Isaiah 58:11",
    "Matthew 7:7",
    "2 Thessalonians 3:3",
    "Psalm 119:11",
    "John 16:33",
    "Romans 12:2",
    "1 Peter 4:8",
    "Psalm 62:1",
    "Matthew 28:20",
    "Jeremiah 17:7-8",
    "Luke 12:32",
    "1 Corinthians 13:4-7",
    "Psalm 46:1",
    "Hebrews 4:16",
    "John 13:34-35",
    "Isaiah 35:4",
    "Philippians 2:3-4",
    "Romans 15:4",
    "Psalm 145:18",
    "James 1:17",
    "Matthew 22:37-39",
    "Psalm 9:9-10",
    "John 6:35",
    "2 Corinthians 1:3-4",
    "Isaiah 12:2",
    "Romans 6:23",
    "Psalm 27:14",
    "Galatians 2:20",
    "1 Timothy 4:12",
    "Matthew 10:29-31",
    "Psalm 147:3",
    "John 14:6",
    "Proverbs 4:23",
    "Ephesians 4:32",
    "Hebrews 10:24-25",
    "Psalm 86:5",
    "1 Peter 1:3",
    "Luke 6:38",
    "Romans 1:16",
    "Psalm 37:7",
    "Matthew 5:16",
    "Isaiah 55:8-9",
    "Philippians 3:14",
    "2 Corinthians 9:7",
    "John 5:24",
    "Psalm 40:1-2",
    "Proverbs 12:25",
    "Romans 3:23-24",
    "Isaiah 6:8",
    "Matthew 6:34",
    "Psalm 51:10",
    "1 John 1:9",
    "Hebrews 12:1",
    "John 11:25-26",
    "Proverbs 27:17",
    "Ephesians 6:10",
    "Romans 5:3-5",
    "Psalm 119:165",
    "James 5:16",
    "Isaiah 32:17",
    "Philippians 4:19",
    "2 Corinthians 3:17",
    "John 15:13",
    "Psalm 100:2",
    "1 Peter 3:15",
    "Luke 10:27",
    "Romans 11:36",
    "Psalm 34:19",
    "Matthew 22:39",
    "Isaiah 9:6",
    "Philippians 1:21",
    "2 Timothy 2:15",
    "John 3:17",
    "Psalm 84:11",
    "Proverbs 11:25",
    "Ephesians 1:3",
    "Romans 8:37",
    "Psalm 33:20",
    "Matthew 13:44",
    "Isaiah 53:5",
    "Philippians 4:8",
    "2 Corinthians 4:16-18",
    "John 14:1",
    "Psalm 119:50",
    "James 2:17",
    "Isaiah 40:8",
    "Philippians 2:13",
    "Romans 8:1",
    "Psalm 63:1",
    "1 John 3:1",
    "John 7:38",
    "Proverbs 19:21",
    "Ephesians 5:2",
    "Romans 15:5",
    "Psalm 23:6",
    "Matthew 18:20",
    "Isaiah 40:31",
    "Philippians 3:20",
    "2 Corinthians 10:5",
    "John 1:9",
    "Psalm 25:4-5",
    "James 1:12",
    "Isaiah 44:22",
    "Philippians 1:3",
    "Romans 10:13",
    "Psalm 103:2-3",
    "Matthew 11:30",
    "Isaiah 45:2",
    "Philippians 4:13",
    "2 Corinthians 5:17",
    "John 17:17",
    "Psalm 118:6",
    "James 3:17",
    "Isaiah 49:16",
    "Philippians 4:5",
    "Romans 12:10",
    "Psalm 1:3",
    "Matthew 5:9",
    "Isaiah 33:2",
    "Philippians 3:10",
    "2 Corinthians 13:11",
    "John 14:21",
    "Psalm 9:1",
    "James 1:2-3",
    "Isaiah 66:13",
    "Philippians 2:14",
    "Romans 8:6",
    "Psalm 28:7",
    "Matthew 7:12",
    "Isaiah 40:1",
    "Philippians 1:27",
    "2 Corinthians 2:14",
    "John 3:30",
    "Psalm 46:5",
    "James 4:8",
    "Isaiah 57:15",
    "Philippians 4:20",
    "Romans 15:13",
    "Psalm 130:5",
    "Matthew 9:29",
    "Isaiah 40:29",
    "Philippians 2:16",
    "2 Corinthians 4:6",
    "John 8:36",
    "Psalm 94:19",
    "James 5:11",
    "Isaiah 55:12",
    "Philippians 4:23",
    "Romans 13:10",
    "Psalm 37:23",
    "Matthew 28:18-20",
    "Isaiah 43:1",
    "Philippians 1:9-10",
    "2 Corinthians 9:8",
    "John 20:29"
    
  ];
  
 
  async function getRandomBibleVerse() {
    const randomIndex = Math.floor(Math.random() * allowedVerses.length);
    const verseToFetch = allowedVerses[randomIndex];
    try {
      const response = await axios.get(`https://bible-api.com/${encodeURIComponent(verseToFetch)}`);
      if (response.data && response.data.text) {
        return {
          reference: response.data.reference,
          text: response.data.text
        };
      } else {
        return { reference: "N/A", text: "No verse available today." };
      }
    } catch (error) {
      console.error("Failed to fetch Bible verse:", error);
      return { reference: "N/A", text: "Unable to fetch verse at this time." };
    }
  }
  
  
  router.get('/', async (req, res, next) => {
    try {
      const verse = await getRandomBibleVerse();
      const now = new Date();
  
      const sql = `
        SELECT * FROM calendar_events
        WHERE event_date >= ?
        ORDER BY event_date ASC
        LIMIT 1
      `;
  
      db.query(sql, [now], (err, result) => {
        if (err) {
          console.error("DB error:", err);
          return next(err);
        }
  
        const nextEvent = result[0] || null;
  
        res.render('home', {
          user: req.session.user,
          verse,
          nextEvent
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  module.exports = router;