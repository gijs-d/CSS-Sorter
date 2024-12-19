module.exports = {
    inputPath: 'test',
    outputPath: 'output',
    clearOutputDir: true,

    changeFontPxToRem: true,
    addPxFontSizeToHtmlTag: 16,

    logAddPxFontSizeToHtmlTag: true,
    logFileNames: true,
    logDirNames: true,
    logMergedSelectors: true,

    mergeDuplicateSelectors: true,
    addMergedComments: true,

    // prettier-ignore
    tagsOrder: [                            
        // CSS Variables
        'root',
        // Universal Selector
        '*',
        // Document Structure
        'html', 'body', '#root', 'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
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

    processAtsAndOrder: ['supports', 'keyframes', 'media'],
};
