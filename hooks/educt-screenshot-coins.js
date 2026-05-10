import { connectDB } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, amount, admin, screenshotId } = req.body;
    
    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount required' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentBalance = user.balance || 0;
    const newBalance = currentBalance - amount;
    
    if (newBalance < 0) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Update balance directly
    await db.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          balance: newBalance,
          updatedAt: new Date()
        } 
      }
    );
    
    // Record transaction
    await db.collection('transfers').insertOne({
      email: email,
      userName: user.name,
      amount: -amount,
      adminName: admin,
      reason: 'Screenshot approval revoked',
      status: 'completed',
      createdAt: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      newBalance: newBalance,
      message: `${amount} coins deducted successfully`
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
