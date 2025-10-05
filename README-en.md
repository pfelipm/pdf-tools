[🇪🇸 Versión en español](./README.md) | [🐉 Versió en català](./README-ca.md)

# PDF_Tools

<p align="center">
  <img src="./readme-files/PT destacado 540x357.png">
</p>

**PDF_Tools** is a lightweight and powerful extension for Google Chrome that integrates PDF file manipulation tools directly into your browser through a modern side panel. Merge and split PDF documents with ease, without the need to install heavy software or rely on online services.

This extension was born from the need to have quick and efficient tools at hand for the most common tasks with PDF files. Instead of opening desktop applications or uploading sensitive files to the web, PDF_Tools processes everything locally in your browser, ensuring speed and privacy.

## ✨ Main Features

<p align="center">
  <img src="./readme-files/Capturas.gif">
</p>

* **Modern side panel**: Access all tools from a convenient side panel (`Side Panel API`) without interrupting your browsing.
* **Merge PDF**: Combine multiple PDF files into a single document.
    * **Drag and drop**: Easily add files by dragging them to the interface.
    * **Visual reordering**: Change the order of the files before merging them by simply dragging them in the list.
* **Split PDF**: Extract pages or ranges from a PDF.
    * **Flexible extraction**: Define ranges (`1-5, 8, 10-`) or extract individual pages.
    * **Full split**: Generate a PDF for each page of the original document with a single click.
* **ZIP Compression**: Download all the files generated in the split into a single `.zip` file for convenience.
* **Multi-language**: Interface available in English, Spanish, and Catalan, with a selector to change the language manually or use the browser's language.
* **Local processing**: All files are processed on your machine. No document leaves your browser, ensuring 100% privacy.

## ⚙️ Technical Description

PDF_Tools is built with standard web technologies and follows best practices for Chrome extension development.

* **Manifest V3**: The extension uses the latest version of the Chrome manifest, ensuring greater security, performance, and future compatibility.
* **JavaScript (vanilla JS)**: All application logic is written in pure JavaScript, with no framework dependencies, which ensures optimal performance and a small package size.
* **Side Panel API (`chrome.sidePanel`)**: The native Chrome API is used to display the interface in a side panel, offering an integrated user experience.
* **Internationalization API (`chrome.i18n`)**: Multi-language support is managed through the Chrome `i18n` API, allowing for efficient localization.
* **Storage API (`chrome.storage`)**: The user's language preference is saved locally using `chrome.storage.local`.

## 🚀 Installation

### Option 1: From the Chrome Web Store (recommended)

1.  Visit the [PDF_Tools page](https://chromewebstore.google.com/detail/amfbkjdnaalliclaenmafeohionnkmoa) on the Chrome Web Store.
2.  Click "Add to Chrome".
3.  Done! You can now use the extension.

### Option 2: From source code (for developers and IT administrators)

1.  Download and unzip or clone this repository to your local machine:
    ```bash
    git clone https://github.com/pfelipm/pdf-tools
    ```
2.  Open Google Chrome and go to the extensions page: `chrome://extensions/`.
3.  Enable **"Developer mode"** in the upper right corner.
4.  Click the **"Load unpacked"** button.
5.  Select the repository folder you just downloaded or cloned. The extension will be installed locally.
6. Done! The extension icon will appear in your extensions bar, I suggest you pin it to it for more comfortable use.

This option can facilitate the deployment of the extension in a classroom where computers are configured to browse in incognito mode by default. In this case, after installing it in each computer's browser, check the **"Allow in incognito"** option in the extension's settings so that it remains active in this mode.

## 💙 Credits

This project has been created and is maintained by **[Pablo Felip](https://www.linkedin.com/in/pfelipm/)**.

This project would not be possible without the excellent work of the open source community. The following libraries are used in this extension:

* **[pdf-lib.js](https://github.com/Hopding/pdf-lib)**: For creating and manipulating PDF documents in JavaScript.
* **[Sortable.js](https://github.com/SortableJS/Sortable)**: For reordering by dragging and dropping in the file list.
* **[JSZip](https://github.com/Stuk/jszip)**: For creating `.zip` files in the browser.

## ✊ License

This project is distributed under the terms of the [LICENSE](/LICENSE) file.

## 🦊 Firefox Version

[Juan José de Haro](https://bilateria.org/) has been kind enough to prepare a version of PDF_Tools for Firefox. You can find it in his own [GitHub repository](https://github.com/jjdeharo/pdf-tools-for-firefox).

This is the power of open source!