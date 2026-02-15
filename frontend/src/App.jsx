import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import View from "./pages/View";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Upload />} />
      <Route path="/:id" element={<View />} />
    </Routes>
  );
}

export default App;
