class Logger {

    constructor(htmlElement) {
        this.htmlElement = htmlElement;
    }

    addLog(text) {
        let el = document.createElement('p');
        el.innerText = text
        el.classList.add('yellow-bkg')
        if (this.htmlElement.childNodes.length > 10) {
            this.htmlElement.removeChild(this.htmlElement.firstChild);
        }
        this.htmlElement.appendChild(el);
    }
}

module.exports = Logger;