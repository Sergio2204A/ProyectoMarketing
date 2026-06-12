import { useState } from "react";

function Home() {

  const [formData, setFormData] = useState({
    product: "",
    goal: "",
    audience: "",
    channel: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>

      <h1>Marketing AI Platform</h1>

      <h2>Generador de Campañas</h2>

      <br />

      <input
        type="text"
        name="product"
        placeholder="Producto"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="goal"
        placeholder="Objetivo"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="audience"
        placeholder="Público"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="channel"
        placeholder="Canal"
        onChange={handleChange}
      />

      <br /><br />

      <button>
        Generar Campaña
      </button>

      <hr />

      <h3>Vista previa</h3>

      <pre>
        {JSON.stringify(formData, null, 2)}
      </pre>

    </div>
  );
}

export default Home;