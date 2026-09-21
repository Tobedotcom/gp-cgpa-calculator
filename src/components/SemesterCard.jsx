
import "../css/components/SemesterCard.css";

import CourseTable from "./CourseTable";

import { calculateSemesterGP } from "../utils/grades";

import { useEffect, useState } from "react";

function SemesterCard({
  user,
  yearId,
  semesterId,
  semesterName,
  initialCourses,
  title,
  onGPChange,
  isOpen,
  onToggle,
  onDelete,
  onGuestSecondCourse,
}) {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [currentSemesterId, setCurrentSemesterId] = useState(semesterId);

  const [courses, setCourses] = useState(
    (initialCourses ?? []).map((course) => ({
      ...course,
      name: course.course_code,
      gradePoint:
        course.grade === ""
          ? 0
          : Number(course.units) *
            ({ A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[course.grade] ?? 0),
    })),
  );

  useEffect(() => {
    setCurrentSemesterId(semesterId);
  }, [semesterId]);

  useEffect(() => {
    setCourses(
      (initialCourses ?? []).map((course) => ({
        ...course,
        name: course.course_code,
        gradePoint:
          course.grade === ""
            ? 0
            : Number(course.units) *
              ({ A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[course.grade] ?? 0),
      })),
    );
  }, [initialCourses]);

  const totalUnits = courses.reduce(
    (sum, course) => sum + Number(course.units || 0),
    0,
  );

  const semesterGP = calculateSemesterGP(courses);

  useEffect(() => {
    onGPChange(semesterGP);
  }, [semesterGP, onGPChange]);

  useEffect(() => {
    if (user) return;

    if (courses.length === 2) {
      onGuestSecondCourse?.();
    }
  }, [courses.length, user, onGuestSecondCourse]);

  function handleSemesterDeleted() {
    setCurrentSemesterId(null);
    setCourses([]);
    setIsAddingCourse(false);
    onGPChange(null);
  }

  return (
    <article className="semester-card">
      <div className="semester-card__header" onClick={onToggle}>
        <div>
          <span className="semester-card__label">SEMESTER</span>
          <h4>{title}</h4>
        </div>

        <div className="semester-card__summary">
          <div>
            <span>Semester GP</span>
            <strong>
              {semesterGP === null ? "—" : semesterGP.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Total Units</span>
            <strong>{totalUnits}</strong>
          </div>
        </div>

        <button
          type="button"
          className="semester-card__delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
            handleSemesterDeleted();
          }}
          aria-label={`Delete ${title}`}
        >
          ×
        </button>

        <button
          type="button"
          className={`semester-card__toggle ${
            isOpen ? "semester-card__toggle--open" : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          aria-label={isOpen ? "Collapse semester" : "Expand semester"}
        >
          ↓
        </button>
      </div>

      <div
        className={`semester-card__content ${
          isOpen ? "semester-card__content--open" : ""
        }`}
      >
        <CourseTable
          user={user}
          yearId={yearId}
          semesterId={currentSemesterId}
          semesterName={semesterName}
          onSemesterCreated={setCurrentSemesterId}
          courses={courses}
          onCoursesChange={setCourses}
          isAddingCourse={isAddingCourse}
          onStartAdding={() => setIsAddingCourse(true)}
          onCancelAdding={() => setIsAddingCourse(false)}
        />
      </div>
    </article>
  );
}

export default SemesterCard;
