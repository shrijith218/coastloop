import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [community, setCommunity] = useState("juhu-guardians");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(db, "users", result.user.uid), {
        name: name,
        email: result.user.email,
        communityId: community,
        ecoPoints: 0,
        rankScore: 0,
        totalVerifiedDisposals: 0,
        totalReports: 0,
        badges: ["CoastLoop Starter"],
        createdAt: serverTimestamp(),
      });

      navigate("/home");
    } catch (firebaseError) {
      console.error("Registration error:", firebaseError);

      if (firebaseError.code === "auth/email-already-in-use") {
        setError(
          "An account already exists with this email. Please log in instead.",
        );
      } else if (firebaseError.code === "permission-denied") {
        setError(
          "Account created, but Firestore blocked the profile setup. Check Firestore Rules.",
        );
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Unable to create account. Check the browser console for details.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="logo">🌊</div>
        <h1>Join CoastLoop</h1>
        <p className="tagline">Start protecting your coast today.</p>

        <form onSubmit={handleRegister}>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="community">Community</label>
          <select
            id="community"
            value={community}
            onChange={(event) => setCommunity(event.target.value)}
          >
            <option value="juhu-guardians">Juhu Coast Guardians</option>
            <option value="versova-wave">Versova Clean Wave</option>
            <option value="college-eco">College Eco Champions</option>
          </select>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}