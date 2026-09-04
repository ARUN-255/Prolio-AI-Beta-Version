import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/Home/HomePage";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page">
      <div className="container">
        <p className="eyebrow">Prolio AI</p>
        <h1>{title}</h1>
        <p>This page will be completed in its dedicated frontend step.</p>
      </div>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/features" element={<PlaceholderPage title="Features" />} />
      <Route path="/students" element={<PlaceholderPage title="For Students" />} />
      <Route path="/recruiters" element={<PlaceholderPage title="For Recruiters" />} />
      <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
      <Route path="/login" element={<PlaceholderPage title="Log in" />} />
      <Route path="/register" element={<PlaceholderPage title="Create your account" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
