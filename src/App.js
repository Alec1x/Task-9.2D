import React,{ Suspense, lazy }from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login/Login.jsx";
import SignUp from "./SignUp/SignUp.jsx";
import Home from "./Home/Home.jsx";
import PostComposePage from "./features/posts/PostComposePage.jsx";
import FindQuestionPage from "./features/posts/FindQuestionPage.jsx";
import PlansPage from "./features/billing/PlansPage.jsx";
import CheckoutPage from "./features/billing/CheckoutPage.jsx";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/home" element={<Home />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
                {/* 新增：8.1D 发帖模块路由 */}
                <Route path="/posts/new" element={<PostComposePage />} />
                <Route path="/posts/find" element={<FindQuestionPage />} />

                <Route path="/plans" element={<PlansPage />}/>
                <Route path="/checkout" element={<CheckoutPage />}/>
            </Routes>
        </BrowserRouter>
    );
}
