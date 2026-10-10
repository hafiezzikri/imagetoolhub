
document.addEventListener("DOMContentLoaded", function () {
  // Automatically update the copyright year.
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Back-to-top button.
  const backToTopButton = document.getElementById("backToTop");

  if (backToTopButton) {
    backToTopButton.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
