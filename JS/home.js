/* ============================================================
   RENTBOOK INDIA
   HOME.JS

   Homepage interactions.
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupHomeNavigation();

        setupHeroButtons();

        setupRevealAnimations();

        setupStatsAnimation();

    }
);


/* ============================================================
   1. HOMEPAGE NAVIGATION
============================================================ */

function setupHomeNavigation() {

    const navigationLinks =
        document.querySelectorAll(
            ".nav-links a"
        );

    navigationLinks.forEach(link => {

        link.addEventListener(
            "click",
            function () {

                navigationLinks.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                this.classList.add("active");

            }
        );

    });

}


/* ============================================================
   2. HERO BUTTON INTERACTION
============================================================ */

function setupHeroButtons() {

    const exploreButton =
        document.querySelector(
            'a[href*="explore.html"]'
        );

    const listBookButton =
        document.querySelector(
            'a[href*="add-book.html"]'
        );


    if (exploreButton) {

        exploreButton.addEventListener(
            "click",
            () => {

                console.log(
                    "Opening Explore Books..."
                );

            }
        );

    }


    if (listBookButton) {

        listBookButton.addEventListener(
            "click",
            () => {

                console.log(
                    "Opening seller book listing..."
                );

            }
        );

    }

}


/* ============================================================
   3. SCROLL REVEAL

   Adds a small visual entrance effect when sections enter
   the viewport.

   CSS can later define:
       .js-reveal
       .js-revealed
============================================================ */

function setupRevealAnimations() {

    const sections =
        document.querySelectorAll(
            "section"
        );

    if (!sections.length) {
        return;
    }


    sections.forEach(section => {

        section.classList.add(
            "js-reveal"
        );

    });


    if (
        !("IntersectionObserver" in window)
    ) {

        sections.forEach(section => {

            section.classList.add(
                "js-revealed"
            );

        });

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "js-revealed"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.15
            }
        );


    sections.forEach(section => {

        observer.observe(section);

    });

}


/* ============================================================
   4. STAT NUMBER ANIMATION

   Example:
       500+
       100+
       20+

   This is only visual frontend animation.
============================================================ */

function setupStatsAnimation() {

    const stats =
        document.querySelectorAll(
            ".hero-stat strong"
        );

    stats.forEach(stat => {

        stat.addEventListener(
            "mouseenter",
            () => {

                stat.style.transform =
                    "scale(1.08)";

            }
        );

        stat.addEventListener(
            "mouseleave",
            () => {

                stat.style.transform =
                    "";

            }
        );

    });

}