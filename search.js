const apiKey = "xxx";
const cxId = "xxx";

const searchResultsDiv = document.getElementById("search-results");
const searchButton = document.getElementById("search-button");
const query = document.getElementById("search-input");
const previousButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const externalSearchBtn = document.getElementById("external-search-btn");
const externalSearchDiv = document.querySelector(".external-search-div");
const navbar = document.getElementById("navbar");

const resultsPerPage = 10;
let currentPage = 1;
let totalResults = 0;
let totalPages = 0;
let results;

/* GOOGLE API FETCH */
const baseUrl = "https://www.googleapis.com/customsearch/v1";
const fetchData = async () => {
  const start = (currentPage - 1) * resultsPerPage + 1;
  const params = {
    key: apiKey, //
    cx: cxId, //The Programmable Search Engine ID to use for this request.
    q: query.value,
    siteSearch: "youtube.com",
    orTerms: "music",
    start: start.toString(),
    num: resultsPerPage.toString(),
    // safe: active,
  };

  const res = await fetch(baseUrl + "?" + new URLSearchParams(params));
  const data = await res.json();
  results = data.items;
  totalResults = data.searchInformation.totalResults;
  totalPages = Math.ceil(totalResults / resultsPerPage);

  addItems();
};

/* BUTTON EVENT LISTENERS */
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(query.value);

  // Clear previous search results
  searchResultsDiv.innerHTML = "";

  externalSearchDiv.style.display = query.value ? "block" : "none";
  externalSearchBtn.innerHTML = `
    &nbsp;<img src="search-icon.svg" alt="search" />
    &nbsp; Search&nbsp;<b>${query.value}</b>&nbsp;on Google`;

  fetchData();
});

previousButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchData();
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchData();
  }
});

externalSearchDiv.addEventListener("click", () => {
  const encodedSearchValue = encodeURIComponent(query.value);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedSearchValue}`;

  // Open the Google search in a new tab
  window.open(googleSearchUrl, "_blank");
});

navbar.addEventListener('click', () => {
    location.reload()
})

/* ADD ITEMS/RESULTS */
function addItems() {
  // Clear previous search results
  searchResultsDiv.innerHTML = "";

  results.forEach((result) => {
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("result");

    // Adds click event listener to each result div
    resultDiv.addEventListener("click", () => {
      showPreviewOverlay(result);
    });

    // Get video information
    const title = result.title;
    const channelName = result.pagemap?.person?.[0]?.name || "Unknown Artist";
    const view = result.pagemap?.videoobject?.[0]?.interactioncount || "N/A";
    const views = abbreviateNumber(view);
    const thumbnailUrl = result.pagemap?.cse_image?.[0]?.src;

    // USE TO REPLACE 404 image urls WITH PLACEHOLDER
    // REQUIRES HOSTED PAGE www. or localhost

    // const placeholderUrl = './placeholder-thumb.svg';
    // const imageUrl = thumbnailUrl ? (imageExists(thumbnailUrl) ? thumbnailUrl : placeholderUrl) : placeholderUrl;

    // // Function to check if an image URL exists
    // async function imageExists(url) {
    //   try {
    //     const response = await fetch(url);
    //     return response.ok;
    //   } catch (error) {
    //     return false;
    //   }
    // }

    const duration = result.pagemap?.videoobject?.[0]?.duration || "N/A";
    
    /* CONVERT ISO 8601 DURATION to HH:MM:SS */
    function convertDurationToHMS(duration) {
      // Remove the leading "PT" from the duration string
      duration = duration.slice(2);
    
      let minutes = 0,
          seconds = 0;
    
      // Extract minutes and seconds from the duration string
      const minutesMatch = duration.match(/(\d+)M/);
      const secondsMatch = duration.match(/(\d+)S/);
    
      if (minutesMatch) {
        minutes = parseInt(minutesMatch[1]);
      }
    
      if (secondsMatch) {
        seconds = parseInt(secondsMatch[1]);
      }
    
      // Calculate hours, minutes, and seconds
      let hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
    
      // Format the duration
      let formattedDuration = '';
      
      if (hours > 0) {
        formattedDuration += hours.toString() + ':';
      }
      
      formattedDuration += minutes.toString();
    
      if (seconds > 0) {
        formattedDuration += ':' + seconds.toString().padStart(2, '0');
      }
    
      return formattedDuration;
    }
  
    resultDiv.innerHTML = `
      <div class="thumb-container">
        <img src="${thumbnailUrl}" alt="${title}" />
        <span class="info-duration">${convertDurationToHMS(duration)}</span>
      </div>
      <div class="info">
        <h4 class='info-title'>${title}</h4>
        <p class='info-artist'>${channelName}</p>
        <div class='info-footer'>
          <span><img src="yt-icon.svg" alt="youtube" />Youtube.com</span>
          <p class='info-views'>${views}</p>
        </div>
      </div>
    `;

    // Append the <div> to the search results <div>
    searchResultsDiv.appendChild(resultDiv);
  });

  // Display current page number
  const pageInfo = document.getElementById("page-info");
  pageInfo.textContent = currentPage > 1 ? currentPage.toString() : "";
  pageInfo.style.display = currentPage > 1 ? "block" : "none";

  // Adjust visibility of previous and next buttons
  previousButton.style.display = currentPage > 1 ? "block" : "none";
  nextButton.style.display = currentPage < totalPages ? "block" : "none";
}

function closePreviewOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.remove();
  }
}

function openVideoLink(link) {
  // Open the video link in a new tab
  window.open(link, "_blank");
}


/* OVERLAY */
function showPreviewOverlay(result) {
  // Get video information
  const title = result.pagemap?.videoobject?.[0]?.name;
  const channelName = result.pagemap?.person?.[0]?.name || "Unknown Artist";
  const view = result.pagemap?.videoobject?.[0]?.interactioncount || "N/A";
  const views = abbreviateNumber(view);
  const embedUrl = result.pagemap?.videoobject?.[0]?.embedurl || "";
  const url = result.pagemap?.videoobject?.[0]?.url || "";

  // Create the embedded YouTube player iframe
  const player = document.createElement("iframe");
  player.src = embedUrl;
  player.allowFullscreen = true;
  player.allow = "autoplay; encrypted-media";
  player.width = "100%";
  player.height = "240";

  // Create the container div for the player
  const playerContainer = document.createElement("div");
  playerContainer.classList.add("player-container");
  playerContainer.appendChild(player);

  // Create the title element
  const titleElement = document.createElement("h4");
  titleElement.classList.add("overlay-title");
  titleElement.textContent = title;

  // Create the details container div
  const detailsContainer = document.createElement("div");
  detailsContainer.classList.add("details-container");

  // Create the icon span
  const icon = "<img src='yt-icon.svg' alt='icon' />"
  const spanIcon = document.createElement("span");
  spanIcon.innerHTML = icon;
  
  // Create the artist element
  const artistElement = document.createElement("p");
  artistElement.textContent = channelName;

  // Create the span element
  const spanElement = document.createElement("span");
  spanElement.classList.add("dot");

  // Create the views element
  const viewsElement = document.createElement("p");
  viewsElement.textContent = views;

  // Append the channel/artist and views elements to the details container div
  detailsContainer.appendChild(titleElement);
  detailsContainer.appendChild(spanIcon);
  detailsContainer.appendChild(artistElement);
  detailsContainer.appendChild(spanElement);
  detailsContainer.appendChild(viewsElement);
  
  // Create the Visit button
  const visitButton = document.createElement("button");
  visitButton.classList.add("visit-button");
  visitButton.textContent = "Visit";

  // Create the Close button
  const closeButton = document.createElement("button");
  closeButton.classList.add("close-button");
  closeButton.textContent = "Close";

  // Create the button container div
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  
  // Append the visit and close buttons to the button container div
  buttonContainer.appendChild(visitButton);
  buttonContainer.appendChild(closeButton);

  // Create the overlay container
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.appendChild(playerContainer);
  overlay.appendChild(detailsContainer);
  overlay.appendChild(buttonContainer);

  // Add click event listener to the Visit button
  visitButton.addEventListener("click", () => {
    openVideoLink(url);
  });

  // Add click event listener to the Close button
  closeButton.addEventListener("click", () => {
    closePreviewOverlay();
  });

  // Append overlay to the document body
  document.body.appendChild(overlay);
}


/*  OTHERS  */
function abbreviateNumber(views) {
  if (views === "N/A") return;
  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1) + "B";
  } else if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "m";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "k";
  } else {
    return views.toString();
  }
}
