import express from 'express';
import Forum from '../models/Forum';
import { auth } from '../middleware/auth';

const router = express.Router();


router.get('/', async (req, res) => {
  const forums = await Forum.find()
    .populate('owner', 'name email')
    .populate('comments.author', 'name email');
  res.json(forums);
});


router.get('/:id', async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('comments.author', 'name email');
    
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    
    res.json(forum);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/', auth, async (req: any, res) => {
  const { title, description } = req.body;
  const forum = new Forum({ title, description, owner: req.user._id });
  await forum.save();
  await forum.populate('owner', 'name email');
  res.status(201).json(forum);
});


router.delete('/:id', auth, async (req: any, res) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return res.status(404).json({ error: 'Not found' });
  if (forum.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await forum.deleteOne();
  res.json({ success: true });
});


router.post('/:id/comments', auth, async (req: any, res) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return res.status(404).json({ error: 'Not found' });
  const comment = { content: req.body.content, author: req.user._id, createdAt: new Date() };
  forum.comments.push(comment);
  await forum.save();
  await forum.populate('comments.author', 'name email');
  res.status(201).json(forum.comments[forum.comments.length - 1]);
});


router.delete('/:forumId/comments/:commentId', auth, async (req: any, res) => {
  const forum = await Forum.findById(req.params.forumId).populate('comments.author', 'name email');
  if (!forum) return res.status(404).json({ error: 'Not found' });
  // @ts-ignore: Mongoose subdocument array supports .id() 
  const comment = forum.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (comment.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  comment.deleteOne();
  await forum.save();
  res.json({ success: true });
});

export default router; 