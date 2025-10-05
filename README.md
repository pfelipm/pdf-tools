[🇬🇧 English version](./README-en.md) | [🐉 Versió en català](./README-ca.md)

# PDF_Tools

<p align="center">
  <img src="./readme-files/PT destacado 540x357.png">
</p>

**PDF_Tools** es una extensión ligera y potente para Google Chrome que integra herramientas de manipulación de archivos PDF directamente en tu navegador a través de un moderno panel lateral. Une y divide documentos PDF con facilidad, sin necesidad de instalar software pesado ni depender de servicios en línea.

Esta extensión nace de la necesidad de tener a mano herramientas rápidas y eficientes para las tareas más comunes con archivos PDF. En lugar de abrir aplicaciones de escritorio o subir archivos sensibles a la web, PDF_Tools procesa todo localmente en tu navegador, garantizando velocidad y privacidad.

## ✨ Características Principales

<p align="center">
  <img src="./readme-files/Capturas.gif">
</p>

* **Panel lateral moderno**: Accede a todas las herramientas desde un cómodo panel lateral (`Side Panel API`) sin interrumpir tu navegación.
* **Unir PDF**: Combina múltiples archivos PDF en un único documento.
    * **Arrastrar y soltar**: Añade archivos fácilmente arrastrándolos a la interfaz.
    * **Reordenación visual**: Cambia el orden de los archivos antes de unirlos simplemente arrastrándolos en la lista.
* **Dividir PDF**: Extrae páginas o rangos de un PDF.
    * **Extracción flexible**: Define rangos (`1-5, 8, 10-`) o extrae páginas individuales.
    * **División completa**: Genera un PDF por cada página del documento original con un solo clic.
* **Compresión en ZIP**: Descarga todos los archivos generados en la división dentro de un único archivo `.zip` para mayor comodidad.
* **Multi-idioma**: Interfaz disponible en inglés, español y catalán, con un selector para cambiar de idioma manualmente o usar el del navegador.
* **Procesamiento local**: Todos los archivos se procesan en tu máquina. Ningún documento sale de tu navegador, garantizando el 100% de privacidad.

## ⚙️ Descripción Técnica

PDF_Tools está construida con tecnologías web estándar y sigue las mejores prácticas para el desarrollo de extensiones de Chrome.

* **Manifest V3**: La extensión utiliza la última versión del manifiesto de Chrome, garantizando mayor seguridad, rendimiento y compatibilidad a futuro.
* **JavaScript (vanilla JS)**: Toda la lógica de la aplicación está escrita en JavaScript puro, sin dependencias de frameworks, lo que asegura un rendimiento óptimo y un tamaño de paquete reducido.
* **API de panel lateral (`chrome.sidePanel`)**: Se utiliza la API nativa de Chrome para mostrar la interfaz en un panel lateral, ofreciendo una experiencia de usuario integrada.
* **API de internacionalización (`chrome.i18n`)**: El soporte multi-idioma se gestiona a través de la API `i18n` de Chrome, permitiendo una localización eficiente.
* **API de almacenamiento (`chrome.storage`)**: La preferencia de idioma del usuario se guarda localmente usando `chrome.storage.local`.

## 🚀 Instalación

### Opción 1: Desde la Chrome Web Store (recomendado)

1.  Visita la [página de PDF_Tools](https://chromewebstore.google.com/detail/amfbkjdnaalliclaenmafeohionnkmoa) en la Chrome Web Store.
2.  Haz clic en "Añadir a Chrome".
3.  ¡Listo! Ya puedes usar la extensión.

### Opción 2: Desde el código fuente (para desarrolladores y administradores TIC)

1.  Descarga y descomprime o clona este repositorio en tu máquina local:
    ```bash
    git clone https://github.com/pfelipm/pdf-tools
    ```
2.  Abre Google Chrome y ve a la página de extensiones: `chrome://extensions/`.
3.  Activa el **"Modo de desarrollador"** en la esquina superior derecha.
4.  Haz clic en el botón **"Cargar descomprimida"**.
5.  Selecciona la carpeta del repositorio que acabas de descargar o clonar. La extensión se instalará localmente.
6. ¡Listo! El icono de la extensión aparecerá en tu barra de extensiones, te sugiero que lo fijes a ella para usarlo con mayor comodidad.

Esta opción puede facilitar el despliegue de la extensión en un aula en la que los ordenadores estén configurados para navegar de manera predeterminada en modo incógnito. En este caso, tras instalarla en el navegador de cada equipo, marca la opción **"Permitir en incógnito"** en los ajustes de la extensión para que permanezca activa en este modo.

## 💙 Créditos

Este proyecto ha sido creado y es mantenido por **[Pablo Felip](https://www.linkedin.com/in/pfelipm/)**.

Este proyecto no sería posible sin el excelente trabajo de la comunidad de código abierto. Las siguientes bibliotecas se utilizan en esta extensión:

* **[pdf-lib.js](https://github.com/Hopding/pdf-lib)**: Para la creación y manipulación de documentos PDF en JavaScript.
* **[Sortable.js](https://github.com/SortableJS/Sortable)**: Para la reordenación mediante arrastrar y soltar en la lista de archivos.
* **[JSZip](https://github.com/Stuk/jszip)**: Para la creación de archivos `.zip` en el navegador.

## ✊ Licencia

Este proyecto se distribuye bajo los términos del archivo [LICENSE](/LICENSE).

## 🦊 Versión para Firefox

[Juan José de Haro](https://bilateria.org/) ha tenido la gentileza de preparar una versión de PDF_Tools para Firefox. La puedes encontrar en su propio [repositorio GitHub](https://github.com/jjdeharo/pdf-tools-for-firefox).

¡Esta es la fuerza del código abierto!