import { useEffect, useState } from "react";
import "../css/components/TranscriptModal.css";

function TranscriptModal({ years, isOpen, onClose, onContinue }) {
  const [expandedYears, setExpandedYears] = useState({});
  const [selectedYears, setSelectedYears] = useState({});
  const [selectedSemesters, setSelectedSemesters] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setExpandedYears({});
      setSelectedYears({});
      setSelectedSemesters({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleYearExpansion(yearId) {
    setExpandedYears((current) => ({
      ...current,
      [yearId]: !current[yearId],
    }));
  }

  function handleYearSelection(year, checked) {
    const semesterIds = (year.semesters ?? []).map((semester) => semester.id);

    setSelectedYears((current) => ({
      ...current,
      [year.id]: checked,
    }));

    setSelectedSemesters((current) => {
      const updated = { ...current };

      semesterIds.forEach((semesterId) => {
        updated[semesterId] = checked;
      });

      return updated;
    });
  }

  function handleSemesterSelection(year, semester, checked) {
    setSelectedSemesters((current) => {
      const updated = {
        ...current,
        [semester.id]: checked,
      };

      const semesterIds = (year.semesters ?? []).map((item) => item.id);

      const allSelected =
        semesterIds.length > 0 && semesterIds.every((id) => updated[id]);

      setSelectedYears((currentYears) => ({
        ...currentYears,
        [year.id]: allSelected,
      }));

      return updated;
    });
  }

  function handleContinue() {
    const selected = years
      .map((year) => ({
        ...year,
        semesters: (year.semesters ?? []).filter(
          (semester) => selectedSemesters[semester.id],
        ),
      }))
      .filter((year) => year.semesters.length > 0);

    if (selected.length === 0) {
      return;
    }

    onContinue(selected);
  }

  return (
    <div className="transcript-modal__backdrop">
      <div className="transcript-modal">
        <div className="transcript-modal__header">
          <div>
            <p className="transcript-modal__eyebrow">TRANSCRIPT EXPORT</p>

            <h2>Select Academic Records</h2>

            <p>
              Select the years or semesters you want to include in your
              transcript.
            </p>
          </div>

          <button
            type="button"
            className="transcript-modal__close"
            onClick={onClose}
            aria-label="Close transcript export"
          >
            ×
          </button>
        </div>

        <div className="transcript-modal__years">
          {years.map((year) => {
            const semesters = year.semesters ?? [];
            const isExpanded = expandedYears[year.id] ?? false;

            return (
              <div className="transcript-year" key={year.id}>
                <div className="transcript-year__header">
                  <label className="transcript-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedYears[year.id] ?? false}
                      onChange={(event) =>
                        handleYearSelection(year, event.target.checked)
                      }
                    />

                    <span>Year {year.yearNumber}</span>
                  </label>

                  <button
                    type="button"
                    className="transcript-year__toggle"
                    onClick={() => toggleYearExpansion(year.id)}
                    aria-label={
                      isExpanded
                        ? `Collapse Year ${year.yearNumber}`
                        : `Expand Year ${year.yearNumber}`
                    }
                  >
                    {isExpanded ? "−" : "+"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="transcript-year__semesters">
                    {semesters.length === 0 ? (
                      <p className="transcript-year__empty">
                        No semesters added yet.
                      </p>
                    ) : (
                      semesters.map((semester) => (
                        <label
                          className="transcript-checkbox transcript-checkbox--semester"
                          key={semester.id}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSemesters[semester.id] ?? false}
                            onChange={(event) =>
                              handleSemesterSelection(
                                year,
                                semester,
                                event.target.checked,
                              )
                            }
                          />

                          <span>{semester.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="transcript-modal__actions">
          <button
            type="button"
            className="transcript-modal__cancel"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="transcript-modal__continue"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default TranscriptModal;
