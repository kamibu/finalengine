function UIDGenerator() {
    this.id = 0;
}

UIDGenerator.prototype = {
    get: function() {
        return this.id++;
    }
};
