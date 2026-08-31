const compareResumes = ({
  resumeA,
  resumeB,
  requiredSkills = [],
}) => {
  const dataA = resumeA.resume_data || {};
  const dataB = resumeB.resume_data || {};

  const skillsA = Array.isArray(dataA.skills)
    ? dataA.skills
    : [];

  const skillsB = Array.isArray(dataB.skills)
    ? dataB.skills
    : [];

  const normalizedSkillsA = skillsA.map((skill) =>
    String(skill).toLowerCase().trim()
  );

  const normalizedSkillsB = skillsB.map((skill) =>
    String(skill).toLowerCase().trim()
  );

  const commonSkills = normalizedSkillsA.filter(
    (skill) =>
      normalizedSkillsB.includes(skill)
  );

  const uniqueToA = normalizedSkillsA.filter(
    (skill) =>
      !normalizedSkillsB.includes(skill)
  );

  const uniqueToB = normalizedSkillsB.filter(
    (skill) =>
      !normalizedSkillsA.includes(skill)
  );

  const projectCountA = Array.isArray(
    dataA.projects
  )
    ? dataA.projects.length
    : 0;

  const projectCountB = Array.isArray(
    dataB.projects
  )
    ? dataB.projects.length
    : 0;

  const experienceCountA = Array.isArray(
    dataA.experience
  )
    ? dataA.experience.length
    : 0;

  const experienceCountB = Array.isArray(
    dataB.experience
  )
    ? dataB.experience.length
    : 0;

  const educationCountA = Array.isArray(
    dataA.education
  )
    ? dataA.education.length
    : 0;

  const educationCountB = Array.isArray(
    dataB.education
  )
    ? dataB.education.length
    : 0;

  // STRUCTURAL COMPLETENESS SCORE
  const calculateScore = ({
    skills,
    projects,
    experience,
    education,
  }) => {
    const skillScore = Math.min(
      skills.length * 5,
      40
    );

    const projectScore = Math.min(
      projects * 10,
      20
    );

    const experienceScore = Math.min(
      experience * 15,
      30
    );

    const educationScore = Math.min(
      education * 10,
      10
    );

    return (
      skillScore +
      projectScore +
      experienceScore +
      educationScore
    );
  };

  const scoreA = calculateScore({
    skills: normalizedSkillsA,
    projects: projectCountA,
    experience: experienceCountA,
    education: educationCountA,
  });

  const scoreB = calculateScore({
    skills: normalizedSkillsB,
    projects: projectCountB,
    experience: experienceCountB,
    education: educationCountB,
  });

  // JOB MATCHING
  const normalizedRequiredSkills =
    Array.isArray(requiredSkills)
      ? requiredSkills.map((skill) =>
          String(skill)
            .toLowerCase()
            .trim()
        )
      : [];

  const matchedRequiredSkillsA =
    normalizedRequiredSkills.filter(
      (skill) =>
        normalizedSkillsA.includes(skill)
    );

  const matchedRequiredSkillsB =
    normalizedRequiredSkills.filter(
      (skill) =>
        normalizedSkillsB.includes(skill)
    );

  const missingRequiredSkillsA =
    normalizedRequiredSkills.filter(
      (skill) =>
        !normalizedSkillsA.includes(skill)
    );

  const missingRequiredSkillsB =
    normalizedRequiredSkills.filter(
      (skill) =>
        !normalizedSkillsB.includes(skill)
    );

  const jobMatchPercentageA =
    normalizedRequiredSkills.length > 0
      ? Math.round(
          (matchedRequiredSkillsA.length /
            normalizedRequiredSkills.length) *
            100
        )
      : 0;

  const jobMatchPercentageB =
    normalizedRequiredSkills.length > 0
      ? Math.round(
          (matchedRequiredSkillsB.length /
            normalizedRequiredSkills.length) *
            100
        )
      : 0;

  const scoreDifference = Math.abs(
    scoreA - scoreB
  );

  const totalSkills =
    normalizedSkillsA.length +
    normalizedSkillsB.length;

  const commonSkillPercentage =
    totalSkills > 0
      ? Math.round(
          (commonSkills.length * 2 /
            totalSkills) *
            100
        )
      : 0;

  let summary;

  if (scoreA > scoreB) {
    summary =
      `${resumeA.title} has the higher structural completeness score by ${scoreDifference} points.`;
  } else if (scoreB > scoreA) {
    summary =
      `${resumeB.title} has the higher structural completeness score by ${scoreDifference} points.`;
  } else {
    summary =
      "Both resumes have the same structural completeness score.";
  }

  return {
    resume_a: {
      id: resumeA.id,
      title: resumeA.title,

      score: scoreA,

      skill_count:
        normalizedSkillsA.length,

      project_count:
        projectCountA,

      experience_count:
        experienceCountA,

      education_count:
        educationCountA,

      job_match_percentage:
        jobMatchPercentageA,

      matched_required_skills:
        matchedRequiredSkillsA,

      missing_required_skills:
        missingRequiredSkillsA,
    },

    resume_b: {
      id: resumeB.id,
      title: resumeB.title,

      score: scoreB,

      skill_count:
        normalizedSkillsB.length,

      project_count:
        projectCountB,

      experience_count:
        experienceCountB,

      education_count:
        educationCountB,

      job_match_percentage:
        jobMatchPercentageB,

      matched_required_skills:
        matchedRequiredSkillsB,

      missing_required_skills:
        missingRequiredSkillsB,
    },

    higher_score:
      scoreA > scoreB
        ? "resume_a"
        : scoreB > scoreA
        ? "resume_b"
        : "tie",

    better_job_match:
      jobMatchPercentageA >
      jobMatchPercentageB
        ? "resume_a"
        : jobMatchPercentageB >
          jobMatchPercentageA
        ? "resume_b"
        : "tie",

    common_skills:
      commonSkills,

    unique_skills_resume_a:
      uniqueToA,

    unique_skills_resume_b:
      uniqueToB,

    score_difference:
      scoreDifference,

    common_skill_percentage:
      commonSkillPercentage,

    summary,
  };
};

module.exports = {
  compareResumes,
};