/* ============================================================
   RENTBOOK INDIA
   AUTH.JS

   Used by:
       login.html
       signup.html

   CURRENT PURPOSE:
       Frontend authentication prototype.

   IMPORTANT:
       This is NOT real authentication.

   Later:
       auth.js
          ↓
       Express API
          ↓
       MongoDB
          ↓
       Password hashing
          ↓
       JWT / Session
          ↓
       OTP / Google OAuth

============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePasswordToggles();

        initializeLogin();

        initializeSignup();

        initializeForgotPassword();

        initializeGoogleButtons();

    }
);


/* ============================================================
   1. PASSWORD VISIBILITY
============================================================ */

function initializePasswordToggles() {

    setupPasswordToggle(
        "loginPassword",
        "passwordToggle"
    );

    setupPasswordToggle(
        "signupPassword",
        "signupPasswordToggle"
    );

    setupPasswordToggle(
        "confirmPassword",
        "confirmPasswordToggle"
    );

}


function setupPasswordToggle(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);

    if (!input || !button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const hidden =
                input.type === "password";


            if (hidden) {

                input.type = "text";

                button.textContent =
                    "🙈";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type =
                    "password";

                button.textContent =
                    "👁";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


/* ============================================================
   2. LOGIN
============================================================ */

function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearAuthErrors();


            const identifier =
                document
                    .getElementById(
                        "loginIdentifier"
                    )
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    ?.value;


            let valid = true;


            /* Identifier validation */

            if (!identifier) {

                showFieldError(
                    "identifierError",
                    "Enter your email or mobile number."
                );

                valid = false;

            }


            /* Password validation */

            if (!password) {

                showFieldError(
                    "passwordError",
                    "Enter your password."
                );

                valid = false;

            }
            else if (
                password.length < 6
            ) {

                showFieldError(
                    "passwordError",
                    "Password must contain at least 6 characters."
                );

                valid = false;

            }


            if (!valid) {

                showAuthMessage(
                    "Please correct the highlighted fields.",
                    "error"
                );

                return;

            }


            /* ----------------------------------------------------
               FRONTEND DEMO LOGIN

               We check a demo account stored by signup.js.

               This is NOT secure authentication.
            ---------------------------------------------------- */

            const storedUser =
                getFromStorage(
                    "rentbookDemoUser"
                );


            if (
                storedUser &&
                (
                    identifier.toLowerCase() ===
                    storedUser.email.toLowerCase() ||

                    identifier ===
                    storedUser.mobile
                )
            ) {

                if (
                    password ===
                    storedUser.password
                ) {

                    createDemoSession(
                        storedUser
                    );

                    showAuthMessage(
                        "Login successful. Welcome to RentBook India!",
                        "success"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "../index.html";

                        },
                        1200
                    );


                    return;

                }

            }


            /* Demo credentials not found */

            showAuthMessage(
                "Demo account not found or password is incorrect. You can create an account first.",
                "error"
            );

        }
    );

}


/* ============================================================
   3. SIGNUP
============================================================ */

function initializeSignup() {

    const form =
        document.getElementById(
            "signupForm"
        );

    if (!form) {
        return;
    }


    const password =
        document.getElementById(
            "signupPassword"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    /* Password strength */

    if (password) {

        password.addEventListener(
            "input",
            () => {

                updatePasswordStrength(
                    password.value
                );

            }
        );

    }


    /* Confirm password */

    if (confirmPassword) {

        confirmPassword.addEventListener(
            "input",
            () => {

                checkPasswordMatch();

            }
        );

    }


    /* Mobile number */

    const mobile =
        document.getElementById(
            "mobile"
        );

    if (mobile) {

        mobile.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            10
                        );

            }
        );

    }


    /* Signup submit */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearAuthErrors();


            const name =
                document
                    .getElementById(
                        "fullName"
                    )
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById(
                        "email"
                    )
                    ?.value
                    .trim();


            const mobileValue =
                document
                    .getElementById(
                        "mobile"
                    )
                    ?.value
                    .trim();


            const accountType =
                document
                    .getElementById(
                        "accountType"
                    )
                    ?.value;


            const passwordValue =
                password?.value || "";


            const confirmValue =
                confirmPassword?.value || "";


            const terms =
                document
                    .getElementById(
                        "terms"
                    )
                    ?.checked;


            let valid = true;


            /* NAME */

            if (
                !name ||
                name.length < 2
            ) {

                showFieldError(
                    "nameError",
                    "Please enter your full name."
                );

                valid = false;

            }


            /* EMAIL */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                showFieldError(
                    "emailError",
                    "Enter a valid email address."
                );

                valid = false;

            }


            /* MOBILE */

            if (
                !/^[6-9]\d{9}$/.test(
                    mobileValue
                )
            ) {

                showFieldError(
                    "mobileError",
                    "Enter a valid 10-digit Indian mobile number."
                );

                valid = false;

            }


            /* ACCOUNT TYPE */

            if (!accountType) {

                showFieldError(
                    "accountTypeError",
                    "Please select an account type."
                );

                valid = false;

            }


            /* PASSWORD */

            if (
                passwordValue.length < 8
            ) {

                showFieldError(
                    "passwordError",
                    "Password must contain at least 8 characters."
                );

                valid = false;

            }


            /* CONFIRM PASSWORD */

            if (
                passwordValue !==
                confirmValue
            ) {

                showFieldError(
                    "confirmPasswordError",
                    "Passwords do not match."
                );

                valid = false;

            }


            /* TERMS */

            if (!terms) {

                showFieldError(
                    "termsError",
                    "You must accept the terms."
                );

                valid = false;

            }


            if (!valid) {

                showAuthMessage(
                    "Please correct the highlighted fields.",
                    "error"
                );

                return;

            }


            /* ----------------------------------------------------
               FRONTEND DEMO STORAGE

               WARNING:
               Password is stored only for prototype testing.

               NEVER do this in a real production application.
            ---------------------------------------------------- */

            const demoUser = {

                name,

                email,

                mobile: mobileValue,

                accountType,

                password: passwordValue,

                createdAt:
                    new Date().toISOString()

            };


            saveToStorage(
                "rentbookDemoUser",
                demoUser
            );


            showAuthMessage(
                "Account created successfully! This is a frontend demo.",
                "success"
            );


            const button =
                document.getElementById(
                    "signupButton"
                );


            if (button) {

                button.disabled =
                    true;

                const span =
                    button.querySelector(
                        "span"
                    );

                if (span) {

                    span.textContent =
                        "Account Created";

                }

            }


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                1500
            );

        }
    );

}


/* ============================================================
   4. PASSWORD STRENGTH
============================================================ */

function updatePasswordStrength(
    password
) {

    const bars =
        document.querySelectorAll(
            ".strength-bars span"
        );

    const text =
        document.getElementById(
            "strengthText"
        );


    if (!bars.length) {
        return;
    }


    let strength = 0;


    if (
        password.length >= 8
    ) {

        strength++;

    }


    if (
        /[A-Z]/.test(password)
    ) {

        strength++;

    }


    if (
        /[0-9]/.test(password)
    ) {

        strength++;

    }


    if (
        /[^A-Za-z0-9]/.test(password)
    ) {

        strength++;

    }


    bars.forEach(
        (bar, index) => {

            bar.classList.toggle(
                "active",
                index < strength
            );

        }
    );


    if (!text) {
        return;
    }


    const labels = [
        "Password strength",
        "Weak password",
        "Fair password",
        "Good password",
        "Strong password"
    ];


    text.textContent =
        labels[strength];

}


/* ============================================================
   5. PASSWORD MATCH
============================================================ */

function checkPasswordMatch() {

    const password =
        document.getElementById(
            "signupPassword"
        );

    const confirm =
        document.getElementById(
            "confirmPassword"
        );


    if (!password || !confirm) {
        return;
    }


    const error =
        document.getElementById(
            "confirmPasswordError"
        );


    if (
        confirm.value &&
        password.value !==
        confirm.value
    ) {

        if (error) {

            error.textContent =
                "Passwords do not match.";

        }

    }
    else {

        if (error) {

            error.textContent =
                "";

        }

    }

}


/* ============================================================
   6. FORGOT PASSWORD MODAL
============================================================ */

function initializeForgotPassword() {

    const link =
        document.getElementById(
            "forgotPasswordLink"
        );

    const modal =
        document.getElementById(
            "forgotModal"
        );

    const close =
        document.getElementById(
            "closeForgotModal"
        );

    const form =
        document.getElementById(
            "forgotForm"
        );


    if (!link || !modal) {
        return;
    }


    link.addEventListener(
        "click",
        event => {

            event.preventDefault();

            modal.classList.add(
                "active"
            );

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

        }
    );


    if (close) {

        close.addEventListener(
            "click",
            closeForgotModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeForgotModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeForgotModal();

            }

        }
    );


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const email =
                    document
                        .getElementById(
                            "forgotEmail"
                        )
                        ?.value
                        .trim();


                if (!email) {

                    showToast(
                        "Enter your email address.",
                        "error"
                    );

                    return;

                }


                showToast(
                    "Password reset is a frontend demo for now.",
                    "info"
                );


                closeForgotModal();

            }
        );

    }


    function closeForgotModal() {

        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* ============================================================
   7. GOOGLE BUTTONS

   These are placeholders until Google OAuth is integrated.
============================================================ */

function initializeGoogleButtons() {

    const loginButton =
        document.getElementById(
            "googleLogin"
        );

    const signupButton =
        document.getElementById(
            "googleSignup"
        );


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Google Login will be connected after backend/OAuth integration.",
                    "info"
                );

            }
        );

    }


    if (signupButton) {

        signupButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Google Signup will be connected after backend/OAuth integration.",
                    "info"
                );

            }
        );

    }

}


/* ============================================================
   8. DEMO SESSION
============================================================ */

function createDemoSession(
    user
) {

    const session = {

        name: user.name,

        email: user.email,

        accountType:
            user.accountType,

        loggedIn: true,

        loginTime:
            new Date().toISOString()

    };


    saveToStorage(
        "rentbookSession",
        session
    );

}


/* ============================================================
   9. AUTH ERROR HELPERS
============================================================ */

function showFieldError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            message;

    }

}


function clearAuthErrors() {

    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(
            error => {

                error.textContent =
                    "";

            }
        );

}


function showAuthMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "formMessage"
        );


    if (!element) {

        showToast(
            message,
            type
        );

        return;

    }


    element.textContent =
        message;

    element.className =
        "form-message " +
        type;

}