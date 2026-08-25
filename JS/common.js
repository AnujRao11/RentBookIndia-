/* ============================================================
   RENTBOOK INDIA
   COMMON.JS

   Shared frontend functionality used across pages.

   Responsibilities:
   1. Mobile navigation
   2. Smooth scrolling
   3. Active navigation
   4. Image fallback
   5. Small UI helpers

   IMPORTANT:
   This is frontend-only JavaScript.

   It does NOT:
   - authenticate real users
   - connect to MongoDB
   - process payments
   - communicate with delivery partners

   Those features will come later through backend APIs.
============================================================ */


/* ============================================================
   1. DOM READY
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    setupMobileNavigation();

    setupSmoothScrolling();

    setupImageFallbacks();

    setupCurrentYear();

});


/* ============================================================
   2. MOBILE NAVIGATION

   Works with the navigation structure already used by
   the RentBook India pages.

   Example IDs:
       mobile-menu-toggle
       mobile-navigation

   Book/explore pages use their own equivalent IDs.
============================================================ */

function setupMobileNavigation() {

    const toggle =
        document.getElementById("mobile-menu-toggle");

    const navigation =
        document.getElementById("mobile-navigation");

    if (toggle && navigation) {

        toggle.addEventListener("click", () => {

            navigation.classList.toggle("active");

            const isOpen =
                navigation.classList.contains("active");

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            toggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

        });


        /* Close menu after clicking a link */

        navigation
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    navigation.classList.remove("active");

                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });

    }


    /* ------------------------------------------------------------
       Alternative navigation IDs used by book/explore pages
    ------------------------------------------------------------ */

    const alternativeToggle =
        document.getElementById("mobileMenuButton");

    const alternativeNavigation =
        document.getElementById("mobileNavigation");

    if (
        alternativeToggle &&
        alternativeNavigation
    ) {

        alternativeToggle.addEventListener(
            "click",
            () => {

                alternativeNavigation
                    .classList.toggle("active");

            }
        );

    }

}


/* ============================================================
   3. SMOOTH INTERNAL SCROLLING
============================================================ */

function setupSmoothScrolling() {

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(targetId);

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });

}


/* ============================================================
   4. IMAGE FALLBACK

   If an image is missing, the website should not look broken.
============================================================ */

function setupImageFallbacks() {

    document
        .querySelectorAll("img")
        .forEach(image => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );

                    image.alt =
                        "Image unavailable";

                }
            );

        });

}


/* ============================================================
   5. CURRENT YEAR

   Automatically changes copyright year.
============================================================ */

function setupCurrentYear() {

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    yearElements.forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });

}


/* ============================================================
   6. TOAST MESSAGE

   Small reusable notification system.
============================================================ */

function showToast(
    message,
    type = "info"
) {

    let toast =
        document.getElementById(
            "rentbook-toast"
        );

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "rentbook-toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.dataset.type = type;

    toast.classList.add("show");

    clearTimeout(
        window.rentBookToastTimer
    );

    window.rentBookToastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


/* ============================================================
   7. SAFE LOCAL STORAGE

   Prevents JavaScript errors if browser storage is unavailable.
============================================================ */

function saveToStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.warn(
            "Storage unavailable:",
            error
        );

        return false;

    }

}


function getFromStorage(key) {

    try {

        const value =
            localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : null;

    } catch (error) {

        console.warn(
            "Storage read failed:",
            error
        );

        return null;

    }

}