// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeProducts') {
    const products = scrapeProductData();
    sendResponse(products);
  }
});

function scrapeProductData() {
  const products = [];
  const productCards = document.querySelectorAll('[data-component-type="s-search-result"]');

  productCards.forEach(card => {
    try {
      const titleElement = card.querySelector('h2 a span');
      const priceElement = card.querySelector('.a-price .a-offscreen');
      const ratingElement = card.querySelector('.a-icon-star-small .a-icon-alt');
      const reviewsElement = card.querySelector('span[aria-label*="stars"] + span');
      const asin = card.getAttribute('data-asin');
      const url = card.querySelector('h2 a')?.href || '';
      const imageElement = card.querySelector('.s-image');
      const primeElement = card.querySelector('.s-prime');
      const originalPriceElement = card.querySelector('.a-text-price');

      if (titleElement) {
        const product = {
          title: titleElement.textContent.trim(),
          price: priceElement ? priceElement.textContent.trim() : 'N/A',
          rating: ratingElement ? ratingElement.textContent.trim() : 'N/A',
          reviews: reviewsElement ? reviewsElement.textContent.trim() : '0',
          asin: asin || 'N/A',
          url: url,
          image: imageElement ? imageElement.src : 'N/A',
          prime: primeElement ? 'Yes' : 'No',
          originalPrice: originalPriceElement ? originalPriceElement.textContent.trim() : 'N/A',
          scrapedDate: new Date().toISOString()
        };
        products.push(product);
      }
    } catch (error) {
      console.error('Error scraping product:', error);
    }
  });

  return products;
}

// Helper function to wait for elements to load
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkElement() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
      } else {
        requestAnimationFrame(checkElement);
      }
    }

    checkElement();
  });
}
