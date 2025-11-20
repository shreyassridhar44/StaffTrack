import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/auth";

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setAllowed(loggedIn);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 tracking-wide">
            Checking authentication…
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
