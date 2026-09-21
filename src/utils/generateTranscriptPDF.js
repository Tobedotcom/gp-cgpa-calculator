
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateTranscriptPDF({
  transcriptData,
  profile,
}) {
  const pdf = new jsPDF();

  // =========================
  // FUTO LOGO
  // =========================

  const logo = new Image();

  await new Promise((resolve) => {
    logo.onload = resolve;
    logo.onerror = resolve;
    logo.src = "/logo.png";
  });

  if (logo.complete && logo.naturalWidth > 0) {
    pdf.addImage(logo, "PNG", 85, 10, 40, 40);
  }

  // =========================
  // DOCUMENT HEADER
  // =========================

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");

  pdf.text(
    "FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI",
    105,
    62,
    {
      align: "center",
    },
  );

  pdf.setFontSize(14);

  pdf.text("ACADEMIC TRANSCRIPT", 105, 70, {
    align: "center",
  });

  // =========================
  // STUDENT INFORMATION
  // =========================

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    `Name: ${profile?.full_name || "—"}`,
    20,
    84,
  );

  pdf.text(
    `Matric Number: ${profile?.matric_number || "—"}`,
    20,
    92,
  );

  pdf.text(
    `Faculty: ${profile?.faculty || "—"}`,
    20,
    100,
  );

  pdf.text(
    `Department: ${profile?.department || "—"}`,
    20,
    108,
  );

  // =========================
  // GRADE POINTS
  // =========================

  const gradePoints = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0,
  };

  // =========================
  // CALCULATE SEMESTER GP
  // =========================

  function calculateSemesterGP(courses) {
    if (!courses || courses.length === 0) {
      return null;
    }

    let totalQualityPoints = 0;
    let totalUnits = 0;

    courses.forEach((course) => {
      const units = Number(course.units) || 0;
      const point = gradePoints[course.grade] ?? 0;

      totalQualityPoints += point * units;
      totalUnits += units;
    });

    if (totalUnits === 0) {
      return null;
    }

    return totalQualityPoints / totalUnits;
  }

  // =========================
  // CALCULATE YEAR CGPA
  // =========================

  function calculateYearCGPA(semesters) {
    const semesterGPs = semesters
      .map((semester) =>
        calculateSemesterGP(semester.courses ?? []),
      )
      .filter((gp) => gp !== null);

    if (semesterGPs.length === 0) {
      return null;
    }

    const total = semesterGPs.reduce(
      (sum, gp) => sum + gp,
      0,
    );

    return total / semesterGPs.length;
  }

  // =========================
  // CALCULATE OVERALL CGPA
  // =========================

  const yearCGPAs = transcriptData
    .map((year) => calculateYearCGPA(year.semesters ?? []))
    .filter((cgpa) => cgpa !== null);

  let overallCGPA = null;

  if (yearCGPAs.length > 0) {
    const total = yearCGPAs.reduce(
      (sum, cgpa) => sum + cgpa,
      0,
    );

    overallCGPA = total / yearCGPAs.length;
  }

  // =========================
  // CLASSIFICATION / HONORS
  // =========================

  function getClassification(cgpa) {
    if (cgpa === null) {
      return "—";
    }

    if (cgpa >= 4.5) {
      return "First Class";
    }

    if (cgpa >= 3.5) {
      return "Second Class Upper";
    }

    if (cgpa >= 2.4) {
      return "Second Class Lower";
    }

    if (cgpa >= 1.5) {
      return "Third Class";
    }

    if (cgpa >= 1.0) {
      return "Pass";
    }

    return "Fail";
  }

  // =========================
  // TRANSCRIPT RECORDS
  // =========================

  let currentY = 122;

  transcriptData.forEach((year) => {
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");

    pdf.text(
      `YEAR ${year.yearNumber}`,
      20,
      currentY,
    );

    currentY += 8;

    year.semesters.forEach((semester) => {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");

      pdf.text(
        semester.name,
        20,
        currentY,
      );

      currentY += 5;

      const rows = (semester.courses ?? []).map((course) => {
        return [
          course.course_code,
          course.units,
          course.grade,
          gradePoints[course.grade] ?? 0,
        ];
      });

      autoTable(pdf, {
        startY: currentY,
        head: [
          ["Course", "Units", "Grade", "Grade Point"],
        ],
        body: rows,
        theme: "grid",
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [1, 112, 77],
        },
      });

      currentY = pdf.lastAutoTable.finalY + 6;

      // =========================
      // SEMESTER GP
      // =========================

      const semesterGP = calculateSemesterGP(
        semester.courses ?? [],
      );

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");

      pdf.text(
        `Semester GP: ${
          semesterGP !== null
            ? semesterGP.toFixed(2)
            : "—"
        }`,
        20,
        currentY,
      );

      currentY += 12;

      // Create a new page if we're running out of space.
      if (currentY > 260) {
        pdf.addPage();
        currentY = 20;
      }
    });

    // =========================
    // YEAR CGPA
    // =========================

    const yearCGPA = calculateYearCGPA(
      year.semesters ?? [],
    );

    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");

    pdf.text(
      `YEAR ${year.yearNumber} CGPA: ${
        yearCGPA !== null
          ? yearCGPA.toFixed(2)
          : "—"
      }`,
      20,
      currentY,
    );

    currentY += 15;
  });

  // =========================
  // OVERALL RESULT
  // =========================

  if (currentY > 235) {
    pdf.addPage();
    currentY = 30;
  }

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");

  pdf.text("ACADEMIC SUMMARY", 20, currentY);

  currentY += 9;

  pdf.setFontSize(11);

  pdf.text(
    `Overall CGPA: ${
      overallCGPA !== null
        ? overallCGPA.toFixed(2)
        : "—"
    }`,
    20,
    currentY,
  );

  currentY += 8;

  pdf.text(
    `Honors / Classification: ${getClassification(
      overallCGPA,
    )}`,
    20,
    currentY,
  );

  // =========================
  // SIGNATURE SECTION
  // =========================

  if (currentY > 225) {
    pdf.addPage();
    currentY = 35;
  }

  currentY += 20;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  // Student signature
  pdf.line(
    20,
    currentY,
    80,
    currentY,
  );

  pdf.text(
    "Student Signature",
    20,
    currentY + 6,
  );

  pdf.line(
    20,
    currentY + 18,
    80,
    currentY + 18,
  );

  pdf.text(
    "Date",
    20,
    currentY + 24,
  );

  // Registrar / Academic Officer signature
  pdf.line(
    120,
    currentY,
    180,
    currentY,
  );

  pdf.text(
    "Registrar / Academic Officer",
    120,
    currentY + 6,
  );

  pdf.line(
    120,
    currentY + 18,
    180,
    currentY + 18,
  );

  pdf.text(
    "Date",
    120,
    currentY + 24,
  );

  // =========================
  // SAVE PDF
  // =========================

  pdf.save("academic-transcript.pdf");
}
