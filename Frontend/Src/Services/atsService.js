import api from "./api";

export const runAtsAnalysis = async (payload) => {
  const response = await api.post("/students/ats/analyze", payload);
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
