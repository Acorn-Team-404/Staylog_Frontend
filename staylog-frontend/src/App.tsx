import { useOutlet } from "react-router-dom";

function App() {
  const currentOutlet = useOutlet();

  return (
    <div className='container'>
      {currentOutlet}
    </div>
  );
}

export default App;