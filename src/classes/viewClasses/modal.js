class Modaler {

    visible;

    constructor(htmlElement, contentElement) {
        this.visible = false;
        this.contentElement = contentElement;
        this.htmlElement = htmlElement;
        this.htmlElement.classList.add('hide');
        this.callback = () => {console.log('empty callback!')}
    }

    show() {
        this.htmlElement.classList.remove('hide')
    }

    hide() {
        this.htmlElement.classList.add('hide')
    }

    open(panelName, data, callback) {
        if (!this.visible) {
            this.htmlElement.classList.remove('hide');
            switch (panelName) {
                case 'pickup':
                    this.fillPickupContent(data);            
                    break;        
                case 'dialog':
                    console.log('dialog');            
                    break;        
                default:
                    break;
            }
            this.visible = true;
            this.callback = callback;
        }
    }

    fillPickupContent(data) {
        for (let i = 0; i < data.length; i++) {
            let el = document.createElement('p')
            el.innerText = "Pick Up" + data[i].name
            this.contentElement.appendChild(el)
        }
    }

    close() {
        while (this.contentElement.firstChild) {
            this.contentElement.removeChild(this.contentElement.firstChild);
        }
        this.htmlElement.classList.add('hide');
        this.visible = false;
        this.callback()
    }
}

module.exports = Modaler;