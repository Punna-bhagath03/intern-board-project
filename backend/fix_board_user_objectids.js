const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/canvas-board';

const Board = require('./models/Board');

async function fixBoardUserObjectIds() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB');

  // Fix user field
  const boards = await Board.find({ user: { $type: 'string' } });
  console.log(`Found ${boards.length} boards with string user field.`);

  let updated = 0;
  for (const board of boards) {
    try {
      const userId = board.user;
      if (typeof userId === 'string' && /^[a-fA-F0-9]{24}$/.test(userId)) {
        board.user = mongoose.Types.ObjectId(userId);
        await board.save();
        updated++;
      }
    } catch (err) {
      console.error('Failed to update board', board._id, err);
    }
  }
  console.log(`Updated ${updated} boards with user field as ObjectId.`);

  // Fix collaborators.userId field
  const boardsWithStringCollab = await Board.find({ 'collaborators.userId': { $type: 'string' } });
  let collabUpdated = 0;
  for (const board of boardsWithStringCollab) {
    let changed = false;
    for (let collab of board.collaborators) {
      if (typeof collab.userId === 'string' && /^[a-fA-F0-9]{24}$/.test(collab.userId)) {
        collab.userId = mongoose.Types.ObjectId(collab.userId);
        changed = true;
      }
    }
    if (changed) {
      await board.save();
      collabUpdated++;
    }
  }
  console.log(`Updated ${collabUpdated} boards with collaborators.userId as ObjectId.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fixBoardUserObjectIds().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
}); 