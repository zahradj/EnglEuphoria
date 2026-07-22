import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
interface ExportRequest {
  lessonIds: string[];
  format: 'scorm' | 'h5p' | 'html5';
  options: {
    includeTeacherNotes?: boolean;
    includeAnswerKeys?: boolean;
    packageName?: string;
    courseTitle?: string;
  };
}

interface LessonData {
  id: string;
  title: string;
  target_system: string;
  content: any;
  created_at: string;
}

interface SlideContent {
  type: string;
  title?: string;
  vocabulary?: any[];
  grammarRule?: any;
  exercise?: any;
  dialogue?: any;
  content?: any;
}

// SCORM 2004 imsmanifest.xml generator
function generateScormManifest(lessons: LessonData[], courseTitle: string): string {
  const resources = lessons.map((lesson, index) => `
    <resource identifier="RES_${index + 1}" type="webcontent" adlcp:scormType="sco" href="content/lesson${index + 1}/index.html">
      <file href="content/lesson${index + 1}/index.html"/>
      <file href="content/lesson${index + 1}/slides.json"/>
      <file href="content/lesson${index + 1}/styles.css"/>
      <file href="shared/player.js"/>
      <file href="shared/scorm-api.js"/>
    </resource>`).join('\n');

  const items = lessons.map((lesson, index) => `
      <item identifier="ITEM_${index + 1}" identifierref="RES_${index + 1}">
        <title>${escapeXml(lesson.title)}</title>
        <adlnav:presentation>
          <adlnav:navigationInterface>
            <adlnav:hideLMSUI>previous</adlnav:hideLMSUI>
            <adlnav:hideLMSUI>continue</adlnav:hideLMSUI>
          </adlnav:navigationInterface>
        </adlnav:presentation>
      </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="EnglEuphoria_Course" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  
  <organizations default="ORG_1">
    <organization identifier="ORG_1">
      <title>${escapeXml(courseTitle)}</title>
      ${items}
    </organization>
  </organizations>
  
  <resources>
    ${resources}
  </resources>
</manifest>`;
}

// SCORM API JavaScript wrapper
function generateScormApiJs(): string {
  return `// SCORM 2004 API Wrapper
const ScormAPI = {
  api: null,
  
  findAPI: function(win) {
    let attempts = 0;
    while ((!win.API_1484_11) && (win.parent) && (win.parent != win) && (attempts < 10)) {
      attempts++;
      win = win.parent;
    }
    return win.API_1484_11 || null;
  },
  
  init: function() {
    this.api = this.findAPI(window);
    if (this.api) {
      this.api.Initialize("");
      return true;
    }
    console.warn("SCORM API not found - running in standalone mode");
    return false;
  },
  
  setValue: function(element, value) {
    if (this.api) {
      this.api.SetValue(element, value);
    }
  },
  
  getValue: function(element) {
    if (this.api) {
      return this.api.GetValue(element);
    }
    return "";
  },
  
  setScore: function(score, max) {
    this.setValue("cmi.score.raw", score);
    this.setValue("cmi.score.max", max);
    this.setValue("cmi.score.scaled", score / max);
  },
  
  setProgress: function(current, total) {
    this.setValue("cmi.progress_measure", current / total);
  },
  
  setLocation: function(location) {
    this.setValue("cmi.location", location);
  },
  
  getLocation: function() {
    return this.getValue("cmi.location") || "0";
  },
  
  setSuspendData: function(data) {
    this.setValue("cmi.suspend_data", JSON.stringify(data));
  },
  
  getSuspendData: function() {
    const data = this.getValue("cmi.suspend_data");
    return data ? JSON.parse(data) : null;
  },
  
  complete: function() {
    this.setValue("cmi.completion_status", "completed");
    this.setValue("cmi.success_status", "passed");
    this.commit();
  },
  
  commit: function() {
    if (this.api) {
      this.api.Commit("");
    }
  },
  
  terminate: function() {
    if (this.api) {
      this.api.Terminate("");
    }
  }
};

// Initialize on load
document.addEventListener("DOMContentLoaded", function() {
  ScormAPI.init();
});

// Save on unload
window.addEventListener("beforeunload", function() {
  ScormAPI.commit();
  ScormAPI.terminate();
});

window.ScormAPI = ScormAPI;`;
}

// Slide player JavaScript
function generatePlayerJs(): string {
  return `// EnglEuphoria Lesson Player
class LessonPlayer {
  constructor(containerId, slidesData) {
    this.container = document.getElementById(containerId);
    this.slides = slidesData.slides || [];
    this.currentSlide = 0;
    this.score = 0;
    this.maxScore = 0;
    this.init();
  }
  
  init() {
    // Restore position from SCORM
    if (window.ScormAPI) {
      const savedLocation = window.ScormAPI.getLocation();
      if (savedLocation) {
        this.currentSlide = parseInt(savedLocation, 10);
      }
    }
    this.render();
    this.setupNavigation();
  }
  
  render() {
    const slide = this.slides[this.currentSlide];
    if (!slide) return;
    
    let html = '<div class="slide">';
    html += '<h2 class="slide-title">' + (slide.title || 'Slide ' + (this.currentSlide + 1)) + '</h2>';
    html += '<div class="slide-content">';
    
    switch(slide.type) {
      case 'vocabulary':
        html += this.renderVocabulary(slide);
        break;
      case 'grammar':
        html += this.renderGrammar(slide);
        break;
      case 'exercise':
      case 'fill-in-blank':
        html += this.renderExercise(slide);
        break;
      case 'quiz':
      case 'multiple-choice':
        html += this.renderQuiz(slide);
        break;
      case 'dialogue':
        html += this.renderDialogue(slide);
        break;
      default:
        html += '<p>' + JSON.stringify(slide.content || slide) + '</p>';
    }
    
    html += '</div></div>';
    this.container.innerHTML = html;
    
    // Update progress
    if (window.ScormAPI) {
      window.ScormAPI.setLocation(this.currentSlide.toString());
      window.ScormAPI.setProgress(this.currentSlide + 1, this.slides.length);
    }
  }
  
  renderVocabulary(slide) {
    const vocab = slide.vocabulary || [];
    let html = '<div class="vocabulary-grid">';
    vocab.forEach(item => {
      html += '<div class="vocab-card">';
      html += '<div class="vocab-word">' + (item.word || item.term) + '</div>';
      if (item.ipa) html += '<div class="vocab-ipa">' + item.ipa + '</div>';
      html += '<div class="vocab-definition">' + (item.definition || item.meaning) + '</div>';
      if (item.example) html += '<div class="vocab-example">"' + item.example + '"</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }
  
  renderGrammar(slide) {
    const rule = slide.grammarRule || slide.content || {};
    let html = '<div class="grammar-section">';
    html += '<div class="grammar-rule">';
    html += '<h3>' + (rule.title || 'Grammar Rule') + '</h3>';
    html += '<p class="grammar-pattern">' + (rule.pattern || rule.rule || '') + '</p>';
    html += '</div>';
    if (rule.examples && rule.examples.length) {
      html += '<div class="grammar-examples"><h4>Examples:</h4><ul>';
      rule.examples.forEach(ex => {
        html += '<li>' + (typeof ex === 'string' ? ex : ex.sentence || ex.example) + '</li>';
      });
      html += '</ul></div>';
    }
    html += '</div>';
    return html;
  }
  
  renderExercise(slide) {
    const exercise = slide.exercise || slide.content || {};
    let html = '<div class="exercise-section">';
    html += '<p class="exercise-instruction">' + (exercise.instruction || 'Complete the exercise:') + '</p>';
    
    if (exercise.sentences || exercise.items) {
      const items = exercise.sentences || exercise.items;
      html += '<div class="exercise-items">';
      items.forEach((item, idx) => {
        html += '<div class="exercise-item">';
        html += '<span class="item-number">' + (idx + 1) + '.</span> ';
        html += '<span class="item-text">' + (typeof item === 'string' ? item : item.sentence || item.text) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  
  renderQuiz(slide) {
    const quiz = slide.quiz || slide.content || {};
    let html = '<div class="quiz-section">';
    html += '<p class="quiz-question">' + (quiz.question || '') + '</p>';
    
    if (quiz.options) {
      html += '<div class="quiz-options">';
      quiz.options.forEach((opt, idx) => {
        html += '<button class="quiz-option" data-index="' + idx + '">';
        html += (typeof opt === 'string' ? opt : opt.text || opt.label);
        html += '</button>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  
  renderDialogue(slide) {
    const dialogue = slide.dialogue || slide.content || {};
    let html = '<div class="dialogue-section">';
    if (dialogue.context) {
      html += '<p class="dialogue-context">' + dialogue.context + '</p>';
    }
    if (dialogue.lines) {
      html += '<div class="dialogue-lines">';
      dialogue.lines.forEach(line => {
        html += '<div class="dialogue-line">';
        html += '<span class="speaker">' + (line.speaker || line.character) + ':</span> ';
        html += '<span class="line-text">' + line.text + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  
  setupNavigation() {
    document.getElementById('prev-btn').onclick = () => this.prev();
    document.getElementById('next-btn').onclick = () => this.next();
    this.updateNavButtons();
  }
  
  updateNavButtons() {
    document.getElementById('prev-btn').disabled = this.currentSlide === 0;
    document.getElementById('next-btn').disabled = this.currentSlide === this.slides.length - 1;
    document.getElementById('progress-text').textContent = 
      (this.currentSlide + 1) + ' / ' + this.slides.length;
    
    // Complete if at last slide
    if (this.currentSlide === this.slides.length - 1 && window.ScormAPI) {
      window.ScormAPI.complete();
    }
  }
  
  next() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.render();
      this.updateNavButtons();
    }
  }
  
  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.render();
      this.updateNavButtons();
    }
  }
}

window.LessonPlayer = LessonPlayer;`;
}

// CSS for lesson player
function generateStylesCss(): string {
  return `/* EnglEuphoria Lesson Styles */
:root {
  --primary: hsl(259, 84%, 55%);
  --primary-foreground: hsl(0, 0%, 100%);
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(222, 47%, 11%);
  --muted: hsl(210, 40%, 96%);
  --border: hsl(214, 32%, 91%);
  --card: hsl(0, 0%, 100%);
  --accent: hsl(210, 40%, 96%);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.6;
}

.lesson-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.lesson-header {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.lesson-header h1 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.slide-container {
  flex: 1;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
}

.slide-title {
  font-size: 1.4rem;
  color: var(--primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border);
}

/* Vocabulary Styles */
.vocabulary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.vocab-card {
  background: var(--muted);
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid var(--primary);
}

.vocab-word {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary);
}

.vocab-ipa {
  font-style: italic;
  color: #666;
  margin: 5px 0;
}

.vocab-definition {
  margin: 10px 0;
}

.vocab-example {
  font-style: italic;
  color: #555;
  padding: 10px;
  background: white;
  border-radius: 5px;
  margin-top: 10px;
}

/* Grammar Styles */
.grammar-section {
  padding: 20px;
}

.grammar-rule {
  background: linear-gradient(135deg, var(--primary), hsl(280, 84%, 55%));
  color: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.grammar-pattern {
  font-size: 1.2rem;
  font-family: monospace;
  background: rgba(255,255,255,0.2);
  padding: 10px;
  border-radius: 6px;
  margin-top: 10px;
}

.grammar-examples ul {
  list-style: none;
  padding: 0;
}

.grammar-examples li {
  padding: 10px 15px;
  background: var(--muted);
  margin: 8px 0;
  border-radius: 6px;
  border-left: 3px solid var(--primary);
}

/* Exercise Styles */
.exercise-section {
  padding: 20px;
}

.exercise-instruction {
  font-weight: 500;
  margin-bottom: 20px;
  color: var(--primary);
}

.exercise-item {
  padding: 15px;
  background: var(--muted);
  margin: 10px 0;
  border-radius: 8px;
}

.item-number {
  font-weight: 600;
  color: var(--primary);
}

/* Quiz Styles */
.quiz-section {
  padding: 20px;
}

.quiz-question {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 25px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quiz-option {
  padding: 15px 20px;
  background: var(--muted);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  transition: all 0.2s;
}

.quiz-option:hover {
  border-color: var(--primary);
  background: white;
}

/* Dialogue Styles */
.dialogue-section {
  padding: 20px;
}

.dialogue-context {
  font-style: italic;
  color: #666;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--muted);
  border-radius: 8px;
}

.dialogue-line {
  padding: 12px 15px;
  margin: 8px 0;
  background: white;
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.speaker {
  font-weight: 600;
  color: var(--primary);
}

/* Navigation */
.lesson-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.nav-btn {
  padding: 12px 25px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):hover {
  opacity: 0.9;
}

#progress-text {
  font-weight: 500;
  color: var(--foreground);
}`;
}

// Generate lesson HTML page
function generateLessonHtml(lesson: LessonData, lessonIndex: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(lesson.title)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="lesson-container">
    <header class="lesson-header">
      <h1>${escapeXml(lesson.title)}</h1>
      <p>EnglEuphoria Interactive Lesson</p>
    </header>
    
    <div id="slide-container" class="slide-container">
      <p>Loading lesson content...</p>
    </div>
    
    <nav class="lesson-nav">
      <button id="prev-btn" class="nav-btn">← Previous</button>
      <span id="progress-text">1 / 1</span>
      <button id="next-btn" class="nav-btn">Next →</button>
    </nav>
  </div>
  
  <script src="../shared/scorm-api.js"></script>
  <script src="../shared/player.js"></script>
  <script>
    fetch('slides.json')
      .then(res => res.json())
      .then(data => {
        new LessonPlayer('slide-container', data);
      })
      .catch(err => {
        document.getElementById('slide-container').innerHTML = 
          '<p style="color:red">Error loading lesson: ' + err.message + '</p>';
      });
  </script>
</body>
</html>`;
}

// H5P package generator
function generateH5pJson(lessons: LessonData[], courseTitle: string): string {
  return JSON.stringify({
    title: courseTitle,
    language: "en",
    mainLibrary: "H5P.CoursePresentation",
    embedTypes: ["div"],
    license: "U",
    preloadedDependencies: [
      { machineName: "H5P.CoursePresentation", majorVersion: 1, minorVersion: 24 },
      { machineName: "H5P.Blanks", majorVersion: 1, minorVersion: 14 },
      { machineName: "H5P.MultiChoice", majorVersion: 1, minorVersion: 16 },
      { machineName: "H5P.DragText", majorVersion: 1, minorVersion: 10 },
      { machineName: "H5P.Image", majorVersion: 1, minorVersion: 1 }
    ]
  }, null, 2);
}

function generateH5pContent(lessons: LessonData[]): string {
  const slides = lessons.flatMap((lesson, lessonIdx) => {
    const content = lesson.content || {};
    const lessonSlides = content.slides || [];
    
    return lessonSlides.map((slide: SlideContent, slideIdx: number) => ({
      elements: [
        {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          action: transformSlideToH5pAction(slide, slideIdx)
        }
      ],
      slideBackgroundSelector: {}
    }));
  });

  return JSON.stringify({
    presentation: {
      slides: slides,
      keywordListEnabled: true,
      globalBackgroundSelector: {},
      keywordListAlwaysShow: false,
      keywordListAutoHide: false,
      keywordListOpacity: 90
    },
    override: {
      activeSurface: false,
      hideSummarySlide: false,
      summarySlideSolutionButton: true,
      summarySlideRetryButton: true,
      enablePrintButton: false,
      social: {
        showFacebookShare: false,
        facebookShare: { url: "", quote: "" },
        showTwitterShare: false,
        twitterShare: { statement: "", url: "", hashtags: "" },
        showGoogleShare: false,
        googleShareUrl: ""
      }
    },
    l10n: {
      slide: "Slide",
      score: "Score",
      yourScore: "Your Score",
      maxScore: "Max Score",
      total: "Total",
      totalScore: "Total Score",
      showSolutions: "Show solutions",
      retry: "Retry",
      exportAnswers: "Export text",
      hideKeywords: "Hide sidebar navigation menu",
      showKeywords: "Show sidebar navigation menu",
      fullscreen: "Fullscreen",
      exitFullscreen: "Exit fullscreen",
      prevSlide: "Previous slide",
      nextSlide: "Next slide",
      currentSlide: "Current slide",
      lastSlide: "Last slide",
      solutionModeTitle: "Exit solution mode",
      solutionModeText: "Solution Mode",
      summaryMultipleTaskText: "Multiple tasks",
      scoreMessage: "You achieved:",
      shareFacebook: "Share on Facebook",
      shareTwitter: "Share on Twitter",
      shareGoogle: "Share on Google+",
      summary: "Summary",
      solutionsButtonTitle: "Show comments",
      printTitle: "Print",
      printIng498Description: "Prepare for printing",
      printAllSlides: "Print all slides",
      printCurrentSlide: "Print current slide",
      noTitle: "No title",
      accessibilitySlideNavigationExplanation: "Use left and right arrow to change slide in that direction whenever canvas is selected.",
      accessibilityCanvasLabel: "Presentation canvas. Use left and right arrow to move between slides.",
      containsNotCompleted: "@slideName contains not completed interaction",
      containsCompleted: "@slideName contains completed interaction",
      slideCount: "Slide @index of @total",
      containsOnlyCorrect: "@slideName only has correct answers",
      containsIncorrectAnswers: "@slideName has incorrect answers",
      shareResult: "Share Result",
      accessibilityTotalScore: "You got @score of @maxScore points in total",
      accessibilityEnteredFullscreen: "Entered fullscreen",
      accessibilityExitedFullscreen: "Exited fullscreen",
      confirmDialogHeader: "Submit your answers",
      confirmDialogText: "This will submit your answers, do you want to continue?",
      confirmDialogConfirmText: "Submit and see results"
    }
  }, null, 2);
}

function transformSlideToH5pAction(slide: SlideContent, index: number): any {
  const type = slide.type || 'text';
  
  switch (type) {
    case 'vocabulary':
      return {
        library: "H5P.AdvancedText 1.1",
        params: {
          text: generateVocabHtml(slide.vocabulary || [])
        },
        subContentId: `vocab-${index}`
      };
    
    case 'grammar':
      return {
        library: "H5P.AdvancedText 1.1",
        params: {
          text: generateGrammarHtml(slide.grammarRule || slide.content)
        },
        subContentId: `grammar-${index}`
      };
    
    case 'fill-in-blank':
    case 'exercise':
      return {
        library: "H5P.Blanks 1.14",
        params: {
          text: generateBlanksText(slide.exercise || slide.content),
          overallFeedback: [{ from: 0, to: 100, feedback: "Good job!" }],
          showSolutions: "Show solution",
          tryAgain: "Retry",
          checkAnswer: "Check",
          submitAnswer: "Submit",
          notFilledOut: "Please fill in all blanks",
          answerIsCorrect: "correct",
          answerIsWrong: "wrong",
          answeredCorrectly: "Answered correctly",
          answeredIncorrectly: "Answered incorrectly",
          solutionLabel: "Correct answer:",
          inputLabel: "Blank input @num of @total",
          inputHasTipLabel: "Tip available",
          tipLabel: "Tip",
          behaviour: {
            enableRetry: true,
            enableSolutionsButton: true,
            enableCheckButton: true,
            autoCheck: false,
            caseSensitive: false,
            showSolutionsRequiresInput: true,
            separateLines: false,
            confirmCheckDialog: false,
            confirmRetryDialog: false,
            acceptSpellingErrors: false
          }
        },
        subContentId: `blanks-${index}`
      };
    
    case 'quiz':
    case 'multiple-choice':
      const quiz = slide.quiz || slide.content || {};
      return {
        library: "H5P.MultiChoice 1.16",
        params: {
          question: quiz.question || "Question",
          answers: (quiz.options || []).map((opt: any, i: number) => ({
            text: typeof opt === 'string' ? opt : opt.text,
            correct: i === (quiz.correctIndex || 0),
            tpiMessage: "",
            chosenFeedback: "",
            notChosenFeedback: ""
          })),
          behaviour: {
            enableRetry: true,
            enableSolutionsButton: true,
            enableCheckButton: true,
            type: "auto",
            singlePoint: false,
            randomAnswers: false,
            showSolutionsRequiresInput: true,
            confirmCheckDialog: false,
            confirmRetryDialog: false,
            autoCheck: false,
            passPercentage: 100,
            showScorePoints: true
          },
          UI: {
            checkAnswerButton: "Check",
            submitAnswerButton: "Submit",
            showSolutionButton: "Show solution",
            tryAgainButton: "Retry",
            tipsLabel: "Show tip",
            scoreBarLabel: "You got :num out of :total points",
            tipAvailable: "Tip available",
            feedbackAvailable: "Feedback available",
            readFeedback: "Read feedback",
            wrongAnswer: "Wrong answer",
            correctAnswer: "Correct answer",
            shouldCheck: "Should have been checked",
            shouldNotCheck: "Should not have been checked",
            noInput: "Please answer before viewing the solution",
            a11yCheck: "Check the answers. The responses will be marked as correct, incorrect, or unanswered.",
            a11yShowSolution: "Show the solution. The task will be marked with its correct solution.",
            a11yRetry: "Retry the task. Reset all responses and start the task over again."
          },
          confirmCheck: {
            header: "Finish ?",
            body: "Are you sure you wish to finish ?",
            cancelLabel: "Cancel",
            confirmLabel: "Finish"
          },
          confirmRetry: {
            header: "Retry ?",
            body: "Are you sure you wish to retry ?",
            cancelLabel: "Cancel",
            confirmLabel: "Confirm"
          }
        },
        subContentId: `mc-${index}`
      };
    
    default:
      return {
        library: "H5P.AdvancedText 1.1",
        params: {
          text: `<h2>${slide.title || 'Slide'}</h2><p>${JSON.stringify(slide.content || slide)}</p>`
        },
        subContentId: `text-${index}`
      };
  }
}

function generateVocabHtml(vocabulary: any[]): string {
  let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">';
  vocabulary.forEach(item => {
    html += `<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
      <strong style="color: #7c3aed; font-size: 1.2em;">${item.word || item.term}</strong>
      ${item.ipa ? `<em style="color: #666;"> ${item.ipa}</em>` : ''}
      <p>${item.definition || item.meaning}</p>
      ${item.example ? `<p style="font-style: italic; color: #555;">"${item.example}"</p>` : ''}
    </div>`;
  });
  html += '</div>';
  return html;
}

function generateGrammarHtml(rule: any): string {
  if (!rule) return '<p>Grammar content</p>';
  let html = `<div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 20px; border-radius: 12px;">
    <h3>${rule.title || 'Grammar Rule'}</h3>
    <p style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px;">
      ${rule.pattern || rule.rule || ''}
    </p>
  </div>`;
  
  if (rule.examples && rule.examples.length) {
    html += '<h4 style="margin-top: 20px;">Examples:</h4><ul>';
    rule.examples.forEach((ex: any) => {
      html += `<li style="padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 4px;">${
        typeof ex === 'string' ? ex : ex.sentence || ex.example
      }</li>`;
    });
    html += '</ul>';
  }
  return html;
}

function generateBlanksText(exercise: any): string {
  if (!exercise) return 'Fill in the *blank*.';
  const sentences = exercise.sentences || exercise.items || [];
  return sentences.map((item: any) => {
    const text = typeof item === 'string' ? item : item.sentence || item.text;
    // Convert underscores or [blank] to H5P blank format *answer*
    return text.replace(/_{2,}|__+|\[blank\]|\[___\]/gi, '*answer*');
  }).join('\n');
}

// HTML5 bundle generator
function generateHtml5Index(lessons: LessonData[], courseTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(courseTitle)}</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <h1>${escapeXml(courseTitle)}</h1>
      <p>EnglEuphoria Interactive Curriculum</p>
    </header>
    
    <nav class="lesson-list" id="lesson-list">
      <h2>Lessons</h2>
      <ul>
        ${lessons.map((lesson, idx) => `
          <li>
            <a href="#" onclick="loadLesson(${idx}); return false;" class="lesson-link">
              <span class="lesson-number">${idx + 1}</span>
              <span class="lesson-title">${escapeXml(lesson.title)}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
    
    <main id="lesson-container" class="lesson-container" style="display: none;">
      <button onclick="showLessonList()" class="back-btn">← Back to Lessons</button>
      <div id="slide-container" class="slide-container"></div>
      <nav class="lesson-nav">
        <button id="prev-btn" class="nav-btn">← Previous</button>
        <span id="progress-text">1 / 1</span>
        <button id="next-btn" class="nav-btn">Next →</button>
      </nav>
    </main>
  </div>
  
  <script src="js/player.js"></script>
  <script>
    const lessons = ${JSON.stringify(lessons.map(l => l.id))};
    let currentLessonData = null;
    
    function loadLesson(index) {
      fetch('lessons/lesson' + (index + 1) + '.json')
        .then(res => res.json())
        .then(data => {
          currentLessonData = data;
          document.getElementById('lesson-list').style.display = 'none';
          document.getElementById('lesson-container').style.display = 'block';
          new LessonPlayer('slide-container', data);
        });
    }
    
    function showLessonList() {
      document.getElementById('lesson-list').style.display = 'block';
      document.getElementById('lesson-container').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

function generateWebManifest(courseTitle: string): string {
  return JSON.stringify({
    name: courseTitle,
    short_name: "EnglEuphoria",
    start_url: "index.html",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: []
  }, null, 2);
}

// Utility functions
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const auth = await requireAuth(req, { allowedRoles: ['admin'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { lessonIds, format, options }: ExportRequest = await req.json();

    if (!lessonIds || lessonIds.length === 0) {
      throw new Error("No lessons provided for export");
    }

    // Fetch lessons from database
    const { data: lessons, error: fetchError } = await supabase
      .from("curriculum_lessons")
      .select("id, title, target_system, content, created_at")
      .in("id", lessonIds);

    if (fetchError) throw fetchError;
    if (!lessons || lessons.length === 0) {
      throw new Error("No lessons found with provided IDs");
    }

    const courseTitle = options.courseTitle || "EnglEuphoria Curriculum";
    const packageName = options.packageName || `EnglEuphoria_${format.toUpperCase()}_${new Date().toISOString().split('T')[0]}`;

    // Create ZIP package
    const zip = new JSZip();

    if (format === 'scorm') {
      // SCORM 2004 package
      zip.file("imsmanifest.xml", generateScormManifest(lessons, courseTitle));
      zip.file("shared/scorm-api.js", generateScormApiJs());
      zip.file("shared/player.js", generatePlayerJs());

      lessons.forEach((lesson, idx) => {
        const lessonFolder = `content/lesson${idx + 1}`;
        zip.file(`${lessonFolder}/index.html`, generateLessonHtml(lesson, idx));
        zip.file(`${lessonFolder}/styles.css`, generateStylesCss());
        zip.file(`${lessonFolder}/slides.json`, JSON.stringify(lesson.content || { slides: [] }));
      });

    } else if (format === 'h5p') {
      // H5P package
      zip.file("h5p.json", generateH5pJson(lessons, courseTitle));
      zip.file("content/content.json", generateH5pContent(lessons));

    } else if (format === 'html5') {
      // HTML5 standalone bundle
      zip.file("index.html", generateHtml5Index(lessons, courseTitle));
      zip.file("manifest.json", generateWebManifest(courseTitle));
      zip.file("css/styles.css", generateStylesCss());
      zip.file("js/player.js", generatePlayerJs());

      lessons.forEach((lesson, idx) => {
        zip.file(`lessons/lesson${idx + 1}.json`, JSON.stringify({
          id: lesson.id,
          title: lesson.title,
          slides: (lesson.content as any)?.slides || []
        }));
      });
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: "uint8array" });
    const fileName = `${packageName}.zip`;

    // Upload to storage
    const storagePath = `curriculum/${format}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("exports")
      .upload(storagePath, zipBlob, {
        contentType: "application/zip",
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // If bucket doesn't exist, return base64 download
      const base64 = btoa(String.fromCharCode(...zipBlob));
      return new Response(
        JSON.stringify({
          success: true,
          downloadData: base64,
          fileName,
          format,
          lessonCount: lessons.length,
          message: "Package generated (direct download)"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signed URL
    const { data: signedUrlData } = await supabase.storage
      .from("exports")
      .createSignedUrl(storagePath, 3600 * 24 * 7); // 7 days

    // Save export record
    await supabase.from("curriculum_exports").insert({
      format,
      lesson_count: lessons.length,
      file_name: fileName,
      storage_path: storagePath,
      file_size_bytes: zipBlob.length,
      options
    });

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: signedUrlData?.signedUrl,
        fileName,
        format,
        lessonCount: lessons.length,
        fileSizeBytes: zipBlob.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
