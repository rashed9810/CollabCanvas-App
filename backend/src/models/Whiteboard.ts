import mongoose from "mongoose";

export interface ICollaborator {
  userId: mongoose.Types.ObjectId;
  role: "viewer" | "editor" | "presenter";
  permissions: {
    canDraw: boolean;
    canEdit: boolean;
    canManageUsers: boolean;
    canPresentMode: boolean;
  };
  assignedAt: Date;
  assignedBy: mongoose.Types.ObjectId;
}

export interface IPresenterMode {
  isActive: boolean;
  presenterId?: mongoose.Types.ObjectId;
  viewState?: {
    zoom: number;
    panX: number;
    panY: number;
    viewport: {
      width: number;
      height: number;
    };
  };
  startedAt?: Date;
}

export interface IWhiteboard {
  name: string;
  owner: mongoose.Types.ObjectId;
  collaborators: ICollaborator[];
  canvasData: string;
  isPublic: boolean;
  presenterMode: IPresenterMode;
  createdAt: Date;
  updatedAt: Date;
}

const collaboratorSchema = new mongoose.Schema<ICollaborator>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor", "presenter"],
    default: "editor",
    required: true,
  },
  permissions: {
    canDraw: {
      type: Boolean,
      default: true,
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
    canManageUsers: {
      type: Boolean,
      default: false,
    },
    canPresentMode: {
      type: Boolean,
      default: false,
    },
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const presenterModeSchema = new mongoose.Schema<IPresenterMode>({
  isActive: {
    type: Boolean,
    default: false,
  },
  presenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  viewState: {
    zoom: {
      type: Number,
      default: 1,
    },
    panX: {
      type: Number,
      default: 0,
    },
    panY: {
      type: Number,
      default: 0,
    },
    viewport: {
      width: {
        type: Number,
        default: 1920,
      },
      height: {
        type: Number,
        default: 1080,
      },
    },
  },
  startedAt: {
    type: Date,
  },
});

const whiteboardSchema = new mongoose.Schema<IWhiteboard>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [collaboratorSchema],
    canvasData: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    presenterMode: {
      type: presenterModeSchema,
      default: () => ({ isActive: false }),
    },
  },
  {
    timestamps: true,
  }
);

const Whiteboard = mongoose.model<IWhiteboard>("Whiteboard", whiteboardSchema);

export default Whiteboard;
