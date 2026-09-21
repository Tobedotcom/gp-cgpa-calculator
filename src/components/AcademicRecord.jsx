import "../css/components/AcademicRecord.css";
import YearCard from "./YearCard";
import { useCallback, useEffect, useState } from "react";
import { calculateOverallCGPA } from "../utils/grades";
import TranscriptModal from "./TranscriptModal";
import { supabase } from "../lib/supabase";
import { generateId } from "../utils/generateId";

function AcademicRecord({
  user,
  onOverallCGPAChange,
  onGuestSecondCourse,
  isTranscriptOpen,
  onCloseTranscript,
  onTranscriptContinue,
}) {
  const [yearError, setYearError] = useState("");
  const [yearToDelete, setYearToDelete] = useState(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  const [years, setYears] = useState([
    {
      id: generateId(),
      yearNumber: 1,
    },
  ]);

  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearNumber, setNewYearNumber] = useState("");
  const [openYearId, setOpenYearId] = useState(null);
  const [yearCGPAs, setYearCGPAs] = useState({});

  const overallCGPA = calculateOverallCGPA(
    years.map((year) => yearCGPAs[year.id] ?? null),
  );

  useEffect(() => {
    onOverallCGPAChange(overallCGPA);
  }, [overallCGPA, onOverallCGPAChange]);

  const handleYearCGPAChange = useCallback((yearId, cgpa) => {
    setYearCGPAs((current) => {
      if (current[yearId] === cgpa) {
        return current;
      }

      return {
        ...current,
        [yearId]: cgpa,
      };
    });
  }, []);

  function handleYearToggle(yearId) {
    setOpenYearId((currentId) =>
      currentId === yearId ? null : yearId,
    );
  }

  async function handleAddYear() {
    const yearNumber = Number(newYearNumber);

    if (!yearNumber || yearNumber < 1) {
      setYearError("Please enter a valid year number.");
      return;
    }

    const yearExists = years.some(
      (year) => year.yearNumber === yearNumber,
    );

    if (yearExists) {
      setYearError(`Year ${yearNumber} already exists.`);
      return;
    }

    if (!user) {
      setYears((currentYears) => {
        const updatedYears = [
          ...currentYears,
          {
            id: generateId(),
            yearNumber,
          },
        ];

        return updatedYears.sort(
          (a, b) => a.yearNumber - b.yearNumber,
        );
      });

      setNewYearNumber("");
      setYearError("");
      setIsAddingYear(false);
      return;
    }

    const { data, error } = await supabase
      .from("academic_years")
      .insert({
        user_id: user.id,
        year_number: yearNumber,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating academic year:", error);
      setYearError("Could not save this year. Please try again.");
      return;
    }

    setYears((currentYears) => {
      const updatedYears = [
        ...currentYears,
        {
          id: data.id,
          yearNumber: data.year_number,
        },
      ];

      return updatedYears.sort(
        (a, b) => a.yearNumber - b.yearNumber,
      );
    });

    setNewYearNumber("");
    setYearError("");
    setIsAddingYear(false);
  }

  function handleDeleteYear(yearId) {
    const year = years.find((year) => year.id === yearId);
    setYearToDelete(year);
  }

  async function confirmDeleteYear() {
    if (!yearToDelete) return;

    if (!user) {
      setYears((currentYears) =>
        currentYears.filter(
          (year) => year.id !== yearToDelete.id,
        ),
      );

      setYearCGPAs((currentCGPAs) => {
        const updatedCGPAs = { ...currentCGPAs };
        delete updatedCGPAs[yearToDelete.id];
        return updatedCGPAs;
      });

      setYearToDelete(null);
      return;
    }

    const { error } = await supabase
      .from("academic_years")
      .delete()
      .eq("id", yearToDelete.id);

    if (error) {
      console.error("Error deleting academic year:", error);
      return;
    }

    setYears((currentYears) =>
      currentYears.filter(
        (year) => year.id !== yearToDelete.id,
      ),
    );

    setYearCGPAs((currentCGPAs) => {
      const updatedCGPAs = { ...currentCGPAs };
      delete updatedCGPAs[yearToDelete.id];
      return updatedCGPAs;
    });

    setYearToDelete(null);
  }

  useEffect(() => {
    if (!user) return;

    async function loadAcademicRecords() {
      setIsLoadingRecords(true);

      const { data, error } = await supabase
        .from("academic_years")
        .select(
          `
            id,
            year_number,
            semesters (
              id,
              name,
              courses (
                id,
                course_code,
                units,
                grade
              )
            )
          `,
        )
        .eq("user_id", user.id)
        .order("year_number");

      if (error) {
        console.error("Error loading academic records:", error);
        setIsLoadingRecords(false);
        return;
      }

      if (data) {
        setYears(
          data.map((year) => ({
            id: year.id,
            yearNumber: year.year_number,
            semesters: year.semesters ?? [],
          })),
        );
      }

      setIsLoadingRecords(false);
    }

    loadAcademicRecords();
  }, [user]);

  return (
    <section className="academic-record">
      <div className="academic-record__header">
        <div>
          <p className="academic-record__eyebrow">
            ACADEMIC RECORD
          </p>
          <h2>Your Academic History</h2>
        </div>
      </div>

      <div className="academic-record__years">
        {years.map((year) => (
          <YearCard
            user={user}
            key={year.id}
            onGuestSecondCourse={onGuestSecondCourse}
            yearNumber={year.yearNumber}
            yearId={year.id}
            savedSemesters={year.semesters ?? []}
            onDelete={() => handleDeleteYear(year.id)}
            isOpen={openYearId === year.id}
            onToggle={() => handleYearToggle(year.id)}
            onCGPAChange={handleYearCGPAChange}
          />
        ))}
      </div>

      {/* Add Year Button */}
      <button
        type="button"
        className="academic-record__add-year"
        onClick={() => {
          setIsAddingYear(true);
          setYearError("");
        }}
      >
        + Add Year
      </button>

      {/* Add Year Modal */}
      {isAddingYear && (
        <div className="academic-record__modal-backdrop">
          <div className="academic-record__modal">
            <h3>Add Academic Year</h3>

            <label htmlFor="year-number">
              Year Number
            </label>

            <input
              id="year-number"
              type="number"
              min="1"
              value={newYearNumber}
              onChange={(e) => {
                setNewYearNumber(e.target.value);
                setYearError("");
              }}
              placeholder="e.g. 2"
              autoFocus
            />

            {yearError && (
              <p className="academic-record__year-error">
                {yearError}
              </p>
            )}

            <div className="academic-record__modal-actions">
              <button
                type="button"
                onClick={() => {
                  setIsAddingYear(false);
                  setNewYearNumber("");
                  setYearError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddYear}
              >
                Add Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Year Modal */}
      {yearToDelete && (
        <div className="academic-record__modal-backdrop">
          <div className="academic-record__modal">
            <h3>
              Delete Year {yearToDelete.yearNumber}?
            </h3>

            <p>
              This will delete the entire academic year,
              including both semesters and all courses.
              This action cannot be undone.
            </p>

            <div className="academic-record__modal-actions">
              <button
                type="button"
                onClick={() => setYearToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="academic-record__modal-delete"
                onClick={confirmDeleteYear}
              >
                Delete Year
              </button>
            </div>
          </div>
        </div>
      )}

      <TranscriptModal
        years={years}
        isOpen={isTranscriptOpen}
        onClose={onCloseTranscript}
        onContinue={onTranscriptContinue}
      />
    </section>
  );
}

export default AcademicRecord;