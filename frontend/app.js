let currentPage = 0;
let totalPages = 0;
document.addEventListener("DOMContentLoaded", () => {
	const carousel = document.getElementById("carousel");
	const stubSpiders = [
		{
			spiderId: 4,
			spiderName: "Steatoda grossa",
			facts:
				"Steatoda grossa, commonly known as the false black widow, is a species of spider in the family Theridiidae. These spiders are often mistaken for the more dangerous black widow spider due to their similar appearance.",
			spiderImage: "steatoda_grossa.jpg",
		},
		{
			spiderId: 10,
			spiderName: "Holocnemus pluchei",
			facts:
				"They are also called the marbled cellar spider and are known for their delicate appearance and elongated body. Holocnemus pluchei are often found in dark, damp environments such as caves, cellars, and basements, where they construct messy, irregular webs to catch their prey.",
			spiderImage: "holocnemus_pluchei.jpg",
		},
		{
			spiderId: 6,
			spiderName: "Argiope aurantia",
			facts:
				"Argiope aurantia, commonly known as the yellow garden spider, is a species of orb-weaving spider found throughout North America. These spiders are often recognized by their bright yellow and black coloration and distinctive zigzag pattern, known as a stabilimentum, in the center of their webs.",
			spiderImage: "argiope_aurantia.jpg",
		},
		{
			spiderId: 2,
			spiderName: "Habronattus coecatus",
			facts:
				"Habronattus coecatus is a species of jumping spider commonly found in North America. These spiders have excellent vision and use their keen eyesight to locate and capture prey.",
			spiderImage: "habronattus_coecatus.jpg",
		},
		{
			spiderId: 9,
			spiderName: "Pholcus phalangioides",
			facts:
				"They are commonly known as cellar spiders or daddy long-legs spiders due to their long, thin legs. Pholcus phalangioides are known for their unique behavior of vibrating their webs vigorously when disturbed, possibly to confuse or deter predators.",
			spiderImage: "pholcus_phalangioides.jpg",
		},
		{
			spiderId: 7,
			spiderName: "Lycosa tarantula",
			facts:
				"They are also known as wolf spiders and are known for their hunting prowess, often stalking their prey instead of building webs. Despite their name, Lycosa tarantulas venom is not particularly harmful to humans, causing only mild irritation or discomfort.",
			spiderImage: "lycosa_tarantula.jpg",
		},
		{
			spiderId: 3,
			spiderName: "Latrodectus mactans",
			facts:
				"Latrodectus mactans, commonly known as the southern black widow, is a species of venomous spider found in the southeastern United States. Female Latrodectus mactans spiders are known for their distinctive black coloration and red hourglass-shaped markings on the underside of their abdomen.",
			spiderImage: "latrodectus_mactans.jpg",
		},
		{
			spiderId: 1,
			spiderName: "Phidippus audax",
			facts:
				"Phidippus audax, also known as the daring jumping spider, is one of the most common and conspicuous jumping spiders in North America. These spiders are known for their agile jumping ability and are often seen hunting for prey on walls, fences, and vegetation.",
			spiderImage: "phidippus_audax.jpg",
		},
		{
			spiderId: 5,
			spiderName: "Araneus diadematus",
			facts:
				"Araneus diadematus, commonly known as the European garden spider, is a species of orb-weaving spider. These spiders are known for their intricate orb webs, which they use to capture flying insects like flies and mosquitoes.",
			spiderImage: "araneus_diadematus.jpg",
		},
		{
			spiderId: 8,
			spiderName: "Pardosa amentata",
			facts:
				"These spiders are commonly found in grassy habitats and are skilled hunters, preying on small insects. Pardosa amentata females carry their egg sacs attached to their spinnerets until the eggs hatch, protecting them from predators.",
			spiderImage: "pardosa_amentata.jpg",
		},
	];

	stubSpiders.forEach((spider, index) => {
		const IMAGE_BASE_URL =
			"https://spiderpedia-bucket.s3.eu-west-1.amazonaws.com/";
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
		pageNumber.textContent = `Page ${index + 1} of ${stubSpiders.length}`;
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

	function centerCard(selectedCard) {
		const activeCardOffset =
			selectedCard.offsetLeft + selectedCard.offsetWidth / 2;
		const shift = carousel.offsetWidth / 2 - activeCardOffset;
		carousel.style.transform = `translateX(${shift}px)`;
	}

	centerCard(carousel.children[0]);

	const searchForm = document.getElementById("searchForm");
	searchForm.addEventListener("submit", function (event) {
		event.preventDefault();
		searchSpider();
	});
});

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

function showPage(pageIndex) {
	const carousel = document.getElementById("carousel");
	const pages = carousel.querySelectorAll("article");
	pages.forEach((page, index) => {
		page.style.display = index === pageIndex ? "block" : "none";
	});
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
	}

	centerCard(carousel.children[0]);
}
function moveCarousel(selectedCard) {
	const carousel = document.getElementById("carousel");
	const activeCardOffset =
		selectedCard.offsetLeft + selectedCard.offsetWidth / 2;
	const shift = carousel.offsetWidth / 2 - activeCardOffset;
	carousel.style.transform = `translateX(${shift}px)`;
}
