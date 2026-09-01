const analyzeProject = ({
  project,
  requiredSkills = [],
}) => {
  const title = project.title || "";
  const description = project.description || "";

  // Project model stores technologies in tech_stack
  const technologies = Array.isArray(
    project.tech_stack
  )
    ? project.tech_stack
    : [];

  const normalizedTechnologies =
    technologies.map((item) =>
      String(item).toLowerCase().trim()
    );

  const normalizedRequiredSkills =
    Array.isArray(requiredSkills)
      ? requiredSkills.map((item) =>
          String(item).toLowerCase().trim()
        )
      : [];

  const matchedSkills =
    normalizedRequiredSkills.filter(
      (skill) =>
        normalizedTechnologies.includes(skill)
    );

  const missingSkills =
    normalizedRequiredSkills.filter(
      (skill) =>
        !normalizedTechnologies.includes(skill)
    );

  const skillMatchPercentage =
    normalizedRequiredSkills.length > 0
      ? Math.round(
          (matchedSkills.length /
            normalizedRequiredSkills.length) *
            100
        )
      : 0;

  // PROJECT COMPLETENESS SCORE
  let score = 0;

  if (title.trim()) {
    score += 10;
  }

  if (description.trim()) {
    score += 20;
  }

  if (description.trim().length >= 100) {
    score += 10;
  }

  score += Math.min(
    normalizedTechnologies.length * 5,
    25
  );

  // Current schema has one project link
  if (project.link) {
    score += 20;
  }

  score = Math.min(score, 100);

  const strengths = [];
  const improvements = [];

  if (description.trim().length >= 100) {
    strengths.push(
      "Provides a detailed project description"
    );
  }

  if (normalizedTechnologies.length >= 4) {
    strengths.push(
      "Uses a diverse technology stack"
    );
  }

  if (project.link) {
    strengths.push(
      "Project link is available"
    );
  }

  if (!description.trim()) {
    improvements.push(
      "Add a clear project description"
    );
  } else if (description.trim().length < 100) {
    improvements.push(
      "Provide a more detailed project description"
    );
  }

  if (normalizedTechnologies.length === 0) {
    improvements.push(
      "Add technologies used in the project"
    );
  }

  if (!project.link) {
    improvements.push(
      "Add a project repository or live demo link"
    );
  }

  return {
    project: {
      id: project.id,
      title,
    },

    project_score: score,

    technology_count:
      normalizedTechnologies.length,

    technologies:
      normalizedTechnologies,

    required_skill_match_percentage:
      skillMatchPercentage,

    matched_required_skills:
      matchedSkills,

    missing_required_skills:
      missingSkills,

    strengths,

    improvements,
  };
};

module.exports = {
  analyzeProject,
};