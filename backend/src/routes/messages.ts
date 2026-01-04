import express from 'express';
import Message from '../models/Message';
import { auth } from '../middleware/auth';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();


router.get('/messages/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  const myId = (req as any).user.id;
  const myObjectId = new mongoose.Types.ObjectId(myId);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const messages = await Message.find({
    $or: [
      { sender: myObjectId, receiver: userObjectId },
      { sender: userObjectId, receiver: myObjectId }
    ]
  }).sort({ timestamp: 1 });
  res.json(messages);
});


router.get('/chats', auth, async (req: any, res) => {
  const myId = req.user.id;
  const myObjectId = new mongoose.Types.ObjectId(myId);
 
  const messages = await Message.find({
    $or: [
      { sender: myObjectId },
      { receiver: myObjectId }
    ]
  }).sort({ timestamp: -1 });

 
  const chatsMap = new Map();
  messages.forEach(msg => {
    const otherId = msg.sender.toString() === myId ? msg.receiver.toString() : msg.sender.toString();
    if (!chatsMap.has(otherId)) {
      chatsMap.set(otherId, msg);
    }
  });

 
  const chats = await Promise.all(Array.from(chatsMap.values()).map(async (msg) => {
    const otherId = msg.sender.toString() === myId ? msg.receiver : msg.sender;
    const user = await User.findById(otherId).select('name email role');
    if (user) {
      return { user: { id: user.id || user._id, name: user.name, email: user.email, role: user.role }, lastMessage: msg };
    } else {
     
      return { user: { id: otherId.toString(), name: '(Изтрит потребител)', email: '', role: '' }, lastMessage: msg };
    }
  }));

  res.json(chats);
});


router.get('/users-list', auth, async (req, res) => {
  const users = await User.find({}, 'id name email role');
 
  const result = users.map(u => ({
    id: u.id || u._id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json(result);
});

export default router; 