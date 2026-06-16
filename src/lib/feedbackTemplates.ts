export type RoleKey =
  | 'Analyst'
  | 'Consultant'
  | 'Senior Consultant'
  | 'Manager'
  | 'Senior Manager'
  | 'Associate Director'
  | 'Director'
  | 'Partner'
  | 'Expert Partner'

export type ReviewDirection = 'top-down' | 'upward'

export type ScoreValue = 1 | 2 | 3 | 4 | 5

export interface FeedbackGuideline {
  section: string
  topic: string
  details: string
}

export interface Competency {
  id: string
  pillar: string
  title: string
  definition: string
  rubric: Record<ScoreValue, string>
  allowNotRelevant: boolean
  requireLowComment: boolean
  requireHighComment: boolean
  sourceSheet: string
  sourceRow: number
}

export interface FeedbackTemplate {
  roleKey: RoleKey
  displayName: string
  version: number
  active: boolean
  sourceSheet: string
  reviewerGuidance: string
  competencies: Competency[]
}

export const scoreLabels: Record<ScoreValue, string> = {
  1: 'Unsatisfactory',
  2: 'Below expectations',
  3: 'At expectation',
  4: 'Exceeds expectations',
  5: 'Outstanding',
}

export const feedbackGuidelines: FeedbackGuideline[] = [
  {
    "section": "1. Purpose",
    "topic": "Objective",
    "details": "Provide a standardized, data-driven, and fair evaluation across all employees, levels, and geographies."
  },
  {
    "section": "",
    "topic": "Usage",
    "details": "Tool used by HR, Spokespersons, and Project Managers to consolidate a global view of performance."
  },
  {
    "section": "",
    "topic": "Goal",
    "details": "Harmonize performance reviews, ensure consistency in promotions, support employee development."
  },
  {
    "section": "2. When to complete",
    "topic": "Timing",
    "details": "At the end of each project."
  },
  {
    "section": "",
    "topic": "Projects",
    "details": "DD, VDD, Transformation, Proposals, Internal projects (if relevant)."
  },
  {
    "section": "",
    "topic": "Mandatory",
    "details": "All projects longer than 3 weeks."
  },
  {
    "section": "",
    "topic": "Deadline",
    "details": "Submit within 1 week after project closure."
  },
  {
    "section": "3. Who evaluates whom ?",
    "topic": "Top-Down Feedback",
    "details": "Manager/Senior Managers → Analysts, Consultants, Senior Consultants\nAssociate Director/Director → Managers, Senior Managers; \nPartner → Managers, Senior Managers, Associate Directors, Directors."
  },
  {
    "section": "",
    "topic": "Note",
    "details": "Follow project hierarchy; if unclear, check with Stafiz or ask Ops and HR."
  },
  {
    "section": "",
    "topic": "Upward Feedback",
    "details": "Analysts, Consultants and Senior Consultants → Managers, Senior Managers, Associate Directors, Directors.\nManagers, Senior Managers → Director. \nPartners & Expert Partners via Elevo."
  },
  {
    "section": "4. How to use the grid ?",
    "topic": "Step 1",
    "details": "Read guidelines."
  },
  {
    "section": "",
    "topic": "Step 2",
    "details": "Go to the tab of the level for the team member you evaluate. Please, complete the tab 'Personal Information'."
  },
  {
    "section": "",
    "topic": "Step 3",
    "details": "In Column E, rate (based on the scoring scheme) each skillset dimension. Leave blank if not relevant. Scores 1 or 2 require rationale; 4–5 require also comments."
  },
  {
    "section": "",
    "topic": "Step 4",
    "details": "One excel file per team member. \nExample: Manager with 1 Analyst + 1 Senior Consultant = 2 grids."
  },
  {
    "section": "",
    "topic": "Step 5",
    "details": "Send grids to hr@singulier.co within 1 week."
  },
  {
    "section": "",
    "topic": "Step 6",
    "details": "Deliver structured in person feedback to the consultant at project closure."
  },
  {
    "section": "5. Scoring system",
    "topic": "5 – Outstanding",
    "details": "Exceptional across all dimensions; ~5% of employees."
  },
  {
    "section": "",
    "topic": "4 – Exceeds expectations",
    "details": "Above expectations across most dimensions."
  },
  {
    "section": "",
    "topic": "3 – At expectation (on track)",
    "details": "Solid, reliable performance aligned with role expectations."
  },
  {
    "section": "",
    "topic": "2 – Partially meets expectations",
    "details": "Weaknesses in one or more areas."
  },
  {
    "section": "",
    "topic": "1 – Unsatisfactory",
    "details": "Poor performance in most areas."
  },
  {
    "section": "",
    "topic": "Notes",
    "details": "3 is the norm. Avoid grade inflation. Averages are inputs only, not final ratings."
  },
  {
    "section": "6. Key reminders",
    "topic": "Confidentiality",
    "details": "Strictly confidential; used only for evaluation, calibration, promotion readiness."
  },
  {
    "section": "",
    "topic": "Calibration",
    "details": "HR consolidates & calibrates across projects; input must be precise & consistent. The average grade is only an input."
  },
  {
    "section": "",
    "topic": "Feedback quality",
    "details": "Use fact-based, specific, constructive comments. Avoid vague feedback. Support ratings with examples."
  },
  {
    "section": "",
    "topic": "Link to development",
    "details": "Not just a score : a tool to support growth & career progression."
  },
  {
    "section": "",
    "topic": "Consistency",
    "details": "Align evaluations with previous projects unless fact-based change."
  },
  {
    "section": "7. Pitfalls to avoid",
    "topic": "Vague comments",
    "details": "Always provide actionable insights."
  },
  {
    "section": "",
    "topic": "Personal bias",
    "details": "Focus on observable behaviors and outcomes, not preferences."
  }
]

const baseFeedbackTemplates: Omit<FeedbackTemplate, 'reviewerGuidance'>[] = [
  {
    "roleKey": "Analyst",
    "displayName": "Analyst end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Analysts",
    "competencies": [
      {
        "id": "analyst-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Structure problems & develop hypotheses at the workstream level with support\n\nIdentify gaps in data available",
        "rubric": {
          "1": "Unsatisfactory: Struggles to structure even basic problems. Requires constant supervision to progress. Fails to identify missing data or raises issues too late.",
          "2": "Below expectations: Attempts to structure problems but misses key elements or follows unclear logic. Needs frequent guidance to formulate hypotheses. Occasionally spots data gaps, but lacks follow-through.",
          "3": "Meet expectations: Structures workstream-level problems with some support. Develops relevant hypotheses and reliably identifies missing data.",
          "4": "Above expectations: Effectively structures complex problems within the workstream. Anticipates ambiguity, proposes strong hypotheses, and actively flags data gaps with suggestions for resolution.",
          "5": "Outstanding: Thinks like a senior consultant. Structures ambiguous problems effortlessly. Crafts high-impact hypotheses and proactively identifies and addresses data gaps before they become blockers."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 2
      },
      {
        "id": "analyst-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Conduct analysis (using excel model, analyse data), manage data sets, and build a model with minimal assistance",
        "rubric": {
          "1": "Unsatisfactory: Struggles with basic quantitative tasks. Frequently makes errors in analysis or modeling. Needs constant support to manage data or use Excel effectively.",
          "2": "Below expectations: Can run simple analyses but lacks consistency or accuracy. Models are prone to errors, hard to follow, or require rework. Needs regular guidance to manage data properly.",
          "3": "Meet expectations: Performs solid analysis with minimal support. Builds and uses Excel models competently. Manages datasets reliably and produces clean, accurate outputs.",
          "4": "Above expectations: Delivers robust analysis with strong logic and clean models. Anticipates potential data issues and builds flexible, scalable tools with little oversight.",
          "5": "Outstanding: Analytical powerhouse. Builds intuitive, bulletproof models that others rely on. Transforms complex datasets into clear, actionable insights — fast, precise, and with a consultant’s finesse."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 3
      },
      {
        "id": "analyst-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Synthesize multiple information sources (e.g. interviews, data) and provide insights & recommendations at workstream level with support",
        "rubric": {
          "1": "Unsatisfactory: Struggles to connect information from different sources. Outputs are disjointed, overly descriptive, or lack clear recommendations. Needs constant redirection.",
          "2": "Below expectations: Attempts synthesis but misses key patterns or mixes signal with noise. Recommendations are vague or not actionable. Needs regular support to clarify insights.",
          "3": "Meet expectations: Combines inputs into coherent insights with minimal support. Provides relevant, actionable recommendations at the workstream level.",
          "4": "Above expectations: Consistently distills complex inputs into sharp, prioritized insights. Delivers clear, well-supported recommendations that move the workstream forward.",
          "5": "Outstanding: Thinks like a strategist. Synthesizes ambiguity into clarity. Crafts crisp, high-impact recommendations that influence direction and resonate with stakeholders."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 4
      },
      {
        "id": "analyst-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Tell a clear story on a slide, including writing a slide title that reflect the slides and is coherent with the slides before and after",
        "rubric": {
          "1": "Unsatisfactory: Slide is confusing or cluttered. Title is vague, off-topic, or disconnected from the narrative. No clear throughline across slides.",
          "2": "Below expectations: Some logic present, but story is hard to follow. Titles may summarize the content but don’t guide the reader or connect well across the deck.",
          "3": "Meet expectations: Slide tells a coherent story. Title accurately reflects the key message and fits within the overall flow of the deck.",
          "4": "Above expectations: Slide is clear, punchy, and flows naturally within the narrative. Title sharpens the takeaway and builds momentum in the storyline.",
          "5": "Outstanding: Strategic storyteller. Crafts compelling, insight-driven slides with laser-sharp titles that elevate the entire narrative. Makes complex ideas feel obvious."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 5
      },
      {
        "id": "analyst-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write clearly and succinctly with limited typos (grammar, spelling) \n\nCreate visually appealing PowerPoint slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear, verbose, or riddled with typos. Slides are messy, inconsistent, and require major rework to meet basic standards.",
          "2": "Below expectations: Communicates basic ideas but with awkward phrasing or noticeable grammar issues. Slides are functional but often misaligned or visually weak.",
          "3": "Meet expectations: Communicates clearly and concisely. Few to no typos. PowerPoint slides are clean, well-formatted, and require minimal polishing.",
          "4": "Above expectations: Writing is crisp, professional, and engaging. Slides are consistently well-designed, visually balanced, and require no formatting corrections.",
          "5": "Outstanding: Writes with precision and style. Creates executive-ready decks that are both beautiful and impactful. Sets the bar for written clarity and visual polish."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 6
      },
      {
        "id": "analyst-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Clear and concise verbal communication",
        "rubric": {
          "1": "Unsatisfactory: Struggles to express thoughts clearly. Often vague, disorganized, or rambling. Frequently requires clarification from others.",
          "2": "Below expectations: Communicates basic ideas but lacks clarity or conciseness. Message is often unclear or needs further explanation.",
          "3": "Meet expectations: Communicates clearly and concisely most of the time. Delivers information in a straightforward manner with minor adjustments needed.",
          "4": "Above expectations: Always concise and precise in verbal communication. Can simplify complex ideas and deliver them in an easy-to-understand way.",
          "5": "Outstanding: Masterful communicator. Delivers ideas with clarity and impact, never wasting a word. Commands attention and ensures full understanding in every interaction."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 7
      },
      {
        "id": "analyst-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Structure and prioritize their own work, including ability to track and communicate progress, and asking for help / re-prioritising as needed",
        "rubric": {
          "1": "Unsatisfactory: Struggles to organize tasks or set priorities. Frequently misses deadlines and fails to communicate progress. Rarely asks for help and often works in an unstructured manner.",
          "2": "Below expectations: Attempts to prioritize but struggles with time management or task sequencing. Needs frequent reminders to update on progress and seek support when needed.",
          "3": "Meet expectations: Manages own workload and priorities effectively. Tracks progress reliably and communicates updates when needed. Seeks help when appropriate and can re-prioritize based on new information.",
          "4": "Above expectations: Consistently organizes and prioritizes tasks efficiently. Proactively tracks progress, adjusts priorities as needed, and communicates with clarity. Seeks support before blockers arise.",
          "5": "Outstanding: Master of prioritization. Efficiently structures and adjusts work based on shifting demands. Anticipates needs, tracks progress proactively, and re-prioritizes seamlessly, always keeping stakeholders in the loop."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 8
      },
      {
        "id": "analyst-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Behave in a professional & positive manner (e.g. timeliness, meeting management, appropriate dress & conduct, etc) and a team player. Be consistently motivated and collaborative\n\nExhibit consistently reliable & timely delivery, asking for help when needed",
        "rubric": {
          "1": "Unsatisfactory: Frequently late, disorganized, or unprofessional in meetings. Conduct or dress is inappropriate. Rarely asks for help, resulting in missed deadlines and poor collaboration.",
          "2": "Below expectations: Occasionally late or unprepared for meetings. Demonstrates some professionalism but struggles with consistency in reliability or collaboration. Needs reminders to ask for help.",
          "3": "Meet expectations: Consistently punctual, well-prepared, and conducts themselves professionally. Works well in teams and meets deadlines with reliable delivery. Asks for help when needed.",
          "4": "Above expectations: Demonstrates a high level of professionalism in all aspects. Actively contributes to team success and manages work efficiently, ensuring timely delivery. Frequently seeks input when necessary and adjusts accordingly.",
          "5": "Outstanding: Exemplifies professional behaviour at all times. A model team player — highly reliable, always prepared, and consistently delivers ahead of expectations. Proactively seeks feedback and support to enhance performance."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 9
      },
      {
        "id": "analyst-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Actively contribute to internal team brainstorming. Ask relevant questions.",
        "rubric": {
          "1": "Unsatisfactory: Rarely contributes to team discussions or brainstorming sessions. Doesn’t ask questions, leaving gaps in understanding. Relies on others to drive the conversation.",
          "2": "Below expectations: Occasionally contributes, but ideas are vague or lack depth. Asks few questions and may miss opportunities to clarify or deepen discussions.",
          "3": "Meet expectations: Actively participates in brainstorming, offering relevant ideas and asking thoughtful questions. Engages with the team and contributes meaningfully.",
          "4": "Above expectations: Consistently adds valuable insights during team brainstorming. Asks insightful, targeted questions that advance the conversation and spark new ideas.",
          "5": "Outstanding: A catalyst in team discussions. Drives brainstorming sessions with innovative ideas and sharp questions that push the team’s thinking forward. Creates an environment of open, constructive dialogue."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 10
      },
      {
        "id": "analyst-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Exhibit baseline knowledge on PE industry: M&A process",
        "rubric": {
          "1": "Unsatisfactory: Lacks basic understanding of the PE industry and M&A process. Struggles to identify key concepts or terms. Needs significant guidance when discussing industry-specific topics.",
          "2": "Below expectations: Shows a basic awareness of the PE industry and M&A process but cannot explain or apply key concepts effectively. Needs frequent clarification and support in discussions.",
          "3": "Meet expectations: Demonstrates a foundational understanding of the PE industry and the M&A process. Can discuss major stages of M&A and key players with some confidence.",
          "4": "Above expectations: Has a solid grasp of the PE industry and M&A process, including the ability to discuss and apply industry concepts in practical scenarios. Displays awareness of trends and key developments.",
          "5": "Outstanding: Exhibits deep and comprehensive knowledge of the PE industry and M&A process. Can confidently explain intricate details, trends, and strategic implications. Contributes insights that reflect a senior-level understanding of the industry."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 12
      },
      {
        "id": "analyst-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Use basic tools (e.g. think cell, 1-2 digital tools) and gather data",
        "rubric": {
          "1": "Unsatisfactory: Struggles to use basic tools or digital software. Needs continuous guidance to navigate even simple tasks. Data gathering is incomplete or inaccurate.",
          "2": "Below expectations: Uses basic tools with limited effectiveness. Has some difficulty navigating digital tools and often requires assistance. Data gathering is inconsistent or incomplete.",
          "3": "Meet expectations: Proficient with basic tools (e.g., Think Cell) and uses them effectively for data gathering. Can perform standard tasks with minimal guidance.",
          "4": "Above expectations: Works efficiently with a variety of digital tools, applying them independently to gather and analyze data. Can create well-organized outputs and handle more advanced functions.",
          "5": "Outstanding: Expert user of tools, including advanced features. Efficiently gathers and analyzes data, and leverages digital tools to enhance productivity and quality of output. Identifies opportunities to optimize tool usage."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 13
      },
      {
        "id": "analyst-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Open to all types of projects",
        "rubric": {
          "1": "Unsatisfactory: Hesitant or resistant to taking on new or unfamiliar projects. Prefers to work on only well-defined or familiar tasks.",
          "2": "Below expectations: Willing to work on new projects but lacks enthusiasm or frequently struggles with unfamiliar tasks. Needs encouragement to step outside comfort zones.",
          "3": "Meet expectations: Open to a variety of projects. Willing to take on new challenges and adapt to different types of tasks with reasonable comfort and success.",
          "4": "Above expectations: Actively seeks out diverse project experiences. Approaches new challenges with enthusiasm and shows adaptability across various project types.",
          "5": "Outstanding: Thrives in any project environment. Proactively takes on diverse and complex projects, bringing innovative approaches and consistently delivering results. Encourages and supports others to embrace new challenges."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 14
      },
      {
        "id": "analyst-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Analysts",
        "sourceRow": 17
      }
    ]
  },
  {
    "roleKey": "Consultant",
    "displayName": "Consultant end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Consultants",
    "competencies": [
      {
        "id": "consultant-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Structure problems & develop hypotheses independently \n\nIdentify data required & proactively gather data for workstream",
        "rubric": {
          "1": "Unsatisfactory: Struggles to break down complex problems. Needs constant guidance to develop hypotheses and often misses key data requirements. Does not proactively gather data, resulting in incomplete or flawed analysis.",
          "2": "Below expectations: Attempts to structure problems but often lacks clarity or overlooks key elements. Can develop basic hypotheses with support but needs regular guidance to identify and collect necessary data.",
          "3": "Meet expectations: Independently structures problems and develops logical hypotheses with minimal support. Identifies and gathers relevant data for the workstream in a timely manner.",
          "4": "Above expectations: Consistently structures complex problems and develops clear, actionable hypotheses independently. Anticipates data requirements and proactively collects data, addressing gaps before they become issues.",
          "5": "Outstanding: Masterfully structures ambiguous or complex problems and develops innovative, high-impact hypotheses. Anticipates and gathers all necessary data efficiently, often going beyond expectations to ensure thorough analysis."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 2
      },
      {
        "id": "consultant-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Build a quantitative model independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to build even basic quantitative models. Requires constant support and guidance. Models often contain errors or lack structure, making them unreliable for decision-making.",
          "2": "Below expectations: Can build basic models with significant support. Models may have some inconsistencies or require frequent revisions. Needs help troubleshooting issues or improving model efficiency.",
          "3": "Meet expectations: Builds functional and accurate quantitative models independently. Demonstrates the ability to solve problems through well-structured models, with occasional minor adjustments needed.",
          "4": "Above expectations: Consistently builds robust, efficient, and accurate models independently. Anticipates challenges and proactively addresses them, creating scalable and reliable models for complex analyses.",
          "5": "Outstanding: Masterfully builds advanced, high-quality quantitative models independently. Models are both innovative and practical, offering powerful insights and predictive value. Anticipates future needs and designs flexible models that can easily be adapted."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 3
      },
      {
        "id": "consultant-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Identify & synthesize multiple information sources (e.g. interviews, data) and provide insights & recommendations at workstream level independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to synthesize information from different sources. Outputs lack clarity, coherence, or actionable insights. Recommendations are weak or irrelevant, requiring constant revisions and heavy support.",
          "2": "Below expectations: Attempts to synthesize multiple information sources but misses key connections or presents disjointed insights. Recommendations lack depth or feasibility and need significant guidance to refine.",
          "3": "Meet expectations: Effectively synthesizes information from multiple sources and provides relevant insights and recommendations at the workstream level. Works independently with minimal support, although some fine-tuning may be needed.",
          "4": "Above expectations: Consistently synthesizes complex information from diverse sources into coherent, actionable insights. Recommendations are well-supported and contribute effectively to the workstream, requiring little to no revision.",
          "5": "Outstanding: Expertly synthesizes a wide range of information and generates innovative, high-impact insights and recommendations. Anticipates future challenges and proactively shapes the direction of the workstream with strategic, well-founded advice."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 4
      },
      {
        "id": "consultant-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Tell a clear story (e.g. management report) on a workstream (multiple slides)",
        "rubric": {
          "1": "Unsatisfactory: Story is unclear or fragmented. Slides are disorganized, with no clear narrative. The message is lost, and the report fails to connect the dots, leaving the audience confused or disengaged.",
          "2": "Below expectations: Some attempt to structure the story, but slides lack coherence or a logical flow. The narrative is weak, and key points are not effectively highlighted. Audience may struggle to follow the main message.",
          "3": "Meet expectations: Tells a clear, logical story across multiple slides. Each slide aligns with the overall narrative, and key messages are effectively conveyed. Minor adjustments may be needed to improve flow or clarity.",
          "4": "Above expectations: Consistently delivers a compelling and well-structured story across slides. Each slide contributes seamlessly to the narrative, and the report is concise, clear, and persuasive. The story flows naturally, building towards actionable insights.",
          "5": "Outstanding: Masterful storyteller. Creates a powerful, engaging narrative across multiple slides, with a sharp focus on the audience's needs. The story is clear, concise, and strategically impactful, driving decisions with clarity and precision."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 5
      },
      {
        "id": "consultant-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write insights & recommendations relevant to the audience \n\nCreate visually appealing ppt slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear or overly complex, with little focus on the audience. Recommendations are weak or irrelevant. PowerPoint slides are cluttered, poorly formatted, and require significant edits to be presentable.",
          "2": "Below expectations: Writing is somewhat clear but lacks focus or depth in insights and recommendations. PowerPoint slides are functional but lack polish or are not visually appealing, requiring frequent formatting corrections.",
          "3": "Meet expectations: Writing is clear, concise, and relevant to the audience. Recommendations are practical and actionable. PowerPoint slides are well-structured with minimal formatting errors and are visually appealing.",
          "4": "Above expectations: Writing is sharp, engaging, and tailored to the audience’s needs. Recommendations are insightful and aligned with strategic objectives. PowerPoint slides are consistently visually polished, with minimal edits required.",
          "5": "Outstanding: Writing is compelling, insightful, and perfectly aligned with the audience’s perspective. Recommendations are high-impact and clearly articulated. PowerPoint slides are visually stunning, with no formatting issues, and convey the message effectively with creativity and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 6
      },
      {
        "id": "consultant-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Clear, concise, and confident verbal communication, adjusting style for audience and answering questions clearly and succinctly",
        "rubric": {
          "1": "Unsatisfactory: Struggles to communicate clearly or concisely. Frequently lacks confidence, and the style is not adjusted for the audience. Responses to questions are unclear or incomplete.",
          "2": "Below expectations: Communication is somewhat clear but may lack confidence or conciseness. Style is inconsistent with the audience’s needs. Answers to questions are sometimes unclear or require further elaboration.",
          "3": "Meet expectations: Communicates clearly and confidently most of the time, adjusting style for different audiences. Answers questions concisely and effectively, providing relevant information.",
          "4": "Above expectations: Consistently communicates with clarity, confidence, and precision. Adjusts style seamlessly to fit the audience. Responses to questions are direct, thorough, and easy to understand.",
          "5": "Outstanding: Masterful communicator. Always clear, concise, and confident, effortlessly adjusting style for any audience. Responses to questions are succinct, insightful, and leave no room for ambiguity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 7
      },
      {
        "id": "consultant-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Structure a project plan for a workstream. Define / prioritise analyses and data needed",
        "rubric": {
          "1": "Unsatisfactory: Struggles to create a coherent project plan or identify necessary tasks. Lacks the ability to prioritize analyses or data, often missing key elements. Requires frequent guidance to structure work effectively.",
          "2": "Below expectations: Attempts to structure a project plan but often overlooks key elements or creates plans that lack clarity. Prioritization of analyses and data is inconsistent, and deadlines are frequently missed.",
          "3": "Meet expectations: Structures a clear, actionable project plan for a workstream, identifying key tasks and deadlines. Defines and prioritizes analyses and data in a way that supports the workstream’s goals and timelines.",
          "4": "Above expectations: Creates highly detailed and well-organized project plans. Prioritizes analyses and data with foresight, ensuring that key tasks are addressed promptly and in alignment with the workstream’s strategic objectives.",
          "5": "Outstanding: Expertly structures comprehensive, efficient project plans with a clear timeline and well-defined priorities. Anticipates data needs and analysis requirements ahead of time, ensuring smooth execution and optimal results."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 8
      },
      {
        "id": "consultant-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Manage self (work life balance) and raise warning to managers if difficulties are encountered",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage work-life balance, often working excessive hours or neglecting personal well-being. Avoids raising concerns to managers, leading to burnout or unmet expectations.",
          "2": "Below expectations: Often struggles with managing work-life balance, sometimes leading to stress or delays. Occasionally raises concerns to managers, but tends to wait too long before seeking help or guidance.",
          "3": "Meet expectations: Manages work-life balance effectively and proactively addresses any difficulties with work or personal responsibilities. Raises concerns to managers in a timely manner when challenges arise.",
          "4": "Above expectations: Demonstrates strong self-management skills, balancing work and personal life well. Actively raises any concerns with managers before they become major issues, and takes appropriate actions to maintain well-being.",
          "5": "Outstanding: Exemplifies exceptional self-management, maintaining an ideal work-life balance even during high-pressure periods. Anticipates potential difficulties and raises concerns proactively, ensuring smooth operations and personal well-being."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 9
      },
      {
        "id": "consultant-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Work directly with clients and contribute actively in client meetings \n\nContribute ideas to project beyond your workstream",
        "rubric": {
          "1": "Unsatisfactory: Rarely interacts with clients or contributes in client meetings. Limited or no ideas are shared beyond the immediate workstream, leaving the broader project scope unaddressed.",
          "2": "Below expectations: Occasionally participates in client meetings but struggles to engage actively or offer valuable insights. Ideas are often limited to the workstream and do not contribute to the wider project.",
          "3": "Meet expectations: Regularly contributes to client meetings with relevant insights and ideas. Actively collaborates beyond the immediate workstream and contributes effectively to the overall project.",
          "4": "Above expectations: Frequently engages in client meetings with clear, actionable ideas and insights. Proactively contributes ideas and solutions beyond the workstream, adding value to the broader project and client relationship.",
          "5": "Outstanding: Takes a lead role in client meetings, consistently offering innovative ideas and solutions. Contributes meaningfully beyond the workstream, often influencing the overall direction of the project and strengthening the client relationship."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 10
      },
      {
        "id": "consultant-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Familiar with at least 2 of Singulier's practice areas, either through training or project experience",
        "rubric": {
          "1": "Unsatisfactory: Unfamiliar with Singulier’s practice areas. Has little to no exposure to the relevant areas, and lacks the ability to contribute meaningfully to related projects.",
          "2": "Below expectations: Has basic exposure to one practice area but lacks practical experience in applying it. Limited understanding of a second practice area, with gaps in knowledge and application.",
          "3": "Meet expectations: Familiar with two of Singulier's practice areas, either through training or project experience. Can apply knowledge and contribute to projects in a meaningful way.",
          "4": "Above expectations: Demonstrates strong familiarity with two practice areas and can independently contribute to projects within those areas. Proactively seeks to deepen knowledge and apply it effectively.",
          "5": "Outstanding: Expertly familiar with multiple practice areas, with a deep understanding gained through both training and hands-on project experience. Actively applies knowledge across a broad range of projects, often leading initiatives in those areas."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 11
      },
      {
        "id": "consultant-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Use basic tools (e.g. think cell, 1-2 digital tools) and gather data",
        "rubric": {
          "1": "Unsatisfactory: Struggles to use basic tools or digital software. Needs continuous guidance to navigate even simple tasks. Data gathering is incomplete or inaccurate.",
          "2": "Below expectations: Uses basic tools with limited effectiveness. Has some difficulty navigating digital tools and often requires assistance. Data gathering is inconsistent or incomplete.",
          "3": "Meet expectations: Proficient with basic tools (e.g., Think Cell) and uses them effectively for data gathering. Can perform standard tasks with minimal guidance.",
          "4": "Above expectations: Works efficiently with a variety of digital tools, applying them independently to gather and analyze data. Can create well-organized outputs and handle more advanced functions.",
          "5": "Outstanding: Expert user of tools, including advanced features. Efficiently gathers and analyzes data, and leverages digital tools to enhance productivity and quality of output. Identifies opportunities to optimize tool usage."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 12
      },
      {
        "id": "consultant-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Open to all types of projects",
        "rubric": {
          "1": "Unsatisfactory: Hesitant or resistant to taking on new or unfamiliar projects. Prefers to work on only well-defined or familiar tasks.",
          "2": "Below expectations: Willing to work on new projects but lacks enthusiasm or frequently struggles with unfamiliar tasks. Needs encouragement to step outside comfort zones.",
          "3": "Meet expectations: Open to a variety of projects. Willing to take on new challenges and adapt to different types of tasks with reasonable comfort and success.",
          "4": "Above expectations: Actively seeks out diverse project experiences. Approaches new challenges with enthusiasm and shows adaptability across various project types.",
          "5": "Outstanding: Thrives in any project environment. Proactively takes on diverse and complex projects, bringing innovative approaches and consistently delivering results. Encourages and supports others to embrace new challenges."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 13
      },
      {
        "id": "consultant-singulier-spirit-business-development-and-proposals-and-offers",
        "pillar": "Singulier Spirit",
        "title": "Business Development & Proposals and Offers",
        "definition": "Contribute to a proposal",
        "rubric": {
          "1": "Unsatisfactory: Struggles to contribute to proposals. Has limited understanding of the proposal requirements and provides minimal or irrelevant input. Requires constant support from senior team members.",
          "2": "Below expectations: Can contribute to proposals but with limited scope. Input is basic or lacks alignment with the proposal’s objectives. Needs frequent revisions or guidance from others.",
          "3": "Meet expectations: Actively contributes to proposals by providing relevant ideas, insights, or content. Understands the requirements and delivers input that supports the proposal’s overall objectives.",
          "4": "Above expectations: Regularly contributes high-quality input to proposals, demonstrating strong understanding of client needs and proposal goals. Offers valuable insights that strengthen the proposal and address key issues effectively.",
          "5": "Outstanding: Takes an active leadership role in proposal development. Provides strategic insights and innovative ideas that significantly enhance the proposal. Anticipates client needs and ensures all aspects of the proposal align perfectly with the objectives."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 14
      },
      {
        "id": "consultant-singulier-spirit-internal-contribution",
        "pillar": "Singulier Spirit",
        "title": "Internal Contribution",
        "definition": "Support recruitment of interns (e.g. interviews)",
        "rubric": {
          "1": "Unsatisfactory: Does not contribute to the recruitment process. Lacks involvement in interviews or the screening process, showing little initiative to support recruitment efforts.",
          "2": "Below expectations: Participates in some aspects of the recruitment process but requires significant guidance and lacks confidence during interviews. Contributions are limited and not consistently valuable.",
          "3": "Meet expectations: Actively participates in the recruitment process, including conducting interviews. Provides constructive feedback on candidates and contributes positively to the selection process.",
          "4": "Above expectations: Plays a proactive role in the recruitment process, effectively conducting interviews and assessing candidates. Provides insightful feedback and helps to improve the overall recruitment strategy.",
          "5": "Outstanding: Takes a leadership role in recruitment, from organizing interviews to making strategic recommendations on candidates. Contributes significantly to attracting top talent and continuously improving the recruitment process."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 15
      },
      {
        "id": "consultant-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Consultants",
        "sourceRow": 16
      }
    ]
  },
  {
    "roleKey": "Senior Consultant",
    "displayName": "Senior Consultant end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Senior Consultants",
    "competencies": [
      {
        "id": "senior-consultant-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Structure problems & develop hypotheses independently \n\nIdentify data required & proactively gather data for workstream",
        "rubric": {
          "1": "Unsatisfactory: Struggles to break down complex problems. Needs constant guidance to develop hypotheses and often misses key data requirements. Does not proactively gather data, resulting in incomplete or flawed analysis.",
          "2": "Below expectations: Attempts to structure problems but often lacks clarity or overlooks key elements. Can develop basic hypotheses with support but needs regular guidance to identify and collect necessary data.",
          "3": "Meet expectations: Independently structures problems and develops logical hypotheses with minimal support. Identifies and gathers relevant data for the workstream in a timely manner.",
          "4": "Above expectations: Consistently structures complex problems and develops clear, actionable hypotheses independently. Anticipates data requirements and proactively collects data, addressing gaps before they become issues.",
          "5": "Outstanding: Masterfully structures ambiguous or complex problems and develops innovative, high-impact hypotheses. Anticipates and gathers all necessary data efficiently, often going beyond expectations to ensure thorough analysis."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 2
      },
      {
        "id": "senior-consultant-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Coach others on quantitative analysis",
        "rubric": {
          "1": "Unsatisfactory: Lacks the expertise or communication skills to coach others effectively. Struggles to explain concepts clearly and may unintentionally mislead or confuse.",
          "2": "Below expectations: Attempts to support others but provides limited guidance. Coaching is inconsistent or lacks depth, and others may not significantly improve under their guidance.",
          "3": "Meet expectations: Coaches peers effectively on quantitative topics, providing clear explanations and helpful feedback. Can identify mistakes and help others troubleshoot issues.",
          "4": "Above expectations: Regularly and proactively coaches others with clarity and patience. Elevates the skills of teammates by explaining not just the “how” but the “why,” leading to stronger team-wide quantitative capability.",
          "5": "Outstanding: A go-to expert and natural mentor for all things quantitative. Coaches others with impact, inspires confidence, and significantly levels up the analytical skillset of the broader team."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 3
      },
      {
        "id": "senior-consultant-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Provide insights and recommendations at macro client level, looking beyond workstream. \n\nBalance attention to detail with macro perspective. Make complex topics simple.",
        "rubric": {
          "1": "Unsatisfactory: Struggles to connect workstream findings to broader client context. Insights are narrow, unclear, or overly detailed without strategic relevance. Has difficulty simplifying complex issues.",
          "2": "Below expectations: Makes some effort to link workstream insights to client-level issues but misses key strategic angles. Explanations may be too detailed or vague, with limited simplification of complex topics.",
          "3": "Meet expectations: Provides clear, relevant recommendations that connect workstream findings to client’s broader goals. Balances detail with big-picture thinking, and communicates complex ideas in a reasonably simple way.",
          "4": "Above expectations: Consistently delivers client-level insights that are strategic, actionable, and well-connected to broader objectives. Effectively distills complexity into simple, compelling messages.",
          "5": "Outstanding: Thinks and communicates like a trusted advisor. Seamlessly bridges the detail with the big picture, simplifying complexity with elegance and delivering insights that shape client decisions at the highest level."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 4
      },
      {
        "id": "senior-consultant-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Define a blank storyline structure and write a clear executive summary for a workstream",
        "rubric": {
          "1": "Unsatisfactory: Struggles to define a coherent storyline. Executive summaries are unclear, incomplete, or misaligned with the workstream’s findings. Requires heavy guidance to create even a basic narrative.",
          "2": "Below expectations: Attempts to build a storyline but it lacks clarity or logical flow. Executive summaries touch on key points but miss the mark in terms of precision, impact, or structure.",
          "3": "Meet expectations: Can define a basic but logical storyline from scratch and write a clear executive summary that reflects the workstream’s core insights and conclusions.",
          "4": "Above expectations: Structures storylines effectively to guide the reader through complex information. Executive summaries are sharp, insightful, and tailored to the audience. Adds clear narrative value to the deliverable.",
          "5": "Outstanding: Crafts compelling storylines from a blank page, weaving data and insights into a clear, persuasive narrative. Executive summaries are concise, strategic, and memorable—often client-ready on the first draft."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 5
      },
      {
        "id": "senior-consultant-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write insights & recommendations relevant to the audience \n\nCreate visually appealing ppt slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear or overly complex, with little focus on the audience. Recommendations are weak or irrelevant. PowerPoint slides are cluttered, poorly formatted, and require significant edits to be presentable.",
          "2": "Below expectations: Writing is somewhat clear but lacks focus or depth in insights and recommendations. PowerPoint slides are functional but lack polish or are not visually appealing, requiring frequent formatting corrections.",
          "3": "Meet expectations: Writing is clear, concise, and relevant to the audience. Recommendations are practical and actionable. PowerPoint slides are well-structured with minimal formatting errors and are visually appealing.",
          "4": "Above expectations: Writing is sharp, engaging, and tailored to the audience’s needs. Recommendations are insightful and aligned with strategic objectives. PowerPoint slides are consistently visually polished, with minimal edits required.",
          "5": "Outstanding: Writing is compelling, insightful, and perfectly aligned with the audience’s perspective. Recommendations are high-impact and clearly articulated. PowerPoint slides are visually stunning, with no formatting issues, and convey the message effectively with creativity and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 6
      },
      {
        "id": "senior-consultant-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Clear, concise, and confident verbal communication, adjusting style for audience and answering questions clearly and succinctly",
        "rubric": {
          "1": "Unsatisfactory: Struggles to communicate clearly or concisely. Frequently lacks confidence, and the style is not adjusted for the audience. Responses to questions are unclear or incomplete.",
          "2": "Below expectations: Communication is somewhat clear but may lack confidence or conciseness. Style is inconsistent with the audience’s needs. Answers to questions are sometimes unclear or require further elaboration.",
          "3": "Meet expectations: Communicates clearly and confidently most of the time, adjusting style for different audiences. Answers questions concisely and effectively, providing relevant information.",
          "4": "Above expectations: Consistently communicates with clarity, confidence, and precision. Adjusts style seamlessly to fit the audience. Responses to questions are direct, thorough, and easy to understand.",
          "5": "Outstanding: Masterful communicator. Always clear, concise, and confident, effortlessly adjusting style for any audience. Responses to questions are succinct, insightful, and leave no room for ambiguity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 7
      },
      {
        "id": "senior-consultant-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Structure a project plan for a workstream. Define / prioritise analyses and data needed",
        "rubric": {
          "1": "Unsatisfactory: Struggles to create a coherent project plan or identify necessary tasks. Lacks the ability to prioritize analyses or data, often missing key elements. Requires frequent guidance to structure work effectively.",
          "2": "Below expectations: Attempts to structure a project plan but often overlooks key elements or creates plans that lack clarity. Prioritization of analyses and data is inconsistent, and deadlines are frequently missed.",
          "3": "Meet expectations: Structures a clear, actionable project plan for a workstream, identifying key tasks and deadlines. Defines and prioritizes analyses and data in a way that supports the workstream’s goals and timelines.",
          "4": "Above expectations: Creates highly detailed and well-organized project plans. Prioritizes analyses and data with foresight, ensuring that key tasks are addressed promptly and in alignment with the workstream’s strategic objectives.",
          "5": "Outstanding: Expertly structures comprehensive, efficient project plans with a clear timeline and well-defined priorities. Anticipates data needs and analysis requirements ahead of time, ensuring smooth execution and optimal results."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 8
      },
      {
        "id": "senior-consultant-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Play active role in creating a positive environment, including coaching and motivating the team",
        "rubric": {
          "1": "Unsatisfactory: Displays negative or disengaged behaviour that may impact team morale. Does not support or motivate others and is absent from team-building efforts.",
          "2": "Below expectations: Generally well-intentioned but rarely contributes to team morale. Coaching or encouragement is sporadic or passive, with minimal positive influence on the team environment.",
          "3": "Meet expectations: Maintains a consistently positive and professional attitude. Supports colleagues, encourages collaboration, and contributes to a healthy team atmosphere. Provides helpful feedback or guidance when asked.",
          "4": "Above expectations: Actively promotes a positive, inclusive, and motivating environment. Coaches others with empathy and initiative, and energizes the team, especially during high-pressure moments.",
          "5": "Outstanding: Sets the tone for a thriving team culture. Inspires, coaches, and motivates consistently. A key pillar of team morale—people perform better and feel more supported with them on board."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 9
      },
      {
        "id": "senior-consultant-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Present to and maintain relationships with mid-level clients (e.g. CMO) in a project \n\nIndependently lead and facilitate effective client meetings",
        "rubric": {
          "1": "Unsatisfactory: Avoids or struggles in direct client interactions. Fails to build rapport or credibility, and cannot lead meetings without significant support.",
          "2": "Below expectations: Interacts with clients but inconsistently. Presentations lack clarity or impact, and meetings are not well-facilitated without guidance. Relationship-building is limited.",
          "3": "Meet expectations: Can independently lead client meetings with mid-level stakeholders. Presents clearly, maintains professional relationships, and ensures meetings are productive.",
          "4": "Above expectations: Builds strong, trust-based relationships with clients. Leads meetings confidently and smoothly, ensuring alignment and value delivery at every step.",
          "5": "Outstanding: Trusted advisor to mid-level clients. Leads client meetings with presence and impact, often shaping agendas and influencing direction. Builds long-lasting, strategic client relationships."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 10
      },
      {
        "id": "senior-consultant-dare-and-care-project-leadership",
        "pillar": "Dare & Care",
        "title": "Project Leadership",
        "definition": "Play a manager role on at least one project, including reviewing slides\n\nMentor a analyst or consultant and / or manage an intern \n\nManage expert input",
        "rubric": {
          "1": "Unsatisfactory: Struggles to take ownership of project components. Does not effectively manage junior team members or expert input. Requires constant oversight and fails to ensure quality deliverables.",
          "2": "Below expectations: Takes on some project responsibilities but inconsistently reviews work or supports the team. Mentorship is reactive, and engagement with experts is disorganized or unclear.",
          "3": "Meet expectations: Manages a project workstream competently, including slide reviews and timeline tracking. Supports and mentors junior team members, and effectively coordinates expert contributions.",
          "4": "Above expectations: Leads workstreams proactively and ensures high-quality outputs. Provides thoughtful, growth-oriented mentorship. Manages expert input efficiently and integrates it meaningfully into project deliverables.",
          "5": "Outstanding: Demonstrates full ownership of project leadership. Trusted to deliver independently with strong team management. Coaches with impact and manages experts strategically, enhancing the quality and credibility of work."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 11
      },
      {
        "id": "senior-consultant-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Familiar with all of Singulier's practice areas, either through training or project experience*",
        "rubric": {
          "1": "Unsatisfactory: Lacks awareness of Singulier’s key practice areas. Cannot connect project work to broader capabilities or industry context.",
          "2": "Below expectations: Familiar with only one or two practice areas, with limited depth or application. Unable to confidently navigate or contribute across different verticals.",
          "3": "Meet expectations: Understands and can articulate all practice areas at a basic level. Has applied knowledge in at least a few areas, either through training or project involvement.",
          "4": "Above expectations: Demonstrates strong working knowledge of all practice areas, with practical exposure to most. Moves confidently between topics and contributes strategically across verticals.",
          "5": "Outstanding: Deeply familiar with all practice areas. Seen as a connector across domains, proactively bringing the right expertise into projects. Enhances team impact by integrating cross-practice thinking."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 12
      },
      {
        "id": "senior-consultant-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Able to use multiple digital tools (e.g. Holis Market & Competition, EuroMonitor, Media tools)",
        "rubric": {
          "1": "Unsatisfactory: Struggles to use basic digital tools independently. Avoids or misuses platforms, often requiring others to step in.",
          "2": "Below expectations: Has basic proficiency in one or two tools, but usage is limited or inefficient. Needs regular help to access or interpret outputs.",
          "3": "Meet expectations: Can effectively use several core digital tools (e.g. Holis, EuroMonitor) to gather and analyze relevant information with minimal guidance.",
          "4": "Above expectations: Proficient in a broad range of tools and uses them proactively to add insight and value. Often helps others troubleshoot or improve their tool usage.",
          "5": "Outstanding: Power user and informal go-to person for digital tools. Uses tools strategically to generate deep insights, trains others, and regularly introduces new tools or smarter ways of working."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 13
      },
      {
        "id": "senior-consultant-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Successful experience on both DDs & Transformation projects\n\nLead multiple workstreams",
        "rubric": {
          "1": "Unsatisfactory: Has limited project exposure. No substantial experience in either DD or Transformation. Struggles to take ownership or drive progress across workstreams.",
          "2": "Below expectations: Some exposure to DD or Transformation projects but not both. Has led tasks within a workstream, but lacks experience managing multiple streams or delivering under pressure.",
          "3": "Meet expectations: Has worked successfully on both DD and Transformation projects. Capable of leading a workstream with clear outputs and timelines.",
          "4": "Above expectations: Demonstrates solid experience across DD and Transformation. Has independently led multiple workstreams, delivering quality outcomes across diverse project types.",
          "5": "Outstanding: Highly versatile across project types, seamlessly switching between DD and Transformation. Regularly leads several workstreams with impact, drives cross-workstream alignment, and ensures strategic consistency across deliverables."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 14
      },
      {
        "id": "senior-consultant-singulier-spirit-business-development-and-proposals-and-offers",
        "pillar": "Singulier Spirit",
        "title": "Business Development & Proposals and Offers",
        "definition": "Write a proposal with guidance",
        "rubric": {
          "1": "Unsatisfactory: Struggles to contribute meaningfully to proposals. Lacks understanding of client context or value proposition, and needs significant rework.",
          "2": "Below expectations: Contributes basic content but lacks structure, clarity, or client focus. Requires heavy guidance to develop a coherent, client-relevant proposal.",
          "3": "Meet expectations: Can draft sections of a proposal with guidance. Understands the client’s needs, ensures alignment with Singulier’s offer, and contributes to a solid, well-structured draft.",
          "4": "Above expectations: Writes persuasive, tailored proposal content with limited support. Connects client pain points with Singulier’s capabilities effectively and enhances proposal quality.",
          "5": "Outstanding: Shapes and writes compelling proposals almost independently. Demonstrates deep commercial acumen and strategic positioning, often influencing the overall pitch approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 15
      },
      {
        "id": "senior-consultant-singulier-spirit-internal-contribution",
        "pillar": "Singulier Spirit",
        "title": "Internal Contribution",
        "definition": "Some level of office contribution (e.g. interviews, presentations, social event organization)",
        "rubric": {
          "1": "Unsatisfactory: Shows little to no involvement in internal activities. Does not contribute to office events or team-building efforts.",
          "2": "Below expectations: Participates minimally in internal activities. May contribute occasionally but lacks initiative or consistency in engaging with the office or team.",
          "3": "Meet expectations: Actively participates in internal activities such as interviews or social events. Provides useful input in presentations and is generally reliable in supporting office initiatives.",
          "4": "Above expectations: Frequently takes the lead in organizing or contributing to internal events. Regularly presents or contributes to interviews, building a positive internal environment.",
          "5": "Outstanding: A driving force behind internal initiatives. Actively organizes events, presents confidently, and fosters a strong sense of community within the office. Frequently motivates others to get involved."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 16
      },
      {
        "id": "senior-consultant-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Consultants",
        "sourceRow": 17
      }
    ]
  },
  {
    "roleKey": "Manager",
    "displayName": "Manager end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Managers",
    "competencies": [
      {
        "id": "manager-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Support & challenge teams in structuring problems and using hypothesis-driven approach",
        "rubric": {
          "1": "Unsatisfactory: Does not effectively support teams in problem structuring. Provides little challenge or added value, often defaulting to reactive or tactical inputs.",
          "2": "Below expectations: Occasionally contributes ideas but struggles to guide teams through structured thinking. Challenges may lack clarity or depth.",
          "3": "Meet expectations: Supports teams in framing problems clearly and encourages a hypothesis-driven mindset. Can guide conversations to more structured approaches when needed.",
          "4": "Above expectations: Proactively helps teams structure complex problems and consistently brings a hypothesis-driven approach. Challenges assumptions constructively to improve clarity and focus.",
          "5": "Outstanding: Acts as a strategic sounding board for teams. Instinctively identifies the right problem structure and guides others to refine hypotheses. Pushes thinking to a higher level with rigor and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 2
      },
      {
        "id": "manager-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Support and review analyses of others to ensure work is client-ready",
        "rubric": {
          "1": "Unsatisfactory: Lacks the ability or attention to effectively review others’ analyses. Misses key errors or inconsistencies, resulting in low-quality outputs.",
          "2": "Below expectations: Provides some review, but feedback is superficial or inconsistent. Misses opportunities to improve accuracy or clarity of analysis.",
          "3": "Meet expectations: Reviews others’ work competently, identifies key issues, and helps refine outputs to a client-ready standard. Provides clear, actionable feedback.",
          "4": "Above expectations: Enhances the quality of team analyses through thorough reviews and insightful suggestions. Raises the bar on both technical accuracy and business relevance.",
          "5": "Outstanding: Trusted as a final reviewer for critical analysis. Elevates the team’s analytical thinking and ensures outputs are not only accurate but strategically compelling and presentation-ready."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 3
      },
      {
        "id": "manager-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Develop exec-level value-added insights and recommended actions across project and beyond \n\nSupport team to develop value-added insights and ensure relevance of overall team recommendations",
        "rubric": {
          "1": "Unsatisfactory: Struggles to synthesize key findings or link them to actionable recommendations. Provides little support to the team in this area.",
          "2": "Below expectations: Makes observations but lacks depth or alignment with client priorities. Team recommendations lack coherence or strategic relevance.",
          "3": "Meet expectations: Synthesizes insights effectively and provides relevant recommendations. Supports the team to ensure overall conclusions are clear and useful to clients.",
          "4": "Above expectations: Consistently delivers high-impact, exec-level insights and sharp recommendations. Proactively challenges the team to refine thinking and align with client objectives.",
          "5": "Outstanding: Shapes the strategic narrative across the project. Delivers crisp, senior-level insights that often shift client perspectives. A force multiplier for the team’s ability to generate high-value, actionable recommendations."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 4
      },
      {
        "id": "manager-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Define a blank storyline structure and write an executive summary across a project (multiple workstreams) with support",
        "rubric": {
          "1": "Unsatisfactory: Struggles to create a coherent storyline. Executive summaries are unclear, incomplete, or disconnected from project objectives. Requires heavy rework.",
          "2": "Below expectations: Attempts to define a storyline, but it lacks logical flow or completeness. Summaries are too detailed or too vague to be useful to a senior audience.",
          "3": "Meet expectations: Can structure a storyline from scratch with support. Drafts clear, relevant executive summaries that reflect key messages across workstreams.",
          "4": "Above expectations: Designs compelling storylines with limited guidance. Summaries are crisp, high-level, and aligned with the client’s strategic lens. Connects workstreams into a cohesive narrative.",
          "5": "Outstanding: Shapes powerful storylines that elevate the project’s impact. Crafts executive summaries that resonate with senior stakeholders and drive decision-making. Coaches others to improve clarity and flow."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 5
      },
      {
        "id": "manager-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write insights & recommendations relevant to the audience \n\nCreate visually appealing ppt slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear or overly complex, with little focus on the audience. Recommendations are weak or irrelevant. PowerPoint slides are cluttered, poorly formatted, and require significant edits to be presentable.",
          "2": "Below expectations: Writing is somewhat clear but lacks focus or depth in insights and recommendations. PowerPoint slides are functional but lack polish or are not visually appealing, requiring frequent formatting corrections.",
          "3": "Meet expectations: Writing is clear, concise, and relevant to the audience. Recommendations are practical and actionable. PowerPoint slides are well-structured with minimal formatting errors and are visually appealing.",
          "4": "Above expectations: Writing is sharp, engaging, and tailored to the audience’s needs. Recommendations are insightful and aligned with strategic objectives. PowerPoint slides are consistently visually polished, with minimal edits required.",
          "5": "Outstanding: Writing is compelling, insightful, and perfectly aligned with the audience’s perspective. Recommendations are high-impact and clearly articulated. PowerPoint slides are visually stunning, with no formatting issues, and convey the message effectively with creativity and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 6
      },
      {
        "id": "manager-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Present others' work with confidence",
        "rubric": {
          "1": "Unsatisfactory: Struggles to clearly convey information. Presentation lacks structure, confidence, or understanding of the content.",
          "2": "Below expectations: Can present but is hesitant or overly reliant on notes. Misses key messages or fails to adapt delivery to the audience.",
          "3": "Meet expectations: Delivers others’ work clearly and with sufficient confidence. Demonstrates good understanding of the content and answers basic questions effectively.",
          "4": "Above expectations: Presents others’ work smoothly, with clarity and poise. Adapts tone and focus to audience needs and reinforces key messages with impact.",
          "5": "Outstanding: Presents with conviction and presence, as if the work were their own. Handles challenging questions with ease, adds value through framing, and inspires confidence in senior audiences."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 7
      },
      {
        "id": "manager-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Structure a project plan for a project (multiple workstreams) and manage to plan, including regular project updates and meetings",
        "rubric": {
          "1": "Unsatisfactory: Struggles to structure a coherent plan or track progress. Work is often reactive, and project momentum is inconsistent or unclear.",
          "2": "Below expectations: Drafts a basic plan but misses key dependencies or deliverables. Project updates and coordination are sporadic or unclear.",
          "3": "Meet expectations: Builds a solid project plan across multiple workstreams and manages it reliably. Holds regular updates and ensures progress is tracked and issues escalated.",
          "4": "Above expectations: Plans proactively and adjusts the structure as needed. Anticipates risks, keeps meetings purposeful, and ensures clear communication across teams.",
          "5": "Outstanding: Orchestrates complex projects seamlessly. Maintains strong alignment across streams, drives accountability, and communicates progress like a pro. A role model for project management discipline and agility."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 8
      },
      {
        "id": "manager-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Consistently exhibit positive leadership for teams and professionalism associated with a leadership position. Lead by example",
        "rubric": {
          "1": "Unsatisfactory: Demonstrates inconsistent behavior and lacks reliability or self-awareness. Can undermine team morale or professionalism through poor conduct.",
          "2": "Below expectations: Tries to set a good example but occasionally lapses in consistency, motivation, or professional demeanor. Influence on team is limited.",
          "3": "Meet expectations: Behaves professionally and reliably. Sets a solid example for others and contributes positively to team morale and culture.",
          "4": "Above expectations: Acts as a steady, motivating presence. Demonstrates maturity and resilience, encourages others, and reinforces team professionalism through their own conduct.",
          "5": "Outstanding: Embodies leadership through action. Inspires others by consistently showing integrity, ownership, and emotional intelligence. Creates a culture of trust, excellence, and positivity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 9
      },
      {
        "id": "manager-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Present to and maintain relationships with senior clients (e.g. CMO) in a project \n\nUnderstand and respond to clients' strategic challenges \n\nEffectively lead internal team meetings",
        "rubric": {
          "1": "Unsatisfactory: Avoids client exposure or struggles to engage meaningfully. Fails to grasp strategic context. Internal meetings lack structure or impact.",
          "2": "Below expectations: Interacts with clients but lacks confidence or clarity. Understands some client needs but doesn’t connect them to the bigger picture. Team leadership is inconsistent.",
          "3": "Meet expectations: Engages competently with senior clients and manages internal team meetings well. Understands client challenges and contributes relevant ideas.",
          "4": "Above expectations: Builds strong rapport with senior stakeholders and adapts communication style effectively. Anticipates client needs and leads internal meetings with purpose and clarity.",
          "5": "Outstanding: Trusted advisor to senior clients. Navigates complex strategic conversations with ease. Internally, creates alignment, energy, and momentum through high-quality leadership and communication."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 10
      },
      {
        "id": "manager-dare-and-care-project-leadership",
        "pillar": "Dare & Care",
        "title": "Project Leadership",
        "definition": "Manage a large team (e.g. provide clear guidance, steer timely delivery) with multiple workstreams with positive feedback \n\nPrioritize work and ensure team (including manager) has appropriate work life balance",
        "rubric": {
          "1": "Unsatisfactory: Lacks control over the team or delivery. Provides unclear direction. Team morale and workload are poorly managed, leading to burnout or missed deadlines.",
          "2": "Below expectations: Tries to manage the team but struggles with prioritization, delegation, or delivery tracking. Team guidance is inconsistent. Workload distribution can feel unbalanced.",
          "3": "Meet expectations: Manages multiple workstreams and a diverse team with competence. Ensures delivery while keeping workload realistic. Feedback from team is generally positive.",
          "4": "Above expectations: Leads with clarity, structure, and empathy. Balances quality delivery with team well-being. Proactively supports and motivates the team, including the manager.",
          "5": "Outstanding: A natural leader who runs complex projects seamlessly. Provides strategic direction, removes blockers, and sets a high-performance culture that’s also sustainable. Widely respected by both team and clients."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 11
      },
      {
        "id": "manager-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Familiar with all of Singulier's practice areas, either through training or project experience*",
        "rubric": {
          "1": "Unsatisfactory: Lacks awareness of Singulier’s key practice areas. Cannot connect project work to broader capabilities or industry context.",
          "2": "Below expectations: Familiar with only one or two practice areas, with limited depth or application. Unable to confidently navigate or contribute across different verticals.",
          "3": "Meet expectations: Understands and can articulate all practice areas at a basic level. Has applied knowledge in at least a few areas, either through training or project involvement.",
          "4": "Above expectations: Demonstrates strong working knowledge of all practice areas, with practical exposure to most. Moves confidently between topics and contributes strategically across verticals.",
          "5": "Outstanding: Deeply familiar with all practice areas. Seen as a connector across domains, proactively bringing the right expertise into projects. Enhances team impact by integrating cross-practice thinking."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 12
      },
      {
        "id": "manager-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Able to use multiple digital tools (e.g. Holis Market & Competition, EuroMonitor, Media tools)",
        "rubric": {
          "1": "Unsatisfactory: Struggles to use basic digital tools independently. Avoids or misuses platforms, often requiring others to step in.",
          "2": "Below expectations: Has basic proficiency in one or two tools, but usage is limited or inefficient. Needs regular help to access or interpret outputs.",
          "3": "Meet expectations: Can effectively use several core digital tools (e.g. Holis, EuroMonitor) to gather and analyze relevant information with minimal guidance.",
          "4": "Above expectations: Proficient in a broad range of tools and uses them proactively to add insight and value. Often helps others troubleshoot or improve their tool usage.",
          "5": "Outstanding: Power user and informal go-to person for digital tools. Uses tools strategically to generate deep insights, trains others, and regularly introduces new tools or smarter ways of working."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 13
      },
      {
        "id": "manager-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Manage both DD and transformation projects (Business Strategy only)",
        "rubric": {
          "1": "Unsatisfactory: Has not yet managed a full project or lacks exposure to either DD or Transformation contexts. Relies heavily on direction for project flow.",
          "2": "Below expectations: Has supported both project types but struggled when leading. Lacks consistency in structuring, pacing, or driving outcomes.",
          "3": "Meet expectations: Has successfully led both DD and Transformation projects. Demonstrates solid understanding of their distinct rhythms, scopes, and expectations.",
          "4": "Above expectations: Confidently manages both DD and Transformation with minimal oversight. Adapts leadership style to project type and delivers strong outcomes across formats.",
          "5": "Outstanding: A go-to leader for both DD and Transformation. Brings strategic clarity and flawless execution across different project types. Elevates project performance and team cohesion regardless of scope or pressure."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 14
      },
      {
        "id": "manager-singulier-spirit-business-development-and-proposals-and-offers",
        "pillar": "Singulier Spirit",
        "title": "Business Development & Proposals and Offers",
        "definition": "Write a client-ready proposal with minimal partner support",
        "rubric": {
          "1": "Unsatisfactory: Struggles to structure or write a coherent proposal. Requires significant revisions and heavy guidance. The proposal lacks alignment with client needs and expectations.",
          "2": "Below expectations: Drafts a proposal but requires extensive partner input and review. Some sections are unclear or misaligned with client objectives, needing rework.",
          "3": "Meet expectations: Can independently write a solid, client-ready proposal with minimal support. Addresses client needs and delivers clear, structured content.",
          "4": "Above expectations: Writes high-quality, client-ready proposals with minimal partner involvement. Proactively aligns the proposal with client priorities and ensures clarity and impact.",
          "5": "Outstanding: Produces exceptional, tailored proposals independently. Demonstrates strategic insight and deep understanding of client needs, crafting persuasive content that elevates the pitch."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 15
      },
      {
        "id": "manager-singulier-spirit-internal-contribution",
        "pillar": "Singulier Spirit",
        "title": "Internal Contribution",
        "definition": "Support project administration (e.g. LoA, PPFile, Staffing) with partner guidance\n\nServe as spokesperson",
        "rubric": {
          "1": "Unsatisfactory: Struggles with administrative tasks and requires constant supervision or clarification. Does not effectively communicate on behalf of the team or project.",
          "2": "Below expectations: Handles some administrative tasks but misses deadlines or lacks attention to detail. Occasionally steps in as spokesperson, but with limited effectiveness.",
          "3": "Meet expectations: Effectively supports project administration and completes tasks with minimal supervision. Can step in as spokesperson when needed, communicating key points with clarity.",
          "4": "Above expectations: Proactively manages administrative responsibilities and ensures smooth project operations. Acts as a confident and clear spokesperson, representing the project well.",
          "5": "Outstanding: Independently handles project administration efficiently. Serves as a highly effective spokesperson, representing the team and project with authority, professionalism, and impact."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 16
      },
      {
        "id": "manager-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Managers",
        "sourceRow": 17
      }
    ]
  },
  {
    "roleKey": "Senior Manager",
    "displayName": "Senior Manager end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Senior Managers",
    "competencies": [
      {
        "id": "senior-manager-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Support & challenge teams in structuring problems and using hypothesis-driven approach",
        "rubric": {
          "1": "Unsatisfactory: Does not effectively support teams in problem structuring. Provides little challenge or added value, often defaulting to reactive or tactical inputs.",
          "2": "Below expectations: Occasionally contributes ideas but struggles to guide teams through structured thinking. Challenges may lack clarity or depth.",
          "3": "Meet expectations: Supports teams in framing problems clearly and encourages a hypothesis-driven mindset. Can guide conversations to more structured approaches when needed.",
          "4": "Above expectations: Proactively helps teams structure complex problems and consistently brings a hypothesis-driven approach. Challenges assumptions constructively to improve clarity and focus.",
          "5": "Outstanding: Acts as a strategic sounding board for teams. Instinctively identifies the right problem structure and guides others to refine hypotheses. Pushes thinking to a higher level with rigor and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 2
      },
      {
        "id": "senior-manager-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Support and review analyses of others to ensure work is client-ready",
        "rubric": {
          "1": "Unsatisfactory: Lacks the ability or attention to effectively review others’ analyses. Misses key errors or inconsistencies, resulting in low-quality outputs.",
          "2": "Below expectations: Provides some review, but feedback is superficial or inconsistent. Misses opportunities to improve accuracy or clarity of analysis.",
          "3": "Meet expectations: Reviews others’ work competently, identifies key issues, and helps refine outputs to a client-ready standard. Provides clear, actionable feedback.",
          "4": "Above expectations: Enhances the quality of team analyses through thorough reviews and insightful suggestions. Raises the bar on both technical accuracy and business relevance.",
          "5": "Outstanding: Trusted as a final reviewer for critical analysis. Elevates the team’s analytical thinking and ensures outputs are not only accurate but strategically compelling and presentation-ready."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 3
      },
      {
        "id": "senior-manager-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Develop exec-level value-added insights and recommended actions across project and beyond \n\nSupport team to develop value-added insights and ensure relevance of overall team recommendations",
        "rubric": {
          "1": "Unsatisfactory: Struggles to synthesize key findings or link them to actionable recommendations. Provides little support to the team in this area.",
          "2": "Below expectations: Makes observations but lacks depth or alignment with client priorities. Team recommendations lack coherence or strategic relevance.",
          "3": "Meet expectations: Synthesizes insights effectively and provides relevant recommendations. Supports the team to ensure overall conclusions are clear and useful to clients.",
          "4": "Above expectations: Consistently delivers high-impact, exec-level insights and sharp recommendations. Proactively challenges the team to refine thinking and align with client objectives.",
          "5": "Outstanding: Shapes the strategic narrative across the project. Delivers crisp, senior-level insights that often shift client perspectives. A force multiplier for the team’s ability to generate high-value, actionable recommendations."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 4
      },
      {
        "id": "senior-manager-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Define a blank storyline structure and write a client-ready executive summary across multiple workstreams independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to create a coherent storyline. Executive summaries are disorganized or unclear, missing key messages, and require extensive rework.",
          "2": "Below expectations: Attempts to define a storyline but it lacks logical flow or clarity. Executive summaries are incomplete or misaligned with the overall project message.",
          "3": "Meet expectations: Can independently define a clear storyline and write a solid executive summary that reflects key insights across multiple workstreams. The summary is client-ready with minor revisions needed.",
          "4": "Above expectations: Structures compelling, coherent storylines with little to no guidance. Executive summaries are crisp, high-level, and aligned with client objectives, effectively synthesizing across workstreams.",
          "5": "Outstanding: Develops impactful storylines that drive the project narrative forward. Writes executive summaries that are highly polished, strategic, and client-ready, seamlessly connecting multiple workstreams and ensuring client clarity and action."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 5
      },
      {
        "id": "senior-manager-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write insights & recommendations relevant to the audience \n\nCreate visually appealing ppt slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear or overly complex, with little focus on the audience. Recommendations are weak or irrelevant. PowerPoint slides are cluttered, poorly formatted, and require significant edits to be presentable.",
          "2": "Below expectations: Writing is somewhat clear but lacks focus or depth in insights and recommendations. PowerPoint slides are functional but lack polish or are not visually appealing, requiring frequent formatting corrections.",
          "3": "Meet expectations: Writing is clear, concise, and relevant to the audience. Recommendations are practical and actionable. PowerPoint slides are well-structured with minimal formatting errors and are visually appealing.",
          "4": "Above expectations: Writing is sharp, engaging, and tailored to the audience’s needs. Recommendations are insightful and aligned with strategic objectives. PowerPoint slides are consistently visually polished, with minimal edits required.",
          "5": "Outstanding: Writing is compelling, insightful, and perfectly aligned with the audience’s perspective. Recommendations are high-impact and clearly articulated. PowerPoint slides are visually stunning, with no formatting issues, and convey the message effectively with creativity and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 6
      },
      {
        "id": "senior-manager-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Present others' work with confidence",
        "rubric": {
          "1": "Unsatisfactory: Struggles to clearly convey information. Presentation lacks structure, confidence, or understanding of the content.",
          "2": "Below expectations: Can present but is hesitant or overly reliant on notes. Misses key messages or fails to adapt delivery to the audience.",
          "3": "Meet expectations: Delivers others’ work clearly and with sufficient confidence. Demonstrates good understanding of the content and answers basic questions effectively.",
          "4": "Above expectations: Presents others’ work smoothly, with clarity and poise. Adapts tone and focus to audience needs and reinforces key messages with impact.",
          "5": "Outstanding: Presents with conviction and presence, as if the work were their own. Handles challenging questions with ease, adds value through framing, and inspires confidence in senior audiences."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 7
      },
      {
        "id": "senior-manager-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Structure a project plan for a large, complex project (e.g. multiple workstream transformation) and manage to plan. Able to turnaround a project that is not going well.",
        "rubric": {
          "1": "Unsatisfactory: Struggles to structure a comprehensive project plan or manage a complex project. Unable to identify or address issues when a project is off track.",
          "2": "Below expectations: Can structure a basic plan but struggles with complexity or identifying critical dependencies. Reactive rather than proactive when project progress falters.",
          "3": "Meet expectations: Structures a solid, clear plan for complex projects with multiple workstreams. Manages project execution to plan and can identify and address issues when the project veers off course.",
          "4": "Above expectations: Proactively structures and manages complex projects with confidence, keeping all workstreams aligned. Effectively identifies early signs of problems and initiates corrective actions to get the project back on track.",
          "5": "Outstanding: Expertly structures and manages large-scale projects. Anticipates challenges and adapts the plan accordingly. Can consistently turn around projects that are in trouble, ensuring successful outcomes even under difficult circumstances."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 8
      },
      {
        "id": "senior-manager-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Consistently exhibit positive leadership for teams and professionalism associated with a leadership position. Lead by example",
        "rubric": {
          "1": "Unsatisfactory: Demonstrates inconsistent behavior and lacks reliability or self-awareness. Can undermine team morale or professionalism through poor conduct.",
          "2": "Below expectations: Tries to set a good example but occasionally lapses in consistency, motivation, or professional demeanor. Influence on team is limited.",
          "3": "Meet expectations: Behaves professionally and reliably. Sets a solid example for others and contributes positively to team morale and culture.",
          "4": "Above expectations: Acts as a steady, motivating presence. Demonstrates maturity and resilience, encourages others, and reinforces team professionalism through their own conduct.",
          "5": "Outstanding: Embodies leadership through action. Inspires others by consistently showing integrity, ownership, and emotional intelligence. Creates a culture of trust, excellence, and positivity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 9
      },
      {
        "id": "senior-manager-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Manage client relationship day-to-day and serve as primary point of contact\n\nUnderstand client dynamics and identify who and how to influence.",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage client relationships. Limited understanding of client dynamics and does not effectively identify or engage key stakeholders.",
          "2": "Below expectations: Can manage basic client interactions but lacks depth in understanding client priorities or dynamics. Needs guidance in identifying and influencing key stakeholders.",
          "3": "Meet expectations: Manages client relationships independently on a day-to-day basis. Understands client dynamics and effectively engages with key stakeholders.",
          "4": "Above expectations: Builds strong client relationships and demonstrates a clear understanding of client priorities. Proactively identifies and influences key stakeholders to drive outcomes.",
          "5": "Outstanding: Serves as a trusted advisor and primary point of contact for clients. Expertly navigates complex client dynamics, influencing key stakeholders with a strategic approach to achieve exceptional results."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 10
      },
      {
        "id": "senior-manager-dare-and-care-project-leadership",
        "pillar": "Dare & Care",
        "title": "Project Leadership",
        "definition": "Direct analytics / insights through third parties (e.g. ventures, experts, external vendors) \n \nManage multiple teams at one time with positive feedback \n\nConsistently provide constructive feedback to teams",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage third-party relationships and does not effectively direct analytics/insights. Fails to manage multiple teams and provide constructive feedback, or feedback is unclear and unhelpful.",
          "2": "Below expectations: Directs third-party efforts but requires significant oversight. Manages multiple teams with some difficulty and provides feedback that lacks clarity or actionable advice.",
          "3": "Meet expectations: Effectively directs third-party analytics/insights and manages multiple teams. Regularly provides constructive feedback that helps teams improve and stay aligned.",
          "4": "Above expectations: Independently directs third-party analytics/insights with minimal supervision. Successfully manages multiple teams, providing clear, actionable, and supportive feedback that motivates and guides teams.",
          "5": "Outstanding: Expertly directs third-party analytics/insights and manages multiple teams seamlessly. Provides consistently constructive, insightful feedback that drives performance and growth across all teams, earning positive feedback from both internal and external stakeholders."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 11
      },
      {
        "id": "senior-manager-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Manage projects extending beyond practice of expertise (e.g. 1-2 practices)",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage projects outside their area of expertise. Lacks confidence and makes significant errors when navigating unfamiliar practices.",
          "2": "Below expectations: Can manage aspects of projects outside their core expertise but relies heavily on guidance. Limited understanding of other practices and struggles to provide meaningful insights.",
          "3": "Meet expectations: Manages projects effectively, even when they extend into unfamiliar practices. Demonstrates a solid understanding of the additional practices involved and can deliver results with some support.",
          "4": "Above expectations: Successfully leads projects that extend beyond their practice expertise. Proactively learns and applies knowledge from other practices, providing valuable insights and solutions.",
          "5": "Outstanding: Excels at managing projects across multiple practices, integrating diverse expertise effortlessly. Provides strategic leadership, blending knowledge from various practices to drive exceptional outcomes."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 12
      },
      {
        "id": "senior-manager-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Able to use multiple digital tools (e.g. Holis Market & Competition, EuroMonitor, Media tools)",
        "rubric": {
          "1": "Unsatisfactory: Struggles to use basic digital tools independently. Avoids or misuses platforms, often requiring others to step in.",
          "2": "Below expectations: Has basic proficiency in one or two tools, but usage is limited or inefficient. Needs regular help to access or interpret outputs.",
          "3": "Meet expectations: Can effectively use several core digital tools (e.g. Holis, EuroMonitor) to gather and analyze relevant information with minimal guidance.",
          "4": "Above expectations: Proficient in a broad range of tools and uses them proactively to add insight and value. Often helps others troubleshoot or improve their tool usage.",
          "5": "Outstanding: Power user and informal go-to person for digital tools. Uses tools strategically to generate deep insights, trains others, and regularly introduces new tools or smarter ways of working."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 13
      },
      {
        "id": "senior-manager-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Manage multiple projects at one time \n\nManage a complex project with multiple workstreams",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage multiple projects or fails to maintain focus on one project. Cannot handle the complexity of a project with multiple workstreams and frequently misses deadlines or deliverables.",
          "2": "Below expectations: Manages multiple projects but struggles to prioritize or allocate resources effectively. Finds it difficult to oversee a complex project with multiple workstreams and requires constant support.",
          "3": "Meet expectations: Manages multiple projects simultaneously with reasonable efficiency. Successfully leads complex projects with multiple workstreams, ensuring key deliverables are met.",
          "4": "Above expectations: Effectively manages several projects at once without compromising quality. Leads complex projects with multiple workstreams smoothly, balancing resources and priorities well.",
          "5": "Outstanding: Seamlessly manages multiple projects, navigating complexity and competing priorities with ease. Successfully leads large, multifaceted projects with multiple workstreams, delivering high-quality results on time and within scope."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 14
      },
      {
        "id": "senior-manager-singulier-spirit-business-development-and-proposals-and-offers",
        "pillar": "Singulier Spirit",
        "title": "Business Development & Proposals and Offers",
        "definition": "Identifies new areas of opportunity beyond current scope of work to support cross-selling",
        "rubric": {
          "1": "Unsatisfactory: Rarely identifies new business opportunities or tends to focus only on existing work. Limited understanding of cross-selling opportunities.",
          "2": "Below expectations: Occasionally identifies areas for cross-selling but does so in a reactive manner, lacking the initiative or insight to drive new opportunities.",
          "3": "Meet expectations: Proactively identifies new opportunities beyond the current scope of work and seeks ways to cross-sell. Has a good understanding of potential areas for expansion but may require some support to fully capitalize on them.",
          "4": "Above expectations: Consistently identifies and acts on new areas for cross-selling, with a strategic approach to expanding client engagement. Takes initiative to explore and propose new opportunities that align with client needs and business goals.",
          "5": "Outstanding: Demonstrates exceptional foresight in identifying new cross-selling opportunities. Proactively expands the scope of work by recognizing and capitalizing on emerging needs. Drives business growth by consistently bringing new opportunities to the table."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 15
      },
      {
        "id": "senior-manager-singulier-spirit-internal-contribution",
        "pillar": "Singulier Spirit",
        "title": "Internal Contribution",
        "definition": "Lead project administration (e.g. LoA, PPFile, Staffing) with minimal partner guidance",
        "rubric": {
          "1": "Unsatisfactory: Struggles to take initiative in internal projects or training. Requires constant supervision and guidance for project administration tasks. Does not effectively serve as a spokesperson or advocate for the team.",
          "2": "Below expectations: Contributes to internal training or initiatives but needs significant partner involvement. Handles project administration with some support and lacks confidence or effectiveness when acting as spokesperson.",
          "3": "Meet expectations: Leads internal training or initiatives independently, contributing valuable knowledge to the team. Manages project administration tasks with minimal oversight and serves as an effective spokesperson when needed.",
          "4": "Above expectations: Takes initiative in leading internal projects or training, showing leadership and organizational skills. Manages project administration with confidence, ensuring smooth operations. Serves as a proactive spokesperson, effectively representing the team.",
          "5": "Outstanding: Takes charge of key internal initiatives, driving impactful training or projects that benefit the organization. Manages all aspects of project administration independently and with excellence. Acts as a dynamic spokesperson, consistently representing the team and organization with authority and influence."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 16
      },
      {
        "id": "senior-manager-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Senior Managers",
        "sourceRow": 17
      }
    ]
  },
  {
    "roleKey": "Associate Director",
    "displayName": "Associate Director end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Associate Directors",
    "competencies": [
      {
        "id": "associate-director-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Support & challenge teams in structuring problems and using hypothesis-driven approach",
        "rubric": {
          "1": "Unsatisfactory: Does not effectively support teams in problem structuring. Provides little challenge or added value, often defaulting to reactive or tactical inputs.",
          "2": "Below expectations: Occasionally contributes ideas but struggles to guide teams through structured thinking. Challenges may lack clarity or depth.",
          "3": "Meet expectations: Supports teams in framing problems clearly and encourages a hypothesis-driven mindset. Can guide conversations to more structured approaches when needed.",
          "4": "Above expectations: Proactively helps teams structure complex problems and consistently brings a hypothesis-driven approach. Challenges assumptions constructively to improve clarity and focus.",
          "5": "Outstanding: Acts as a strategic sounding board for teams. Instinctively identifies the right problem structure and guides others to refine hypotheses. Pushes thinking to a higher level with rigor and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 2
      },
      {
        "id": "associate-director-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Support and review analyses of others to ensure work is client-ready",
        "rubric": {
          "1": "Unsatisfactory: Lacks the ability or attention to effectively review others’ analyses. Misses key errors or inconsistencies, resulting in low-quality outputs.",
          "2": "Below expectations: Provides some review, but feedback is superficial or inconsistent. Misses opportunities to improve accuracy or clarity of analysis.",
          "3": "Meet expectations: Reviews others’ work competently, identifies key issues, and helps refine outputs to a client-ready standard. Provides clear, actionable feedback.",
          "4": "Above expectations: Enhances the quality of team analyses through thorough reviews and insightful suggestions. Raises the bar on both technical accuracy and business relevance.",
          "5": "Outstanding: Trusted as a final reviewer for critical analysis. Elevates the team’s analytical thinking and ensures outputs are not only accurate but strategically compelling and presentation-ready."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 3
      },
      {
        "id": "associate-director-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Develop exec-level value-added insights and recommended actions across project and beyond \n\nSupport team to develop value-added insights and ensure relevance of overall team recommendations",
        "rubric": {
          "1": "Unsatisfactory: Struggles to synthesize key findings or link them to actionable recommendations. Provides little support to the team in this area.",
          "2": "Below expectations: Makes observations but lacks depth or alignment with client priorities. Team recommendations lack coherence or strategic relevance.",
          "3": "Meet expectations: Synthesizes insights effectively and provides relevant recommendations. Supports the team to ensure overall conclusions are clear and useful to clients.",
          "4": "Above expectations: Consistently delivers high-impact, exec-level insights and sharp recommendations. Proactively challenges the team to refine thinking and align with client objectives.",
          "5": "Outstanding: Shapes the strategic narrative across the project. Delivers crisp, senior-level insights that often shift client perspectives. A force multiplier for the team’s ability to generate high-value, actionable recommendations."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 4
      },
      {
        "id": "associate-director-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Define a blank storyline structure and write a client-ready executive summary across multiple workstreams independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to create a coherent storyline. Executive summaries are disorganized or unclear, missing key messages, and require extensive rework.",
          "2": "Below expectations: Attempts to define a storyline but it lacks logical flow or clarity. Executive summaries are incomplete or misaligned with the overall project message.",
          "3": "Meet expectations: Can independently define a clear storyline and write a solid executive summary that reflects key insights across multiple workstreams. The summary is client-ready with minor revisions needed.",
          "4": "Above expectations: Structures compelling, coherent storylines with little to no guidance. Executive summaries are crisp, high-level, and aligned with client objectives, effectively synthesizing across workstreams.",
          "5": "Outstanding: Develops impactful storylines that drive the project narrative forward. Writes executive summaries that are highly polished, strategic, and client-ready, seamlessly connecting multiple workstreams and ensuring client clarity and action."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 5
      },
      {
        "id": "associate-director-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write insights & recommendations relevant to the audience \n\nCreate visually appealing ppt slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear or overly complex, with little focus on the audience. Recommendations are weak or irrelevant. PowerPoint slides are cluttered, poorly formatted, and require significant edits to be presentable.",
          "2": "Below expectations: Writing is somewhat clear but lacks focus or depth in insights and recommendations. PowerPoint slides are functional but lack polish or are not visually appealing, requiring frequent formatting corrections.",
          "3": "Meet expectations: Writing is clear, concise, and relevant to the audience. Recommendations are practical and actionable. PowerPoint slides are well-structured with minimal formatting errors and are visually appealing.",
          "4": "Above expectations: Writing is sharp, engaging, and tailored to the audience’s needs. Recommendations are insightful and aligned with strategic objectives. PowerPoint slides are consistently visually polished, with minimal edits required.",
          "5": "Outstanding: Writing is compelling, insightful, and perfectly aligned with the audience’s perspective. Recommendations are high-impact and clearly articulated. PowerPoint slides are visually stunning, with no formatting issues, and convey the message effectively with creativity and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 6
      },
      {
        "id": "associate-director-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Present others' work with confidence",
        "rubric": {
          "1": "Unsatisfactory: Struggles to clearly convey information. Presentation lacks structure, confidence, or understanding of the content.",
          "2": "Below expectations: Can present but is hesitant or overly reliant on notes. Misses key messages or fails to adapt delivery to the audience.",
          "3": "Meet expectations: Delivers others’ work clearly and with sufficient confidence. Demonstrates good understanding of the content and answers basic questions effectively.",
          "4": "Above expectations: Presents others’ work smoothly, with clarity and poise. Adapts tone and focus to audience needs and reinforces key messages with impact.",
          "5": "Outstanding: Presents with conviction and presence, as if the work were their own. Handles challenging questions with ease, adds value through framing, and inspires confidence in senior audiences."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 7
      },
      {
        "id": "associate-director-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Coach managers to structure work",
        "rubric": {
          "1": "Unsatisfactory: Struggles to guide others in structuring work. Fails to provide clear or actionable advice and lacks the ability to help managers organize their tasks effectively.",
          "2": "Below expectations: Provides some guidance on structuring work but lacks consistency or depth in coaching. Managers often require further support to execute effectively.",
          "3": "Meet expectations: Effectively coaches managers on structuring work, offering clear advice and frameworks. Managers are able to apply guidance and improve their work organization.",
          "4": "Above expectations: Proactively coaches managers on structuring work with insightful and tailored advice. Helps them prioritize tasks, manage complexity, and drive results independently.",
          "5": "Outstanding: Demonstrates exceptional ability to coach managers, helping them not only structure work but also improve strategic thinking and prioritize with a high level of clarity and efficiency. Coaches managers to be more autonomous and effective in leading their own workstreams."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 8
      },
      {
        "id": "associate-director-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Consistently exhibit positive leadership for teams and professionalism associated with a leadership position. Lead by example",
        "rubric": {
          "1": "Unsatisfactory: Demonstrates inconsistent behavior and lacks reliability or self-awareness. Can undermine team morale or professionalism through poor conduct.",
          "2": "Below expectations: Tries to set a good example but occasionally lapses in consistency, motivation, or professional demeanor. Influence on team is limited.",
          "3": "Meet expectations: Behaves professionally and reliably. Sets a solid example for others and contributes positively to team morale and culture.",
          "4": "Above expectations: Acts as a steady, motivating presence. Demonstrates maturity and resilience, encourages others, and reinforces team professionalism through their own conduct.",
          "5": "Outstanding: Embodies leadership through action. Inspires others by consistently showing integrity, ownership, and emotional intelligence. Creates a culture of trust, excellence, and positivity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 9
      },
      {
        "id": "associate-director-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Manage and coach C-level clients in projects",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage C-level clients and lacks the ability to coach them effectively. Requires frequent support and guidance when interacting with high-level stakeholders.",
          "2": "Below expectations: Manages C-level clients but struggles to influence or coach them effectively. May require substantial guidance to navigate C-level conversations or strategic discussions.",
          "3": "Meet expectations: Independently manages and coaches C-level clients in projects. Demonstrates a solid understanding of client needs and provides strategic advice, though may need occasional support for complex situations.",
          "4": "Above expectations: Actively coaches C-level clients, guiding them through strategic decisions and ensuring the project aligns with their vision. Proactively addresses client challenges and drives successful project outcomes.",
          "5": "Outstanding: Establishes trusted, high-level relationships with C-level clients and excels at coaching them through complex projects. Provides strategic insights and anticipates client needs, ensuring a lasting impact on their business and project success."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 10
      },
      {
        "id": "associate-director-dare-and-care-project-leadership",
        "pillar": "Dare & Care",
        "title": "Project Leadership",
        "definition": "Work with client to define scope of a project; convert into LoA and staffing with partner supervision",
        "rubric": {
          "1": "Unsatisfactory: Struggles to understand the client’s needs and define the scope of the project. Has difficulty converting the scope into a LoA and staffing plan, needing constant guidance and support.",
          "2": "Below expectations: Can define a basic project scope but lacks clarity or detail in translating it into a LoA and staffing plan. Requires partner supervision throughout the process.",
          "3": "Meet expectations: Works effectively with clients to define project scope and can translate it into a LoA and staffing plan with minimal guidance. Ensures that the scope is aligned with client expectations and business objectives.",
          "4": "Above expectations: Collaborates with clients to define a comprehensive and strategic project scope. Independently creates a detailed LoA and staffing plan, with minimal supervision, ensuring alignment with client needs and expectations.",
          "5": "Outstanding: Works seamlessly with clients to define project scope, demonstrating a deep understanding of their needs and strategic objectives. Independently converts this into a highly detailed and actionable LoA and staffing plan, showing leadership in guiding the project from initiation."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 11
      },
      {
        "id": "associate-director-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Manage projects including elements from all Singulier practices",
        "rubric": {
          "1": "Unsatisfactory: Struggles to integrate elements from multiple Singulier practices into a project. Lacks understanding of the different practices and fails to manage projects with cross-practice elements effectively.",
          "2": "Below expectations: Can manage projects involving multiple practices but requires significant guidance. Has limited understanding of how to effectively integrate elements from all practices and often relies on others to bridge gaps.",
          "3": "Meet expectations: Effectively manages projects with elements from multiple Singulier practices. Demonstrates a solid understanding of the various practices and successfully integrates them into the project, with some support for coordination.",
          "4": "Above expectations: Independently manages complex projects that involve multiple Singulier practices. Has a deep understanding of each practice and seamlessly integrates them, ensuring alignment across the project.",
          "5": "Outstanding: Demonstrates exceptional skill in managing projects that span all Singulier practices. Seamlessly integrates diverse practice areas, driving project success through a deep understanding and strategic application of all practices. Guides the team to leverage expertise from every area to deliver outstanding results."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 12
      },
      {
        "id": "associate-director-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Familiar with most Singulier tools and able to introduce them to relevant projects",
        "rubric": {
          "1": "Unsatisfactory: Has limited knowledge of Singulier tools and struggles to apply them to projects. Requires significant support to understand and introduce relevant tools.",
          "2": "Below expectations: Familiar with a few Singulier tools but lacks proficiency in introducing or integrating them into projects. Needs guidance to identify which tools are relevant for specific tasks.",
          "3": "Meet expectations: Demonstrates solid knowledge of most Singulier tools and can apply them effectively to projects. Introduces relevant tools with some support, ensuring they align with project goals.",
          "4": "Above expectations: Proactively introduces Singulier tools to relevant projects and ensures their effective application. Demonstrates a strong understanding of which tools are best suited for different tasks and how to maximize their impact.",
          "5": "Outstanding: Expertly integrates and introduces Singulier tools to a wide range of projects. Has deep knowledge of the tools and consistently identifies and applies the most effective ones to drive project success, helping others to leverage them as well."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 13
      },
      {
        "id": "associate-director-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Manage multiple projects at one time \n\nManage a complex project with multiple workstreams",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage multiple projects or fails to maintain focus on one project. Cannot handle the complexity of a project with multiple workstreams and frequently misses deadlines or deliverables.",
          "2": "Below expectations: Manages multiple projects but struggles to prioritize or allocate resources effectively. Finds it difficult to oversee a complex project with multiple workstreams and requires constant support.",
          "3": "Meet expectations: Manages multiple projects simultaneously with reasonable efficiency. Successfully leads complex projects with multiple workstreams, ensuring key deliverables are met.",
          "4": "Above expectations: Effectively manages several projects at once without compromising quality. Leads complex projects with multiple workstreams smoothly, balancing resources and priorities well.",
          "5": "Outstanding: Seamlessly manages multiple projects, navigating complexity and competing priorities with ease. Successfully leads large, multifaceted projects with multiple workstreams, delivering high-quality results on time and within scope."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 14
      },
      {
        "id": "associate-director-singulier-spirit-business-development-and-proposals-and-offers",
        "pillar": "Singulier Spirit",
        "title": "Business Development & Proposals and Offers",
        "definition": "Co-lead a sale with a partner \n\nWrite a client-ready proposal independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to contribute to sales efforts and requires constant supervision. Cannot independently write a client-ready proposal and relies heavily on others for content and structure.",
          "2": "Below expectations: Contributes to sales efforts but lacks the initiative to lead. Needs substantial guidance in writing client-ready proposals and may struggle to meet the client’s needs without significant support.",
          "3": "Meet expectations: Actively contributes to co-leading a sale with a partner and writes clear, client-ready proposals independently. Can handle most aspects of the sales process but may require occasional feedback or adjustments.",
          "4": "Above expectations: Co-leads sales efforts effectively, offering strategic insights and contributing to the overall success. Writes high-quality, client-ready proposals with minimal revisions needed, demonstrating a strong understanding of client needs.",
          "5": "Outstanding: Leads sales efforts alongside a partner, taking full ownership of the process and driving the strategy. Writes exceptional client-ready proposals independently, tailoring them perfectly to client requirements and enhancing the business development process."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 15
      },
      {
        "id": "associate-director-singulier-spirit-internal-contribution",
        "pillar": "Singulier Spirit",
        "title": "Internal Contribution",
        "definition": "Lead project administration (e.g. LoA, PPFile, Staffing) with minimal partner guidance.",
        "rubric": {
          "1": "Unsatisfactory: Struggles to take initiative in internal projects or training. Requires constant supervision and guidance for project administration tasks. Does not effectively serve as a spokesperson or advocate for the team.",
          "2": "Below expectations: Contributes to internal training or initiatives but needs significant partner involvement. Handles project administration with some support and lacks confidence or effectiveness when acting as spokesperson.",
          "3": "Meet expectations: Leads internal training or initiatives independently, contributing valuable knowledge to the team. Manages project administration tasks with minimal oversight and serves as an effective spokesperson when needed.",
          "4": "Above expectations: Takes initiative in leading internal projects or training, showing leadership and organizational skills. Manages project administration with confidence, ensuring smooth operations. Serves as a proactive spokesperson, effectively representing the team.",
          "5": "Outstanding: Takes charge of key internal initiatives, driving impactful training or projects that benefit the organization. Manages all aspects of project administration independently and with excellence. Acts as a dynamic spokesperson, consistently representing the team and organization with authority and influence."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 16
      },
      {
        "id": "associate-director-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Associate Directors",
        "sourceRow": 17
      }
    ]
  },
  {
    "roleKey": "Director",
    "displayName": "Director end-of-project assessment",
    "version": 1,
    "active": true,
    "sourceSheet": "Directors",
    "competencies": [
      {
        "id": "director-problem-solve-structure-problems",
        "pillar": "Problem Solve",
        "title": "Structure problems",
        "definition": "Support & challenge teams in structuring problems and using hypothesis-driven approach",
        "rubric": {
          "1": "Unsatisfactory: Does not effectively support teams in problem structuring. Provides little challenge or added value, often defaulting to reactive or tactical inputs.",
          "2": "Below expectations: Occasionally contributes ideas but struggles to guide teams through structured thinking. Challenges may lack clarity or depth.",
          "3": "Meet expectations: Supports teams in framing problems clearly and encourages a hypothesis-driven mindset. Can guide conversations to more structured approaches when needed.",
          "4": "Above expectations: Proactively helps teams structure complex problems and consistently brings a hypothesis-driven approach. Challenges assumptions constructively to improve clarity and focus.",
          "5": "Outstanding: Acts as a strategic sounding board for teams. Instinctively identifies the right problem structure and guides others to refine hypotheses. Pushes thinking to a higher level with rigor and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 2
      },
      {
        "id": "director-problem-solve-quantitative-analysis",
        "pillar": "Problem Solve",
        "title": "Quantitative Analysis",
        "definition": "Support and review analyses of others to ensure work is client-ready",
        "rubric": {
          "1": "Unsatisfactory: Lacks the ability or attention to effectively review others’ analyses. Misses key errors or inconsistencies, resulting in low-quality outputs.",
          "2": "Below expectations: Provides some review, but feedback is superficial or inconsistent. Misses opportunities to improve accuracy or clarity of analysis.",
          "3": "Meet expectations: Reviews others’ work competently, identifies key issues, and helps refine outputs to a client-ready standard. Provides clear, actionable feedback.",
          "4": "Above expectations: Enhances the quality of team analyses through thorough reviews and insightful suggestions. Raises the bar on both technical accuracy and business relevance.",
          "5": "Outstanding: Trusted as a final reviewer for critical analysis. Elevates the team’s analytical thinking and ensures outputs are not only accurate but strategically compelling and presentation-ready."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 3
      },
      {
        "id": "director-problem-solve-synthesize-and-recommend",
        "pillar": "Problem Solve",
        "title": "Synthesize & Recommend",
        "definition": "Develop exec-level value-added insights and recommended actions across project and beyond \n\nSupport team to develop value-added insights and ensure relevance of overall team recommendations",
        "rubric": {
          "1": "Unsatisfactory: Struggles to synthesize key findings or link them to actionable recommendations. Provides little support to the team in this area.",
          "2": "Below expectations: Makes observations but lacks depth or alignment with client priorities. Team recommendations lack coherence or strategic relevance.",
          "3": "Meet expectations: Synthesizes insights effectively and provides relevant recommendations. Supports the team to ensure overall conclusions are clear and useful to clients.",
          "4": "Above expectations: Consistently delivers high-impact, exec-level insights and sharp recommendations. Proactively challenges the team to refine thinking and align with client objectives.",
          "5": "Outstanding: Shapes the strategic narrative across the project. Delivers crisp, senior-level insights that often shift client perspectives. A force multiplier for the team’s ability to generate high-value, actionable recommendations."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 4
      },
      {
        "id": "director-execute-and-deliver-storytelling-and-exec-summary",
        "pillar": "Execute & Deliver",
        "title": "Storytelling & Exec Summary",
        "definition": "Define a blank storyline structure and write a client-ready executive summary across multiple workstreams independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to create a coherent storyline. Executive summaries are disorganized or unclear, missing key messages, and require extensive rework.",
          "2": "Below expectations: Attempts to define a storyline but it lacks logical flow or clarity. Executive summaries are incomplete or misaligned with the overall project message.",
          "3": "Meet expectations: Can independently define a clear storyline and write a solid executive summary that reflects key insights across multiple workstreams. The summary is client-ready with minor revisions needed.",
          "4": "Above expectations: Structures compelling, coherent storylines with little to no guidance. Executive summaries are crisp, high-level, and aligned with client objectives, effectively synthesizing across workstreams.",
          "5": "Outstanding: Develops impactful storylines that drive the project narrative forward. Writes executive summaries that are highly polished, strategic, and client-ready, seamlessly connecting multiple workstreams and ensuring client clarity and action."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 5
      },
      {
        "id": "director-execute-and-deliver-written-communication-including-powerpoint",
        "pillar": "Execute & Deliver",
        "title": "Written Communication (including PowerPoint)",
        "definition": "Write insights & recommendations relevant to the audience \n\nCreate visually appealing ppt slides with minimal formatting edits",
        "rubric": {
          "1": "Unsatisfactory: Writing is unclear or overly complex, with little focus on the audience. Recommendations are weak or irrelevant. PowerPoint slides are cluttered, poorly formatted, and require significant edits to be presentable.",
          "2": "Below expectations: Writing is somewhat clear but lacks focus or depth in insights and recommendations. PowerPoint slides are functional but lack polish or are not visually appealing, requiring frequent formatting corrections.",
          "3": "Meet expectations: Writing is clear, concise, and relevant to the audience. Recommendations are practical and actionable. PowerPoint slides are well-structured with minimal formatting errors and are visually appealing.",
          "4": "Above expectations: Writing is sharp, engaging, and tailored to the audience’s needs. Recommendations are insightful and aligned with strategic objectives. PowerPoint slides are consistently visually polished, with minimal edits required.",
          "5": "Outstanding: Writing is compelling, insightful, and perfectly aligned with the audience’s perspective. Recommendations are high-impact and clearly articulated. PowerPoint slides are visually stunning, with no formatting issues, and convey the message effectively with creativity and clarity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 6
      },
      {
        "id": "director-execute-and-deliver-verbal-communication",
        "pillar": "Execute & Deliver",
        "title": "Verbal Communication",
        "definition": "Present others' work with confidence",
        "rubric": {
          "1": "Unsatisfactory: Struggles to clearly convey information. Presentation lacks structure, confidence, or understanding of the content.",
          "2": "Below expectations: Can present but is hesitant or overly reliant on notes. Misses key messages or fails to adapt delivery to the audience.",
          "3": "Meet expectations: Delivers others’ work clearly and with sufficient confidence. Demonstrates good understanding of the content and answers basic questions effectively.",
          "4": "Above expectations: Presents others’ work smoothly, with clarity and poise. Adapts tone and focus to audience needs and reinforces key messages with impact.",
          "5": "Outstanding: Presents with conviction and presence, as if the work were their own. Handles challenging questions with ease, adds value through framing, and inspires confidence in senior audiences."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 7
      },
      {
        "id": "director-execute-and-deliver-structure-work-and-prioritize",
        "pillar": "Execute & Deliver",
        "title": "Structure work & Prioritize",
        "definition": "Manage and prioritize heavy workload including multiple projects, office role, and business development work.\n\nDeliver annual revenue >1M **\nWork with client to define scope of a profitable project; convert into LoA and staffing\nindependently\nLead both DD and transformation projects (at least 2 each)",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage workload and frequently misses deadlines. Unable to effectively prioritize tasks and often neglects critical activities, leading to inefficiency and incomplete work.",
          "2": "Below expectations: Manages workload with some difficulty, frequently requiring reminders to meet deadlines. Struggles to prioritize tasks, resulting in delays or imbalanced focus across projects, office responsibilities, and business development.",
          "3": "Meet expectations: Manages workload effectively, balancing multiple projects, office duties, and business development tasks. Prioritizes tasks appropriately and generally meets deadlines with little to no external prompting.",
          "4": "Above expectations: Proactively manages a heavy workload, efficiently prioritizing and balancing multiple projects, office roles, and business development work. Anticipates deadlines and ensures timely delivery across all areas of responsibility.",
          "5": "Outstanding: Masterfully manages a heavy and complex workload, expertly prioritizing competing demands and excelling across multiple projects, office roles, and business development tasks. Delivers consistently high-quality results, exceeding expectations in all areas of responsibility."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 8
      },
      {
        "id": "director-dare-and-care-self-professional-behaviour",
        "pillar": "Dare & Care",
        "title": "Self - Professional Behaviour",
        "definition": "Consistently exhibit positive leadership for teams and professionalism associated with a leadership position. Lead by example",
        "rubric": {
          "1": "Unsatisfactory: Demonstrates inconsistent behavior and lacks reliability or self-awareness. Can undermine team morale or professionalism through poor conduct.",
          "2": "Below expectations: Tries to set a good example but occasionally lapses in consistency, motivation, or professional demeanor. Influence on team is limited.",
          "3": "Meet expectations: Behaves professionally and reliably. Sets a solid example for others and contributes positively to team morale and culture.",
          "4": "Above expectations: Acts as a steady, motivating presence. Demonstrates maturity and resilience, encourages others, and reinforces team professionalism through their own conduct.",
          "5": "Outstanding: Embodies leadership through action. Inspires others by consistently showing integrity, ownership, and emotional intelligence. Creates a culture of trust, excellence, and positivity."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 9
      },
      {
        "id": "director-dare-and-care-teams-and-clients",
        "pillar": "Dare & Care",
        "title": "Teams & Clients",
        "definition": "Manage and coach C-level clients and investors with positive feedback",
        "rubric": {
          "1": "Unsatisfactory: Struggles to build or maintain relationships with C-level clients and investors. Does not effectively manage expectations or provide coaching. Rarely engages with clients beyond the immediate project.",
          "2": "Below expectations: Manages C-level clients and investors with some difficulty. Requires substantial support in coaching and building long-term relationships. Limited interactions outside the scope of active projects.",
          "3": "Meet expectations: Effectively manages and coaches C-level clients and investors, providing relevant insights and guidance. Maintains relationships beyond projects, though may need occasional support for long-term relationship management.",
          "4": "Above expectations: Proactively manages C-level clients and investors, consistently providing valuable coaching and building long-term, trusted relationships. Engages with clients beyond the project scope to ensure sustained business success.",
          "5": "Outstanding: Demonstrates exceptional skill in managing, coaching, and maintaining relationships with C-level clients and investors. Acts as a trusted advisor, nurturing long-term relationships that continue well beyond the project lifecycle and contributing to sustained business growth."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 10
      },
      {
        "id": "director-dare-and-care-project-leadership",
        "pillar": "Dare & Care",
        "title": "Project Leadership",
        "definition": "Work with client to define scope of a project; convert into LoA and staffing independently",
        "rubric": {
          "1": "Unsatisfactory: Struggles to define the project scope with the client and requires significant support to convert it into a LoA and staffing plan. Needs constant guidance throughout the process and fails to work independently.",
          "2": "Below expectations: Can define the project scope with client input but lacks clarity or detail in converting it into a LoA and staffing plan. Needs some guidance and support to ensure alignment with client expectations.",
          "3": "Meet expectations: Independently works with the client to define the project scope and successfully converts it into a LoA and staffing plan. Demonstrates a solid understanding of project requirements and effectively aligns the plan with client goals.",
          "4": "Above expectations: Takes full ownership in defining the project scope and independently converts it into a comprehensive LoA and staffing plan. Ensures alignment with client needs and demonstrates foresight in anticipating potential challenges.",
          "5": "Outstanding: Expertly collaborates with clients to define a detailed and strategic project scope, translating it seamlessly into a clear, actionable LoA and staffing plan. Takes full initiative and works independently, ensuring smooth execution and alignment with business objectives."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 11
      },
      {
        "id": "director-digital-technical-expertise-industry-and-digital-skills-and-profile",
        "pillar": "Digital / Technical Expertise",
        "title": "Industry & Digital Skills & Profile",
        "definition": "Develop industry specialty (multiple projects, some public thought leadership) \n\nDemonstrate external profile in PE world (e.g. attendance at events, etc)",
        "rubric": {
          "1": "Unsatisfactory: Shows limited involvement in the industry and lacks specialized knowledge. Has minimal to no external presence in the PE world and does not participate in relevant events or thought leadership activities.",
          "2": "Below expectations: Demonstrates some involvement in the industry but has limited depth of expertise. Attends some events or engages in minimal thought leadership activities, but external profile is not yet developed or impactful.",
          "3": "Meet expectations: Actively develops industry expertise through multiple projects and contributes to public thought leadership efforts. Maintains a moderate external profile in the PE world, attending events and occasionally sharing insights.",
          "4": "Above expectations: Develops strong industry expertise through multiple high-impact projects and consistently contributes to thought leadership (e.g., writing articles, speaking at events). Demonstrates a visible external profile in the PE world, with active participation in key industry events.",
          "5": "Outstanding: Establishes a recognized industry specialty, driving major thought leadership initiatives and regularly shaping industry conversations. Has a strong and influential external profile in the PE world, frequently attending and contributing to key events and shaping the future of the industry."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 12
      },
      {
        "id": "director-digital-technical-expertise-tools",
        "pillar": "Digital / Technical Expertise",
        "title": "Tools",
        "definition": "Familiar with most Singulier tools and able to introduce them to relevant projects",
        "rubric": {
          "1": "Unsatisfactory: Has limited knowledge of Singulier tools and struggles to apply them to projects. Requires significant support to understand and introduce relevant tools.",
          "2": "Below expectations: Familiar with a few Singulier tools but lacks proficiency in introducing or integrating them into projects. Needs guidance to identify which tools are relevant for specific tasks.",
          "3": "Meet expectations: Demonstrates solid knowledge of most Singulier tools and can apply them effectively to projects. Introduces relevant tools with some support, ensuring they align with project goals.",
          "4": "Above expectations: Proactively introduces Singulier tools to relevant projects and ensures their effective application. Demonstrates a strong understanding of which tools are best suited for different tasks and how to maximize their impact.",
          "5": "Outstanding: Expertly integrates and introduces Singulier tools to a wide range of projects. Has deep knowledge of the tools and consistently identifies and applies the most effective ones to drive project success, helping others to leverage them as well."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 13
      },
      {
        "id": "director-digital-technical-expertise-project-experience",
        "pillar": "Digital / Technical Expertise",
        "title": "Project Experience",
        "definition": "Manage 2-3 projects concurrently while maintaining internal leadership role & business development work",
        "rubric": {
          "1": "Unsatisfactory: Struggles to manage more than one project at a time. Frequently misses deadlines and delivers incomplete or low-quality work due to lack of focus or poor time management.",
          "2": "Below expectations: Can manage 1-2 projects but struggles with 3 concurrent projects. Needs significant guidance in balancing priorities and often requires support to stay on top of deliverables.",
          "3": "Meet expectations: Successfully leads 2-3 projects concurrently with reasonable efficiency. Manages to prioritize tasks effectively and meets most deadlines without major issues.",
          "4": "Above expectations: Demonstrates strong leadership in managing 2-3 projects simultaneously. Balances competing priorities effectively, ensuring timely delivery and high-quality results across all projects.",
          "5": "Outstanding: Expertly manages 2-3 complex projects at the same time, consistently delivering high-quality work on time. Demonstrates exceptional time management and leadership skills, driving the success of multiple projects concurrently with minimal oversight."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 14
      },
      {
        "id": "director-singulier-spirit-business-development-and-proposals-and-offers",
        "pillar": "Singulier Spirit",
        "title": "Business Development & Proposals and Offers",
        "definition": "Accrue at least 800k EUR per year sales credits (of which 300k EUR can be shared; must include at least 2 independent sales with at least 2 separate clients (PE firms) worth a total of 500k EUR) \nDemonstrate at least 10 connections at PE firms with relationships beyond projects Demonstrated ability to sell a project with a new contact for Singulier",
        "rubric": {
          "1": "Unsatisfactory: Struggles to contribute to sales efforts and has minimal involvement in generating revenue. Fails to reach sales targets and does not close independent sales.",
          "2": "Below expectations: Contributes to sales efforts but does not consistently meet revenue targets. Rarely engages in independent sales and struggles to close deals, needing significant partner support to meet targets.",
          "3": "Meet expectations: Meets the revenue target of 500k EUR per year with partner collaboration and successfully closes at least 2 independent sales. Demonstrates solid sales abilities and contributes effectively to business development efforts.",
          "4": "Above expectations: Consistently exceeds the sales target of 500k EUR per year with partners and closes more than 2 independent sales. Demonstrates a strong ability to build relationships and close deals independently, contributing to overall business growth.",
          "5": "Outstanding: Exceeds sales expectations year after year, consistently generating over 500k EUR in revenue with partners and closing multiple independent sales. Demonstrates exceptional business development skills, consistently securing large deals and driving significant revenue growth."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 15
      },
      {
        "id": "director-singulier-spirit-internal-contribution",
        "pillar": "Singulier Spirit",
        "title": "Internal Contribution",
        "definition": "Successfully serve as spokesperson and mentor Lead projects with strong upward feedback",
        "rubric": {
          "1": "Unsatisfactory: Does not take on any office leadership responsibilities. Has little to no involvement in office initiatives and is not seen as a contributor to internal office culture.",
          "2": "Below expectations: Occasionally takes on office leadership tasks but does not actively seek opportunities to contribute. Shows limited initiative in improving office culture or leading office initiatives.",
          "3": "Meet expectations: Actively participates in office leadership and contributes to improving the office culture. Takes on leadership tasks when needed and supports office initiatives effectively.",
          "4": "Above expectations: Plays a key leadership role within the office, regularly driving internal initiatives and contributing to a positive office culture. Takes initiative to guide and motivate colleagues.",
          "5": "Outstanding: Provides exceptional leadership within the office, consistently leading initiatives that enhance office culture and drive internal improvements. Acts as a role model for others and has a significant impact on office dynamics and operations."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 16
      },
      {
        "id": "director-singulier-spirit-singulier-values-excellence-boldness-growth-kindness-passion-and-innovation",
        "pillar": "Singulier Spirit",
        "title": "Singulier Values : Excellence, Boldness, Growth, Kindness, Passion and Innovation",
        "definition": "Consistently exhibit Singulier values",
        "rubric": {
          "1": "Unsatisfactory: Rarely demonstrates Singulier values. Shows limited ambition, avoids entrepreneurial challenges, and struggles to adapt to changing situations. Frequently seeks problems rather than solutions.",
          "2": "Below expectations: Occasionally displays some Singulier values but lacks consistency. May demonstrate ambition or flexibility in certain situations, but struggles to consistently apply these values across tasks.",
          "3": "Meet expectations: Consistently demonstrates Singulier values. Shows ambition and a solution-oriented mindset, adapts to changes, and occasionally takes initiative in entrepreneurial ways.",
          "4": "Above expectations: Regularly exhibits a strong entrepreneurial spirit, ambition, and flexibility. Actively seeks solutions to challenges and motivates others to do the same.",
          "5": "Outstanding: Fully embodies Singulier values. Demonstrates exceptional ambition, entrepreneurial thinking, and flexibility, leading by example. Always solution-oriented, drives innovation, and inspires the team with their proactive approach."
        },
        "allowNotRelevant": true,
        "requireLowComment": true,
        "requireHighComment": true,
        "sourceSheet": "Directors",
        "sourceRow": 17
      }
    ]
  }
]

export const feedbackTemplates: FeedbackTemplate[] = baseFeedbackTemplates.map((template) => ({
  ...template,
  reviewerGuidance: buildReviewerGuidance(template.roleKey, 'top-down'),
}))

export function getFeedbackTemplate(
  revieweeRole: RoleKey,
  direction: ReviewDirection,
  reviewerRole?: RoleKey,
): FeedbackTemplate | null {
  const template = baseFeedbackTemplates.find((item) => item.roleKey === revieweeRole && item.active)
  if (!template) return null

  const relationship = direction === 'upward' ? 'upward feedback' : 'manager feedback'
  const reviewerPart = reviewerRole ? ` from ${reviewerRole}` : ''
  const competencies = adaptCompetenciesForRelationship(template.competencies, direction)

  return {
    ...template,
    displayName: `${template.displayName} · ${relationship}${reviewerPart}`,
    reviewerGuidance: buildReviewerGuidance(revieweeRole, direction, reviewerRole),
    competencies,
  }
}

function adaptCompetenciesForRelationship(
  competencies: Competency[],
  direction: ReviewDirection,
): Competency[] {
  if (direction === 'top-down') return competencies

  return competencies.map((competency) => ({
    ...competency,
    allowNotRelevant: true,
    definition: `${competency.definition}\n\nUpward feedback lens: answer based on what you personally observed from this leader during the project. Use Not relevant where the dimension was not visible to you.`,
  }))
}

function buildReviewerGuidance(revieweeRole: RoleKey, direction: ReviewDirection, reviewerRole?: RoleKey) {
  const reviewerContext = reviewerRole ? ` as a ${reviewerRole}` : ''

  if (direction === 'upward') {
    return [
      `You are giving upward feedback on a ${revieweeRole}${reviewerContext}.`,
      'Use the full role-specific assessment grid, including Problem Solve, Execute & Deliver, Dare & Care, Digital / Technical Expertise, and Singulier Spirit.',
      'Use concrete examples and mark dimensions not relevant when you could not reasonably observe them.',
    ].join(' ')
  }

  return [
    `You are reviewing a ${revieweeRole}${reviewerContext}.`,
    'Use the role-specific end-of-project assessment scale from the current spreadsheet process.',
    'Scores of 1-2 and 4-5 need specific rationale; 3 is the norm and 5 should remain exceptional.',
  ].join(' ')
}
