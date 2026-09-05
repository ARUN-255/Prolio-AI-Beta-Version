import api from "./api";

export const runAtsAnalysis = async (payload) => {
  const response = await api.post("/students/ats/analyze", payload);
  return response.data;
};

export const runUploadedAtsAnalysis = async ({ file, jobTitle, jobDescription }) => {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_title", jobTitle || "");
  formData.append("job_description", jobDescription);

  const response = await api.post(
    "/students/ats/analyze-upload",
    formData
  );

  return response.data;
};

export const getAtsAnalyses = async () => {
  const response = await api.get("/students/ats");
  return response.data;
};

export const getAtsAnalysisById = async (id) => {
  const response = await api.get(`/students/ats/${id}`);
  return response.data;
};

export const deleteAtsAnalysis = async (id) => {
  const response = await api.delete(`/students/ats/${id}`);
  return response.data;
};
