import "../css/components/CourseRow.css";

import { getQualityPoints } from "../utils/grades";

function CourseRow({ course, onChange }) {
  const gradePoint = getQualityPoints(course.grade, course.units);

  return (
    <div className="course-row">
      <input
        type="text"
        placeholder="Course name or code"
        value={course.name}
        onChange={(e) =>
          onChange("name", e.target.value.toUpperCase())
        }
        autoFocus
      />

      <select
        value={course.units}
        onChange={(e) => onChange("units", e.target.value)}
      >
        <option value="" disabled>
          Units
        </option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
      </select>

      <select
        value={course.grade}
        onChange={(e) => onChange("grade", e.target.value)}
      >
        <option value="" disabled>
          Grade
        </option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
      </select>

      <span className="course-row__grade-point">
        {gradePoint !== null ? gradePoint.toFixed(1) : "—"}
      </span>
    </div>
  );
}

export default CourseRow;