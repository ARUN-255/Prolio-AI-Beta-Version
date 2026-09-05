import api from "./api";

export const getStudentProfile = async () => (await api.get("/students/portfolio")).data;
export const createStudentProfile = async (profileData) => (await api.post("/students/portfolio", profileData)).data;
export const updateStudentProfile = async (profileData) => (await api.put("/students/portfolio", profileData)).data;
export const getCompletePortfolio = async () => (await api.get("/students/portfolio/all")).data;

export const getProjects = async () => (await api.get("/students/portfolio/projects")).data;
export const createProject = async (projectData) => (await api.post("/students/portfolio/projects", projectData)).data;
export const updateProject = async (id, projectData) => (await api.put(`/students/portfolio/projects/${id}`, projectData)).data;
export const deleteProject = async (id) => (await api.delete(`/students/portfolio/projects/${id}`)).data;

export const getExperiences = async () => (await api.get("/students/portfolio/experiences")).data;
export const createExperience = async (experienceData) => (await api.post("/students/portfolio/experiences", experienceData)).data;
export const updateExperience = async (id, experienceData) => (await api.put(`/students/portfolio/experiences/${id}`, experienceData)).data;
export const deleteExperience = async (id) => (await api.delete(`/students/portfolio/experiences/${id}`)).data;

export const getEducation = async () => (await api.get("/students/portfolio/education")).data;
export const createEducation = async (educationData) => (await api.post("/students/portfolio/education", educationData)).data;
export const updateEducation = async (id, educationData) => (await api.put(`/students/portfolio/education/${id}`, educationData)).data;
export const deleteEducation = async (id) => (await api.delete(`/students/portfolio/education/${id}`)).data;

export const getSkills = async () => (await api.get("/students/portfolio/skills")).data;
export const createSkill = async (skillData) => (await api.post("/students/portfolio/skills", skillData)).data;
export const updateSkill = async (id, skillData) => (await api.put(`/students/portfolio/skills/${id}`, skillData)).data;
export const deleteSkill = async (id) => (await api.delete(`/students/portfolio/skills/${id}`)).data;

export const getCertificates = async () => (await api.get("/students/portfolio/certificates")).data;
export const createCertificate = async (certificateData) => (await api.post("/students/portfolio/certificates", certificateData)).data;
export const updateCertificate = async (id, certificateData) => (await api.put(`/students/portfolio/certificates/${id}`, certificateData)).data;
export const deleteCertificate = async (id) => (await api.delete(`/students/portfolio/certificates/${id}`)).data;

export const updatePortfolioSlug = async (slug) => (await api.put("/students/portfolio/slug", { slug })).data;
export const getPublicPortfolio = async (slug) => (await api.get(`/public/profile/${slug}`)).data;
