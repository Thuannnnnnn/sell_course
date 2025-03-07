"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Tooltip, Overlay, Popover } from 'react-bootstrap';
import { useParams } from 'next/navigation';
import { ReactionTopic, ReactionTopicById } from '@/app/api/forum/forum';

// Define reaction types
export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

// Define reaction data structure
interface Reaction {
  reactionId: string;
  reactionType: ReactionType;
  createdAt: string;
}

interface ForumReactionsProps {
  forumId: string;
  reactions: Reaction[];
  onReactionChange?: (newReactions: Reaction[]) => void;
}

// Reaction emoji mapping
const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡'
};

// Reaction color mapping
const reactionColors: Record<ReactionType, string> = {
  like: 'primary',
  love: 'danger',
  haha: 'warning',
  wow: 'info',
  sad: 'secondary',
  angry: 'dark'
};

// Reaction animation classes
const reactionAnimations: Record<ReactionType, string> = {
  like: 'reaction-animation-pulse',
  love: 'reaction-animation-heartBeat',
  haha: 'reaction-animation-bounce',
  wow: 'reaction-animation-tada',
  sad: 'reaction-animation-shakeY',
  angry: 'reaction-animation-headShake'
};

const ForumReactions: React.FC<ForumReactionsProps> = ({ forumId, reactions, onReactionChange }) => {
  const { data: session } = useSession();
  const t = useTranslations('Forum');
  const params = useParams();
  const locale = params.locale as string;

  const [showReactionSelector, setShowReactionSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userReaction, setUserReaction] = useState<Reaction | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0
  });
  const [totalReactions, setTotalReactions] = useState(0);
  const [dominantReaction, setDominantReaction] = useState<ReactionType>('like');
  const [showAnimation, setShowAnimation] = useState<ReactionType | null>(null);

  const target = useRef(null);

  // Calculate reaction counts and user's reaction
  useEffect(() => {
    if (!reactions) return;

    // Reset counts
    const counts: Record<ReactionType, number> = {
      like: 0,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };

    // Count reactions by type
    reactions.forEach(reaction => {
      if (reaction.reactionType in counts) {
        counts[reaction.reactionType as ReactionType]++;
      }

      // Check if this is the current user's reaction
      // Note: We don't have userId in the reaction object, so we'll need to check this differently
      // This would typically be handled by the backend
    });

    // Calculate total and find dominant reaction
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    let dominant: ReactionType = 'like';
    let maxCount = 0;

    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = type as ReactionType;
      }
    });

    setReactionCounts(counts);
    setTotalReactions(total);
    setDominantReaction(dominant);

    // Load user's reaction
    const loadUserReaction = async () => {
      if (session?.user?.user_id && forumId) {
        try {
          // This is a placeholder - your API might need to be modified to return the user's reaction
          const result = await ReactionTopicById(
            session.user.user_id,
            forumId,
            '', // We're not sending a reaction type for GET
            session.user.token || ''
          );

          // Use the result from the API to find the user's reaction
          if (result && result.reactionType) {
            // Find the user's existing reaction in the reactions array if it exists
            const existingReaction = reactions.find(r =>
              r.reactionType === result.reactionType &&
              result.userId === session.user.user_id
            );

            if (existingReaction) {
              setUserReaction(existingReaction);
            } else {
              // Create a new reaction object if not found in the array
              const newReaction: Reaction = {
                reactionId: result.reactionId || Date.now().toString(),
                reactionType: result.reactionType as ReactionType,
                createdAt: result.createdAt || new Date().toISOString()
              };
              setUserReaction(newReaction);
            }
          }
        } catch (error) {
          console.error('Error loading user reaction:', error);
        }
      }
    };

    loadUserReaction();
  }, [reactions, session, forumId]);

  const handleReactionClick = () => {
    if (!session) {
      // Redirect to login if not logged in
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    // Always show the reaction selector when clicking the button
    setShowReactionSelector(!showReactionSelector);
  };

  const handleAddReaction = async (type: ReactionType) => {
    if (!session?.user?.token || !session?.user?.user_id) return;

    setIsProcessing(true);
    setShowReactionSelector(false);

    try {
      // Check if user is clicking the same reaction type they already have
      const isSameReaction = userReaction && userReaction.reactionType === type;

      console.log(`Adding reaction: ${type} to forum: ${forumId} by user: ${session.user.user_id}`);
      console.log(`Is same reaction: ${isSameReaction}`);

      // Call the ReactionTopic API function
      const success = await ReactionTopic(
        session.user.user_id,
        forumId,
        type,
        session.user.token
      );

      if (success) {
        console.log(`Reaction ${type} added successfully`);

        // Create a new reaction object
        const newReaction: Reaction = {
          reactionId: userReaction?.reactionId || Date.now().toString(), // Keep same ID if updating
          reactionType: type,
          createdAt: new Date().toISOString()
        };

        // Update the reactions list
        let updatedReactions = [...reactions];

        // If user already had a reaction, replace it
        if (userReaction) {
          console.log(`User had previous reaction: ${userReaction.reactionType}, replacing with: ${type}`);
          // Remove the old reaction first
          updatedReactions = updatedReactions.filter(r => r.reactionId !== userReaction.reactionId);

          // Always add the new reaction (even if same type)
          // The backend will handle toggling if needed
          updatedReactions.push(newReaction);
          setUserReaction(newReaction);
        } else {
          console.log(`Adding new reaction: ${type}`);
          updatedReactions.push(newReaction);
          setUserReaction(newReaction);
        }

        // Update state
        onReactionChange?.(updatedReactions);
        setShowAnimation(type);
        setTimeout(() => setShowAnimation(null), 1000);
      } else {
        console.log("Failed to add reaction");
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get button style based on user's reaction
  const getButtonStyle = () => {
    if (!userReaction) return 'btn-outline-primary';
    return `btn-${reactionColors[userReaction.reactionType as ReactionType]}`;
  };

  // Get button text based on user's reaction
  const getButtonText = () => {
    if (!userReaction) return t('likes');
    return reactionEmojis[userReaction.reactionType as ReactionType] + ' ' + t(userReaction.reactionType);
  };

  return (
    <div className="reaction-container">
      {/* Main reaction button */}
      <button
        ref={target}
        className={`btn ${getButtonStyle()} me-2 ${isProcessing ? 'disabled' : ''} reaction-main-btn`}
        onClick={handleReactionClick}
        disabled={isProcessing}
        title={t('clickToReact')}
      >
        {userReaction ? (
          <>
            <span className={showAnimation === userReaction.reactionType ? reactionAnimations[userReaction.reactionType as ReactionType] : ''}>
              {reactionEmojis[userReaction.reactionType as ReactionType]}
            </span> {t(userReaction.reactionType as string)}
          </>
        ) : (
          <>
            <i className="bi bi-hand-thumbs-up me-1"></i> {t('likes')}
          </>
        )}
        {totalReactions > 0 && ` (${totalReactions})`}
      </button>

      {/* Reaction selector popover */}
      <Overlay
        show={showReactionSelector}
        target={target.current}
        placement="top"
        rootClose={true}
        onHide={() => setShowReactionSelector(false)}
      >
        <Popover id="reaction-popover" className="reaction-popover">
          <Popover.Body className="d-flex justify-content-between p-2">
            {Object.entries(reactionEmojis).map(([type, emoji]) => (
              <button
                key={type}
                className={`btn btn-light reaction-emoji-btn mx-1 ${
                  userReaction?.reactionType === type ? 'active' : ''
                }`}
                onClick={() => {
                  handleAddReaction(type as ReactionType);
                  setShowReactionSelector(false);
                }}
                title={t(type)}
              >
                <span className="reaction-emoji fs-4">{emoji}</span>
              </button>
            ))}
          </Popover.Body>
        </Popover>
      </Overlay>

      {/* Tooltip showing reaction counts */}
      {totalReactions > 0 && (
        <Tooltip id="reaction-counts-tooltip" className="d-none">
          <div>
            {Object.entries(reactionCounts)
              .filter(([_, count]) => count > 0)
              .map(([type, count]) => (
                <div key={type}>
                  {reactionEmojis[type as ReactionType]} {t(type)}: {count}
                </div>
              ))}
          </div>
        </Tooltip>
      )}

      {/* Add required CSS for animations */}
      <style jsx global>{`
        .reaction-popover {
          background-color: white !important;
          border-radius: 30px !important;
          box-shadow: 0 0 15px rgba(0,0,0,0.3) !important;
          border: none !important;
          z-index: 1050 !important;
        }

        .reaction-popover .popover-body {
          padding: 10px !important;
        }

        .reaction-emoji-btn {
          border-radius: 50% !important;
          width: 45px !important;
          height: 45px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          margin: 0 5px !important;
        }

        .reaction-emoji-btn:hover {
          transform: scale(1.3) !important;
          z-index: 1 !important;
          box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
        }

        .reaction-emoji-btn.active {
          background-color: #e6f2ff !important;
          border-color: #0d6efd !important;
        }

        .reaction-emoji {
          font-size: 1.5rem !important;
        }

        .reaction-main-btn {
          position: relative !important;
          transition: all 0.2s ease !important;
          border-width: 2px !important;
        }

        .reaction-main-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
        }

        .reaction-main-btn:active {
          transform: translateY(0) !important;
        }

        /* Custom Animation Classes */
        @keyframes reaction-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes reaction-heartBeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }

        @keyframes reaction-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        @keyframes reaction-tada {
          0% { transform: scale(1) rotate(0deg); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes reaction-shakeY {
          0%, 100% { transform: translateY(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateY(-4px); }
          20%, 40%, 60%, 80% { transform: translateY(4px); }
        }

        @keyframes reaction-headShake {
          0% { transform: translateX(0); }
          6.5% { transform: translateX(-6px) rotateY(-9deg); }
          18.5% { transform: translateX(5px) rotateY(7deg); }
          31.5% { transform: translateX(-3px) rotateY(-5deg); }
          43.5% { transform: translateX(2px) rotateY(3deg); }
          50% { transform: translateX(0); }
        }

        .reaction-animation-pulse {
          animation: reaction-pulse 0.8s ease-in-out;
        }

        .reaction-animation-heartBeat {
          animation: reaction-heartBeat 1.3s ease-in-out;
        }

        .reaction-animation-bounce {
          animation: reaction-bounce 0.8s ease;
        }

        .reaction-animation-tada {
          animation: reaction-tada 0.8s ease;
        }

        .reaction-animation-shakeY {
          animation: reaction-shakeY 0.8s ease;
        }

        .reaction-animation-headShake {
          animation: reaction-headShake 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ForumReactions;