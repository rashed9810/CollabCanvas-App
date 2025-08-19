import React, { useState, useEffect } from "react";
import {
  Poll,
  PollResult,
  CastVoteData,
  PollResultsResponse,
} from "../types/poll";
import { pollAPI } from "../services/pollAPI";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface PollOverlayProps {
  poll: Poll;
  onClose: () => void;
  onVote: (data: CastVoteData) => Promise<void>;
}

const PollOverlay: React.FC<PollOverlayProps> = ({ poll, onClose, onVote }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [results, setResults] = useState<PollResult[]>([]);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<{
    optionIndex: number;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(poll.expiresAt).getTime();
      const difference = expiry - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        setShowResults(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [poll.expiresAt]);

  // Load poll results
  useEffect(() => {
    const loadResults = async () => {
      try {
        const response: PollResultsResponse = await pollAPI.getPollResults(
          poll._id
        );
        setResults(response.results);
        setUserHasVoted(response.userHasVoted);
        setUserVote(response.userVote);

        if (response.userHasVoted || !poll.isActive) {
          setShowResults(true);
        }
      } catch (error) {
        console.error("Failed to load poll results:", error);
      }
    };

    loadResults();
  }, [poll._id, poll.isActive]);

  const handleVote = async () => {
    if (selectedOption === null || loading) return;

    setLoading(true);
    try {
      await onVote({ pollId: poll._id, optionIndex: selectedOption });

      // Reload results after voting
      const response: PollResultsResponse = await pollAPI.getPollResults(
        poll._id
      );
      setResults(response.results);
      setUserHasVoted(true);
      setUserVote(response.userVote);
      setShowResults(true);

      showToast("Vote cast successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to cast vote", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getMaxVotes = () => {
    return Math.max(...results.map((r) => r.votes), 1);
  };

  const isPollExpired = timeLeft === 0 || !poll.isActive;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {poll.question}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>By {poll.createdBy.name}</span>
                {!isPollExpired && (
                  <span className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formatTime(timeLeft)} left</span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Poll expired notice */}
          {isPollExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">This poll has ended.</p>
            </div>
          )}

          {/* Voting interface */}
          {!showResults && !userHasVoted && !isPollExpired && (
            <div className="space-y-3">
              {poll.options.map((option) => (
                <label
                  key={option.index}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOption === option.index
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.index}
                    checked={selectedOption === option.index}
                    onChange={() => setSelectedOption(option.index)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option.text}</span>
                </label>
              ))}

              <button
                onClick={handleVote}
                disabled={selectedOption === null || loading}
                className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{loading ? "Voting..." : "Cast Vote"}</span>
              </button>
            </div>
          )}

          {/* Results */}
          {(showResults || userHasVoted || isPollExpired) && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Results</h4>
                <span className="text-sm text-gray-500">
                  {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
                </span>
              </div>

              {results.map((result) => (
                <div key={result.optionIndex} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 flex items-center space-x-2">
                      <span>{result.text}</span>
                      {userVote?.optionIndex === result.optionIndex && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Your vote
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-gray-500">
                      {result.votes} ({result.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        userVote?.optionIndex === result.optionIndex
                          ? "bg-purple-600"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width: `${(result.votes / getMaxVotes()) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {!isPollExpired && (
                <button
                  onClick={() => setShowResults(false)}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Voting
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollOverlay;
