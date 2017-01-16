function initializeFactEditor(editor, variables, factReadyCallback) {
    let entry = editor.getElementsByClassName('fact-entry')[0],
        form = editor.getElementsByTagName('form')[0],
        button = editor.getElementsByTagName('button')[0];

    let fitEntrySize = fitSize.bind(entry, () => entry.value.length + 3, 18);
    fitEntrySize();
    entry.addEventListener('keydown', fitEntrySize);

    entry.focus();
    entry.selectionStart = entry.value.length;

    let formVisible = false;

    let selectHtmlArr = [ '<select><option>?</option>' ];
    for (let varId in variables) {
        selectHtmlArr.push(`<option value="${varId}">${varId}: ${variables[varId]}</option>`);
    }
    selectHtmlArr.push('</select>');
    let selectHtml = selectHtmlArr.join('');

    editor.addEventListener('transitionend', function(e) {
        if (e.target != editor) {
            return;
        }
        if (this.style.opacity == 0) {
            let prevText = button.innerHTML;
            button.innerHTML = button.getAttribute('data-toggle');
            button.setAttribute('data-toggle', prevText);

            if (formVisible) {
                form.classList.add('hidden');
                entry.classList.remove('hidden');
                entry.focus();
                formVisible = false;
            } else {
                form.innerHTML = entry.value.replace(/\?/g, selectHtml);
                form.querySelectorAll('select').forEach(s => {
                    let fitSelectSize = fitSize.bind(s, () => s.options[s.selectedIndex].text.length + 2, 14);
                    fitSelectSize();
                    s.addEventListener('change', fitSelectSize);
                    s.addEventListener('change', ifFactReadyThenCall.bind(this, factReadyCallback));
                });
                entry.classList.add('hidden');
                form.classList.remove('hidden');
                form.querySelector('select').focus();
                formVisible = true;
            }
            this.style.opacity = 1;
        } else {
            button.disabled = false;
        }
    });

    button.addEventListener('click', function() {
        if (entry.value.match(/\?/)) {
            editor.style.opacity = 0;
            button.disabled = true;
        } else {
            entry.focus();
        }
    });

    entry.addEventListener('keypress', e => e.keyCode == 13 && button.click());
}

function fitSize(getTextLen, fontWidth) {
    setTimeout(() => this.style.width = (getTextLen() * fontWidth) + 'px', 4);
}

function ifFactReadyThenCall(callback) {
    if ([].every.call(this.parentNode.querySelectorAll('select'), s => s.selectedIndex > 0)) {
        callback();
    }
}
