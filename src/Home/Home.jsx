import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import NewsletterSubscribe from "./NewsletterSubscribe";

export default function Home() {
    const navigate = useNavigate();
    const db = getFirestore();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (!u) {
                navigate("/login", { replace: true });
                return;
            }
            setUser(u);
            try {
                const snap = await getDoc(doc(db, "users", u.uid));
                if (snap.exists()) setProfile(snap.data());
            } catch (e) {
                console.warn("Failed to load profile:", e);
            } finally {
                setLoading(false);
            }
        });
        return () => unsub();
    }, [db, navigate]);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut(auth);
            navigate("/login", { replace: true });
        } finally {
            setSigningOut(false);
        }
    };

    const displayName =
        profile?.firstName || user?.displayName || user?.email?.split("@")[0] || "there";

    if (loading) {
        return (
            <div className="home-wrap">
                <div className="home-card">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-wrap">
            <div className="home-card">
                <h2 className="home-title">Welcome, {displayName} 👋</h2>
                <p className="home-subtitle">
                    You’re now signed in{user?.email ? ` as ${user.email}` : ""}.
                </p>
                <button
                    onClick={() => navigate("/posts/new")}
                    style={{padding: "10px 16px", fontWeight: 600}}
                >
                    post
                </button>
                <button
                                    onClick={() => navigate("/plans")}
                 style={{padding: "10px 16px", fontWeight: 600, marginLeft: 12}}
                 >
                 Plans

            </button>

            <div className="home-actions">
                <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="home-primaryBtn"
                >
                    {signingOut ? "Signing out..." : "Sign out"}
                </button>
            </div>

            {/* Newsletter subscription */}
            <div style={{marginTop: 24}}>
                <h3 style={{marginBottom: 8}}>Subscribe to our newsletter</h3>
                <NewsletterSubscribe/>
            </div>
        </div>
</div>
)
    ;
}
