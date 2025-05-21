import { getCaasUrl, getLibs } from "../../scripts/utils.js";
import { getConfig, populateLocalizedTextFromListItems, replaceText } from "../utils/utils.js";
import DXCardCollection from "./DXCardCollection.js";


export default async function init(el) {
  performance.mark('react-include:start');

  let root = document.createElement('div');
  root.id = 'root';
  let script = document.createElement('script');
  script.src = 'https://partner-directory-ui-flex.adobe.io/static/js/main.924b4a12.js';
  let link = document.createElement('link');
  link.href = 'https://partner-directory-ui-flex.adobe.io/static/css/main.03a0463f.css';
  link.rel="stylesheet";
  el.append(root);
  el.append(script);
  el.append(link);

  performance.mark('react-include:end');
  performance.measure('react-include block', 'react-include:start', 'react-include:end');
}
