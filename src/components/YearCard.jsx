import "../css/components/YearCard.css";
import SemesterCard from "./SemesterCard";
import { calculateYearCGPA } from "../utils/grades";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function YearCard({
  user,
  yearNumber,
  yearId,
  savedSemesters,
  onDelete,
  isOpen,
  onToggle,
  onCGPAChange,
  onGuestSecondCourse,
}) {
  const [harmattanGP, setHarmattanGP] = useState(null);
  const [rainGP, setRainGP] = useState(null);
  const [openSemester, setOpenSemester] = useState(null);
  const [semesters, setSemesters] = useState(savedSemesters ?? []);

  const yearlyCGPA = calculateYearCGPA(harmattanGP, rainGP);

  useEffect(() => {
    setSemesters(savedSemesters ?? []);
  }, [savedSemesters]);

  useEffect(() => {
    onCGPAChange(yearId, yearlyCGPA);
  }, [yearId, yearlyCGPA, onCGPAChange]);

  function handleSemesterToggle(semester) {
    setOpenSemester((currentSemester) =>
      currentSemester === semester ? null : semester,
    );
  }

  async function handleDeleteSemester(semesterId) {
    if (!semesterId) return;

    // Guest mode
    if (!user) {
      setSemesters((currentSemesters) =>
        currentSemesters.filter((semester) => semester.id !== semesterId),
      );

      return;
    }

    // Logged-in mode
    const { error } = await supabase
      .from("semesters")
      .delete()
      .eq("id", semesterId);

    if (error) {
      console.error("Error deleting semester:", error);
      return;
    }

    // Update the UI after successful deletion
    setSemesters((currentSemesters) =>
      currentSemesters.filter((semester) => semester.id !== semesterId),
    );

    console.log("Semester deleted successfully");
  }

  const harmattanSemester = semesters.find(
    (semester) => semester.name === "Harmattan Semester",
  );

  const rainSemester = semesters.find(
    (semester) => semester.name === "Rain Semester",
  );

  return (
    <article className="year-card">
      <div className="year-card__header" onClick={onToggle}>
        <div>
          <p className="year-card__eyebrow">ACADEMIC YEAR</p>
          <h3>Year {yearNumber}</h3>
        </div>

        <div className="year-card__cgpa">
          <span>Year CGPA</span>
          <strong>{yearlyCGPA === null ? "—" : yearlyCGPA.toFixed(2)}</strong>
        </div>

        <button
          type="button"
          className="year-card__delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete Year ${yearNumber}`}
        >
           ×
        </button>

        <button
          type="button"
          className={`year-card__toggle ${
            isOpen ? "year-card__toggle--open" : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          aria-label={isOpen ? "Collapse year" : "Expand year"}
        >
          ↓
        </button>
      </div>

      <div
        className={`year-card__semesters ${
          isOpen ? "year-card__semesters--open" : ""
        }`}
      >
        <SemesterCard
          user={user}
          yearId={yearId}
          semesterId={harmattanSemester?.id}
          semesterName="Harmattan Semester"
          initialCourses={harmattanSemester?.courses ?? []}
          title={`Year ${yearNumber} – Harmattan Semester`}
          onGPChange={setHarmattanGP}
          isOpen={openSemester === "harmattan"}
          onToggle={() => handleSemesterToggle("harmattan")}
          onDelete={() => handleDeleteSemester(harmattanSemester?.id)}
          onGuestSecondCourse={onGuestSecondCourse}
        />

        <SemesterCard
          user={user}
          yearId={yearId}
          semesterId={rainSemester?.id}
          semesterName="Rain Semester"
          initialCourses={rainSemester?.courses ?? []}
          title={`Year ${yearNumber} – Rain Semester`}
          onGPChange={setRainGP}
          isOpen={openSemester === "rain"}
          onToggle={() => handleSemesterToggle("rain")}
          onDelete={() => handleDeleteSemester(rainSemester?.id)}
          onGuestSecondCourse={onGuestSecondCourse}
        />
      </div>
    </article>
  );
}

export default YearCard;
