import mongoose, { Document, Schema } from "mongoose";

export interface IVote extends Document {
  _id: string;
  pollId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  whiteboardId: mongoose.Types.ObjectId;
  optionIndex: number;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    whiteboardId: {
      type: Schema.Types.ObjectId,
      ref: "Whiteboard",
      required: true,
      index: true,
    },
    optionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying and constraints
voteSchema.index({ pollId: 1, userId: 1 }); // For checking existing votes
voteSchema.index({ pollId: 1, optionIndex: 1 }); // For vote counting
voteSchema.index({ whiteboardId: 1, createdAt: -1 }); // For user activity

// Ensure user can only vote once per poll (unless multiple votes allowed)
// This will be enforced in the application logic, not as a unique index
// because we need to handle the allowMultipleVotes case

const Vote = mongoose.model<IVote>("Vote", voteSchema);

export default Vote;
