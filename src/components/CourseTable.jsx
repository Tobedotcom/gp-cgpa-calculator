import "../css/components/CourseTable.css";

import CourseRow from "./CourseRow";
import CourseTableRow from "./CourseTableRow";

import { useState } from "react";

import { getQualityPoints } from "../utils/grades";

import { supabase } from "../lib/supabase";

import { generateId } from "../utils/generateId";

const emptyCourse = {
  name: "",
  units: "",
  grade: "",
};

function CourseTable({
  user,
  yearId,
  semesterId,
  semesterName,
  onSemesterCreated,
  courses,
  onCoursesChange,
  isAddingCourse,
  onStartAdding,
  onCancelAdding,
}) {
  const [draftCourse, setDraftCourse] = useState(emptyCourse);

  function handleDraftChange(field, value) {
    setDraftCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (!draftCourse.name || !draftCourse.units || !draftCourse.grade) {
      return;
    }

    // Guest mode: keep the course only in React state
    if (!user) {
      const newCourse = {
        id: generateId(),
        ...draftCourse,
        gradePoint: getQualityPoints(draftCourse.grade, draftCourse.units),
      };

      onCoursesChange((prev) => [...prev, newCourse]);
      setDraftCourse(emptyCourse);
      onCancelAdding();
      return;
    }

    // Logged-in mode: save to Supabase
    let currentSemesterId = semesterId;

    // Create the semester if it doesn't exist yet
    if (!currentSemesterId) {
      const { data: semester, error: semesterError } = await supabase
        .from("semesters")
        .insert({
          year_id: yearId,
          name: semesterName,
        })
        .select()
        .single();

      if (semesterError) {
        console.error("Error creating semester:", semesterError);
        return;
      }

      currentSemesterId = semester.id;
      onSemesterCreated(semester.id);
    }

    const units = Number(draftCourse.units);

    const { data: savedCourse, error: courseError } = await supabase
      .from("courses")
      .insert({
        semester_id: currentSemesterId,
        course_code: draftCourse.name,
        units,
        grade: draftCourse.grade,
      })
      .select()
      .single();

    if (courseError) {
      console.error("Error creating course:", courseError);
      return;
    }

    const newCourse = {
      id: savedCourse.id,
      name: savedCourse.course_code,
      units: savedCourse.units,
      grade: savedCourse.grade,
      gradePoint: getQualityPoints(savedCourse.grade, savedCourse.units),
    };

    onCoursesChange((prev) => [...prev, newCourse]);

    setDraftCourse(emptyCourse);
    onCancelAdding();
  }

  async function handleDelete(id) {
    if (!user) {
      onCoursesChange((prev) => prev.filter((course) => course.id !== id));
      return;
    }

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting course:", error);
      return;
    }

    onCoursesChange((prev) => prev.filter((course) => course.id !== id));
  }

  async function handleUpdate(updatedCourse) {
  if (!user) {
    onCoursesChange((prev) =>
      prev.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course,
      ),
    );
    return;
  }

  const { error } = await supabase
    .from("courses")
    .update({
      course_code: updatedCourse.name,
      units: Number(updatedCourse.units),
      grade: updatedCourse.grade,
    })
    .eq("id", updatedCourse.id);

  if (error) {
    console.error("Error updating course:", error);
    return;
  }

  onCoursesChange((prev) =>
    prev.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course,
    ),
  );
}

  return (
    <div className="course-table">
      <div className="course-table__header">
        <span>Course</span>
        <span>Units</span>
        <span>Grade</span>
        <span>Grade Point</span>
        <span></span>
      </div>

      {courses.map((course) => (
        <CourseTableRow
          key={course.id}
          course={course}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}

      {courses.length === 0 && !isAddingCourse && (
        <p className="course-table__empty">No courses added yet.</p>
      )}

      {isAddingCourse && (
        <div className="course-table__entry">
          <CourseRow course={draftCourse} onChange={handleDraftChange} />

          <button
            type="button"
            className="course-table__save"
            onClick={handleSave}
          >
            ✓ Save
          </button>
        </div>
      )}

      {!isAddingCourse && (
        <button
          type="button"
          className="course-table__add"
          onClick={onStartAdding}
        >
          + Add Course
        </button>
      )}
    </div>
  );
}

export default CourseTable;
