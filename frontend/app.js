let currentPage = 0;
let totalPages = 0;
let ascendingOrder = true;
let userLoggedIn = false;

document.addEventListener("DOMContentLoaded", () => {
	const loginButton = document.getElementById("login-button");
	const logoutButton = document.getElementById("logout-button");
	const navUsername = document.getElementById("nav-username");
	const carousel = document.getElementById("carousel");
	const carouselContainer = document.getElementById('carousel-container');
	const loginMessage = document.getElementById('loginMessage');
	const IMAGE_BASE_URL = "https://spiderpedia-bucket.s3.eu-west-1.amazonaws.com/";

	function fetchSpidersInfo() {
		const apiUrl = "http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000/api/spiders-info";
		return fetch(apiUrl).then((response) => response.json());
	}

	const stubSpiders = fetchSpidersInfo();

	loginButton.addEventListener('click', function() {
        window.location.href = '/login';
    });

	logoutButton.addEventListener('click', function() {
        window.location.href = '/logout';
    });

	function checkLoginAndRenderCards() {
		fetch("http://ec2-3-250-137-103.eu-west-1.compute.amazonaws.com:5000/user")
			.then((response) => response.json())
			.then((data) => {
				if (data !== "Not logged in") {
					userLoggedIn = true;
					loginButton.style.display = "none";
        			logoutButton.style.display = "inline";
					navUsername.textContent = data.username;
					navUsername.style.display = "inline";
					carouselContainer.classList.remove('blur-effect');
					carousel.style.filter = "none";
					loginMessage.style.display = "none";
				} else {
					loginButton.style.display = "inline";
					logoutButton.style.display = "none";
					navUsername.style.display = "none";
					carousel.style.filter = "blur(5px)";
					loginMessage.style.display = "block";
				}
			})
			.catch(error => console.error('Error checking login status:', error));
		renderSpiderCards(stubSpiders);
	}

	checkLoginAndRenderCards();

	function renderSpiderCards(spiderArray) {
		carousel.innerHTML = "";

		spiderArray.forEach((spider, index) => {
			const card = document.createElement("article");
			const img = document.createElement("img");
			const title = document.createElement("h2");
			const desc = document.createElement("p");
			const likeBtn = document.createElement("button");
			const pageNumber = document.createElement("span");

			img.src = IMAGE_BASE_URL + spider.spiderImage;
			img.alt = `Image of ${spider.spiderName}`;
			title.textContent = spider.spiderName;
			desc.textContent = spider.facts;
			likeBtn.classList.add("heart-btn");
			likeBtn.innerHTML = "❤";
			likeBtn.disabled = !userLoggedIn;
			if (!userLoggedIn) {
				likeBtn.classList.add('disabled'); // Add 'disabled' class for styling
			} else {
				likeBtn.classList.remove('disabled'); // Remove 'disabled' class if user is logged in
			}
			pageNumber.textContent = `Page ${index + 1} of ${spiderArray.length}`;
			pageNumber.classList.add("page-number");

			likeBtn.addEventListener("click", (event) => {
				likeBtn.classList.toggle("liked");
				event.stopPropagation();
			});

			card.appendChild(title);
			card.appendChild(img);
			card.appendChild(desc);
			card.appendChild(likeBtn);
			card.appendChild(pageNumber);
			carousel.appendChild(card);

			card.addEventListener("click", () => {
				document
					.querySelectorAll("#carousel article")
					.forEach((c) => c.classList.remove("active"));
				card.classList.add("active");
				centerCard(card);
			});

			if (index === 0) {
				card.classList.add("active");
			}
		});

		centerCard(carousel.children[0]);
	}

	const sortByNameLink = document.querySelector('a[href="#about"]');
	sortByNameLink.addEventListener("click", sortSpidersByName);

	function sortSpidersByName() {
		if (ascendingOrder) {
			stubSpiders.sort((a, b) => a.spiderName.localeCompare(b.spiderName));
		} else {
			stubSpiders.sort((a, b) => b.spiderName.localeCompare(a.spiderName));
		}
		ascendingOrder = !ascendingOrder;
		renderSpiderCards(stubSpiders);
	}

	const searchButton = document.querySelector(".search-btn");
	searchButton.addEventListener("submit", function (event) {
		event.preventDefault();
		searchSpider();
	});
});

function centerCard(selectedCard) {
	const carousel = document.getElementById("carousel");
	const activeCardOffset =
		selectedCard.offsetLeft + selectedCard.offsetWidth / 2;
	const shift = carousel.offsetWidth / 2 - activeCardOffset;
	carousel.style.transform = `translateX(${shift}px)`;
}

function searchSpider() {
	const searchText = document.getElementById("searchInput").value.toLowerCase();
	const pages = document.querySelectorAll("#carousel article");
	let found = false;
	for (let i = 0; i < pages.length; i++) {
		const spiderName = pages[i].querySelector("h2").textContent.toLowerCase();
		if (spiderName.includes(searchText)) {
			currentPage = i;
			moveCarousel(pages[i]);
			found = true;
			break;
		}
	}
	if (!found) alert("No spider found with that name.");
}

function moveCarousel(selectedCard) {
	const carousel = document.getElementById("carousel");
	const activeCardOffset =
		selectedCard.offsetLeft + selectedCard.offsetWidth / 2;
	const shift = carousel.offsetWidth / 2 - activeCardOffset;
	carousel.style.transform = `translateX(${shift}px)`;
}

function resetPage() {
	document.getElementById("searchInput").value = "";
	const pages = document.querySelectorAll("#carousel article");
	pages.forEach((page) => {
		page.style.display = "block";
	});

	const activeCard = document.querySelector("#carousel article.active");
	if (activeCard) {
		activeCard.classList.remove("active");
	}
	const firstCard = document.querySelector("#carousel article");
	if (firstCard) {
		firstCard.classList.add("active");
		moveCarousel(firstCard);
	}
}
