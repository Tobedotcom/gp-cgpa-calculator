import "../css/components/CGPASummary.css";

import { getHonoursClassification, getCGPAColorClass } from "../utils/grades";

function CGPASummary({ overallCGPA }) {
  console.log("CGPASummary overallCGPA:", overallCGPA);
  const honoursClassification = getHonoursClassification(overallCGPA);

  const cgpaColorClass = getCGPAColorClass(overallCGPA);

  return (
    <section className="cgpa-summary">
      <div className="cgpa-summary__header">
        <div>
          <p className="cgpa-summary__eyebrow">OVERALL CGPA</p>

          <h2 className={cgpaColorClass}>
            {overallCGPA === null ? "—" : overallCGPA.toFixed(2)}
          </h2>
        </div>

        <span className="cgpa-summary__scale">/ 5.00</span>
      </div>

      <div className="cgpa-summary__stats">
        <div>
          <span>Honours Classification</span>

          <strong className={cgpaColorClass}>{honoursClassification}</strong>
        </div>
      </div>
    </section>
  );
}

export default CGPASummary;
