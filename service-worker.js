// Permite a los usuarios abrir el panel lateral haciendo clic en el icono de la barra de herramientas.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
