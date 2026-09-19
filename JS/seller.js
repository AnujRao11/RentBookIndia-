// Mobile menu

const menuButton = document.getElementById("menuButton");
const mobileNav = document.getElementById("mobileNav");

if (menuButton && mobileNav) {

    menuButton.addEventListener("click", function () {

        mobileNav.classList.toggle("show");

    });

}


// FAQ

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function (question) {

    question.addEventListener("click", function () {

        const faqItem = question.parentElement;

        faqItem.classList.toggle("open");

    });

});