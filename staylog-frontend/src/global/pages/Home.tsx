import api from "../api";

function Home() {
  async function handleSubmit() {

      try {
        const res = await api.get("/v1/test")
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
  }


  return (
    <>
      <button onClick={handleSubmit}>Api 연결 Test</button>
    </>
  );
}

export default Home;