# Amazon Product Scraper Extension

A Chrome extension that helps you scrape and export product information from Amazon search results pages.

## Features

- Scrapes key product information including:
  - Title
  - Price
  - Rating
  - Number of Reviews
  - ASIN (Amazon Standard Identification Number)
  - Product URL
  - Product Image URL
  - Prime Status
  - Original Price (if available)
- Displays scraped data in an organized table
- Exports data to Excel (.xlsx) format with automatic date-based file naming
- Real-time status updates and error handling
- Clean and user-friendly interface

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Go to any Amazon search results page
2. Click the extension icon in your Chrome toolbar
3. Click "Scrape Products" to gather product information
4. Review the scraped data in the table
5. Click "Export" to save the data as an Excel file

## Dependencies

- XLSX library for Excel file generation
- Chrome Extension APIs

## Project Structure

- `manifest.json`: Extension configuration
- `popup.html`: Extension popup interface
- `popup.js`: Main extension logic
- `content.js`: Content script for page interaction
- `styles.css`: Extension styling

## Notes

- The extension works on Amazon search results pages
- Ensure you have appropriate permissions to scrape data from Amazon
- Some product information may not be available for all items

## Error Handling

The extension includes comprehensive error handling for:
- Scraping failures
- Export issues
- Missing data
- Library loading problems

## Contributing

Feel free to submit issues and enhancement requests!
