let currentPage = 0;
let totalPages = 0;

const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get("token");
sessionStorage.setItem("accessToken", accessToken);

function searchSpider() {
	const searchText = document
		.getElementById("search-input")
		.value.toLowerCase();
	const pages = document.querySelectorAll(".page");
	let found = false;
	for (let i = 0; i < pages.length; i++) {
		const spiderName = pages[i].querySelector("h2").textContent.toLowerCase();
		if (spiderName.includes(searchText)) {
			currentPage = i;
			showPage(currentPage);
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

	function checkLoginAndUpdateContent(token) {
		fetch(
			"http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000/user",
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
			.then((response) => response.json())
			.then((data) => {
				if (accessToken) {
					loginBtn.style.display = "none";
					logoutBtn.style.display = "inline";
					navUsername.textContent = data.username;
					navUsername.style.display = "inline";
					bookContent.style.display = "block";
					fetchSpidersInfo(token).then(displaySpiders);
				} else {
					loginBtn.style.display = "inline";
					logoutBtn.style.display = "none";
					navUsername.style.display = "none";
					bookContent.style.display = "none";
				}
			});
	}

	checkLoginAndUpdateContent(sessionStorage.getItem("accessToken"));

	document.getElementById("sort").addEventListener("change", function () {
		fetchSpidersInfo(sessionStorage.getItem("accessToken")).then((data) => {
			if (data) {
				const sortedData = sortData(data, this.value);
				displaySpiders(sortedData);
			}
		});
	});

	function fetchSpidersInfo(token) {
		const apiUrl =
			"http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000/api/spiders-info";
		return fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((response) => response.json());
	}

	function sortData(data, sortOrder) {
		if (sortOrder === "asc") {
			return data.sort((a, b) => a.spiderName.localeCompare(b.spiderName));
		} else if (sortOrder === "desc") {
			return data.sort((a, b) => b.spiderName.localeCompare(a.spiderName));
		}
		return data;
	}

	function displaySpiders(data) {
		const book = document.querySelector(".book");
		const existingPages = document.querySelectorAll(".page");
		existingPages.forEach((page) => page.remove());

		data.forEach((spider, index) => {
			const page = document.createElement("article");
			page.classList.add("page");
			page.innerHTML = `
    <section class="spider-page">
		<article class="arrow-container">
                <span class="arrow left-arrow" onclick="prevPage()"></span>
				<span class="arrow right-arrow" onclick="nextPage()"></span>
			</article>
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
		showPage(currentPage);
	}

	document.addEventListener("click", function (event) {
		const target = event.target;
		if (target.classList.contains("left-arrow")) {
			if (currentPage > 0) {
				currentPage--;
				showPage(currentPage);
			}
		} else if (target.classList.contains("right-arrow")) {
			if (currentPage < totalPages - 1) {
				currentPage++;
				showPage(currentPage);
			}
		}
	});
});
