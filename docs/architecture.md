# QuizGen Architecture

The complete original application is now runnable from the Vite root.

## Runtime flow

```text
Study Text / PDF
      |
      v
Input + PDF.js extraction
      |
      v
Quiz configuration
      |
      v
Gemini generation
      |
      v
JSON parsing / validation
      |
      v
Interactive quiz + timer
      |
      v
Programmatic evaluation
      |
      v
Weak-topic analysis
      |
      v
Targeted practice / history
```

The current migration keeps all original behavior in `src/app.js` so the application remains functional. The supporting folders provide clean extraction targets for the next refactor pass.
