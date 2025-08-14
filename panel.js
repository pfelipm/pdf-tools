// --- INICIALIZACIÓN Y VARIABLES GLOBALES ---
const { PDFDocument } = PDFLib;

document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE LOCALIZACIÓN (i18n) ---
    const langSwitcher = document.getElementById('lang-switcher');
    const langModes = ['auto', 'es', 'en'];
    const langIcons = { auto: '🌐', es: '🇪🇸', en: '🇬🇧' };
    let currentLangMode = 'auto';

    function getLocaleMessages(lang) {
        return new Promise((resolve) => {
            const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
            fetch(url)
                .then(response => response.json())
                .then(messages => resolve(messages))
                .catch(() => resolve({})); // Devuelve objeto vacío si falla
        });
    }

    async function getTranslatedMessage(key, substitutions) {
        let langToUse = currentLangMode;
        if (langToUse === 'auto') {
            let uiLang = chrome.i18n.getUILanguage().split('-')[0];
            // Fallback para euskera y gallego a español
            if (['eu', 'gl'].includes(uiLang)) {
                uiLang = 'es';
            }
            langToUse = ['en', 'es', 'ca'].includes(uiLang) ? uiLang : 'en'; // 'en' como fallback final
        }

        const messages = await getLocaleMessages(langToUse);
        let message = messages[key]?.message || '';

        if (substitutions && typeof substitutions === 'object') {
            message = message.replace(/\{(\w+)\}/g, (match, placeholderKey) => {
                return substitutions.hasOwnProperty(placeholderKey) ? substitutions[placeholderKey] : match;
            });
        }

        return message;
    }

    async function applyLocalization() {
        // Actualizar textos estáticos
        document.querySelectorAll('[data-i18n]').forEach(async elem => {
            const key = elem.getAttribute('data-i18n');
            elem.textContent = await getTranslatedMessage(key);
        });

        // Actualizar placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(async elem => {
            const key = elem.getAttribute('data-i18n-placeholder');
            elem.placeholder = await getTranslatedMessage(key);
        });

        document.title = await getTranslatedMessage('appName');

        // Actualizar el interruptor de idioma
        langSwitcher.textContent = langIcons[currentLangMode];
        const langKeyMap = { auto: 'langAuto', es: 'langSpanish', en: 'langEnglish' };
        const langKey = langKeyMap[currentLangMode];
        const langName = await getTranslatedMessage(langKey);
        langSwitcher.dataset.tooltip = await getTranslatedMessage('langSwitcherTooltip', { lang: langName });

        // CORRECCIÓN: Volver a traducir los mensajes de estado final si es necesario.
        if (mergeModule.isComplete()) {
            const mergeProgressText = document.getElementById('merge-progress-text');
            mergeProgressText.textContent = await getTranslatedMessage('progressComplete');
        }
        if (splitModule.isComplete()) {
            const splitProgressText = document.getElementById('split-progress-text');
            splitProgressText.textContent = await getTranslatedMessage('progressComplete');
        }
    }

    async function initializeApp() {
        const data = await chrome.storage.local.get('languageMode');
        currentLangMode = data.languageMode || 'auto';
        await applyLocalization();
        setupEventListeners();
        resetUI();
    }

    langSwitcher.addEventListener('click', async () => {
        const currentIndex = langModes.indexOf(currentLangMode);
        currentLangMode = langModes[(currentIndex + 1) % langModes.length];
        await chrome.storage.local.set({ languageMode: currentLangMode });
        await applyLocalization();
    });

    // --- LÓGICA DE PESTAÑAS ---
    const tabMergeBtn = document.getElementById('tab-merge-btn');
    const tabSplitBtn = document.getElementById('tab-split-btn');
    const mergeContent = document.getElementById('merge-content');
    const splitContent = document.getElementById('split-content');

    function setupEventListeners() {
        tabMergeBtn.addEventListener('click', () => {
            tabMergeBtn.classList.add('active');
            tabSplitBtn.classList.remove('active');
            mergeContent.classList.remove('hidden');
            splitContent.classList.add('hidden');
        });

        tabSplitBtn.addEventListener('click', () => {
            tabSplitBtn.classList.add('active');
            tabMergeBtn.classList.remove('active');
            splitContent.classList.remove('hidden');
            mergeContent.classList.add('hidden');
        });
    }

    // ========================================================================
    // --- SECCIÓN DE UNIR PDF ---
    // ========================================================================
    const mergeModule = (() => {
        let isTaskComplete = false; // Estado para rastrear si la tarea finalizó
        const dropZone = document.getElementById('merge-drop-zone');
        const fileInput = document.getElementById('merge-file-input');
        const browseBtn = document.getElementById('merge-browse-btn');
        const mergeBtn = document.getElementById('merge-btn');
        const downloadBtn = document.getElementById('merge-download-btn');
        const fileListContainer = document.getElementById('merge-file-list-container');
        const clearAllBtn = document.getElementById('merge-clear-all-btn');
        const progressContainer = document.getElementById('merge-progress-container');
        const progressBar = document.getElementById('merge-progress-bar');
        const progressText = document.getElementById('merge-progress-text');
        const errorMessage = document.getElementById('merge-error-message');
        let selectedFiles = [];

        function reset() {
            selectedFiles = [];
            fileInput.value = null;
            isTaskComplete = false;
            updateFileListUI();
        }

        async function handleFiles(files) {
            hideError();
            isTaskComplete = false;
            const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
            if (pdfFiles.length === 0 && files.length > 0) {
                showError(await getTranslatedMessage('errorOnlyPdf'));
                return;
            }
            setProcessingState(true, await getTranslatedMessage('progressLoading'));
            const newFilesData = [];
            for (const file of pdfFiles) {
                try {
                    const fileArrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
                    newFilesData.push({ file: file, id: crypto.randomUUID(), pageCount: pdfDoc.getPageCount() });
                } catch (e) {
                    showError(await getTranslatedMessage('errorReadPdf', {fileName: file.name}));
                }
            }
            selectedFiles.push(...newFilesData);
            await updateFileListUI();
            setProcessingState(false);
        }

        async function updateFileListUI() {
            fileListContainer.innerHTML = '';
            if (selectedFiles.length > 0) {
                const list = document.createElement('ul');
                const pageSuffixSingle = await getTranslatedMessage('pageSuffix');
                const pageSuffixPlural = await getTranslatedMessage('pagesSuffix');
                selectedFiles.forEach((fileWrapper) => {
                    const listItem = document.createElement('li');
                    listItem.setAttribute('data-id', fileWrapper.id);
                    listItem.className = 'file-item-container';
                    const pageSuffix = fileWrapper.pageCount === 1 ? pageSuffixSingle : pageSuffixPlural;
                    listItem.innerHTML = `
                        <div class="flex">
                            <svg class="icon-drag" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            <span class="file-name">${fileWrapper.file.name}</span>
                            <span class="file-pages">(${fileWrapper.pageCount} ${pageSuffix})</span>
                        </div>
                        <button class="remove-btn">
                           <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>`;
                    list.appendChild(listItem);
                });
                fileListContainer.appendChild(list);
                document.querySelectorAll('.remove-btn').forEach(button => button.addEventListener('click', (e) => {
                    const idToRemove = e.currentTarget.parentElement.getAttribute('data-id');
                    selectedFiles = selectedFiles.filter(f => f.id !== idToRemove);
                    updateFileListUI();
                }));
                new Sortable(list, { animation: 150, ghostClass: 'dragging', onEnd: (evt) => {
                    const movedItem = selectedFiles.splice(evt.oldIndex, 1)[0];
                    selectedFiles.splice(evt.newIndex, 0, movedItem);
                }});
            }
            clearAllBtn.classList.toggle('hidden', selectedFiles.length === 0);
            mergeBtn.disabled = selectedFiles.length < 2;
            if (!isTaskComplete) {
                downloadBtn.classList.add('hidden');
            }
        }

        function showError(message) { errorMessage.textContent = message; errorMessage.classList.remove('hidden'); }
        function hideError() { errorMessage.classList.add('hidden'); }

        function setProcessingState(isProcessing, text = '') {
            mergeBtn.disabled = isProcessing;
            browseBtn.disabled = isProcessing;
            dropZone.style.pointerEvents = isProcessing ? 'none' : 'auto';
            if (isProcessing) {
                progressContainer.classList.remove('hidden');
                progressText.classList.remove('hidden');
                progressText.textContent = text;
                downloadBtn.classList.add('hidden');
            } else {
                if (!text) {
                    progressContainer.classList.add('hidden');
                    progressText.classList.add('hidden');
                } else {
                     progressText.textContent = text;
                }
            }
        }

        async function updateProgress(current, total) {
            const percentage = Math.round((current / total) * 100);
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = await getTranslatedMessage('progressProcessing', { current, total, percentage });
        }

        browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
        clearAllBtn.addEventListener('click', reset);

        mergeBtn.addEventListener('click', async () => {
            if (selectedFiles.length < 2) { showError(await getTranslatedMessage('errorNeed2Files')); return; }
            setProcessingState(true); hideError(); isTaskComplete = false;
            try {
                const mergedPdf = await PDFDocument.create();
                for (let i = 0; i < selectedFiles.length; i++) {
                    await updateProgress(i + 1, selectedFiles.length);
                    const fileWrapper = selectedFiles[i];
                    const fileArrayBuffer = await fileWrapper.file.arrayBuffer();
                    const pdfToMerge = await PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
                    const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
                const mergedPdfBytes = await mergedPdf.save();
                const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const totalPages = mergedPdf.getPageCount();
                const pageSuffix = totalPages === 1 ? await getTranslatedMessage('pageSuffix') : await getTranslatedMessage('pagesSuffix');
                downloadBtn.textContent = `${await getTranslatedMessage('downloadButton')} (${totalPages} ${pageSuffix})`;
                downloadBtn.href = url;
                downloadBtn.classList.remove('hidden');
                setProcessingState(false, await getTranslatedMessage('progressComplete'));
                isTaskComplete = true; // Marcar tarea como completada
            } catch (error) {
                showError(await getTranslatedMessage('errorGeneric'));
                setProcessingState(false);
            }
        });

        return { reset, isComplete: () => isTaskComplete };
    })();

    // ========================================================================
    // --- SECCIÓN DE DIVIDIR PDF ---
    // ========================================================================
    const splitModule = (() => {
        let isTaskComplete = false; // Estado para rastrear si la tarea finalizó
        const dropZone = document.getElementById('split-drop-zone');
        const fileInput = document.getElementById('split-file-input');
        const browseBtn = document.getElementById('split-browse-btn');
        const splitBtn = document.getElementById('split-btn');
        const clearBtn = document.getElementById('split-clear-btn');
        const optionsArea = document.getElementById('split-options-area');
        const actionArea = document.getElementById('split-action-area');
        const resultsArea = document.getElementById('split-results-area');
        const downloadsList = document.getElementById('split-downloads-list');
        const fileNameEl = document.getElementById('split-file-name');
        const filePagesEl = document.getElementById('split-file-pages');
        const rangeInput = document.getElementById('split-range-input');
        const progressContainer = document.getElementById('split-progress-container');
        const progressBar = document.getElementById('split-progress-bar');
        const progressText = document.getElementById('split-progress-text');
        const errorMessage = document.getElementById('split-error-message');
        let sourcePdf = { file: null, doc: null, totalPages: 0 };

        function reset() {
            sourcePdf = { file: null, doc: null, totalPages: 0 };
            fileInput.value = '';
            rangeInput.value = '';
            isTaskComplete = false;
            dropZone.classList.remove('hidden');
            optionsArea.classList.add('hidden');
            actionArea.classList.add('hidden');
            resultsArea.classList.add('hidden');
            downloadsList.innerHTML = '';
            splitBtn.disabled = true;
            hideError();
            progressContainer.classList.add('hidden');
            progressText.classList.add('hidden');
        }

        async function handleFile(files) {
            if (files.length === 0) return;
            const file = files[0];
            if (file.type !== 'application/pdf') {
                showError(await getTranslatedMessage('errorOnlyPdf'));
                return;
            }
            hideError(); isTaskComplete = false;
            setProcessingState(true, await getTranslatedMessage('progressLoading'));
            try {
                const fileArrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
                sourcePdf = { file: file, doc: pdfDoc, totalPages: pdfDoc.getPageCount() };
                fileNameEl.textContent = file.name;
                filePagesEl.textContent = `${sourcePdf.totalPages} ${await getTranslatedMessage('totalPages')}`;
                dropZone.classList.add('hidden');
                optionsArea.classList.remove('hidden');
                actionArea.classList.remove('hidden');
                splitBtn.disabled = false;
            } catch (e) {
                showError(await getTranslatedMessage('errorReadPdf', {fileName: file.name}));
                reset();
            } finally {
                setProcessingState(false);
            }
        }

        async function parsePageRanges(rangeStr, totalPages) {
            const ranges = [];
            const parts = rangeStr.split(',').filter(p => p.trim() !== '');
            if (parts.length === 0) throw new Error(await getTranslatedMessage('errorEmptyPages'));
            for (const part of parts) {
                const trimmedPart = part.trim();
                if (trimmedPart.includes('-')) {
                    let [start, end] = trimmedPart.split('-').map(n => n.trim());
                    start = start === '' ? 1 : parseInt(start, 10);
                    end = end === '' ? totalPages : parseInt(end, 10);
                    if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
                        throw new Error(await getTranslatedMessage('errorInvalidRange', {range: trimmedPart}));
                    }
                    ranges.push(Array.from({ length: end - start + 1 }, (_, i) => start + i));
                } else {
                    const page = parseInt(trimmedPart, 10);
                    if (isNaN(page) || page < 1 || page > totalPages) {
                        throw new Error(await getTranslatedMessage('errorInvalidPage', {page: trimmedPart}));
                    }
                    ranges.push([page]);
                }
            }
            return ranges;
        }

        function showError(message) { errorMessage.textContent = message; errorMessage.classList.remove('hidden'); }
        function hideError() { errorMessage.classList.add('hidden'); }

        function setProcessingState(isProcessing, text = '') {
            splitBtn.disabled = isProcessing; clearBtn.disabled = isProcessing; browseBtn.disabled = isProcessing;
            dropZone.style.pointerEvents = isProcessing ? 'none' : 'auto';
            if (isProcessing) {
                progressContainer.classList.remove('hidden');
                progressText.classList.remove('hidden');
                progressText.textContent = text;
                progressBar.style.width = '0%';
            } else {
                if (text) { progressText.textContent = text; }
                else { progressContainer.classList.add('hidden'); progressText.classList.add('hidden'); }
            }
        }

        async function updateProgress(current, total) {
            const percentage = Math.round((current / total) * 100);
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = await getTranslatedMessage('progressCreating', { current, total, percentage });
        }

        browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFile(e.dataTransfer.files); });
        fileInput.addEventListener('change', (e) => handleFile(e.target.files));
        clearBtn.addEventListener('click', reset);
        document.getElementById('split-mode-range').addEventListener('change', () => rangeInput.disabled = false);
        document.getElementById('split-mode-all').addEventListener('change', () => rangeInput.disabled = true);

        splitBtn.addEventListener('click', async () => {
            hideError(); isTaskComplete = false;
            let pageGroups;
            try {
                const splitModeAll = document.getElementById('split-mode-all').checked;
                pageGroups = splitModeAll ? Array.from({ length: sourcePdf.totalPages }, (_, i) => [i + 1]) : await parsePageRanges(rangeInput.value, sourcePdf.totalPages);
            } catch (e) {
                showError(e.message);
                return;
            }
            setProcessingState(true);
            downloadsList.innerHTML = '';
            try {
                const originalFileName = sourcePdf.file.name.replace(/\.pdf$/i, '');
                for (let i = 0; i < pageGroups.length; i++) {
                    await updateProgress(i + 1, pageGroups.length);
                    const pageGroup = pageGroups[i];
                    const newPdfDoc = await PDFDocument.create();
                    const copiedPages = await newPdfDoc.copyPages(sourcePdf.doc, pageGroup.map(p => p - 1));
                    copiedPages.forEach(page => newPdfDoc.addPage(page));
                    const pdfBytes = await newPdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    let newFileName;
                    if (pageGroup.length === 1) {
                        newFileName = await getTranslatedMessage('fileNamePage', {baseName: originalFileName, page: pageGroup[0]});
                    } else {
                        newFileName = await getTranslatedMessage('fileNamePages', {baseName: originalFileName, start: pageGroup[0], end: pageGroup[pageGroup.length - 1]});
                    }
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = newFileName;
                    link.textContent = newFileName;
                    link.className = "download-link";
                    downloadsList.appendChild(link);
                }
                resultsArea.classList.remove('hidden');
                setProcessingState(false, await getTranslatedMessage('progressComplete'));
                isTaskComplete = true; // Marcar tarea como completada
            } catch (e) {
                showError(await getTranslatedMessage('errorGeneric'));
                setProcessingState(false);
            }
        });

        return { reset, isComplete: () => isTaskComplete };
    })();

    function resetUI() {
        mergeModule.reset();
        splitModule.reset();
        // Asegurar que solo la pestaña de unir esté visible al inicio
        tabMergeBtn.classList.add('active');
        tabSplitBtn.classList.remove('active');
        mergeContent.classList.remove('hidden');
        splitContent.classList.add('hidden');
    }

    initializeApp();
});
