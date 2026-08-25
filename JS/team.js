/* ============================================================
   RENTBOOK INDIA
   TEAM.JS

   Team page interactions.

   Current responsibilities:
       1. Team-card hover interaction
       2. Image loading handling
       3. Optional role highlighting
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTeamCards();

        initializeTeamImages();

    }
);


/* ============================================================
   1. TEAM CARDS
============================================================ */

function initializeTeamCards() {

    const cards =
        document.querySelectorAll(
            ".team-card"
        );


    cards.forEach(card => {

        card.addEventListener(
            "mouseenter",
            () => {

                cards.forEach(
                    other => {

                        if (
                            other !== card
                        ) {

                            other.classList.add(
                                "team-card-dim"
                            );

                        }

                    }
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                cards.forEach(
                    other => {

                        other.classList.remove(
                            "team-card-dim"
                        );

                    }
                );

            }
        );

    });

}


/* ============================================================
   2. TEAM IMAGE HANDLING
============================================================ */

function initializeTeamImages() {

    const images =
        document.querySelectorAll(
            ".team-card img"
        );


    images.forEach(image => {

        image.addEventListener(
            "load",
            () => {

                image.classList.add(
                    "loaded"
                );

            }
        );


        image.addEventListener(
            "error",
            () => {

                image.style.display =
                    "none";


                const parent =
                    image.parentElement;


                if (parent) {

                    parent.classList.add(
                        "placeholder"
                    );

                }

            }
        );

    });

}