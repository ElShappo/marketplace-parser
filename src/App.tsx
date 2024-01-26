import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Table from "./pages/Table/Table";
import PageLayout from "./components/PageLayout/PageLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Table />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
