const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const defaultProfile = {
  currentOrg: "Sarrow Esports",
  status: "Open to Opportunities",
  imageUrl: "https://cdn.discordapp.com/avatars/1285098941637197899/e3e604da1a955e12fade4ed4be42b02e.webp?size=1024"
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await client.connect();
    const db = client.db('law1x-website');
    const collection = db.collection('profile');

    // GET /api/profile
    if (req.method === 'GET') {
      const data = await collection.findOne({});
      if (!data) {
        await collection.insertOne(defaultProfile);
        return res.status(200).json(defaultProfile);
      }
      res.status(200).json(data);
      return;
    }

    // PUT /api/profile (update)
    if (req.method === 'PUT') {
      const body = await getBody(req);
      await collection.updateOne(
        {},
        { $set: { ...body, updatedAt: new Date() } },
        { upsert: true }
      );
      res.status(200).json({ success: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

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