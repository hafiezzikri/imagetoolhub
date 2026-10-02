/* ========================================
   IMAGETOOLSHUB
   MAIN JAVASCRIPT
======================================== */

/* ========================================
   SELECT ELEMENTS
======================================== */

const body = document.body;

const themeToggle = document.getElementById("themeToggle");

const menuToggle = document.getElementById("menuToggle");

const navMenu = document.getElementById("navMenu");

const navLinks = document.querySelectorAll(".nav-link");

/* ========================================
   DARK MODE
======================================== */

/*
    Check saved theme
    from LocalStorage
*/

const savedTheme = localStorage.getItem("theme");

/*
    If user previously selected
    dark mode, activate it
*/

if (savedTheme === "dark") {
  body.classList.add("dark-mode");
}

/* ========================================
   THEME TOGGLE
======================================== */

function updateThemeIcon() {
  if (!themeToggle) {
    return;
  }

  const icon = themeToggle.querySelector("i");

  if (!icon) {
    return;
  }

  const isDarkMode = body.classList.contains("dark-mode");

  /*
        Change icon
    */

  if (isDarkMode) {
    icon.className = "bx bx-sun";

    themeToggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    icon.className = "bx bx-moon";

    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  }
}

/*
    Update icon when page loads
*/

updateThemeIcon();

/* ========================================
   THEME BUTTON
======================================== */

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    /*
                Toggle dark mode
            */

    body.classList.toggle("dark-mode");

    /*
                Check current theme
            */

    const isDarkMode = body.classList.contains("dark-mode");

    /*
                Save theme
                to LocalStorage
            */

    if (isDarkMode) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }

    /*
                Update icon
            */

    updateThemeIcon();
  });
}

/* ========================================
   MOBILE NAVIGATION
======================================== */

function closeMobileMenu() {
  /*
        Stop if navigation
        does not exist
    */

  if (!navMenu) {
    return;
  }

  navMenu.classList.remove("active");

  updateMenuIcon();
}

/* ========================================
   UPDATE MOBILE MENU ICON
======================================== */

function updateMenuIcon() {
  if (!menuToggle) {
    return;
  }

  const icon = menuToggle.querySelector("i");

  if (!icon) {
    return;
  }

  /*
        If nav menu does not exist,
        reset to menu icon
    */

  if (!navMenu) {
    icon.className = "bx bx-menu";

    menuToggle.setAttribute("aria-label", "Open navigation menu");

    return;
  }

  const isMenuOpen = navMenu.classList.contains("active");

  /*
        If menu is open
    */

  if (isMenuOpen) {
    icon.className = "bx bx-x";

    menuToggle.setAttribute("aria-label", "Close navigation menu");
  } else {
    icon.className = "bx bx-menu";

    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }
}

/* ========================================
   MOBILE MENU BUTTON
======================================== */

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", function (event) {
    /*
                Prevent click from
                triggering outside click
            */

    event.stopPropagation();

    /*
                Toggle mobile menu
            */

    navMenu.classList.toggle("active");

    /*
                Update menu icon
            */

    updateMenuIcon();
  });
}

/* ========================================
   CLOSE MOBILE MENU
   WHEN NAV LINK IS CLICKED
======================================== */

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    closeMobileMenu();
  });
});

/* ========================================
   CLOSE MOBILE MENU
   WHEN ESCAPE IS PRESSED
======================================== */

document.addEventListener("keydown", function (event) {
  if (
    event.key === "Escape" &&
    navMenu &&
    navMenu.classList.contains("active")
  ) {
    closeMobileMenu();
  }
});

/* ========================================
   CLOSE MOBILE MENU
   WHEN CLICKING OUTSIDE
======================================== */

document.addEventListener("click", function (event) {
  /*
            Stop if nav menu
            does not exist
        */

  if (!navMenu) {
    return;
  }

  /*
            Check if menu is open
        */

  const isMenuOpen = navMenu.classList.contains("active");

  if (!isMenuOpen) {
    return;
  }

  /*
            Check if click is
            inside navbar
        */

  const isInsideNavbar = event.target.closest(".navbar");

  /*
            Close menu if
            clicking outside navbar
        */

  if (!isInsideNavbar) {
    closeMobileMenu();
  }
});

/* ========================================
   INITIAL MENU STATE
======================================== */

updateMenuIcon();

/* ========================================
   CONSOLE MESSAGE
======================================== */

console.log("ImageToolsHub is running successfully!");
