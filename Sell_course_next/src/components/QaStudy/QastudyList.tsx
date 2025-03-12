"use client";
import { useQaSocket } from "@/hook/useQaSocket";
import { useState } from "react";
import {
  createQa,
  updatesQa,
  deleteQa,
  createReaction,
  deleteReaction,
} from "@/app/api/QAStudy/qastudy";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  FaEdit,
  FaTrash,
  FaReply,
  FaThumbsUp,
  FaHeart,
  FaLaugh,
  FaSurprise,
  FaSadTear,
  FaAngry,
} from "react-icons/fa";

type QaStudyListProps = {
  courseId: string;
};

export default function QaStudyList({ courseId }: QaStudyListProps) {
  const { qaList } = useQaSocket(courseId);
  const [question, setQuestion] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingQaId, setEditingQaId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const { data: session } = useSession();

  const sendQuestion = async () => {
    if (!question || !session?.user.email || !session?.user.token) return;

    try {
      await createQa(
        session.user.email,
        courseId,
        question,
        replyToId || "",
        session.user.token
      );
      setQuestion("");
      setReplyToId(null);
    } catch (error) {
      console.error("Failed to create QA:", error);
    }
  };

  const sendReply = async () => {
    if (
      !replyText ||
      !session?.user.email ||
      !session?.user.token ||
      !replyToId
    )
      return;

    try {
      await createQa(
        session.user.email,
        courseId,
        replyText,
        replyToId,
        session.user.token
      );
      setReplyText("");
      setReplyToId(null);
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const handleEdit = (qaId: string, currentText: string) => {
    setEditingQaId(qaId);
    setEditText(currentText);
  };

  const saveEdit = async (qaId: string) => {
    if (!editText || !session?.user.token) return;

    try {
      await updatesQa(qaId, courseId, editText, session.user.token);
      setEditingQaId(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update QA:", error);
    }
  };

  const handleDelete = async (qaId: string) => {
    if (!session?.user.token) return;

    try {
      await deleteQa(qaId, session.user.token);
    } catch (error) {
      console.error("Failed to delete QA:", error);
    }
  };

  const handleReply = (qaId: string) => {
    setReplyToId(qaId);
    setReplyText("");
  };

  const handleReaction = async (
    qaId: string,
    reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  ) => {
    if (!session?.user.user_id || !session?.user.token) return;

    const userReaction = qaList
      .find((qa) => qa.qaId === qaId)
      ?.reactionQas?.find((r) => r.userEmail === session.user.email);

    try {
      if (userReaction) {
        if (userReaction.reactionType === reactionType) {
          // If the user clicks the same reaction, remove it
          await deleteReaction(
            session.user.user_id,
            qaId,
            courseId,
            session.user.token
          );
        } else {
          await createReaction(
            session.user.user_id,
            qaId,
            reactionType,
            courseId,
            session.user.token
          );
        }
      } else {
        await createReaction(
          session.user.user_id,
          qaId,
          reactionType,
          courseId,
          session.user.token
        );
      }
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const getReactionCount = (qaId: string, reactionType: string) =>
    qaList
      .find((qa) => qa.qaId === qaId)
      ?.reactionQas?.filter((r) => r.reactionType === reactionType).length || 0;

  const hasUserReacted = (qaId: string, reactionType: string) =>
    qaList
      .find((qa) => qa.qaId === qaId)
      ?.reactionQas?.some(
        (r) =>
          r.userEmail === session?.user.email && r.reactionType === reactionType
      );

  const topLevelQas = qaList.filter((qa) => !qa.parentId);
  const getReplies = (qaId: string) =>
    qaList.filter((qa) => qa.parentId === qaId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">QA Study Room</h1>
      <div className="space-y-4">
        {topLevelQas.map((qa) => (
          <div key={qa.qaId} className="space-y-2">
            {/* Main QA */}
            <div className="flex items-start space-x-3">
              <Image
                src={qa.avatarImg || "/default-avatar.png"}
                alt={qa.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{qa.username}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(qa.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {qa.userEmail === session?.user.email && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(qa.qaId, qa.text)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(qa.qaId)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                {editingQaId === qa.qaId ? (
                  <div className="flex space-x-2">
                    <input
                      title="Edit"
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border p-2 flex-1 rounded"
                    />
                    <button
                      onClick={() => saveEdit(qa.qaId)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingQaId(null)}
                      className="bg-gray-300 text-black px-4 py-2 rounded"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 rounded-lg">{qa.text}</div>
                )}
                {/* Reaction Buttons */}
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => handleReaction(qa.qaId, "like")}
                    className={`flex items-center space-x-1 ${
                      hasUserReacted(qa.qaId, "like")
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  >
                    <FaThumbsUp />{" "}
                    <span>{getReactionCount(qa.qaId, "like")}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(qa.qaId, "love")}
                    className={`flex items-center space-x-1 ${
                      hasUserReacted(qa.qaId, "love")
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    <FaHeart /> <span>{getReactionCount(qa.qaId, "love")}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(qa.qaId, "haha")}
                    className={`flex items-center space-x-1 ${
                      hasUserReacted(qa.qaId, "haha")
                        ? "text-yellow-500"
                        : "text-gray-500"
                    }`}
                  >
                    <FaLaugh /> <span>{getReactionCount(qa.qaId, "haha")}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(qa.qaId, "wow")}
                    className={`flex items-center space-x-1 ${
                      hasUserReacted(qa.qaId, "wow")
                        ? "text-yellow-500"
                        : "text-gray-500"
                    }`}
                  >
                    <FaSurprise />{" "}
                    <span>{getReactionCount(qa.qaId, "wow")}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(qa.qaId, "sad")}
                    className={`flex items-center space-x-1 ${
                      hasUserReacted(qa.qaId, "sad")
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  >
                    <FaSadTear />{" "}
                    <span>{getReactionCount(qa.qaId, "sad")}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(qa.qaId, "angry")}
                    className={`flex items-center space-x-1 ${
                      hasUserReacted(qa.qaId, "angry")
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    <FaAngry />{" "}
                    <span>{getReactionCount(qa.qaId, "angry")}</span>
                  </button>
                </div>
                {/* Reply Button */}
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    onClick={() => handleReply(qa.qaId)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    title="Reply"
                  >
                    <FaReply className="inline mr-1" /> Reply
                  </button>
                  {replyToId === qa.qaId && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="border p-2 flex-1 rounded"
                        onKeyDown={(e) => e.key === "Enter" && sendReply()}
                      />
                      <button
                        onClick={sendReply}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        title="Submit Reply"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setReplyToId(null)}
                        className="bg-gray-300 text-black px-4 py-2 rounded"
                        title="Cancel Reply"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Replies */}
            {getReplies(qa.qaId).map((reply) => (
              <div
                key={reply.qaId}
                className="flex items-start space-x-3 ml-12"
              >
                <Image
                  src={reply.avatarImg || "/default-avatar.png"}
                  alt={reply.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{reply.username}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {reply.userEmail === session?.user.email && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(reply.qaId, reply.text)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(reply.qaId)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingQaId === reply.qaId ? (
                    <div className="flex space-x-2">
                      <input
                        title="Edit"
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border p-2 flex-1 rounded"
                      />
                      <button
                        onClick={() => saveEdit(reply.qaId)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        title="Save"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQaId(null)}
                        className="bg-gray-300 text-black px-4 py-2 rounded"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {reply.text}
                    </div>
                  )}
                  {/* Reaction Buttons for Replies */}
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={() => handleReaction(reply.qaId, "like")}
                      className={`flex items-center space-x-1 ${
                        hasUserReacted(reply.qaId, "like")
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      <FaThumbsUp />{" "}
                      <span>{getReactionCount(reply.qaId, "like")}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(reply.qaId, "love")}
                      className={`flex items-center space-x-1 ${
                        hasUserReacted(reply.qaId, "love")
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      <FaHeart />{" "}
                      <span>{getReactionCount(reply.qaId, "love")}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(reply.qaId, "haha")}
                      className={`flex items-center space-x-1 ${
                        hasUserReacted(reply.qaId, "haha")
                          ? "text-yellow-500"
                          : "text-gray-500"
                      }`}
                    >
                      <FaLaugh />{" "}
                      <span>{getReactionCount(reply.qaId, "haha")}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(reply.qaId, "wow")}
                      className={`flex items-center space-x-1 ${
                        hasUserReacted(reply.qaId, "wow")
                          ? "text-yellow-500"
                          : "text-gray-500"
                      }`}
                    >
                      <FaSurprise />{" "}
                      <span>{getReactionCount(reply.qaId, "wow")}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(reply.qaId, "sad")}
                      className={`flex items-center space-x-1 ${
                        hasUserReacted(reply.qaId, "sad")
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      <FaSadTear />{" "}
                      <span>{getReactionCount(reply.qaId, "sad")}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(reply.qaId, "angry")}
                      className={`flex items-center space-x-1 ${
                        hasUserReacted(reply.qaId, "angry")
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      <FaAngry />{" "}
                      <span>{getReactionCount(reply.qaId, "angry")}</span>
                    </button>
                  </div>
                  {/* Reply Button for Replies */}
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() => handleReply(reply.qaId)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      title="Reply"
                    >
                      <FaReply className="inline mr-1" /> Reply
                    </button>
                    {replyToId === reply.qaId && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="border p-2 flex-1 rounded"
                          onKeyDown={(e) => e.key === "Enter" && sendReply()}
                        />
                        <button
                          onClick={sendReply}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                          title="Submit Reply"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setReplyToId(null)}
                          className="bg-gray-300 text-black px-4 py-2 rounded"
                          title="Cancel Reply"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center space-x-3">
        <Image
          src={session?.user.avatarImg || "/default-avatar.png"}
          alt={session?.user.name || "User"}
          width={40}
          height={40}
          className="rounded-full"
        />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Write your comment here..."
          className="border p-2 flex-1 rounded"
          onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
        />
        <button
          onClick={sendQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          type="button"
        >
          Submit
        </button>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700">Previous</button>
        <button className="text-gray-500 hover:text-gray-700">Next</button>
      </div>
    </div>
  );
}

export type ReactionQa = {
  reactionId: string;
  userEmail: string;
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry";
};

export type QaData = {
  qaId: string;
  userEmail: string;
  username: string;
  courseId: string;
  text: string;
  parentId?: string | null;
  createdAt: string;
  avatarImg?: string;
  reactionQas?: ReactionQa[];
};
