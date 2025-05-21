import {prodHosts} from "../../scripts/utils.js";

function createScript(url) {
  let script = document.createElement('script');
  script.src =url;
  script.async = true;
  script.onload = function () {
    console.log('hello script');
  };
  return script;
}

export default async function init(el) {
  performance.mark('react-include:start');

  let root = document.createElement('div');
  root.id = 'root';

  let link = document.createElement('link');
  let mainScript;

  const rows = Array.from(el.children);
  rows.forEach((row) => {
    const cols = Array.from(row.children);
    const rowTitle = cols[0].innerText.trim().toLowerCase().replace(/ /g, '-');

    if (rowTitle === "prod-script" && prodHosts.includes(window.location.host)) {
      mainScript = createScript( cols[1]?.innerText.trim());
    }
    if (rowTitle === "stage-script" && !prodHosts.includes(window.location.host)) {
      mainScript = createScript(cols[1]?.innerText.trim());
    }
    if (rowTitle === "prod-styles" && prodHosts.includes(window.location.host)) {
      link.href = cols[1]?.innerText.trim();
    }
    if (rowTitle === "stage-styles" && !prodHosts.includes(window.location.host)) {
      link.href = cols[1]?.innerText.trim();
    }
  });
  if(!mainScript){
    return;
  }


  let configScript = createScript( 'https://partner-directory-ui-flex.adobe.io/configuration.js');
  let newRelicScript = createScript( 'https://partner-directory-ui-flex.adobe.io/newrelic.js');


  link.rel="stylesheet";
  document.body.append(root);
  document.head.appendChild(link);
  document.head.appendChild(configScript);
  document.head.appendChild(newRelicScript);
  document.head.appendChild(mainScript);




  performance.mark('react-include:end');
  performance.measure('react-include block', 'react-include:start', 'react-include:end');
}
