const { MongoClient } = require('mongodb');

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('law1x-website');
  }
  return db;
}

// Default Experiences Data
const defaultExperiences = [
  {
    id: 1,
    org: "Sarrow Esports",
    role: "Co-Owner",
    date: "Previous",
    desc: "Promoted to executive after demonstrating operational impact. Directed roster strategy, recruitment evaluation, and performance standards. Managed scrim scheduling, communication channels, and alignment between competitive and media departments.",
    tags: ["Executive Leadership", "Roster Strategy", "Media Alignment"],
    order: 6
  },
  {
    id: 2,
    org: "Synex",
    role: "Founder & Head of Operations",
    date: "Previous",
    desc: "Built infrastructure for competitive, media, and promotions divisions. Created recruitment pipelines and onboarding processes. Developed promotional strategies across social platforms and implemented communication systems to reduce friction.",
    tags: ["Infrastructure", "Recruitment", "Social Growth"],
    order: 5
  },
  {
    id: 3,
    org: "Fortral",
    role: "Founder",
    date: "Previous",
    desc: "Recruited and managed 30+ staff and competitive members. Established hierarchies, reporting structures, discipline systems, and long-term planning to support growth and operational stability.",
    tags: ["Team Building", "Systems Design", "Scale Management"],
    order: 4
  },
  {
    id: 4,
    org: "Beneath Esports",
    role: "Head of Management",
    date: "Previous",
    desc: "Oversaw management operations and coordinated between departments. Contributed to performance standards, improved staff accountability systems, and supported overall organizational growth.",
    tags: ["Operations", "Accountability", "Growth"],
    order: 3
  },
  {
    id: 5,
    org: "Chronic",
    role: "Management",
    date: "1 Month",
    desc: "Provided operational and community support, maintained internal communication engagement, and assisted management to ensure team continuity.",
    tags: ["Community", "Support"],
    order: 2
  },
  {
    id: 6,
    org: "WTJ",
    role: "Operations",
    date: "2 Months",
    desc: "Assisted with operational tasks behind the scenes, maintained consistent team communication, and supported coordination efforts to enhance workflow efficiency.",
    tags: ["Operations", "Workflow"],
    order: 1
  }
];

const defaultProfile = {
  currentOrg: "Sarrow Esports",
  status: "Open to Opportunities",
  imageUrl: "https://cdn.discordapp.com/avatars/1285098941637197899/e3e604da1a955e12fade4ed4be42b02e.webp?size=1024"
};

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const db = await connectDB();
  const experiences = db.collection('experiences');
  const profile = db.collection('profile');

  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // GET /api/experiences - Get all experiences
    if (pathname === '/api/experiences' && req.method === 'GET') {
      const data = await experiences.find({}).sort({ order: -1 }).toArray();
      
      // If no data exists, initialize with defaults
      if (data.length === 0) {
        await experiences.insertMany(defaultExperiences);
        return res.json(defaultExperiences);
      }
      
      res.statusCode = 200;
      res.json(data);
      return;
    }

    // POST /api/experiences - Add new experience
    if (pathname === '/api/experiences' && req.method === 'POST') {
      const body = await getBody(req);
      const newExp = {
        ...body,
        id: Date.now(),
        order: Date.now(),
        createdAt: new Date()
      };
      await experiences.insertOne(newExp);
      res.statusCode = 201;
      res.json(newExp);
      return;
    }

    // PUT /api/experiences/:id - Update experience
    if (pathname.startsWith('/api/experiences/') && req.method === 'PUT') {
      const id = parseInt(pathname.split('/')[3]);
      const body = await getBody(req);
      await experiences.updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date() } }
      );
      res.statusCode = 200;
      res.json({ success: true });
      return;
    }

    // DELETE /api/experiences/:id - Delete experience
    if (pathname.startsWith('/api/experiences/') && req.method === 'DELETE') {
      const id = parseInt(pathname.split('/')[3]);
      await experiences.deleteOne({ id });
      res.statusCode = 200;
      res.json({ success: true });
      return;
    }

    // GET /api/profile - Get profile
    if (pathname === '/api/profile' && req.method === 'GET') {
      const data = await profile.findOne({});
      
      // If no profile exists, initialize with default
      if (!data) {
        await profile.insertOne(defaultProfile);
        return res.json(defaultProfile);
      }
      
      res.statusCode = 200;
      res.json(data);
      return;
    }

    // PUT /api/profile - Update profile
    if (pathname === '/api/profile' && req.method === 'PUT') {
      const body = await getBody(req);
      await profile.updateOne(
        {},
        { $set: { ...body, updatedAt: new Date() } },
        { upsert: true }
      );
      res.statusCode = 200;
      res.json({ success: true });
      return;
    }

    // POST /api/reset - Reset all data to default
    if (pathname === '/api/reset' && req.method === 'POST') {
      await experiences.deleteMany({});
      await profile.deleteMany({});
      
      await experiences.insertMany(defaultExperiences);
      await profile.insertOne(defaultProfile);

      res.statusCode = 200;
      res.json({ success: true });
      return;
    }

    // 404 for unmatched routes
    res.statusCode = 404;
    res.json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    res.json({ error: error.message });
  }
};

// Helper to parse request body
function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}