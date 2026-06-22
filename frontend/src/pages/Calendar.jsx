import { useState } from "react";
import CalendarTable from "../components/CalendarTable";

function Calendar() {

  const [calendarData, setCalendarData] =
    useState([]);

  const handleGenerate = () => {

    setCalendarData([
      {
        day: "Lunes",
        idea: "Presentación del producto",
        copy: "Descubre todo lo que tenemos para ti.",
        hour: "9:00 AM"
      },
      {
        day: "Martes",
        idea: "Beneficios del producto",
        copy: "Conoce por qué nuestros clientes lo aman.",
        hour: "11:00 AM"
      },
      {
        day: "Miércoles",
        idea: "Testimonio de cliente",
        copy: "Historias reales, resultados reales.",
        hour: "2:00 PM"
      }
    ]);

  };

  return (
    <div className="calendar-page">

      <div className="calendar-header">

        <h1>
          📅 Generador de Calendario
        </h1>

        <p>
          Genera un plan semanal de contenido.
        </p>

      </div>

      <button
        className="generate-btn"
        onClick={handleGenerate}
      >
        Generar Calendario
      </button>

      <CalendarTable
        data={calendarData}
      />

    </div>
  );
}

export default Calendar;