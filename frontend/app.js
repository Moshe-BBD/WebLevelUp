//TODO: use javascript here instead of in same page as html

// document.addEventListener("DOMContentLoaded", function () {
// 	let currentPage = 0;
// 	const pages = document.querySelectorAll(".page");

// 	function showPage(pageIndex) {
// 		if (pageIndex >= 0 && pageIndex < pages.length) {
// 			pages[currentPage].style.display = "none";
// 			pages[pageIndex].style.display = "block";
// 			currentPage = pageIndex;
// 		}
// 	}

// 	function nextPage() {
// 		showPage(currentPage + 1);
// 	}

// 	function prevPage() {
// 		showPage(currentPage - 1);
// 	}

// 	showPage(0);
// });

document.addEventListener("DOMContentLoaded", function () {
	fetch("http://localhost:5000/user")
		.then((response) => response.json())
		.then((data) => {
			const loginBtn = document.getElementById("login-btn");
			const logoutBtn = document.getElementById("logout-btn");
			const navUsername = document.getElementById("nav-username");
			if (data !== "Not logged in") {
				loginBtn.style.display = "none";
				logoutBtn.style.display = "inline";
				navUsername.textContent = data.username;
				navUsername.style.display = "inline";
			} else {
				loginBtn.style.display = "inline";
				logoutBtn.style.display = "none";
				navUsername.style.display = "none";
			}
		});
});
