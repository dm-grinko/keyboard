"use strict";
class Game {
    constructor() {
        this.lengthElement = document.getElementById("length");
        this.lettersElement = document.getElementById("letters");
        this.wordElement = document.getElementById("word");
        this.combinationsElement = document.getElementById("combinations");
        this.body = document.getElementById("body");
        this.slider = document.getElementById("slider");
        this.error = document.getElementById("error");
        this.words = this.getWords();
        this.step = 0;
        this.analytics = this.getAnalytics();
    }

    getAnalytics() {
        const analytics = {}
        for (const key of this.words) {
            analytics[key] = 0;
        }
        return analytics;
    }

    getWords() {
        const length = +this.lengthElement.value;
        const letters = this.lettersElement.value.split("");
        return this.generateWords(length, letters);
    }

    onchange() {
        // update words on input change
        this.words = this.getWords();
        this.nextWord();
        this.analytics = this.getAnalytics();
        this.showCombinations();
        this.body.className = "";
    }

    showCombinations(word, diff) {
        if (word && diff) {
            this.analytics[word] = this.analytics[word] / 1.2 > diff ? diff : Math.floor((this.analytics[word] + diff) / 2);
        }

        this.analytics = Object.fromEntries(
            Object.entries(this.analytics).sort(([, a], [, b]) => a - b).reverse()
        );

        const reducer = (a, w) => {
            return a + `<tr>
                    <td>
                        ${w} = ${this.analytics[w]}
                    </td>
                </tr>`
        };

        const table = Object.keys(this.analytics).reduce(reducer, '');
        this.combinationsElement.innerHTML = `<table style="width:100%">${table}</table>`;
    }

    startTime() {
        this.start = Date.now();
    }

    endTime(word) {
        const current = Date.now();
        const diff = current - this.start;

        this.showCombinations(word, diff);
    }

    onfocusout(e) {
        // the input should have a minimum of 2 characters
        if (this.lettersElement.value.length < 2) {
            this.error.style.display = "block";
        } else {
            this.error.style.display = "none";
        }
        this.analytics = this.getAnalytics();
        this.nextWord();
        this.showCombinations();
    }

    onkeydown(e) {
        // the input should have unique characters without space
        const notAllowed = [" ", ...this.lettersElement.value];
        if (notAllowed.includes(e.key)) {
            e.preventDefault();
            return false;
        }
    }

    generateWords(length, input, output = input) {
        // ex.: length - 2, input - ['n', 't']
        // result: ['nn', 'nt', 'tt', 'tn']
        const result = [];

        for (let i = 0; i < input.length; i++) {
            const a = input[i];

            for (let o = 0; o < output.length; o++) {
                const b = output[o];
                result.push(`${a}${b}`);
            }
        }

        return result[0].length === length ?
            result :
            this.generateWords(length, input, result);
    }

    getWord() {
        const keys = Object.keys(this.analytics);
        const values = Object.values(this.analytics);
        const min = 0;
        let max;

        // if all combinations were tested
        if (Math.min(...values) !== 0) {
            this.body.className = "active";
            max = 3; // practicing only 3 worst combinations
            const random = Math.floor(Math.random() * (max - min) + min);

            return {
                slug: keys[random],
                letters: keys[random].split(""),
            };
        } else {
            const newKeys = [];
            keys.forEach(key => { // first of all lets test untested data
                if (this.analytics[key] === 0) {
                    newKeys.push(key);
                }
            });

            max = Math.floor(newKeys.length);
            const random = Math.floor(Math.random() * (max - min) + min);

            return {
                slug: newKeys[random],
                letters: newKeys[random].split(""),
            };
        }

    }

    showWord({ letters }) {
        // creat a span element for each letter
        this.wordElement.innerHTML = "";
        for (let i = 0; i < letters.length; i++) {
            this.wordElement.innerHTML += `<span id="${i}">${letters[i]}</span>`;
        }
        this.startTime();
    }

    nextWord() {
        const word = this.getWord();
        if (word.slug === this.entry) {
            return this.nextWord();
        }
        this.word = word;
        this.entry = "";
        this.showWord(this.word);
    }

    moveSlider(action) {
        this.step = action && this.step !== 1000 ? this.step + 10 : 0;
        const max = this.step;

        d3.select("input")
            .transition()
            .duration(1000)
            .tween("value", function() {
                var i = d3.interpolate(this.value, max);
                return (t) => (this.value = i(t));
            });
    }

    onKeypress({ key: letter }) {
        const letterElement = document.getElementById(this.entry.length);

        if (letter == letterElement.innerHTML) {
            // on entering the correct character
            letterElement.style.color = "#5d5d5d";
            this.entry += letter;

            if (this.entry === this.word.slug) {
                // on entering the correct word
                this.moveSlider(true);
                this.endTime(this.word.slug);
                this.nextWord();
            }
        } else {
            // on entering the wrong character
            // must start typing the word from the beginning
            for (let i = 0; i < this.word.letters.length; i++) {
                const letterElement = document.getElementById(i);
                if (letterElement) {
                    letterElement.style.color = Math.min(...Object.values(this.analytics)) !== 0 ?
                        "#04aa6d" : "#9faa04"; // yellow for the first test otherwise green
                }
            }
            this.entry = "";
            // move the slider to the beginning
            this.moveSlider(false);
        }
    }

    start() {
        this.nextWord();
        this.body.addEventListener("keypress", this.onKeypress.bind(this));
    }
}

const game = new Game();

game.start();