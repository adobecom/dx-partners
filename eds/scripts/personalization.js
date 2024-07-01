import {isNonMember} from "./utils.js";

function getNodesByXPath(query) {
  const nodes = [];
  const xpathResult = document.evaluate(query, document);
  let current = xpathResult?.iterateNext();
  while(current) {
    nodes.push(current);
    current = xpathResult.iterateNext();
  }
  return nodes;
}

function replacePlaceholders(placeholders) {
  Object.keys(placeholders).forEach(function (key) {
    if (!placeholders[key]) return;
    const nodesToReplace = getNodesByXPath(`//em[text()="$${key}"]`);
    nodesToReplace.forEach((node) => {
      node.replaceWith(placeholders[key]);
    });
  });
}

function removeJoinNowCtas() {
  if (isNonMember()) return;
  const nodesToRemove = getNodesByXPath('//a[text()="Join now"]');
  nodesToRemove.forEach((node) => {
    node.remove();
  });
}

export function applyPersonalization(placeholdersToReplace) {
  replacePlaceholders(placeholdersToReplace);
  removeJoinNowCtas();
}
