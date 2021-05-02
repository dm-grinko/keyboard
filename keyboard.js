'use strict';
class Game {
    constructor() {
        this.lengthElement = document.getElementById('length');
        this.lettersElement = document.getElementById('letters');
        this.wordElement = document.getElementById('word');
        this.body = document.getElementById('body');
        this.slider = document.getElementById('slider');
        this.error = document.getElementById('error');
        this.words = this.getWords();
        this.step = 0;
    };

    getWords() {
        const length = +this.lengthElement.value;
        const letters = this.lettersElement.value.split('');
        return this.generateWords(length, letters);
    }

    onchange() {
        // update words on input change
        this.words = this.getWords();
        this.nextWord();
    }

    onfocusout(e) {
        // the input should have a minimum of 2 characters
        if (this.lettersElement.value.length < 2) {
            this.error.style.display = 'block';
        } else {
            this.error.style.display = 'none';
        }
    }

    onkeydown(e) {
        // the input should have unique characters without space
        const notAllowed = [' ', ...this.lettersElement.value];
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
            result : this.generateWords(length, input, result);
    }

    getWord(words) {
        const random = Math.floor(Math.random() * words.length);

        return {
            slug: words[random],
            letters: words[random].split(''),
        };
    };

    showWord({ letters }) {
        // creat a span element for each letter
        this.wordElement.innerHTML = '';
        for (let i = 0; i < letters.length; i++) {
            this.wordElement.innerHTML += `<span id="${i}">${letters[i]}</span>`;
        }
    };

    nextWord() {
        const word = this.getWord(this.words);
        if (word.slug === this.entry) {
            return this.nextWord();
        }
        this.word = word;
        this.entry = '';
        this.showWord(this.word);
    };

    moveSlider(action) {
        this.step = action && this.step !== 1000 ? this.step + 10 : 0;
        const max = this.step;

        d3.select("input").transition()
            .duration(1000)
            .tween("value", function() {
                var i = d3.interpolate(this.value, max);
                return t => this.value = i(t);
            });
    }

    onKeypress({ key: letter }) {
        const letterElement = document.getElementById(this.entry.length);

        if (letter == letterElement.innerHTML) { // on entering the correct character 
            letterElement.style.color = "#5d5d5d";
            this.entry += letter;

            if (this.entry === this.word.slug) { // on entering the correct word
                this.moveSlider(true);
                this.nextWord();
            }
        } else { // on entering the wrong character
            // must start typing the word from the beginning
            for (let i = 0; i < this.word.letters.length; i++) {
                const letterElement = document.getElementById(i);
                if (letterElement) {
                    letterElement.style.color = "#04aa6d";
                }
            }
            this.entry = '';
            // move the slider to the beginning
            this.moveSlider(false);
        }
    };

    start() {
        this.nextWord();
        this.body.addEventListener('keypress', this.onKeypress.bind(this));
    };
}

const game = new Game();

game.start();