// Poll-related type definitions

export interface PollOption {
  text: string;
  index: number;
}

export interface Poll {
  _id: string;
  whiteboardId: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  question: string;
  options: PollOption[];
  isActive: boolean;
  allowMultipleVotes: boolean;
  duration: number;
  createdAt: string;
  expiresAt: string;
  totalVotes: number;
}

export interface Vote {
  _id: string;
  pollId: string;
  optionIndex: number;
  createdAt: string;
}

export interface PollResult {
  optionIndex: number;
  text: string;
  votes: number;
  percentage: number;
}

export interface PollResultsResponse {
  success: boolean;
  poll: Poll;
  results: PollResult[];
  userHasVoted: boolean;
  userVote: {
    optionIndex: number;
    createdAt: string;
  } | null;
}

export interface CreatePollData {
  whiteboardId: string;
  question: string;
  options: PollOption[];
  duration: number;
  allowMultipleVotes: boolean;
}

export interface CastVoteData {
  pollId: string;
  optionIndex: number;
}
