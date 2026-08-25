/* ============================================================
   RENTBOOK INDIA
   BOOKS.JS

   Book marketplace frontend logic.

   Features:
       Search
       Category filter
       Sorting
       Reset filters
       Mobile navigation
       Rent button interaction
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeBookMarketplace();

    }
);


function initializeBookMarketplace() {

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

    const noBooks =
        document.getElementById(
            "noBooks"
        );

    const categoryButtons =
        document.querySelectorAll(
            ".category-card"
        );

    const resetCategory =
        document.getElementById(
            "resetCategory"
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
       FILTER BOOKS
    ======================================================== */

    function filterBooks() {

        const searchText =
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


        let visibleCount = 0;


        cards.forEach(card => {

            const title =
                (
                    card.dataset.title ||
                    card
                        .querySelector("h3")
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


            const searchMatch =
                title.includes(
                    searchText
                );


            const categoryMatch =
                selectedCategory ===
                    "all" ||

                category ===
                    selectedCategory;


            const visible =
                searchMatch &&
                categoryMatch;


            card.style.display =
                visible
                    ? ""
                    : "none";


            if (visible) {

                visibleCount++;

            }

        });


        if (noBooks) {

            noBooks.classList.toggle(
                "show",
                visibleCount === 0
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


    /* ========================================================
       CATEGORY FILTER
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
       RESET
    ======================================================== */

    if (resetCategory) {

        resetCategory.addEventListener(
            "click",
            () => {

                selectedCategory =
                    "all";


                if (searchInput) {

                    searchInput.value =
                        "";

                }


                categoryButtons.forEach(
                    button => {

                        button.classList.remove(
                            "active"
                        );

                    }
                );


                const allButton =
                    document.querySelector(
                        '[data-category="all"]'
                    );


                if (allButton) {

                    allButton.classList.add(
                        "active"
                    );

                }


                filterBooks();

            }
        );

    }


    /* ========================================================
       SORTING
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


                const sortType =
                    sortBooks.value;


                cards.sort(
                    (a, b) => {

                        const rentA =
                            Number(
                                a.dataset.rent ||
                                0
                            );


                        const rentB =
                            Number(
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


                        if (
                            sortType ===
                            "low"
                        ) {

                            return (
                                rentA -
                                rentB
                            );

                        }


                        if (
                            sortType ===
                            "high"
                        ) {

                            return (
                                rentB -
                                rentA
                            );

                        }


                        if (
                            sortType ===
                            "rating"
                        ) {

                            return (
                                ratingB -
                                ratingA
                            );

                        }


                        return 0;

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
       RENT BUTTONS

       Real rental processing will come later.
    ======================================================== */

    document
        .querySelectorAll(
            ".rent-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    /*
                       The actual <a> navigation remains active.
                       We only log the event for now.
                    */

                    console.log(
                        "Rental selected:",
                        button.href
                    );

                }
            );

        });


    /* ========================================================
       INITIAL FILTER
    ======================================================== */

    filterBooks();

}