import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route
        path="/welcome"
        element={
          <main className="app-shell">
            <section className="welcome-card" aria-labelledby="welcome-title">
              <p className="eyebrow">Prolio AI</p>
              <h1 id="welcome-title">Build your professional profile with clarity.</h1>
              <p className="welcome-copy">
                The frontend foundation is running. Authentication, dashboards, portfolio,
                resume tools, ATS, recruiter tools, and billing will be added through this SPA.
              </p>
            </section>
          </main>
        }
      />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}

export default App;
