import "../css/components/CourseTableRow.css";
import { useState } from "react";
import { getQualityPoints } from "../utils/grades";

function CourseTableRow({ course, onUpdate, onDelete }) {
  const [editingField, setEditingField] = useState(null);

  function commitChange(field, value) {
    const updated = { ...course, [field]: value };
    updated.gradePoint = getQualityPoints(updated.grade, updated.units);
    onUpdate(updated);
    setEditingField(null);
  }

  return (
    <div className="course-table__row">
      {editingField === "name" ? (
        <input
          type="text"
          autoFocus
          defaultValue={course.name}
          onBlur={(e) => commitChange("name", e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
        />
      ) : (
        <span className="course-table__editable" onClick={() => setEditingField("name")}>
          {course.name}
        </span>
      )}

      {editingField === "units" ? (
        <select
          autoFocus
          defaultValue={course.units}
          onChange={(e) => commitChange("units", e.target.value)}
          onBlur={() => setEditingField(null)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
      ) : (
        <span className="course-table__editable" onClick={() => setEditingField("units")}>
          {course.units}
        </span>
      )}

      {editingField === "grade" ? (
        <select
          autoFocus
          defaultValue={course.grade}
          onChange={(e) => commitChange("grade", e.target.value)}
          onBlur={() => setEditingField(null)}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
        </select>
      ) : (
        <span className="course-table__editable" onClick={() => setEditingField("grade")}>
          {course.grade}
        </span>
      )}

      <span>{course.gradePoint.toFixed(1)}</span>

      <button
        type="button"
        className="course-table__delete"
        onClick={() => onDelete(course.id)}
        aria-label={`Delete ${course.name}`}
      >
          ×
      </button>
    </div>
  );
}

export default CourseTableRow;