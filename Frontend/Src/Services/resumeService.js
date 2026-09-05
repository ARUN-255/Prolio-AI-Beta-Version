import api from "./api";

export const getResumes = async () => {
  const response = await api.get("/students/resumes");
  return response.data;
};

export const getResumeById = async (id) => {
  const response = await api.get(`/students/resumes/${id}`);
  return response.data;
};

export const createResume = async (resumeData) => {
  const response = await api.post("/students/resumes", resumeData);
  return response.data;
};

export const updateResume = async (id, resumeData) => {
  const response = await api.put(`/students/resumes/${id}`, resumeData);
  return response.data;
};

export const deleteResume = async (id) => {
  const response = await api.delete(`/students/resumes/${id}`);
  return response.data;
};

export const importResumeFromPortfolio = async () => {
  const response = await api.get("/students/resumes/import/profile");
  return response.data;
};

export const updateResumeData = async (id, resumeData) => {
  const response = await api.put(`/students/resume/${id}/data`, resumeData);
  return response.data;
};

export const generateResumePdf = async (id) => {
  const response = await api.post(`/students/resume/${id}/generate-pdf`);
  return response.data;
};

export const getResumePdfUrl = async (id) => {
  const response = await api.get(`/students/resume/${id}/pdf-url`);
  return response.data;
};

export const updateResumeVisibility = async (id, isPublic) => {
  const response = await api.patch(`/students/resumes/${id}/visibility`, {
    is_public: isPublic,
  });
  return response.data;
};
