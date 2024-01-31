import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TableComponent from "./pages/Table/TableComponent";
import PageLayout from "./components/PageLayout/PageLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<TableComponent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
