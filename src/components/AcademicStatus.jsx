import "../css/components/AcademicStatus.css";

function AcademicStatus() {
  return (
    <section className="academic-status">
      <div>
        <p className="academic-status__eyebrow">ACADEMIC OVERVIEW</p>
        <h1>Track and calculate your academic progress</h1>
        <p className="academic-status__description">
          Keep your semesters, grades, GP, and CGPA organized in one place.
        </p>
      </div>

      <div className="academic-status__badge">
        5.00 Scale
      </div>
    </section>
  );
}

export default AcademicStatus;