//TODO: use javascript here instead of in same page as html

document.addEventListener("DOMContentLoaded", function () {
	let currentPage = 0;
	const pages = document.querySelectorAll(".page");

	function showPage(pageIndex) {
		if (pageIndex >= 0 && pageIndex < pages.length) {
			pages[currentPage].style.display = "none";
			pages[pageIndex].style.display = "block";
			currentPage = pageIndex;
		}
	}

	function nextPage() {
		showPage(currentPage + 1);
	}

	function prevPage() {
		showPage(currentPage - 1);
	}

	showPage(0);
});
