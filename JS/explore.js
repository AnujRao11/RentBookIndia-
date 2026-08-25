/* ============================================================
   RENTBOOK INDIA
   EXPLORE.JS

   Explore Books page.

   Features:
       Search
       Category filtering
       Sorting
       No-result state
       Mobile navigation
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeExplorePage();

    }
);


function initializeExplorePage() {

    const searchInput =
        document.getElementById(
            "bookSearch"
        );

    const searchButton =
        document.getElementById(
            "searchButton"
        );

    const booksGrid =
        document.getElementById(
            "booksGrid"
        );

    const noResults =
        document.getElementById(
            "noResults"
        );

    const categoryButtons =
        document.querySelectorAll(
            ".category-card"
        );

    const sortBooks =
        document.getElementById(
            "sortBooks"
        );


    if (!booksGrid) {
        return;
    }


    let selectedCategory =
        "all";


    /* ========================================================
       FILTER
    ======================================================== */

    function filterBooks() {

        const query =
            searchInput
                ?.value
                .toLowerCase()
                .trim() || "";


        const cards =
            Array.from(
                booksGrid.querySelectorAll(
                    ".book-card"
                )
            );


        let count = 0;


        cards.forEach(card => {

            const title =
                (
                    card.dataset.title ||
                    card.querySelector("h3")
                        ?.textContent ||
                    ""
                )
                    .toLowerCase();


            const category =
                (
                    card.dataset.category ||
                    ""
                )
                    .toLowerCase();


            const author =
                (
                    card.querySelector(
                        ".book-author"
                    )?.textContent ||
                    ""
                )
                    .toLowerCase();


            const matchesSearch =
                title.includes(query) ||
                author.includes(query);


            const matchesCategory =
                selectedCategory ===
                    "all" ||

                category ===
                    selectedCategory;


            const visible =
                matchesSearch &&
                matchesCategory;


            card.style.display =
                visible
                    ? ""
                    : "none";


            if (visible) {

                count++;

            }

        });


        if (noResults) {

            noResults.classList.toggle(
                "show",
                count === 0
            );

        }

    }


    /* ========================================================
       SEARCH
    ======================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterBooks
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            filterBooks
        );

    }


    /* Enter key */

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    filterBooks();

                }

            }
        );

    }


    /* ========================================================
       CATEGORY BUTTONS
    ======================================================== */

    categoryButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    categoryButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedCategory =
                        (
                            button.dataset.category ||
                            "all"
                        ).toLowerCase();


                    filterBooks();

                }
            );

        }
    );


    /* ========================================================
       SORT
    ======================================================== */

    if (sortBooks) {

        sortBooks.addEventListener(
            "change",
            () => {

                const cards =
                    Array.from(
                        booksGrid.querySelectorAll(
                            ".book-card"
                        )
                    );


                cards.sort(
                    (a, b) => {

                        const priceA =
                            Number(
                                a.dataset.price ||
                                a.dataset.rent ||
                                0
                            );


                        const priceB =
                            Number(
                                b.dataset.price ||
                                b.dataset.rent ||
                                0
                            );


                        const ratingA =
                            Number(
                                a.dataset.rating ||
                                0
                            );


                        const ratingB =
                            Number(
                                b.dataset.rating ||
                                0
                            );


                        switch (
                            sortBooks.value
                        ) {

                            case "low":

                                return (
                                    priceA -
                                    priceB
                                );


                            case "high":

                                return (
                                    priceB -
                                    priceA
                                );


                            case "rating":

                                return (
                                    ratingB -
                                    ratingA
                                );


                            default:

                                return 0;

                        }

                    }
                );


                cards.forEach(
                    card => {

                        booksGrid.appendChild(
                            card
                        );

                    }
                );


                filterBooks();

            }
        );

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    filterBooks();

}