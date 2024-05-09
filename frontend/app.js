let currentPage = 0;
let totalPages = 0;

function searchSpider() {
    const searchText = document
        .getElementById("search-input")
        .value.toLowerCase();
    const pages = document.querySelectorAll(".page");
    let found = false;
    for (let i = 0; i < pages.length; i++) {
        const spiderName = pages[i]
            .querySelector("h2")
            .textContent.toLowerCase();
        if (spiderName.includes(searchText)) {
            currentPage = i; // Update current page globally
            showPage(currentPage); // Display the searched page
            found = true;
            break;
        }
    }
    if (!found) alert("No spider found with that name.");
}

function showPage(pageIndex) {
    const pages = document.querySelectorAll(".page");
    pages.forEach((page, index) => {
        page.style.display = index === pageIndex ? "block" : "none";
    });
    updateArrows();
}

function updateArrows() {
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");
    leftArrow.style.display = currentPage > 0 ? "inline-block" : "none";
    rightArrow.style.display =
        currentPage < totalPages - 1 ? "inline-block" : "none";
}

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const navUsername = document.getElementById("nav-username");
    const bookContent = document.getElementById("book-content");
    const IMAGE_BASE_URL =
        "https://spiderpedia-bucket.s3.eu-west-1.amazonaws.com/";

    function checkLoginAndUpdateContent() {
        fetch(
            "http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000/user"
        )
            .then((response) => response.json())
            .then((data) => {
                if (data !== "Not logged in") {
                    loginBtn.style.display = "none";
                    logoutBtn.style.display = "inline";
                    navUsername.textContent = data.username;
                    navUsername.style.display = "inline";
                    bookContent.style.display = "block";
                    fetchSpidersInfo().then(displaySpiders);
                } else {
                    loginBtn.style.display = "inline";
                    logoutBtn.style.display = "none";
                    navUsername.style.display = "none";
                    bookContent.style.display = "none";
                }
            });
    }

    checkLoginAndUpdateContent();

    document.getElementById("sort").addEventListener("change", function () {
        fetchSpidersInfo().then((data) => {
            if (data) {
                const sortedData = sortData(data, this.value);
                displaySpiders(sortedData);
            }
        });
    });

    function fetchSpidersInfo() {
        const apiUrl =
            "http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000/api/spiders-info";
        return fetch(apiUrl).then((response) => response.json());
    }

    function sortData(data, sortOrder) {
        if (sortOrder === "asc") {
            return data.sort((a, b) =>
                a.spiderName.localeCompare(b.spiderName)
            );
        } else if (sortOrder === "desc") {
            return data.sort((a, b) =>
                b.spiderName.localeCompare(a.spiderName)
            );
        }
        return data;
    }

    function displaySpiders(data) {
        const book = document.querySelector(".book");
        const existingPages = document.querySelectorAll(".page");
        existingPages.forEach((page) => page.remove()); // Remove existing pages

        data.forEach((spider, index) => {
            const page = document.createElement("article");
            page.classList.add("page");
            page.innerHTML = `
    <input type="checkbox" id="checkbox-page${index + 1}" />
    <section class="front-page">
        <h2>${spider.spiderName}</h2>
        <img src="${IMAGE_BASE_URL}${spider.spiderImage}" alt="${
                spider.spiderName
            }" class="spider-image"> 
        <p>${spider.facts || "No fact available"}</p>
    </section>
`;
            book.insertBefore(page, document.querySelector(".back-cover"));
        });

        totalPages = data.length;
        showPage(currentPage); // Reset to first page
    }

    document.querySelector(".left-arrow").addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
        }
    });

    document.querySelector(".right-arrow").addEventListener("click", () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            showPage(currentPage);
        }
    });
});