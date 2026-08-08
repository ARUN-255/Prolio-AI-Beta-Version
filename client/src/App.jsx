import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to Prolio AI...");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage("Could not connect to the backend");
      });
  }, []);

  return (
    <div>
      <h1>Prolio AI</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;