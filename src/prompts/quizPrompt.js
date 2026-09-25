export function buildQuizPrompt(material, count, difficulty, questionType) {
  return `Create a ${count}-question ${difficulty} ${questionType} quiz strictly grounded in this study material:

${material}

Return valid JSON only.`;
}
