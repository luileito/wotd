(function(global) {

    const document = global.document;

    function fmtstr(s) {
        // Transform something like `'pohatta [from Sla. Cf. bogat] : rich man'`
        // into `{ source:"pohatta", etymology: "from Sla. Cf. bogat", target:"rich man" }`.
        // TODO: Decouple regexp so that we can handle different formats.
        let pattern = /(.*) \[(.*)\] : (.*)/;
        let matches = s.match(pattern);
        // TODO: Ensure the right matches were found.
        return {
          source: matches[1],
          etymology: matches[2],
          target: matches[3],
        }
    }

    function loadWord() {
        return new Promise(function(resolve, reject) {
            // Test mode: not running in a Chrome extension.
            if (typeof chrome.runtime === 'undefined') {
                let example = fmtstr('aalto [from Gmc. Cf. Icl alda] : wave');
                resolve(example);
            }
            // The `entries.txt` file holds the list of words.
            // IMHO the filaname is generic enough, so no need to decouple this by now.
            let url = chrome.runtime.getURL('./entries.txt');
            return fetch(url)
            .then(function(response) {
                if (response.status !== 200) {
                    reject('Error while reading entries.txt file: ' + response.status);
                }
                return response.text()
                .then(function(content) {
                    let lines = content.split('\n').filter(s => s.trim());
                    let index = Math.floor(Math.random() * lines.length);
                    let entry = lines[index];
                    resolve(fmtstr(entry));
                });
            });
        });
    }

    function randomColor() {
        let hexValues = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++) {
            let index = Math.floor(Math.random() * hexValues.length);
            let value = hexValues[index];
            color += value;
        }
        return color;
    }

    function loadGradient() {
        let color1 = randomColor();
        let color2 = randomColor();
        let angle = Math.round(Math.random() * 360);
        let gradient = 'linear-gradient(' + angle + 'deg, ' + color1 + ', ' + color2 + ')';
        return gradient;
    }

    function elemByClass(name) {
        // Much faster than `document.querySelector`, given that our selectors are dead simple.
        return document.getElementsByClassName(name)[0];
    }

    // Entry point.
    document.addEventListener('DOMContentLoaded', function() {
        document.body.style.background = loadGradient();

        loadWord()
        .then(function(entry) {
            elemByClass('title').innerHTML = entry.source;
            elemByClass('etymology').innerHTML = entry.etymology;
            elemByClass('description').innerHTML = entry.target;

            let anchor = elemByClass('img-query');
            if (anchor) {
                anchor.href = 'https://www.google.com/search?hl=en&site=imghp&tbm=isch&source=hp&q=' + encodeURIComponent(entry.target);
            }
        })
        .catch(console.error);
    });

})(this);
