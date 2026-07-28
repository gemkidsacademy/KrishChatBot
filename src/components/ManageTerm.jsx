import { useState } from "react";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";

import AddTerm from "./AddTerm";
import ManageTermsList from "./ManageTermsList";
import "./ManageTerm.css";

export default function ManageTerm({ centerCode }) {
  const [view, setView] = useState("home");

  if (view === "add") {
    return (
      <AddTerm
        centerCode={centerCode}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "manage") {
    return (
      <ManageTermsList
        centerCode={centerCode}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <div className="manage-term-home">

      <div className="term-card">
        <FaPlus className="term-icon" />

        <h2>Add Term</h2>

        <p>
          Create a new academic term for your centre by entering a
          unique term name.
        </p>

        <button onClick={() => setView("add")}>
          Add Term
        </button>
      </div>

      <div className="term-card">
        <FaCalendarAlt className="term-icon" />

        <h2>Manage Terms</h2>

        <p>
          View all terms, edit their details, delete terms, and manage
          the current active term for your centre.
        </p>

        <button onClick={() => setView("manage")}>
          Manage Terms
        </button>
      </div>

    </div>
  );
}