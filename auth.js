import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB2FlkeqOusow8qNq9-zeR7erf3kpI1gAU",
    authDomain: "smart-study-planner-5f723.firebaseapp.com",
    projectId: "smart-study-planner-5f723",
    storageBucket: "smart-study-planner-5f723.firebasestorage.app",
    messagingSenderId: "1092762116428",
    appId: "1:1092762116428:web:69ac50ece80d7da382efe9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ===============================
// SIGN UP
// ===============================

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {

    signupBtn.addEventListener("click", async function () {

        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();
        const message = document.getElementById("signupMessage");

        if (!email || !password) {
            message.textContent = "⚠️ Please enter email and password.";
            return;
        }

        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            message.textContent = "✅ Account created successfully!";

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {

            console.error("Signup Error:", error);

            message.textContent =
                "❌ " + error.message;
        }

    });

}


// ===============================
// LOGIN
// ===============================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", async function () {

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        const message = document.getElementById("loginMessage");

        if (!email || !password) {
            message.textContent = "⚠️ Please enter email and password.";
            return;
        }

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            message.textContent = "✅ Login successful!";

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("Login Error:", error);

            message.textContent =
                "❌ Invalid email or password.";
        }

    });

}