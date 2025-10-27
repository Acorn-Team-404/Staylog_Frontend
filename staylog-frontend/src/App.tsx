import { useOutlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from "./global/components/Navbar"

function App() {
  const currentOutlet = useOutlet();

  return (
    <>
      <Navbar></Navbar>
      <div className="container" style={{ paddingTop: '82px' }}>
        {currentOutlet}
      </div>
    </>
  );
}

export default App;