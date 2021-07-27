var $ = selector => document.querySelector(selector);

function onExecuteRegex(ev) {
  ev.preventDefault();
  cleanResults();

  const values = fetchFormValues();
  if (values === undefined) return;

  const results = executePattern(values);

  printResults(results);
  highlightResults(results, values.target);
}

function cleanResults() {
  console.clear();
  $('#resultsLabel').innerHTML = 'Matches (Results):';
  $('#results').value = '';
}

function fetchFormValues() {
  const regexForm = $('#regex-form');
  const isValid = regexForm.reportValidity();

  if (!isValid) return;

  const inputTarget = $('#target');
  const inputPattern = $('#pattern');
  const checkboxIndex = $('#showIndex');
  const checkboxGroups = $('#showGroups');

  return {
    target: inputTarget.value.trim(),
    pattern: inputPattern.value,
    showIndex: checkboxIndex.checked,
    showGroups: checkboxGroups.checked
  };
}

function executePattern(values) {
  const { target, pattern, showIndex, showGroups } = values;
  let results = [];
  let regexResult = null;

  const regexObject = new RegExp(pattern, 'g');
  regexResult = regexObject.exec(target);

  if (regexResult === null) throw Error('Regex returned empty value');

  regexResult.forEach(e => {
    if (e[0] === '') throw Error('Regex returned empty value');

    results.push(
      generateResult(
        showGroups ? regexResult.join(' ||| ') : regexResult[0],
        regexResult.index,
        regexObject.lastIndex,
        showIndex
      )
    );
  });

  logExecutionTime(pattern, target);

  return results;
}

function generateResult(result, index, lastIndex, showIndex) {
  const indexText = showIndex ? `[${index}-${lastIndex}]` : '';
  return {
    result: result + indexText,
    index: index,
    lastIndex: lastIndex
  };
}

function printResults(results) {
  const resultsInput = $('#results');
  const resultsLabel = $('#resultsLabel');
  const resultsArray = results.map(item => item.result);

  resultsLabel.innerHTML = `${resultsArray.length} Matches (Results)`;

  if (resultsArray.length > 0) {
    resultsInput.value = resultsArray.join(' | ');
  } else {
    resultsInput.value = 'No matches';
  }
}

function highlightResults(results, text) {
  let item = null;
  let initialIndex = 0;
  let content = '';

  while ((item = results.shift()) != null) {
    content += text.substring(initialIndex, item.index);
    content += `
      <span style="background-color: cornflowerblue">
        ${text.substring(initialIndex, item.lastIndex)}
      </span>`;
    initialIndex = item.lastIndex;
  }

  if (text.length - initialIndex > 0) {
    const formattedText = escapeHTML(text.substring(initialIndex, text.length));
    content += formattedText;
  }

  $('#highlightText').innerHTML = content;

  function escapeHTML(string) {
    return string
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

function logExecutionTime(pattern, target) {
  const regexObject = new RegExp(pattern, 'g');
  const timerInit = performance.now();
  regexObject.test(target);
  const timerEnd = performance.now();
  console.info(`Execution time: ${timerEnd - timerInit} ms`);
}
