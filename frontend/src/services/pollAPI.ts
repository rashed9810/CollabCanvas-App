import api from "./api";
import {
  Poll,
  PollResultsResponse,
  CreatePollData,
  CastVoteData,
} from "../types/poll";

export const pollAPI = {
  // Create a new poll
  createPoll: async (
    data: CreatePollData
  ): Promise<{ success: boolean; poll: Poll }> => {
    const response = await api.post("/polls/create", data);
    return response.data;
  },

  // Cast a vote
  castVote: async (
    data: CastVoteData
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/polls/vote", data);
    return response.data;
  },

  // Get poll results
  getPollResults: async (pollId: string): Promise<PollResultsResponse> => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  },

  // Get active polls for a whiteboard
  getActivePolls: async (
    whiteboardId: string
  ): Promise<{ success: boolean; polls: Poll[] }> => {
    const response = await api.get(`/polls/whiteboard/${whiteboardId}/active`);
    return response.data;
  },

  // Close a poll
  closePoll: async (
    pollId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/polls/${pollId}/close`);
    return response.data;
  },
};
