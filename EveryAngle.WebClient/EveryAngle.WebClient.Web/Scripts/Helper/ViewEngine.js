(function (window) {
    "use strict";

    window.WC.ViewEngine = function (handler) {
        var getHandlerArgumentsPart = function (element, arg) {
            var args = [];

            if (arg.charAt(0) === '(') {
                arg = arg.substr(1);
            }

            arg = arg.substr(0, arg.lastIndexOf(')'));

            if (arg) {
                jQuery.each(arg.split(','), function (index, value) {
                    value = jQuery.trim(value);
                    if (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
                        value = value.substr(1, value.length - 2);
                    }
                    else if (value === 'null') {
                        value = null;
                    }
                    else if (value === 'this') {
                        value = element;
                    }
                    else if (!isNaN(value)) {
                        value = parseFloat(value);
                    }
                    args[index] = value;
                });
            }

            return args;
        };

        var getHandlerParts = function (element, handlerString) {
            var parts = null;
            if (handlerString.indexOf('$root') !== -1) {
                var fn = handlerString.replace('$root.', '');
                var indexOfEndMethod = fn.indexOf('(');
                parts = {};
                parts.methods = fn.substr(0, indexOfEndMethod).split('.');
                parts.arguments = getHandlerArgumentsPart(element, fn.substr(indexOfEndMethod));
            }
            return parts;
        };

        var callHandlerParts = function (handlerParts) {
            var fn = handler;
            jQuery.each(handlerParts.methods, function (index, method) {
                if (fn[method]) {
                    fn = fn[method];
                }
                else {
                    fn = null;
                    return false;
                }
            });
            if (typeof fn === 'function') {
                return fn.apply(handler, handlerParts.arguments);
            }
            else {
                return false;
            }
        };

        this.ApplyCustomView = function (container) {

            container.find('[data-click]').each(function (index, element) {
                element = jQuery(element);
                element.off('click').on('click', { click: element.data('click'), handler: handler }, function (e) {
                    var parts = getHandlerParts(this, e.data.click);
                    if (parts) {
                        callHandlerParts(parts);
                    }
                });
            });

            container.find('[data-visible]').each(function (index, element) {
                element = jQuery(element);
                var parts = getHandlerParts(this, element.data('visible'));
                var isVisible = parts && callHandlerParts(parts);
                if (isVisible) {
                    element.removeClass('alwaysHide');
                }
                else {
                    element.addClass('alwaysHide');
                }
            });
        };
    };

})(window);
