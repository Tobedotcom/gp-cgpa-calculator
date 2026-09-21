export const GRADE_POINTS = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export function getGradePoint(grade) {
  return GRADE_POINTS[grade] ?? null;
}

export function getQualityPoints(grade, units) {
  const gradePoint = getGradePoint(grade);
  const numericUnits = Number(units);

  if (gradePoint === null || numericUnits <= 0) {
    return null;
  }

  return gradePoint * numericUnits;
}

export function calculateSemesterGP(courses) {
  if (!courses?.length) {
    return null;
  }

  const validCourses = courses.filter(
    (course) =>
      getGradePoint(course.grade) !== null && Number(course.units) > 0,
  );

  if (!validCourses.length) {
    return null;
  }

  const totalUnits = validCourses.reduce(
    (sum, course) => sum + Number(course.units),
    0,
  );

  const totalQualityPoints = validCourses.reduce(
    (sum, course) => sum + getQualityPoints(course.grade, course.units),
    0,
  );

  if (totalUnits === 0) {
    return null;
  }

  return totalQualityPoints / totalUnits;
}

export function calculateYearCGPA(harmattanGP, rainGP) {
  const completedSemesters = [harmattanGP, rainGP].filter(
    (gp) => typeof gp === "number" && !Number.isNaN(gp),
  );

  if (completedSemesters.length === 0) {
    return null;
  }

  const totalGP = completedSemesters.reduce((sum, gp) => sum + gp, 0);

  return totalGP / completedSemesters.length;
}

export function calculateOverallCGPA(yearCGPAs) {
  if (!yearCGPAs?.length) {
    return null;
  }

  const completedYears = yearCGPAs.filter(
    (cgpa) => typeof cgpa === "number" && !Number.isNaN(cgpa),
  );

  if (completedYears.length === 0) {
    return null;
  }

  const totalCGPA = completedYears.reduce((sum, cgpa) => sum + cgpa, 0);

  return totalCGPA / completedYears.length;
}

export function getHonoursClassification(cgpa) {
  if (typeof cgpa !== "number" || Number.isNaN(cgpa)) {
    return "—";
  }

  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.4) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  if (cgpa >= 1.0) return "Pass";
  return "Fail";
}

export function getCGPAColorClass(cgpa) {
  if (typeof cgpa !== "number" || Number.isNaN(cgpa)) {
    return "cgpa--empty";
  }

  if (cgpa >= 4.5) return "cgpa--first-class";
  if (cgpa >= 3.5) return "cgpa--second-upper";
  if (cgpa >= 2.4) return "cgpa--second-lower";
  if (cgpa >= 1.5) return "cgpa--third-class";
  if (cgpa >= 1.0) return "cgpa--pass";

  return "cgpa--fail";
}
