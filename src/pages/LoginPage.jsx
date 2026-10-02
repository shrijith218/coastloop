import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      navigate("/home");
    } catch (firebaseError) {
      console.error(firebaseError);

      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait and try again.");
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="logo">🌊</div>

        <h1>CoastLoop</h1>

        <p className="tagline">
          Dispose Right. Protect the Coast.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-footer">
          New to CoastLoop? <Link to="/register">Create an account</Link>
        </p>

        <small>
          Your location is used only to find bins and validate responsible
          disposal rewards.
        </small>
      </section>
    </main>
  );
}