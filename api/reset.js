const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await client.connect();
    const db = client.db('law1x-website');

    // Clear and reset experiences
    await db.collection('experiences').deleteMany({});
    await db.collection('experiences').insertMany(defaultExperiences);

    // Clear and reset profile
    await db.collection('profile').deleteMany({});
    await db.collection('profile').insertOne(defaultProfile);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: error.message });
  }
};