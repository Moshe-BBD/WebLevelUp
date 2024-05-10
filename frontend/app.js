let currentPage = 0;
let totalPages = 0;

// Stub data for spiders information
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
	const IMAGE_BASE_URL =
		"https://spiderpedia-bucket.s3.eu-west-1.amazonaws.com/";
	displaySpiders(stubSpiders);

	document.getElementById("sort").addEventListener("change", function () {
		const sortedData = sortData(stubSpiders, this.value);
		displaySpiders(sortedData);
	});

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
		const bookContent = document.getElementById("book-content");
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
		bookContent.style.display = "block";
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
