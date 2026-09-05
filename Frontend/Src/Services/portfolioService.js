import api from "./api";

/* =========================================================
   Main Student Profile
   ========================================================= */

export const getStudentProfile = async () => {
  const response = await api.get("/students/portfolio");
  return response.data;
};

export const createStudentProfile = async (profileData) => {
  const response = await api.post(
    "/students/portfolio",
    profileData
  );

  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put(
    "/students/portfolio",
    profileData
  );

  return response.data;
};

/* =========================================================
   Complete Portfolio
   ========================================================= */

export const getCompletePortfolio = async () => {
  const response = await api.get("/students/portfolio/all");
  return response.data;
};

/* =========================================================
   Projects
   ========================================================= */

export const getProjects = async () => {
  const response = await api.get(
    "/students/portfolio/projects"
  );

  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post(
    "/students/portfolio/projects",
    projectData
  );

  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await api.put(
    `/students/portfolio/projects/${id}`,
    projectData
  );

  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(
    `/students/portfolio/projects/${id}`
  );

  return response.data;
};

/* =========================================================
   Experience
   ========================================================= */

export const getExperiences = async () => {
  const response = await api.get(
    "/students/portfolio/experiences"
  );

  return response.data;
};

export const createExperience = async (experienceData) => {
  const response = await api.post(
    "/students/portfolio/experiences",
    experienceData
  );

  return response.data;
};

export const updateExperience = async (
  id,
  experienceData
) => {
  const response = await api.put(
    `/students/portfolio/experiences/${id}`,
    experienceData
  );

  return response.data;
};

export const deleteExperience = async (id) => {
  const response = await api.delete(
    `/students/portfolio/experiences/${id}`
  );

  return response.data;
};

/* =========================================================
   Education
   ========================================================= */

export const getEducation = async () => {
  const response = await api.get(
    "/students/portfolio/education"
  );

  return response.data;
};

export const createEducation = async (educationData) => {
  const response = await api.post(
    "/students/portfolio/education",
    educationData
  );

  return response.data;
};

export const updateEducation = async (
  id,
  educationData
) => {
  const response = await api.put(
    `/students/portfolio/education/${id}`,
    educationData
  );

  return response.data;
};

export const deleteEducation = async (id) => {
  const response = await api.delete(
    `/students/portfolio/education/${id}`
  );

  return response.data;
};

/* =========================================================
   Skills
   ========================================================= */

export const getSkills = async () => {
  const response = await api.get(
    "/students/portfolio/skills"
  );

  return response.data;
};

export const createSkill = async (skillData) => {
  const response = await api.post(
    "/students/portfolio/skills",
    skillData
  );

  return response.data;
};

export const updateSkill = async (id, skillData) => {
  const response = await api.put(
    `/students/portfolio/skills/${id}`,
    skillData
  );

  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await api.delete(
    `/students/portfolio/skills/${id}`
  );

  return response.data;
};

/* =========================================================
   Certificates
   ========================================================= */

export const getCertificates = async () => {
  const response = await api.get(
    "/students/portfolio/certificates"
  );

  return response.data;
};

export const createCertificate = async (
  certificateData
) => {
  const response = await api.post(
    "/students/portfolio/certificates",
    certificateData
  );

  return response.data;
};

export const updateCertificate = async (
  id,
  certificateData
) => {
  const response = await api.put(
    `/students/portfolio/certificates/${id}`,
    certificateData
  );

  return response.data;
};

export const deleteCertificate = async (id) => {
  const response = await api.delete(
    `/students/portfolio/certificates/${id}`
  );

  return response.data;
};

/* =========================================================
   Public Portfolio Slug
   ========================================================= */

export const updatePortfolioSlug = async (slug) => {
  const response = await api.put(
    "/students/portfolio/slug",
    { slug }
  );

  return response.data;
};