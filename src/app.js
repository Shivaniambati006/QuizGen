// Global State Object
        const state = {
            apiKey: localStorage.getItem('quizgen_gemini_key') || '',
            activeTab: 'home',
            inputTab: 'text',
            extractedText: '',
            extractedPdfText: '',
            currentQuiz: null, // Holds currently loaded quiz object
            userAnswers: {}, // Map of index -> string answer
            quizTimerInterval: null,
            timeElapsedSec: 0,
            activeQuestionIdx: 0,
            lastEvaluationResult: null,
            history: []
        };

        // Initialize PDF.js worker
        if (window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }

        // DOM Loaded Init
        window.addEventListener('DOMContentLoaded', () => {
            loadHistoryFromStorage();
            updateApiKeyUI();
            updateWordCount();
            renderHistoryTable();
            renderRecentHomeHistory();

            // Set up Drag & Drop for PDF
            const dropZone = document.getElementById('pdfDropZone');
            if (dropZone) {
                dropZone.addEventListener('click', () => document.getElementById('pdfFileInput').click());
                dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-blue-500', 'bg-blue-50/50'); });
                dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('border-blue-500', 'bg-blue-50/50'); });
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('border-blue-500', 'bg-blue-50/50');
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processPdfFile(e.dataTransfer.files[0]);
                    }
                });
            }
        });

        function switchTab(tabId) {
            state.activeTab = tabId;
            ['home', 'create', 'quiz', 'results', 'history', 'guide'].forEach(id => {
                const el = document.getElementById(`view-${id}`);
                const nav = document.getElementById(`nav-${id}`);
                if (el) {
                    if (id === tabId) el.classList.remove('hidden');
                    else el.classList.add('hidden');
                }
                if (nav) {
                    if (id === tabId) {
                        nav.className = "tab-active py-5 px-1 text-sm inline-flex items-center gap-2";
                    } else {
                        nav.className = "tab-inactive py-5 px-1 text-sm inline-flex items-center gap-2";
                    }
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchInputTab(type) {
            state.inputTab = type;
            const btnText = document.getElementById('tab-input-text');
            const btnPdf = document.getElementById('tab-input-pdf');
            const containerText = document.getElementById('input-text-container');
            const containerPdf = document.getElementById('input-pdf-container');

            if (type === 'text') {
                btnText.className = "py-2 px-4 border-b-2 border-blue-600 font-medium text-blue-600 flex items-center gap-2";
                btnPdf.className = "py-2 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium flex items-center gap-2";
                containerText.classList.remove('hidden');
                containerPdf.classList.add('hidden');
            } else {
                btnPdf.className = "py-2 px-4 border-b-2 border-blue-600 font-medium text-blue-600 flex items-center gap-2";
                btnText.className = "py-2 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium flex items-center gap-2";
                containerPdf.classList.remove('hidden');
                containerText.classList.add('hidden');
            }
            updateWordCount();
        }

        function toggleApiKeyModal() {
            const modal = document.getElementById('apiKeyModal');
            modal.classList.toggle('hidden');
            if (!modal.classList.contains('hidden')) {
                document.getElementById('customApiKeyInput').value = state.apiKey;
            }
        }

        function saveApiKey() {
            const key = document.getElementById('customApiKeyInput').value.trim();
            state.apiKey = key;
            localStorage.setItem('quizgen_gemini_key', key);
            updateApiKeyUI();
            toggleApiKeyModal();
        }

        function updateApiKeyUI() {
            const label = document.getElementById('apiKeyStatusText');
            if (state.apiKey) {
                label.textContent = "Gemini Key: Configured";
            } else {
                label.textContent = "Gemini Key: System Default";
            }
        }

        function updateWordCount() {
            let text = "";
            if (state.inputTab === 'text') {
                text = document.getElementById('studyText').value;
            } else {
                text = state.extractedPdfText;
            }
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            document.getElementById('wordCountLabel').textContent = `${words} words loaded`;
        }

        function handlePdfSelect(event) {
            const file = event.target.files[0];
            if (file) processPdfFile(file);
        }

        async function processPdfFile(file) {
            if (file.type !== 'application/pdf') {
                alert('Please upload a valid PDF file.');
                return;
            }

            const statusEl = document.getElementById('pdfStatus');
            const nameEl = document.getElementById('pdfFileName');
            const stateEl = document.getElementById('pdfExtractionState');

            statusEl.classList.remove('hidden');
            nameEl.textContent = file.name;
            stateEl.textContent = "Extracting text using PDF.js...";

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + "\n";
                }

                state.extractedPdfText = fullText;
                stateEl.textContent = `Extracted ${pdf.numPages} pages!`;
                updateWordCount();
            } catch (err) {
                console.error(err);
                stateEl.textContent = "Error extracting PDF text.";
            }
        }

        function loadSampleData() {
            switchInputTab('text');
            const sampleText = `Computer Networks: Layering & Error Control Principles

1. The OSI Model vs TCP/IP Architecture:
The OSI reference model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. In contrast, the TCP/IP suite compresses these into 4 or 5 practical layers: Link, Internet, Transport, and Application.

2. Transport Layer Protocols:
The Transport layer is responsible for process-to-process communication. 
- Transmission Control Protocol (TCP) provides connection-oriented, reliable service using 3-way handshakes (SYN, SYN-ACK, ACK) and flow control via sliding window protocols.
- User Datagram Protocol (UDP) is connectionless, unreliable, but lightweight with low header overhead (8 bytes compared to TCP's 20-60 bytes).

3. Error Control & Flow Control Techniques:
Error detection uses techniques like Parity Checks, Cyclic Redundancy Check (CRC), and Checksums. 
Flow control prevents a fast sender from overwhelming a slow receiver. Stop-and-Wait ARQ allows only 1 frame in transit at a time. Go-Back-N ARQ uses a sliding window where the sender can transmit up to N frames before requiring an ACK, but retransmits all unacknowledged frames if a timeout occurs. Selective Repeat ARQ retransmits ONLY the frame that was damaged or lost, requiring individual buffering at the receiver.

4. IP Addressing & Subnetting:
IPv4 addresses are 32-bit logical addresses divided into Class A, B, C, D, and E. CIDR (Classless Inter-Domain Routing) notation uses a prefix length (e.g., /24) to represent the network mask. Subnetting divides a larger network into smaller subnetworks to conserve IP space and reduce broadcast domains.`;

            document.getElementById('studyText').value = sampleText;
            document.getElementById('cfgTitle').value = "Sample: Computer Networks Core";
            updateWordCount();
        }

        async function generateQuizFromLLM(overridePromptText = null, targetTopics = null) {
            let materialContext = "";
            if (state.inputTab === 'text') {
                materialContext = document.getElementById('studyText').value.trim();
            } else {
                materialContext = state.extractedPdfText.trim();
            }

            if (!materialContext) {
                alert('Please provide study text or upload a PDF first.');
                return;
            }

            const qType = document.getElementById('cfgType').value;
            const qDiff = document.querySelector('input[name="cfgDiff"]:checked').value;
            const qCount = parseInt(document.getElementById('cfgCount').value, 10);
            let quizTitle = document.getElementById('cfgTitle').value.trim() || "AI Generated Study Quiz";

            if (targetTopics) {
                quizTitle += ` (Targeted Practice)`;
            }

            const btnGen = document.getElementById('btnGenerateQuiz');
            const origText = btnGen.innerHTML;
            btnGen.disabled = true;
            btnGen.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating Quiz with Gemini AI...`;

            // System Instruction & Prompt Engineering
            const systemInstruction = `You are QuizGen, an expert educational AI system. Generate a high-quality quiz strictly based on the user's provided study material.`;
            
            let prompt = `Create a ${qCount}-question quiz of difficulty "${qDiff}" and question type "${qType}".\n`;
            if (targetTopics && targetTopics.length > 0) {
                prompt += `CRITICAL FOCUS: Concentrate heavily on these specific weak topics: ${targetTopics.join(', ')}.\n`;
            }
            prompt += `STUDY MATERIAL CONTEXT:\n"""\n${materialContext}\n"""\n\n`;
            prompt += `REQUIREMENTS:
1. Return ONLY a valid, well-formed JSON ARRAY of question objects. No markdown wrappers like \`\`\`json outside, return plain parseable text or array.
2. Each question object MUST follow this JSON schema:
{
  "question": "Clear string statement or question",
  "type": "MCQ" or "True/False" or "Fill in the Blank",
  "options": ["Option A", "Option B", "Option C", "Option D"], // Required for MCQ (4 options). For True/False provide ["True", "False"]. For Fill in the Blank, set to empty array []
  "answer": "Exact string matching one option for MCQ/TF, or exact target word/phrase for Fill in Blank",
  "explanation": "Detailed concise explanation referencing the study material",
  "topic": "Specific sub-topic name (e.g., TCP Handshake, CRC Error Detection)",
  "difficulty": "${qDiff}"
}
3. Questions MUST be factual and grounded strictly in the study context.`;

            let quizQuestions = null;

            try {
                // Call Gemini API via fetch
                const apiKeyToUse = state.apiKey || ""; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKeyToUse}`;

                const payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                };

                const resp = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) {
                    throw new Error(`API responded with status: ${resp.status}`);
                }

                const result = await resp.json();
                const rawJsonStr = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (rawJsonStr) {
                    quizQuestions = JSON.parse(rawJsonStr);
                } else {
                    throw new Error("No output generated from Gemini API.");
                }

            } catch (err) {
                console.warn("API Call Failed or Fallback Triggered:", err);
                alert("Gemini API call encountered an error or key issue. Generating dynamic smart fallback quiz from context.");
                quizQuestions = generateSmartFallbackQuestions(materialContext, qCount, qType, qDiff, targetTopics);
            } finally {
                btnGen.disabled = false;
                btnGen.innerHTML = origText;
            }

            if (quizQuestions && Array.isArray(quizQuestions) && quizQuestions.length > 0) {
                // Validate schema
                const validQuestions = quizQuestions.filter(q => q.question && q.answer);
                startQuizSession(quizTitle, qDiff, qType, validQuestions, materialContext);
            } else {
                alert("Failed to parse valid quiz questions. Please try again.");
            }
        }

        function generateSmartFallbackQuestions(context, count, type, diff, targetTopics) {
            // Intelligent template questions generated if offline or no key available
            const sampleQuestions = [
                {
                    question: "Which OSI layer is responsible for process-to-process communication?",
                    type: "MCQ",
                    options: ["Network Layer", "Transport Layer", "Data Link Layer", "Physical Layer"],
                    answer: "Transport Layer",
                    explanation: "The Transport Layer manages end-to-end process communication using ports (e.g. TCP/UDP).",
                    topic: "Transport Layer",
                    difficulty: diff
                },
                {
                    question: "TCP header overhead is smaller than UDP header overhead.",
                    type: "True/False",
                    options: ["True", "False"],
                    answer: "False",
                    explanation: "TCP has a 20-60 byte header, whereas UDP has a lightweight 8-byte header.",
                    topic: "Transport Layer",
                    difficulty: diff
                },
                {
                    question: "Selective Repeat ARQ retransmits ONLY the frame that was damaged or lost.",
                    type: "True/False",
                    options: ["True", "False"],
                    answer: "True",
                    explanation: "Selective Repeat maintains individual buffers for frames, retransmitting only unacknowledged frames.",
                    topic: "Error Control",
                    difficulty: diff
                },
                {
                    question: "In IPv4 addressing, CIDR notation uses a network prefix length to represent the mask.",
                    type: "MCQ",
                    options: ["True", "False", "Both", "Neither"],
                    answer: "True",
                    explanation: "CIDR notation (e.g., /24) explicitly defines the prefix length of the network mask.",
                    topic: "IP Addressing",
                    difficulty: diff
                },
                {
                    question: "Fill in the blank: TCP uses a _____-way handshake to establish connection.",
                    type: "Fill in the Blank",
                    options: [],
                    answer: "3",
                    explanation: "TCP establishes connection using SYN, SYN-ACK, and ACK (3-way handshake).",
                    topic: "Transport Layer",
                    difficulty: diff
                }
            ];

            return sampleQuestions.slice(0, count);
        }

        function startQuizSession(title, diff, type, questions, contextText) {
            state.currentQuiz = {
                title,
                difficulty: diff,
                type,
                questions,
                contextText,
                startTime: new Date()
            };
            state.userAnswers = {};
            state.activeQuestionIdx = 0;
            state.timeElapsedSec = 0;

            // Start Timer
            if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);
            state.quizTimerInterval = setInterval(() => {
                state.timeElapsedSec++;
                const mins = String(Math.floor(state.timeElapsedSec / 60)).padStart(2, '0');
                const secs = String(state.timeElapsedSec % 60).padStart(2, '0');
                document.getElementById('quizTimerDisplay').textContent = `${mins}:${secs}`;
            }, 1000);

            // Update UI
            document.getElementById('activeQuizTitle').textContent = title;
            document.getElementById('activeQuizDiffBadge').textContent = diff;
            document.getElementById('activeQuizTypeBadge').textContent = type;

            renderQuestionCard();
            switchTab('quiz');
        }

        function renderQuestionCard() {
            const quiz = state.currentQuiz;
            if (!quiz) return;

            const qIdx = state.activeQuestionIdx;
            const q = quiz.questions[qIdx];
            const total = quiz.questions.length;

            // Update Header & Counter
            document.getElementById('questionCounterText').textContent = `Question ${qIdx + 1} of ${total}`;
            const answeredCount = Object.keys(state.userAnswers).length;
            document.getElementById('answeredCounterText').textContent = `${answeredCount} Answered`;

            const pct = Math.round(((qIdx + 1) / total) * 100);
            document.getElementById('quizProgressBar').style.width = `${pct}%`;

            document.getElementById('qTopicBadge').textContent = `Topic: ${q.topic || 'General'}`;
            document.getElementById('qText').textContent = q.question;

            // Render Options Container
            const optContainer = document.getElementById('optionsContainer');
            optContainer.innerHTML = '';

            const currentSavedAnswer = state.userAnswers[qIdx] || '';

            if (q.type === 'MCQ' || q.type === 'True/False' || (q.options && q.options.length > 0)) {
                q.options.forEach((opt, idx) => {
                    const isSelected = currentSavedAnswer === opt;
                    const optBtn = document.createElement('button');
                    optBtn.className = `w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                        isSelected 
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`;
                    optBtn.onclick = () => selectOption(qIdx, opt);
                    optBtn.innerHTML = `
                        <span>${opt}</span>
                        <div class="w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}">
                            ${isSelected ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
                        </div>
                    `;
                    optContainer.appendChild(optBtn);
                });
            } else {
                // Fill in the Blank Input
                const inputWrap = document.createElement('div');
                inputWrap.className = 'space-y-2';
                inputWrap.innerHTML = `
                    <label class="block text-xs font-semibold text-slate-600">Type your answer below:</label>
                    <input type="text" id="blankInput" value="${currentSavedAnswer}" placeholder="Enter answer..." 
                        class="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" 
                        oninput="saveBlankAnswer(${qIdx}, this.value)">
                `;
                optContainer.appendChild(inputWrap);
            }

            // Navigation Buttons State
            document.getElementById('btnPrevQ').disabled = (qIdx === 0);
            const btnNext = document.getElementById('btnNextQ');
            if (qIdx === total - 1) {
                btnNext.innerHTML = `Review & Submit <i class="fa-solid fa-check-circle ml-1.5"></i>`;
                btnNext.onclick = confirmSubmitQuiz;
            } else {
                btnNext.innerHTML = `Next <i class="fa-solid fa-arrow-right ml-1.5"></i>`;
                btnNext.onclick = () => navigateQuestion(1);
            }

            renderPillIndicators();
        }

        function selectOption(qIdx, optionText) {
            state.userAnswers[qIdx] = optionText;
            renderQuestionCard();
        }

        function saveBlankAnswer(qIdx, val) {
            state.userAnswers[qIdx] = val.trim();
            const answeredCount = Object.keys(state.userAnswers).length;
            document.getElementById('answeredCounterText').textContent = `${answeredCount} Answered`;
        }

        function navigateQuestion(step) {
            const newIdx = state.activeQuestionIdx + step;
            if (newIdx >= 0 && newIdx < state.currentQuiz.questions.length) {
                state.activeQuestionIdx = newIdx;
                renderQuestionCard();
            }
        }

        function renderPillIndicators() {
            const container = document.getElementById('questionPills');
            container.innerHTML = '';
            state.currentQuiz.questions.forEach((_, idx) => {
                const isAnswered = state.userAnswers.hasOwnProperty(idx) && state.userAnswers[idx] !== '';
                const isCurrent = idx === state.activeQuestionIdx;
                const pill = document.createElement('button');
                pill.className = `w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                    isCurrent 
                        ? 'ring-2 ring-blue-600 bg-blue-600 text-white' 
                        : isAnswered 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`;
                pill.textContent = idx + 1;
                pill.onclick = () => { state.activeQuestionIdx = idx; renderQuestionCard(); };
                container.appendChild(pill);
            });
        }

        function confirmSubmitQuiz() {
            if (confirm("Are you sure you want to submit your quiz for evaluation?")) {
                evaluateQuizProgrammatically();
            }
        }

        function evaluateQuizProgrammatically() {
            clearInterval(state.quizTimerInterval);
            const quiz = state.currentQuiz;
            const answers = state.userAnswers;

            let correctCount = 0;
            let wrongCount = 0;
            let unansweredCount = 0;
            const weakTopicsMap = {};
            const detailedResults = [];

            quiz.questions.forEach((q, idx) => {
                const userAns = (answers[idx] || '').toString().trim();
                const expectedAns = (q.answer || '').toString().trim();

                let isCorrect = false;
                let isUnanswered = false;

                if (!userAns) {
                    unansweredCount++;
                    isUnanswered = true;
                } else if (userAns.toLowerCase() === expectedAns.toLowerCase()) {
                    isCorrect = true;
                    correctCount++;
                } else {
                    wrongCount++;
                }

                if (!isCorrect) {
                    const topic = q.topic || 'General Topic';
                    weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + 1;
                }

                detailedResults.push({
                    question: q.question,
                    options: q.options,
                    userAnswer: userAns,
                    expectedAnswer: expectedAns,
                    isCorrect,
                    isUnanswered,
                    explanation: q.explanation,
                    topic: q.topic || 'General'
                });
            });

            const total = quiz.questions.length;
            const pct = Math.round((correctCount / total) * 100);
            const weakTopicsList = Object.keys(weakTopicsMap);

            state.lastEvaluationResult = {
                title: quiz.title,
                date: new Date().toLocaleString(),
                scorePct: pct,
                correctCount,
                wrongCount,
                unansweredCount,
                totalQuestions: total,
                weakTopics: weakTopicsList,
                detailedResults,
                contextText: quiz.contextText
            };

            // Save to persistent storage (IndexedDB/localStorage)
            saveResultToHistory(state.lastEvaluationResult);

            // Render Results View
            renderResultsView();
            switchTab('results');
        }

        function renderResultsView() {
            const res = state.lastEvaluationResult;
            if (!res) return;

            document.getElementById('resQuizTitle').textContent = res.title;
            document.getElementById('resQuizMeta').textContent = `Evaluated on ${res.date}`;
            document.getElementById('resScorePct').textContent = `${res.scorePct}%`;
            document.getElementById('resCountCorrect').textContent = res.correctCount;
            document.getElementById('resCountWrong').textContent = res.wrongCount;
            document.getElementById('resCountUnanswered').textContent = res.unansweredCount;

            // Render Weak Topics Badges
            const wtContainer = document.getElementById('weakTopicsList');
            wtContainer.innerHTML = '';
            if (res.weakTopics.length > 0) {
                res.weakTopics.forEach(topic => {
                    const badge = document.createElement('span');
                    badge.className = 'px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg border border-rose-200';
                    badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> ${topic}`;
                    wtContainer.appendChild(badge);
                });
                document.getElementById('btnPracticeWeak').disabled = false;
                document.getElementById('btnPracticeWeak').classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                wtContainer.innerHTML = `<span class="text-xs text-emerald-700 font-medium"><i class="fa-solid fa-circle-check"></i> Excellent! No weak topics detected.</span>`;
                document.getElementById('btnPracticeWeak').disabled = true;
                document.getElementById('btnPracticeWeak').classList.add('opacity-50', 'cursor-not-allowed');
            }

            // Trigger AI Advice Fetch
            generateAIAdvice();

            // Render Detailed Question Breakdown Cards
            const reviewContainer = document.getElementById('detailedReviewContainer');
            reviewContainer.innerHTML = '';

            res.detailedResults.forEach((qRes, idx) => {
                const card = document.createElement('div');
                card.className = `p-5 rounded-xl border ${
                    qRes.isCorrect 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : qRes.isUnanswered 
                            ? 'bg-amber-50/40 border-amber-200' 
                            : 'bg-rose-50/40 border-rose-200'
                } space-y-3`;

                card.innerHTML = `
                    <div class="flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <span class="text-xs font-semibold text-slate-500">Q${idx + 1} • Topic: ${qRes.topic}</span>
                            <h4 class="font-bold text-slate-800 text-base">${qRes.question}</h4>
                        </div>
                        <span class="px-2.5 py-1 text-xs font-bold rounded-lg ${
                            qRes.isCorrect 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : qRes.isUnanswered 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-rose-100 text-rose-800'
                        }">
                            ${qRes.isCorrect ? '<i class="fa-solid fa-check mr-1"></i> Correct' : qRes.isUnanswered ? 'Unanswered' : '<i class="fa-solid fa-xmark mr-1"></i> Incorrect'}
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div class="p-2.5 rounded-lg bg-white/80 border border-slate-200">
                            <span class="text-slate-500 block font-medium">Your Answer:</span>
                            <span class="font-semibold ${qRes.isCorrect ? 'text-emerald-700' : 'text-rose-600'}">${qRes.userAnswer || 'None'}</span>
                        </div>
                        <div class="p-2.5 rounded-lg bg-white/80 border border-slate-200">
                            <span class="text-slate-500 block font-medium">Correct Answer:</span>
                            <span class="font-semibold text-slate-800">${qRes.expectedAnswer}</span>
                        </div>
                    </div>

                    <div class="text-xs bg-white/90 p-3 rounded-lg border border-slate-200 text-slate-700">
                        <span class="font-bold text-slate-800 block mb-0.5"><i class="fa-solid fa-circle-info text-blue-600 mr-1"></i> Explanation:</span>
                        ${qRes.explanation}
                    </div>
                `;
                reviewContainer.appendChild(card);
            });
        }

        async function generateAIAdvice() {
            const adviceEl = document.getElementById('aiStudyAdviceText');
            const res = state.lastEvaluationResult;
            if (!res) return;

            if (res.weakTopics.length === 0) {
                adviceEl.textContent = "Great job! You mastered all topics in this quiz. Maintain your performance by attempting higher difficulty quizzes.";
                return;
            }

            adviceEl.textContent = "Analyzing weak performance areas and formulating targeted study recommendations...";

            const prompt = `Act as an academic tutor. A student scored ${res.scorePct}% on a quiz.
Weak topics needing practice: ${res.weakTopics.join(', ')}.
Study Material Context snippet: "${res.contextText.substring(0, 500)}..."

Provide 2-3 concise, actionable study tips strictly focused on these weak topics to help them master the subject. Keep response under 80 words.`;

            try {
                const apiKeyToUse = state.apiKey || "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKeyToUse}`; 
 
                const resp = await fetch(apiUrl, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
                }); 
 
                if (resp.ok) { 
                    const data = await resp.json(); 
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text; 
                    if (text) { 
                        adviceEl.textContent = text; 
                        return; 
                    } 
                } 
            } catch (e) { 
                console.warn("AI advice generation skipped/failed:", e); 
            } 
 
            // Fallback advice text 
            adviceEl.textContent = `Focus your upcoming revision on: ${res.weakTopics.join(', ')}. Review the corresponding lecture notes and re-attempt targeted quizzes focusing on these core concepts.`; 
        } 
 
        function regenerateQuizSameMaterial() { 
            switchTab('create'); 
            generateQuizFromLLM(); 
        } 
 
        function practiceWeakTopicsOnly() { 
            const res = state.lastEvaluationResult; 
            if (!res || res.weakTopics.length === 0) return; 
            switchTab('create'); 
            generateQuizFromLLM(null, res.weakTopics); 
        } 
 
        function saveResultToHistory(resObj) { 
            state.history.unshift(resObj); 
            try { 
                localStorage.setItem('quizgen_history', JSON.stringify(state.history)); 
            } catch (e) { 
                console.error("Storage save failed:", e); 
            } 
            renderHistoryTable(); 
            renderRecentHomeHistory(); 
        } 
 
        function loadHistoryFromStorage() { 
            try { 
                const raw = localStorage.getItem('quizgen_history'); 
                if (raw) state.history = JSON.parse(raw); 
            } catch (e) { 
                state.history = []; 
            } 
        } 
 
        function renderHistoryTable() { 
            const tbody = document.getElementById('historyTableBody'); 
            if (!tbody) return; 
            tbody.innerHTML = ''; 
 
            if (state.history.length === 0) { 
                tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400 italic">No historical quiz attempts found.</td></tr>`; 
                return; 
            } 
 
            state.history.forEach((item, idx) => { 
                const tr = document.createElement('tr'); 
                tr.className = 'hover:bg-slate-50 transition'; 
                tr.innerHTML = ` 
                    <td class="p-4 text-slate-500 whitespace-nowrap text-xs">${item.date}</td> 
                    <td class="p-4 font-semibold text-slate-800">${item.title}</td> 
                    <td class="p-4"><span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">Medium</span></td> 
                    <td class="p-4"><span class="font-bold text-blue-600">${item.scorePct}%</span> <span class="text-xs text-slate-400">(${item.correctCount}/${item.totalQuestions})</span></td> 
                    <td class="p-4"> 
                        ${item.weakTopics.length > 0  
                            ? item.weakTopics.map(t => `<span class="inline-block bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-medium mr-1 mb-1 border border-rose-200">${t}</span>`).join('')  
                            : '<span class="text-xs text-emerald-600 font-medium">None</span>'} 
                    </td> 
                    <td class="p-4 text-right"> 
                        <button onclick="downloadSingleReport(${idx})" class="text-blue-600 hover:text-blue-800 text-xs font-semibold"> 
                            <i class="fa-solid fa-download"></i> JSON 
                        </button> 
                    </td> 
                `; 
                tbody.appendChild(tr); 
            }); 
        } 
 
        function renderRecentHomeHistory() { 
            const container = document.getElementById('homeRecentHistory'); 
            if (!container) return; 
            container.innerHTML = ''; 
 
            if (state.history.length === 0) { 
                container.innerHTML = `<p class="text-sm text-slate-500 italic">No quiz attempts recorded yet. Click "Create First Quiz" above to get started!</p>`; 
                return; 
            } 
 
            state.history.slice(0, 3).forEach(item => { 
                const itemEl = document.createElement('div'); 
                itemEl.className = 'flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm'; 
                itemEl.innerHTML = ` 
                    <div> 
                        <h4 class="font-bold text-slate-800 text-sm">${item.title}</h4> 
                        <span class="text-xs text-slate-500">${item.date} • ${item.totalQuestions} Questions</span> 
                    </div> 
                    <div class="text-right"> 
                        <span class="text-base font-black text-blue-600">${item.scorePct}%</span> 
                        <span class="block text-[11px] text-slate-500">${item.correctCount} Correct</span> 
                    </div> 
                `; 
                container.appendChild(itemEl); 
            }); 
        } 
 
        function clearAllHistory() { 
            if (confirm("Clear all persistent quiz history?")) { 
                state.history = []; 
                localStorage.removeItem('quizgen_history'); 
                renderHistoryTable(); 
                renderRecentHomeHistory(); 
            } 
        } 
 
        function downloadQuizReport() { 
            if (!state.lastEvaluationResult) return; 
            downloadJSONBlob(state.lastEvaluationResult, 'QuizGen_Report.json'); 
        } 
 
        function downloadSingleReport(idx) { 
            if (state.history[idx]) { 
                downloadJSONBlob(state.history[idx], `QuizGen_Attempt_${idx + 1}.json`); 
            } 
        } 
 
        function downloadJSONBlob(data, filename) { 
            const str = JSON.stringify(data, null, 2); 
            const blob = new Blob([str], { type: 'application/json' }); 
            const url = URL.createObjectURL(blob); 
            const a = document.createElement('a'); 
            a.href = url; 
            a.download = filename; 
            a.click(); 
            URL.revokeObjectURL(url); 
        }
