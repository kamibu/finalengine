var UIDGenerator = function() {
    this.id = 0;
}

UIDGenerator.prototype = {
    get: function() {
        return this.id++;
    }
}
