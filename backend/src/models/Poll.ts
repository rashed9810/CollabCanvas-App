import mongoose from "mongoose";

export interface IPollOption {
  text: string;
  index: number;
}

export interface IPoll {
  whiteboardId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  question: string;
  options: IPollOption[];
  isActive: boolean;
  allowMultipleVotes: boolean;
  duration: number; // in minutes
  createdAt: Date;
  expiresAt: Date;
  totalVotes: number;
}

export interface IVote {
  pollId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  optionIndex: number;
  createdAt: Date;
}

const pollOptionSchema = new mongoose.Schema<IPollOption>({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  index: {
    type: Number,
    required: true,
    min: 0,
  },
});

const pollSchema = new mongoose.Schema<IPoll>(
  {
    whiteboardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Whiteboard",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    options: {
      type: [pollOptionSchema],
      required: true,
      validate: {
        validator: function (options: IPollOption[]) {
          return options.length >= 2 && options.length <= 10;
        },
        message: "Poll must have between 2 and 10 options",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440, // 24 hours
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
pollSchema.index({ whiteboardId: 1, isActive: 1 });
pollSchema.index({ expiresAt: 1 });

// Middleware to set expiresAt based on duration
pollSchema.pre("save", function (next) {
  if (this.isNew) {
    this.expiresAt = new Date(Date.now() + this.duration * 60 * 1000);
  }
  next();
});

const voteSchema = new mongoose.Schema<IVote>(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Compound index to prevent duplicate votes (unless multiple votes allowed)
voteSchema.index({ pollId: 1, userId: 1 });

export const Poll = mongoose.model<IPoll>("Poll", pollSchema);
export const Vote = mongoose.model<IVote>("Vote", voteSchema);
