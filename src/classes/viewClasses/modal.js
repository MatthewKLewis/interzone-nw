class Modaler {

    visible;

    constructor(htmlElement) {
        this.visible = false;
        this.htmlElement = htmlElement;
        this.htmlElement.classList.add('hide');
    }

    addLog(text) {
        let el = document.createElement('p');
        el.innerText = text
        if (this.htmlElement.childNodes.length > 10) {
            this.htmlElement.removeChild(this.htmlElement.firstChild);
        }
        this.htmlElement.appendChild(el);
    }

    show() {
        this.htmlElement.classList.remove('hide')
    }

    hide() {
        this.htmlElement.classList.add('hide')
    }

    toggleVisibility() {
        if (this.visible) {
            this.htmlElement.classList.add('hide');
        } else {
            this.htmlElement.classList.remove('hide');
        }
        this.visible = !this.visible;
    }
}

module.exports = Modaler;