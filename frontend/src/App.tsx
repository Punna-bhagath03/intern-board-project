import './App.css';
import Whiteboard from './components/whiteboard';
import Signup from './components/signup';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Whiteboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
export default App;
