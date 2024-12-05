document.addEventListener('DOMContentLoaded', function() {
  const keywordInput = document.getElementById('keyword');
  const scrapeButton = document.getElementById('scrapeButton');
  const statusDiv = document.getElementById('status');
  const resultsTable = document.getElementById('resultsTable');
  const resultsBody = document.getElementById('resultsBody');
  const exportButton = document.getElementById('exportButton');

  let scrapedData = [];

  scrapeButton.addEventListener('click', async () => {
    const keyword = keywordInput.value.trim();
    if (!keyword) {
      showStatus('Please enter a keyword', 'error');
      return;
    }

    showStatus('Scraping products...', 'info');
    resultsTable.style.display = 'none';
    exportButton.style.display = 'none';
    resultsBody.innerHTML = '';
    scrapedData = [];

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Navigate to Amazon search page
      await chrome.tabs.update(tab.id, {
        url: `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`
      });

      // Wait for page load and inject content script
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Execute content script
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapeProducts
      });

      if (results && results[0].result) {
        scrapedData = results[0].result;
        displayResults(scrapedData);
        showStatus(`Found ${scrapedData.length} products`, 'success');
      } else {
        showStatus('No products found', 'error');
      }
    } catch (error) {
      showStatus('Error: ' + error.message, 'error');
      console.error('Scraping error:', error);
    }
  });

  exportButton.addEventListener('click', async () => {
    try {
      console.log('Export button clicked');
      if (scrapedData.length === 0) {
        showStatus('No data to export', 'error');
        return;
      }

      showStatus('Preparing Excel file...', 'info');
      
      // Check if XLSX is available
      if (typeof XLSX === 'undefined') {
        throw new Error('XLSX library not loaded');
      }

      // Create a simple Excel file first to test
      const wb = XLSX.utils.book_new();
      const ws_data = [
        ['Title', 'Price', 'Rating', 'Reviews','url'],
        ...scrapedData.map(product => [
          product.title,
          product.price,
          product.rating,
          product.reviews,
          product.url
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      // Generate file name
      const fileName = `amazon_products_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      try {
        XLSX.writeFile(wb, fileName);
        showStatus('Data exported successfully!', 'success');
      } catch (writeError) {
        console.error('Error writing file:', writeError);
        // Fallback to Blob approach
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('Data exported successfully!', 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      showStatus('Error exporting data: ' + error.message, 'error');
    }
  });

  function showStatus(message, type) {
    console.log('Status:', message, type);
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }

  function displayResults(data) {
    resultsBody.innerHTML = '';
    data.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.title}</td>
        <td>${product.price}</td>
        <td>${product.rating}</td>
        <td>${product.reviews}</td>
        <td>${product.asin || 'N/A'}</td>
        <td><a href="${product.url}" target="_blank">View</a></td>
      `;
      resultsBody.appendChild(row);
    });
    resultsTable.style.display = 'table';
    exportButton.style.display = 'block';
  }
});

// This function will be injected into the page
function scrapeProducts() {
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
          originalPrice: originalPriceElement ? originalPriceElement.textContent.trim() : 'N/A'
        };
        products.push(product);
      }
    } catch (error) {
      console.error('Error scraping product:', error);
    }
  });

  return products;
}
