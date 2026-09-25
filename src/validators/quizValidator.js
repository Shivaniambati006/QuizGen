export function validateQuiz(questions) {
  if (!Array.isArray(questions)) {
    throw new Error("Quiz response must be an array.");
  }

  return questions.filter(q =>
    q &&
    typeof q.question === "string" &&
    typeof q.answer === "string"
  );
}
