const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await client.connect();
    const db = client.db('law1x-website');
    const collection = db.collection('experiences');

    // GET /api/experiences
    if (req.method === 'GET') {
      const data = await collection.find({}).sort({ order: -1 }).toArray();
      res.status(200).json(data);
      return;
    }

    // POST /api/experiences (add new)
    if (req.method === 'POST') {
      const body = await getBody(req);
      const newExp = {
        ...body,
        id: Date.now(),
        order: Date.now(),
        createdAt: new Date()
      };
      await collection.insertOne(newExp);
      res.status(201).json(newExp);
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