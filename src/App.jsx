import { useState } from "react";
import "./App.css";
import logoTecno from "./assets/mesa.png";

function App() {

  const [incidencia, setIncidencia] = useState("");
  const [solucion, setSolucion] = useState("");

  const [llamadaEntrante, setLlamadaEntrante] = useState(false);
  const [enLlamada, setEnLlamada] = useState(false);

  const [recognition, setRecognition] = useState(null);

  const [duracion, setDuracion] = useState(0);
  const [timer, setTimer] = useState(null);

  const [micActivo, setMicActivo] = useState(false);

  const API_URL = "http://localhost:8000";

  // -------------------------
  // INICIAR MICRÓFONO
  // -------------------------

  const iniciarVoz = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    const recog = new SpeechRecognition();

    recog.lang = "es-MX";
    recog.continuous = true;

    recog.onresult = async (event) => {

      let texto = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        texto += event.results[i][0].transcript;
      }

      const res = await fetch(`${API_URL}/detect-problem`,{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({ text: texto })
      })

      const data = await res.json();

      if(data.problem){
        setIncidencia(data.problem)
        buscarSolucion(data.problem)
      }

    }

    recog.start();

    setRecognition(recog);
    setMicActivo(true);

  }


  // -------------------------
  // APAGAR MICRÓFONO
  // -------------------------

  const detenerVoz = () => {

    if(recognition){
      recognition.stop()
    }

    setMicActivo(false);

  }


  // -------------------------
  // TOGGLE MICRÓFONO
  // -------------------------

  const toggleMic = () => {

    if(micActivo){
      detenerVoz()
    } else {
      iniciarVoz()
    }

  }


  // -------------------------
  // BUSCAR SOLUCIÓN
  // -------------------------

  const buscarSolucion = async (texto) => {

    const res = await fetch(`${API_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: texto }),
    });

    const data = await res.json();

    if (!data.found) return;

    setSolucion(data.solution_text);

  };


  // -------------------------
  // ACEPTAR LLAMADA
  // -------------------------

  const aceptarLlamada = () => {

    setLlamadaEntrante(false)
    setEnLlamada(true)

    iniciarVoz()

    const intervalo = setInterval(() => {
      setDuracion((prev)=> prev + 1)
    },1000)

    setTimer(intervalo)

  }


  // -------------------------
  // FINALIZAR LLAMADA
  // -------------------------

  const finalizarLlamada = () => {

    detenerVoz()

    if(timer){
      clearInterval(timer)
    }

    setDuracion(0)
    setEnLlamada(false)

  }


  return (
    <div>

      {/* HEADER */}

      <div className="topbar">
        <img src={logoTecno} className="logo" alt="logo" />
        <h1>Sistema de Registro y Gestión de Atención Telefónica</h1>
      </div>


      {/* BARRA DE LLAMADA */}

      {enLlamada && (

        <div className="call-bar">

          <div className="call-info">

            <span className="call-indicator"></span>

            <span className="call-text">
              Llamada en proceso
            </span>

            <span className="call-time">
              {duracion}s
            </span>

          </div>

          <div className="call-controls">

            <button
              className={`btn-mic ${micActivo ? "mic-on" : "mic-off"}`}
              onClick={toggleMic}
            >
              {micActivo ? "🎤 Mic abierto" : "🔇 Mic cerrado"}
            </button>

            <button
              className="btn-hangup"
              onClick={finalizarLlamada}
            >
              🔴 Finalizar
            </button>

          </div>

        </div>

      )}


      <div className="main">

        <button
          className="btn-call"
          onClick={()=>setLlamadaEntrante(true)}
        >
          📞 Simular llamada
        </button>


        <div className="card">

          <textarea
            placeholder="Incidencia detectada..."
            value={incidencia}
            readOnly
          />

        </div>


        <h2 className="label">Solución Sugerida:</h2>

        <div className="card solucion">

          <textarea
            value={solucion}
            readOnly
          />

        </div>

      </div>


      {/* LLAMADA ENTRANTE */}

      {llamadaEntrante && (

        <div className="incoming-call">

          <h2>📞 Llamada entrante</h2>

          <p>Ciudadano</p>

          <div className="call-buttons">

            <button
              className="btn-accept"
              onClick={aceptarLlamada}
            >
              Aceptar
            </button>

            <button
              className="btn-reject"
              onClick={()=>setLlamadaEntrante(false)}
            >
              Rechazar
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;