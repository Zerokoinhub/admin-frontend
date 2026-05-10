import { connectDB } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, screenshotIndex, approved } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get existing approved status or create new
    let screenshotsApproved = user.screenshotsApproved || {};
    screenshotsApproved[screenshotIndex] = approved;
    
    await db.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          screenshotsApproved: screenshotsApproved,
          updatedAt: new Date()
        } 
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
