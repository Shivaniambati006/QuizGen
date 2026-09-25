export function evaluateQuiz(questions, answers = {}) {
  let correct = 0;

  questions.forEach((question, index) => {
    if (
      String(answers[index] || "").trim().toLowerCase() ===
      String(question.answer || "").trim().toLowerCase()
    ) {
      correct++;
    }
  });

  return {
    correct,
    total: questions.length,
    score: questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0
  };
}
