// ============================================
// ATS SERVICE
// Rule-based ATS analysis engine
// ============================================


// WORDS THAT SHOULD NOT COUNT AS ATS KEYWORDS
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "than",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "we",
  "you",
  "your",
  "our",
  "they",
  "their",
  "will",
  "would",
  "should",
  "can",
  "could",
  "may",
  "might",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "about",
  "into",
  "over",
  "under",
  "through",
  "within",
  "across",

  // JOB DESCRIPTION NOISE
  "looking",
  "candidate",
  "candidates",
  "role",
  "job",
  "position",
  "responsibilities",
  "requirements",
  "required",
  "preferred",
  "basic",
  "knowledge",
  "understand",
  "understanding",
  "experience",
  "experienced",
  "ability",
  "skills",
  "skill",
  "strong",
  "good",
  "excellent",
  "working",
  "work",
  "using",
  "use",
  "used",
  "join",
  "team",
  "intern",
  "internship",
]);


// KNOWN TECHNICAL SKILLS
const TECH_SKILLS = [
  {
    name: "JavaScript",
    aliases: ["javascript", "js"],
  },
  {
    name: "TypeScript",
    aliases: ["typescript", "ts"],
  },
  {
    name: "React",
    aliases: ["react", "react.js", "reactjs"],
  },
  {
    name: "Angular",
    aliases: ["angular"],
  },
  {
    name: "Vue",
    aliases: ["vue", "vue.js", "vuejs"],
  },
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node"],
  },
  {
    name: "Express",
    aliases: ["express", "express.js", "expressjs"],
  },
  {
    name: "Java",
    aliases: ["java"],
  },
  {
    name: "Python",
    aliases: ["python"],
  },
  {
    name: "C++",
    aliases: ["c++"],
  },
  {
    name: "C#",
    aliases: ["c#"],
  },
  {
    name: "Spring",
    aliases: ["spring"],
  },
  {
    name: "Spring Boot",
    aliases: ["spring boot", "springboot"],
  },
  {
    name: "SQL",
    aliases: ["sql"],
  },
  {
    name: "PostgreSQL",
    aliases: ["postgresql", "postgres"],
  },
  {
    name: "MySQL",
    aliases: ["mysql"],
  },
  {
    name: "MongoDB",
    aliases: ["mongodb", "mongo db"],
  },
  {
    name: "Redis",
    aliases: ["redis"],
  },
  {
    name: "AWS",
    aliases: [
      "aws",
      "amazon web services",
    ],
  },
  {
    name: "Azure",
    aliases: ["azure"],
  },
  {
    name: "GCP",
    aliases: [
      "gcp",
      "google cloud",
      "google cloud platform",
    ],
  },
  {
    name: "Docker",
    aliases: ["docker"],
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
  },
  {
    name: "Git",
    aliases: ["git"],
  },
  {
    name: "GitHub",
    aliases: ["github"],
  },
  {
    name: "REST API",
    aliases: [
      "rest api",
      "rest apis",
      "restful api",
      "restful apis",
      "rest",
    ],
  },
  {
    name: "GraphQL",
    aliases: ["graphql"],
  },
  {
    name: "HTML",
    aliases: ["html", "html5"],
  },
  {
    name: "CSS",
    aliases: ["css", "css3"],
  },
  {
    name: "Linux",
    aliases: ["linux"],
  },
  {
    name: "Microservices",
    aliases: [
      "microservices",
      "microservice",
    ],
  },
  {
    name: "CI/CD",
    aliases: [
      "ci/cd",
      "continuous integration",
      "continuous deployment",
    ],
  },
  {
    name: "Jenkins",
    aliases: ["jenkins"],
  },
  {
    name: "Terraform",
    aliases: ["terraform"],
  },
];


// NORMALIZE TEXT
const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};


// CHECK WHETHER TEXT CONTAINS A TERM
const containsTerm = (text, term) => {
  const normalizedText = ` ${normalizeText(text)} `;
  const normalizedTerm = normalizeText(term);

  if (!normalizedTerm) {
    return false;
  }

  return normalizedText.includes(
    ` ${normalizedTerm} `
  );
};


// CONVERT RESUME JSON INTO SEARCHABLE TEXT
const resumeDataToText = (resumeData = {}) => {
  const parts = [];

  const walk = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      parts.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };

  walk(resumeData);

  return normalizeText(
    parts.join(" ")
  );
};


// GET SKILLS STORED IN RESUME
const extractResumeSkills = (
  resumeData = {}
) => {
  if (!Array.isArray(resumeData.skills)) {
    return [];
  }

  return resumeData.skills
    .map((skill) => {
      if (typeof skill === "string") {
        return skill.trim();
      }

      if (
        skill &&
        typeof skill === "object"
      ) {
        return String(
          skill.name ||
          skill.skill_name ||
          skill.title ||
          ""
        ).trim();
      }

      return "";
    })
    .filter(Boolean);
};


// FIND TECHNICAL SKILLS REQUESTED BY JOB
const extractJobSkills = (
  jobDescription
) => {
  const jobSkills = [];

  for (const skill of TECH_SKILLS) {
    const found = skill.aliases.some(
      (alias) =>
        containsTerm(
          jobDescription,
          alias
        )
    );

    if (found) {
      jobSkills.push(skill.name);
    }
  }

  return [...new Set(jobSkills)];
};


// CHECK WHETHER RESUME HAS A PARTICULAR SKILL
const resumeHasSkill = (
  skillName,
  resumeSkills,
  resumeText
) => {
  const skillDefinition =
    TECH_SKILLS.find(
      (skill) =>
        skill.name.toLowerCase() ===
        skillName.toLowerCase()
    );

  if (!skillDefinition) {
    return false;
  }

  const combinedResumeText = [
    ...resumeSkills,
    resumeText,
  ].join(" ");

  return skillDefinition.aliases.some(
    (alias) =>
      containsTerm(
        combinedResumeText,
        alias
      )
  );
};


// MATCH TECHNICAL SKILLS
const analyzeSkills = ({
  resumeSkills,
  resumeText,
  jobDescription,
}) => {
  const jobSkills =
    extractJobSkills(jobDescription);

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of jobSkills) {
    if (
      resumeHasSkill(
        skill,
        resumeSkills,
        resumeText
      )
    ) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  return {
    jobSkills,
    matchedSkills,
    missingSkills,
  };
};


// EXTRACT IMPORTANT NON-SKILL KEYWORDS
const extractImportantKeywords = (
  jobDescription
) => {
  const normalized =
    normalizeText(jobDescription);

  const words =
    normalized.split(" ");

  const frequencies = {};

  for (const word of words) {
    if (!word) continue;

    if (word.length < 3) continue;

    if (STOP_WORDS.has(word)) continue;

    // Ignore numbers
    if (/^\d+$/.test(word)) {
      continue;
    }

    frequencies[word] =
      (frequencies[word] || 0) + 1;
  }

  return Object.entries(frequencies)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    })
    .map(([word]) => word)
    .slice(0, 25);
};


// MATCH IMPORTANT KEYWORDS
const analyzeKeywords = (
  resumeText,
  jobDescription
) => {
  const keywords =
    extractImportantKeywords(
      jobDescription
    );

  const matchedKeywords = [];
  const missingKeywords = [];

  for (const keyword of keywords) {
    if (
      containsTerm(
        resumeText,
        keyword
      )
    ) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  return {
    matchedKeywords,
    missingKeywords,
    totalKeywords: keywords.length,
  };
};


// CHECK RESUME COMPLETENESS
const calculateCompletenessScore = (
  resumeData
) => {
  let points = 0;

  // 3 points
  if (
    resumeData.personal_info &&
    Object.keys(
      resumeData.personal_info
    ).length > 0
  ) {
    points += 3;
  }

  // 3 points
  if (
    typeof resumeData.summary ===
      "string" &&
    resumeData.summary.trim()
  ) {
    points += 3;
  }

  // 3 points
  if (
    Array.isArray(resumeData.skills) &&
    resumeData.skills.length > 0
  ) {
    points += 3;
  }

  // 2 points
  if (
    Array.isArray(
      resumeData.experience
    ) &&
    resumeData.experience.length > 0
  ) {
    points += 2;
  }

  // 2 points
  if (
    Array.isArray(
      resumeData.projects
    ) &&
    resumeData.projects.length > 0
  ) {
    points += 2;
  }

  // 2 points
  if (
    Array.isArray(
      resumeData.education
    ) &&
    resumeData.education.length > 0
  ) {
    points += 2;
  }

  return points;
};


// CALCULATE ATS SCORE
const calculateAtsScore = ({
  matchedSkills,
  jobSkills,
  matchedKeywords,
  totalKeywords,
  resumeData,
}) => {
  // -------------------------
  // SKILLS = 45 POINTS
  // -------------------------
  let skillScore = 0;

  if (jobSkills.length > 0) {
    skillScore =
      (matchedSkills.length /
        jobSkills.length) *
      45;
  } else {
    // No explicit technical skills detected
    skillScore = 30;
  }


  // -------------------------
  // KEYWORDS = 30 POINTS
  // -------------------------
  let keywordScore = 0;

  if (totalKeywords > 0) {
    keywordScore =
      (matchedKeywords.length /
        totalKeywords) *
      30;
  } else {
    keywordScore = 20;
  }


  // -------------------------
  // COMPLETENESS = 15 POINTS
  // -------------------------
  const completenessScore =
    calculateCompletenessScore(
      resumeData
    );


  // -------------------------
  // CONTEXT = 10 POINTS
  // -------------------------
  let contextScore = 0;

  const resumeText =
    resumeDataToText(resumeData);

  const contextualTerms = [
    "software",
    "engineer",
    "developer",
    "backend",
    "frontend",
    "full stack",
    "web",
    "cloud",
    "database",
  ];

  let contextMatches = 0;

  for (const term of contextualTerms) {
    if (containsTerm(resumeText, term)) {
      contextMatches += 1;
    }
  }

  contextScore = Math.min(
    10,
    contextMatches * 2
  );


  const total =
    skillScore +
    keywordScore +
    completenessScore +
    contextScore;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(total)
    )
  );
};


// GENERATE STRENGTHS
const generateStrengths = ({
  matchedSkills,
  jobSkills,
  matchedKeywords,
  atsScore,
  resumeData,
}) => {
  const strengths = [];

  if (
    jobSkills.length > 0 &&
    matchedSkills.length /
      jobSkills.length >=
      0.6
  ) {
    strengths.push(
      "Resume matches a strong portion of the technical skills required for the role."
    );
  }

  if (matchedSkills.length >= 4) {
    strengths.push(
      "Resume demonstrates multiple relevant technical skills."
    );
  }

  if (matchedKeywords.length >= 5) {
    strengths.push(
      "Resume has good keyword alignment with the job description."
    );
  }

  if (
    resumeData.summary &&
    String(resumeData.summary).trim()
  ) {
    strengths.push(
      "Resume includes a professional summary."
    );
  }

  if (atsScore >= 75) {
    strengths.push(
      "Overall ATS compatibility is strong for this job description."
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      "Resume contains some information relevant to the target role."
    );
  }

  return strengths;
};


// GENERATE IMPROVEMENTS
const generateImprovements = ({
  missingSkills,
  missingKeywords,
  resumeData,
}) => {
  const improvements = [];

  if (missingSkills.length > 0) {
    improvements.push(
      `Consider including these job-relevant skills only if you genuinely have experience with them: ${missingSkills
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  if (missingKeywords.length > 0) {
    improvements.push(
      `Where accurate, improve alignment with relevant job terminology such as: ${missingKeywords
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  if (
    !resumeData.summary ||
    !String(
      resumeData.summary
    ).trim()
  ) {
    improvements.push(
      "Add a concise professional summary tailored to the target role."
    );
  }

  if (
    !Array.isArray(
      resumeData.projects
    ) ||
    resumeData.projects.length === 0
  ) {
    improvements.push(
      "Add relevant projects that demonstrate practical application of your skills."
    );
  }

  if (
    !Array.isArray(
      resumeData.experience
    ) ||
    resumeData.experience.length === 0
  ) {
    improvements.push(
      "Add relevant internship, work, freelance, or practical experience where applicable."
    );
  }

  if (
    !Array.isArray(
      resumeData.education
    ) ||
    resumeData.education.length === 0
  ) {
    improvements.push(
      "Include your education details to improve resume completeness."
    );
  }

  return improvements;
};


// MAIN ATS ANALYSIS FUNCTION
const analyzeResumeAgainstJob = (
  resume,
  jobDescription
) => {
  const resumeData =
    resume.resume_data || {};

  const resumeText =
    resumeDataToText(resumeData);

  const resumeSkills =
    extractResumeSkills(
      resumeData
    );

  const {
    jobSkills,
    matchedSkills,
    missingSkills,
  } = analyzeSkills({
    resumeSkills,
    resumeText,
    jobDescription,
  });

  const {
    matchedKeywords,
    missingKeywords,
    totalKeywords,
  } = analyzeKeywords(
    resumeText,
    jobDescription
  );

  const atsScore =
    calculateAtsScore({
      matchedSkills,
      jobSkills,
      matchedKeywords,
      totalKeywords,
      resumeData,
    });

  const strengths =
    generateStrengths({
      matchedSkills,
      jobSkills,
      matchedKeywords,
      atsScore,
      resumeData,
    });

  const improvements =
    generateImprovements({
      missingSkills,
      missingKeywords,
      resumeData,
    });

  return {
    atsScore,
    matchedKeywords,
    missingKeywords,
    matchedSkills,
    missingSkills,
    strengths,
    improvements,
  };
};


module.exports = {
  analyzeResumeAgainstJob,
};