import { connectDB } from '../../../lib/db';

export default async function handler(req, res) {
  // Allow both POST and PUT methods
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, screenshotIndex, approved } = req.body;
    
    console.log("📝 Update screenshot status:", { email, screenshotIndex, approved });
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const db = await connectDB();
    
    // Get current user
    const user = await db.collection('users').findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get existing approved status or create new
    let screenshotsApproved = user.screenshotsApproved || {};
    screenshotsApproved[screenshotIndex] = approved;
    
    // Update user
    const updateResult = await db.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          screenshotsApproved: screenshotsApproved,
          updatedAt: new Date()
        } 
      }
    );

    console.log("✅ Status saved:", updateResult);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Screenshot status updated',
      screenshotsApproved: screenshotsApproved
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
