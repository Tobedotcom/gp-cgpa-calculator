import "../css/components/TranscriptPreview.css";

import { generateTranscriptPDF } from "../utils/generateTranscriptPDF";

function TranscriptPreview({ data, profile, onClose }) {
  if (!data) return null;

  return (
    <div className="transcript-preview__backdrop">
      <div className="transcript-preview">
        <div className="transcript-preview__header">
          <div>
            <p className="transcript-preview__eyebrow">TRANSCRIPT PREVIEW</p>

            <h2>Academic Transcript</h2>
          </div>

          <button
            type="button"
            className="transcript-preview__close"
            onClick={onClose}
            aria-label="Close transcript preview"
          >
            ×
          </button>
        </div>

        <div className="transcript-preview__student">
          <div>
            <span>Full Name</span>
            <strong>{profile?.full_name || "—"}</strong>
          </div>

          <div>
            <span>Matric Number</span>
            <strong>{profile?.matric_number || "—"}</strong>
          </div>

          <div>
            <span>Faculty</span>
            <strong>{profile?.faculty || "—"}</strong>
          </div>

          <div>
            <span>Department</span>
            <strong>{profile?.department || "—"}</strong>
          </div>
        </div>

        <div className="transcript-preview__records">
          {data.map((year) => (
            <section className="transcript-preview__year" key={year.id}>
              <h3>Year {year.yearNumber}</h3>

              {year.semesters.map((semester) => (
                <div className="transcript-preview__semester" key={semester.id}>
                  <div className="transcript-preview__semester-header">
                    <h4>{semester.name}</h4>
                  </div>

                  {semester.courses?.length > 0 ? (
                    <div className="transcript-preview__table-wrapper">
                      <table className="transcript-preview__table">
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Units</th>
                            <th>Grade</th>
                            <th>Grade Point</th>
                          </tr>
                        </thead>

                        <tbody>
                          {semester.courses.map((course) => {
                            const gradePoints = {
                              A: 5,
                              B: 4,
                              C: 3,
                              D: 2,
                              E: 1,
                              F: 0,
                            };

                            const gradePoint = gradePoints[course.grade] ?? 0;

                            return (
                              <tr key={course.id}>
                                <td>{course.course_code}</td>
                                <td>{course.units}</td>
                                <td>{course.grade}</td>
                                <td>{gradePoint.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="transcript-preview__empty">
                      No courses recorded for this semester.
                    </p>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>

        <div className="transcript-preview__actions">
          <button
            type="button"
            className="transcript-preview__close-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="transcript-preview__download"
            onClick={() =>
              generateTranscriptPDF({
                transcriptData: data,
                profile,
              })
            }
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default TranscriptPreview;
