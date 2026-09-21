import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import FUTO_ACADEMIC_DATA from "../data/futoAcademicData";

import "../css/components/Profile.css";

function Profile({ onProfileUpdated }) {
  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");

  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");

  const [facultySearch, setFacultySearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const [showFacultyOptions, setShowFacultyOptions] =
    useState(false);

  const [showDepartmentOptions, setShowDepartmentOptions] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      setFullName(data.full_name);
      setMatricNumber(data.matric_number);
      setFaculty(data.faculty);
      setDepartment(data.department);

      setFacultySearch(data.faculty || "");
      setDepartmentSearch(data.department || "");
    }

    getProfile();
  }, []);

  const selectedFaculty = FUTO_ACADEMIC_DATA.find(
    (item) => item.code === faculty,
  );

  const filteredFaculties = FUTO_ACADEMIC_DATA.filter((item) =>
    item.code
      .toLowerCase()
      .includes(facultySearch.toLowerCase()),
  );

  const filteredDepartments = selectedFaculty
    ? selectedFaculty.departments.filter((item) =>
        item
          .toLowerCase()
          .includes(departmentSearch.toLowerCase()),
      )
    : [];

  function handleFacultyChange(event) {
    const value = event.target.value;

    setFacultySearch(value);
    setShowFacultyOptions(true);
  }

  function handleFacultySelect(facultyCode) {
    setFaculty(facultyCode);
    setFacultySearch(facultyCode);

    setDepartment("");
    setDepartmentSearch("");

    setShowFacultyOptions(false);
  }

  function handleDepartmentChange(event) {
    const value = event.target.value;

    setDepartmentSearch(value);
    setShowDepartmentOptions(true);
  }

  function handleDepartmentSelect(departmentName) {
    setDepartment(departmentName);
    setDepartmentSearch(departmentName);

    setShowDepartmentOptions(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    if (!faculty) {
      setMessage("Please select a faculty.");
      return;
    }

    if (!department) {
      setMessage("Please select a department.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        matric_number: matricNumber,
        faculty,
        department,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile saved successfully!");

    onProfileUpdated?.();
  }

  return (
    <div className="profile-card">
      <h1 className="profile-card__title">
        Student Profile
      </h1>

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >
        <div className="profile-field">
          <label
            className="profile-field__label"
            htmlFor="fullName"
          >
            Full Name
          </label>

          <input
            className="profile-field__input"
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            required
          />
        </div>

        <div className="profile-field">
          <label
            className="profile-field__label"
            htmlFor="matricNumber"
          >
            Matric Number
          </label>

          <input
            className="profile-field__input"
            id="matricNumber"
            type="text"
            value={matricNumber}
            onChange={(event) =>
              setMatricNumber(event.target.value)
            }
            required
          />
        </div>

        <div className="profile-field">
          <label
            className="profile-field__label"
            htmlFor="faculty"
          >
            Faculty
          </label>

          <div className="profile-field__combobox">
            <input
              className="profile-field__input"
              id="faculty"
              type="text"
              value={facultySearch}
              onChange={handleFacultyChange}
              onFocus={() => setShowFacultyOptions(true)}
              placeholder="Search faculty..."
              autoComplete="off"
              required
            />

            {showFacultyOptions && (
              <div className="profile-field__options">
                {filteredFaculties.length > 0 ? (
                  filteredFaculties.map((item) => (
                    <button
                      className="profile-field__option"
                      key={item.code}
                      type="button"
                      onClick={() =>
                        handleFacultySelect(item.code)
                      }
                    >
                      {item.code}
                    </button>
                  ))
                ) : (
                  <p className="profile-field__empty">
                    No faculty found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-field">
          <label
            className="profile-field__label"
            htmlFor="department"
          >
            Department
          </label>

          <div className="profile-field__combobox">
            <input
              className="profile-field__input"
              id="department"
              type="text"
              value={departmentSearch}
              onChange={handleDepartmentChange}
              onFocus={() => {
                if (selectedFaculty) {
                  setShowDepartmentOptions(true);
                }
              }}
              placeholder={
                faculty
                  ? "Search department..."
                  : "Select a faculty first"
              }
              autoComplete="off"
              disabled={!faculty}
              required
            />

            {showDepartmentOptions && selectedFaculty && (
              <div className="profile-field__options">
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((item) => (
                    <button
                      className="profile-field__option"
                      key={item}
                      type="button"
                      onClick={() =>
                        handleDepartmentSelect(item)
                      }
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <p className="profile-field__empty">
                    No department found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          className="profile-form__submit"
          type="submit"
        >
          Save Profile
        </button>
      </form>

      {message && (
        <p className="profile-message">{message}</p>
      )}
    </div>
  );
}

export default Profile;