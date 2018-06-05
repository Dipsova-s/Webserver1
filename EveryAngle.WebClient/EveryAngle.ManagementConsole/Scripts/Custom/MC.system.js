(function (win) {
    var system = {
        __timeout: {},
        __interval: {},
        abort: function () {
            if (MC.ajax)
                MC.ajax.abortAll();

            for (var seed in MC.system.__timeout)
                win.__clearTimeout(seed);
            for (var seed in MC.system.__interval)
                win.__clearInterval(seed);

            MC.system.__timeout = {};
            MC.system.__interval = {};
        }
    };
    MC.system = system;

    // edit window.setTimeout
    win.__setTimeout = win.setTimeout;
    win.setTimeout = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var seed = win.__setTimeout.apply(this, args);
        MC.system.__timeout[seed] = true;
        return seed;
    };
    win.__clearTimeout = win.clearTimeout;
    win.clearTimeout = function (seed) {
        delete MC.system.__timeout[seed];
        win.__clearTimeout(seed);
    };

    // edit window.setInterval
    win.__setInterval = win.setInterval;
    win.setInterval = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var seed = win.__setInterval.apply(this, args);
        MC.system.__interval[seed] = true;
        return seed;
    };
    win.__clearInterval = win.clearInterval;
    win.clearInterval = function (seed) {
        delete MC.system.__interval[seed];
        win.__clearInterval(seed);
    };

})(window);
