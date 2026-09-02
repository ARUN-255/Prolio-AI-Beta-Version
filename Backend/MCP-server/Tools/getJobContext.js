const getJobContext = ({
  jobTitle = "",
  jobDescription = "",
  requiredSkills = [],
}) => {
  const normalizedSkills = Array.isArray(
    requiredSkills
  )
    ? requiredSkills
        .filter(
          (skill) =>
            typeof skill === "string" &&
            skill.trim().length > 0
        )
        .map((skill) =>
          skill.trim()
        )
    : [];

  if (
    !jobTitle.trim() &&
    !jobDescription.trim() &&
    normalizedSkills.length === 0
  ) {
    throw new Error(
      "Job context is required"
    );
  }

  return {
    job_title:
      jobTitle.trim() || null,

    job_description:
      jobDescription.trim() || null,

    required_skills:
      normalizedSkills,
  };
};

module.exports = {
  getJobContext,
};