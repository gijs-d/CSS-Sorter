# CSS Sorter

## Overview

This project is a Node.js script that sorts CSS files and organizes their rules based on specified criteria. It can also convert font sizes from pixels to rem units and merge duplicate selectors.

## Prerequisites

- Node.js installed on your machine.

## Installation

1. Clone the repository or download the script files.
2. Navigate to the project directory in your terminal.

## Configuration

Before running the script, you need to configure the settings in the `config.js` file. Here are the key options you can set:

- `inputPath`: The directory where your input CSS files are located.

- `target`: The target file or directory to process.

- `outputPath`: The directory where the sorted CSS files will be saved.

- `changeFontPxToRem`: Set to `true` to convert font sizes from pixels to rem units.

- `logFileNames`: Set to `true` to log the names of the files being processed.

- `logDirNames`: Set to `true` to log the names of the directories being processed.

- `logMergedSelectors`: Set to `true` to log when selectors are merged.

- `mergeDuplicateSelectors`: Set to `true` to enable merging of duplicate selectors.

- `tagsOrder`: An array that defines the order of CSS selectors.

- `processAtsAndOrder`: An array that defines the order of at-rules to process.

### CSS Selector Sorting Order


The CSS selectors are sorted in the following order to maintain consistency and organization:

```javascript
        tagsOrder: [
            // CSS Variables
            'root',
            // Universal Selector
            '*',
            // Document Structure
            'html', 'body', 'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
            // Headings
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            // Text Elements
            'p', 'div', 'span',
            // Media Elements
            'img',
            // List Elements
            'ul', 'ol', 'li',
            // Form Elements
            'form', 'input', 'select', 'option', 'button', 'label', 'textarea',
            // Table Elements
            'table', 'tr', 'td', 'th',
            // Other Elements
            'otherTags', 'class', 'id', '@'
        ]
```

### Supported At-Rules
  
The following at-rules are sorted alphabetically at the `'@'` place in the `tagsOrder`:

- **\@font-face**: 
- **\@viewport**:   
- **\@page**: 

### Special At-Rules

The following special at-rules are processed separately by the project and sorted according to `processAtsAndOrder`. Each at-rule can contain CSS rule blocks inside:

- **@supports**: 
- **@keyframes**: 
- **@media**: 

These at-rules are processed in the order listed above.


## Usage

1. **Configure the Script**:
   - Modify the `config.js` file to set your input and output paths, as well as other options.

2. **Run the Script**:
   Execute the script to start sorting the CSS files:

   ```bash
   npm start
   ```

## Output

```
    css [ 'style1.css', 'style2.css' ]
    Sort file: test/css/style1.css
    Merge duplicate selector: html, body
    Merge duplicate selector: p
    Merge duplicate selector: form
    Save file: output/css/style1.css
    Sort file: test/css/style2.css
    Merge duplicate selector: body
    Merge duplicate selector: h2
    Merge duplicate selector: h3
    Save file: output/css/style2.css
```