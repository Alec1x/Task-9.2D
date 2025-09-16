import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, googleSignIn } from "../lib/firebase";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";


export default function Login() {
    const navigate = useNavigate();
    const db = getFirestore();

    const [form, setForm] = useState({ email: "", password: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [me, setMe] = useState(null); // 当前登录用户

    //
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setMe(u));
        return () => unsub();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const { email, password } = form;
            if (!email || !password) throw new Error("Please enter email and password.");
            await signInWithEmailAndPassword(auth, email.trim(), password);
            navigate("/home");
        } catch (err) {
            setError(err?.message?.replace("Firebase:", "").trim() || "Invalid email or password.");
        } finally {
            setSubmitting(false);
        }
    };

    const onGoogle = async () => {
        setError("");
        setSubmitting(true);
        try {
            const cred = await googleSignIn();
            const u = cred.user;


            const ref = doc(db, "users", u.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                const full = (u.displayName || "").trim();
                const parts = full.split(/\s+/);
                const firstName = parts[0] || "";
                const lastName = parts.slice(1).join(" ") || "";
                await setDoc(ref, {
                    firstName,
                    lastName,
                    email: u.email,
                    createdAt: serverTimestamp(),
                });
            }

            navigate("/home");
        } catch (err) {
            if (err?.code === "auth/operation-not-allowed") {
                setError("Google sign-in is disabled. Enable it in Authentication > Sign-in method.");
            } else if (err?.code !== "auth/popup-closed-by-user") {
                setError(err?.message?.replace("Firebase:", "").trim() || "Google sign-in failed.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        setError("");
        setSubmitting(true);
        try {
            await signOut(auth);

            navigate("/login");
        } catch (e) {
            setError(e?.message?.replace("Firebase:", "").trim() || "Sign out failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-wrap">
            {me && (
                <div
                    className="login-signedInBar"
                    style={{
                        marginBottom: 12,
                        padding: "8px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 14,
                        background: "#fafafa",
                    }}
                >
                    Signed in as <strong>{me.email}</strong>{" "}
                    <button
                        onClick={handleSignOut}
                        disabled={submitting}
                        style={{ marginLeft: 8 }}
                        className="login-signoutBtn"
                    >
                        Sign out
                    </button>
                    <button
                        onClick={() => navigate("/home")}
                        disabled={submitting}
                        style={{ marginLeft: 8 }}
                        className="login-goHomeBtn"
                    >
                        Go to Home
                    </button>
                </div>
            )}

            <form onSubmit={onSubmit} className="login-card" aria-busy={submitting}>
                <h2 className="login-title">Login</h2>

                <label className="login-label">
                    Email
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="login-input"
                        disabled={submitting}
                    />
                </label>

                <label className="login-label">
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        placeholder="********"
                        autoComplete="current-password"
                        required
                        className="login-input"
                        disabled={submitting}
                    />
                </label>

                {error && (
                    <div role="alert" aria-live="polite" className="login-error">
                        {error}
                    </div>
                )}

                <button type="submit" disabled={submitting} className="login-primaryBtn">
                    {submitting ? "Signing in..." : "Sign in"}
                </button>

                <div className="login-btnRow">
                    <button type="button" onClick={onGoogle} disabled={submitting} className="login-googleBtn">
                        Continue with Google
                    </button>
                </div>

                <div className="login-footer">
                    New here? <Link to="/signup">Create an account</Link>
                </div>
            </form>
        </div>
    );
}
