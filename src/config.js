module.exports = {
    inputPath: 'test/',                     // Path to the input directory containing CSS files
    target: 'css',                          // Target directory or file to sort
    outputPath: 'output/',                  // Path to the output directory for sorted CSS files

    changeFontPxToRem: true,                // Whether to convert font sizes from px to rem

    logFileNames: true,                     // Log file names during processing
    logDirNames: true,                      // Log directory names during processing
    logMergedSelectors: true,               // Log merged selectors

    mergeDuplicateSelectors: true,          // Whether to merge duplicate selectors

    tagsOrder: [                            // Order of CSS selectors
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
    ],

    processAtsAndOrder: [                   // At-rules to process and their order
        'supports', 'keyframes', 'media'
    ]
};