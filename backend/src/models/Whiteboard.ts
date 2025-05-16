import mongoose from 'mongoose';

export interface IWhiteboard {
  name: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  canvasData: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whiteboardSchema = new mongoose.Schema<IWhiteboard>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    canvasData: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Whiteboard = mongoose.model<IWhiteboard>('Whiteboard', whiteboardSchema);

export default Whiteboard;
