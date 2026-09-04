const crypto = require("crypto");

const {
  redisClient,
} = require("../Config/redis");


// ========================================
// CONSTANTS
// ========================================

// Keep identical answers for 24 hours.
const QUESTION_CACHE_TTL =
  60 * 60 * 24;


// ========================================
// NORMALIZE QUESTION
// ========================================

const normalizeQuestion = (
  question
) => {
  if (
    typeof question !== "string"
  ) {
    return "";
  }

  return question
    .trim()
    .toLowerCase()

    // Collapse repeated whitespace.
    .replace(/\s+/g, " ")

    // Remove punctuation differences.
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      ""
    )

    .trim();
};


// ========================================
// CREATE QUESTION HASH
// ========================================

const createQuestionHash = (
  question
) => {
  const normalizedQuestion =
    normalizeQuestion(question);

  if (!normalizedQuestion) {
    return null;
  }

  return crypto
    .createHash("sha256")
    .update(normalizedQuestion)
    .digest("hex");
};


// ========================================
// CACHE KEY
// ========================================

const getQuestionCacheKey = (
  ownerId,
  question
) => {
  const hash =
    createQuestionHash(question);

  if (!hash) {
    return null;
  }

  /*
   * ownerId is included deliberately.
   *
   * Two students may receive the same
   * question but their portfolio answers
   * will be different.
   */

  return (
    `chatbot-answer:${ownerId}:` +
    `${hash}`
  );
};


// ========================================
// GET CACHED ANSWER
// ========================================

const getCachedAnswer = async (
  ownerId,
  question
) => {
  const key =
    getQuestionCacheKey(
      ownerId,
      question
    );

  if (!key) {
    return null;
  }

  const cached =
    await redisClient.get(key);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached);
  } catch (error) {
    /*
     * Corrupted cache data should not
     * break the chatbot.
     */

    await redisClient.del(key);

    return null;
  }
};


// ========================================
// CACHE ANSWER
// ========================================

const cacheAnswer = async (
  ownerId,
  question,
  answer
) => {
  const key =
    getQuestionCacheKey(
      ownerId,
      question
    );

  if (!key) {
    return false;
  }

  const payload = {
    answer,

    normalized_question:
      normalizeQuestion(question),

    cached_at:
      new Date().toISOString(),
  };

  await redisClient.set(
    key,
    JSON.stringify(payload),
    {
      EX:
        QUESTION_CACHE_TTL,
    }
  );

  return true;
};


// ========================================
// DELETE CACHED ANSWER
// ========================================

const deleteCachedAnswer = async (
  ownerId,
  question
) => {
  const key =
    getQuestionCacheKey(
      ownerId,
      question
    );

  if (!key) {
    return false;
  }

  await redisClient.del(key);

  return true;
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  normalizeQuestion,
  createQuestionHash,
  getQuestionCacheKey,
  getCachedAnswer,
  cacheAnswer,
  deleteCachedAnswer,
};