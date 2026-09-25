// Canonical state shape used by the application.
// The current complete build keeps runtime state in src/app.js for compatibility
// with the original inline event handlers. This module is the migration target.
export const appState = {
  apiKey: "",
  activeTab: "home",
  inputTab: "text",
  extractedText: "",
  extractedPdfText: "",
  currentQuiz: null,
  userAnswers: {},
  quizTimerInterval: null,
  timeElapsedSec: 0,
  activeQuestionIdx: 0,
  lastEvaluationResult: null,
  history: []
};
