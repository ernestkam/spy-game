// Template management
const Templates = {
    getCardTemplate() {
        return document.getElementById('cardTemplate').content.cloneNode(true);
    },

    getSetupBoxTemplate() {
        return document.getElementById('setupBoxTemplate').content.cloneNode(true);
    }
}; 