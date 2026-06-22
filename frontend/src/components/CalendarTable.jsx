function CalendarTable({ data }) {

  if (data.length === 0) {

    return (
      <p>
        No hay contenido generado.
      </p>
    );
  }

  return (

    <table className="calendar-table">

      <thead>
        <tr>
          <th>Día</th>
          <th>Idea</th>
          <th>Copy</th>
          <th>Hora</th>
        </tr>
      </thead>

      <tbody>

        {data.map((item, index) => (

          <tr key={index}>

            <td>{item.day}</td>
            <td>{item.idea}</td>
            <td>{item.copy}</td>
            <td>{item.hour}</td>

          </tr>

        ))}

      </tbody>

    </table>

  );
}

export default CalendarTable;