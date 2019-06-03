// Number
(function (window, Number) {

    "use strict";

    // Get safe decimals
    Number.prototype.getSafeDecimals = function (addDecimals) {
        return Math.min(20, Math.max(4, (this.toString().split('.')[1] || '').length + 2 + (addDecimals || 0)));
    };

    // Safe parse value
    Number.prototype.safeParse = function (safeDecimals) {
        return parseFloat(this.toFixed(safeDecimals));
    };

})(window, window.Number);

// Array
(function (window, Array) {

    "use strict";

    // Array.sum
    // e.g. -> [2,3,4,5,6].sum()
    Array.prototype.sum = function () {
        for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
        return sum;
    };

    // Array.max
    // e.g. -> [2,3,4,5,6].max()
    Array.prototype.max = function () {
        return Math.max.apply({}, this);
    };

    // Array.min
    // e.g. -> [2, 3, 4, 5, 6].min()
    Array.prototype.min = function () {
        return Math.min.apply({}, this);
    };

    // Array.indexOfObject: index of json object in array
    // @params
    // - name, json property name to find
    // - filter, string or function
    // - sensitive (optional), default = true, is case sensitive or not?
    // @return - index of array (-1 if not found)
    Array.prototype.indexOfObject = function (name, filter, sensitive) {
        var i = -1, isFunction = typeof filter === 'function';
        for (var index = 0; index < this.length; index++) {
            if (isFunction) {
                if (filter(this[index][name])) {
                    i = index;
                    break;
                }
            }
            else {
                if (this[index][name] === filter || (sensitive === false && ('' + this[index][name]).toLowerCase() === ('' + filter).toLowerCase())) {
                    i = index;
                    break;
                }
            }
        }
        return i;
    };

    // Array.hasObject: has json object in array or not?
    // @params
    // - name, json property name to find
    // - filter, string or function
    // - sensitive (optional), default = true, is case sensitive or not?
    // @return - true or false
    Array.prototype.hasObject = function (name, filter, sensitive) {
        return this.indexOfObject(name, filter, sensitive) !== -1;
    };

    // Array.findObject: find json object in array
    // @params
    // - name, json property name to find
    // - filter, string or function
    // - sensitive (optional), default = true, is case sensitive or not?
    // @return - first finding json object
    Array.prototype.findObject = function (name, filter, sensitive) {
        return this[this.indexOfObject(name, filter, sensitive)] || null;
    };

    // Array.findObjects: find json objects in array
    // @params
    // - name, json property name to find
    // - filter, string or function
    // - sensitive (optional), default = true, is case sensitive or not?
    // @return - finding json objects
    Array.prototype.findObjects = function (name, filter, sensitive) {
        var result = [], isFunction = typeof filter === 'function';
        for (var index = 0; index < this.length; index++) {
            if (isFunction) {
                if (filter(this[index][name])) {
                    result.push(this[index]);
                }
            }
            else {
                if (this[index][name] === filter || (sensitive === false && ('' + this[index][name]).toLowerCase() === ('' + filter).toLowerCase())) {
                    result.push(this[index]);
                }
            }
        }
        return result;
    };

    // Array.removeObject: remove matched json objects in array
    // @params
    // - name, json property name to find
    // - filter, string or function
    // - sensitive (optional), default = true, is case sensitive or not?
    // @return - [nothing]
    Array.prototype.removeObject = function (name, filter, sensitive) {
        var isFunction = typeof filter === 'function';
        for (var index = this.length - 1; index >= 0; index--) {
            if (isFunction) {
                if (filter(this[index][name])) {
                    this.splice(index, 1);
                }
            }
            else {
                if (this[index][name] === filter || (sensitive === false && ('' + this[index][name]).toLowerCase() === ('' + filter).toLowerCase())) {
                    this.splice(index, 1);
                }
            }
        }
    };

    // Array.sortObject - sort json object
    // @params
    // - name, json property name
    // - direction (optional), sort direction: -1 = ASC (default), 1 = DESC
    // @return - [nothing]
    Array.prototype.sortObject = function (name, direction, sensitive) {
        if (typeof direction === 'undefined')
            direction = -1;

        this.sort(function (a, b) {
            var x = a[name];
            var y = b[name];

            if (x === y)
                return 0;
            if (x === null)
                return 1 * direction;
            if (y === null)
                return -1 * direction;

            if (sensitive === false) {
                if (typeof x === 'string')
                    x = x.toLowerCase();
                if (typeof y === 'string')
                    y = y.toLowerCase();
            }

            // use localeCompare on string
            if (typeof x === 'string') {
                return x.localeCompare(y) * direction * -1;
            }
            if (typeof y === 'string') {
                return y.localeCompare(x) * direction;
            }

            // use normal compare on others
            if (x < y)
                return 1 * direction;
            else if (x > y)
                return -1 * direction;
            else
                return 0;
        });
    };

    // Array.distinct - get rid of duplicating value in array
    // @params
    // - converter (optional), converter function before conparing
    // @return - unique values in array
    Array.prototype.distinct = function (converter) {
        if (typeof converter !== 'function')
            converter = function (value) { return value; };

        var seen = {};
        return this.filter(function (item) {
            var k = converter(item);
            return seen.hasOwnProperty(k) ? false : seen[k] = true;
        });
    };

    // Array.pushDeferred - add deferred object
    // @params
    // - fn, function name
    // - args: array, arguments
    // @return - [nothing]
    Array.prototype.pushDeferred = function (fn, args) {
        this.push({ fn: fn || jQuery.noop, args: args || [] });
    };

})(window, window.Array);

// ko
(function (window, ko) {

    "use strict";

    if (!window.enumHandlers)
        window['enumHandlers'] = {};
    if (typeof enumHandlers.CHECKSTATE === 'undefined') {
        enumHandlers.CHECKSTATE = {
            FALSE: 1,
            TRUE: 2,
            UNDEFINED: 3
        };
    }
    if (typeof enumHandlers.FIELDCHOOSERNAME === 'undefined') {
        enumHandlers.FIELDCHOOSERNAME = {
            LISTDRILLDOWN: 'ListDrilldownGrid',
            FIELDCHOOSER: 'DisplayPropertiesGrid'
        };
    }

    // solved binding inside ko element (http://www.knockmeout.net/2012/05/quick-tip-skip-binding.html)
    ko.bindingHandlers.stopBinding = {
        init: function () {
            return { controlsDescendantBindings: true };
        }
    };
    ko.virtualElements.allowedBindings.stopBinding = true;

    // check 3 state
    ko.bindingHandlers.IndeterminatableChange = {
        init: function () { },
        update: function (element, valueAccessor, allBindings, viewModel) {
            var value = valueAccessor(),
                $element = jQuery(element),
                state = $element.data('state'),
                stateText = '';

            if (typeof state === 'undefined') {
                $element.data('state-changed', false);
            }
            else {
                $element.data('state-changed', true);
            }

            // clear cover element
            $element.prev('.chkIndeterminatable').remove();

            if (value() === null) {
                state = enumHandlers.CHECKSTATE.UNDEFINED;
                stateText += 'empty';
            }
            else if (value()) {
                state = enumHandlers.CHECKSTATE.TRUE;
                stateText += 'yes';
            }
            else {
                state = enumHandlers.CHECKSTATE.FALSE;
                stateText += 'no';
            }

            $element
                .addClass('chk')
                .data('state', state)
                .prop({
                    indeterminate: value() === null ? true : false,
                    checked: value() === null ? false : value()
                });

            var position = $element.position();
            position.top += parseInt($element.css('margin-top') || 0);
            position.left += parseInt($element.css('margin-left') || 0);
            $element.before(
                jQuery('<span />')
                    .attr({
                        'class': 'chkIndeterminatable ' + ($element.is(':disabled') ? ' disabled' : '') + stateText,
                        'id': element.id ? element.id + '-checkbox' : ''
                    })
                    .css(position)
                    .on('click', { value: value }, function (e) {
                        if (jQuery(this).next(':disabled').length === 0) {
                            e.data.value(value() === null ? true : (value() ? false : null));
                        }
                    })
            );

            if (allBindings().click)
                allBindings().click(element, value());
            else if (viewModel.IndeterminatableCallback)
                viewModel.IndeterminatableCallback(element, value());
        }
    };

    ko.bindingHandlers.Indeterminatable = {
        init: function () { },
        update: function () { }
    };

})(window, window.ko);

// jQuery
(function (window, jQuery) {

    "use strict";

    // set storage prefix
    window.getStoragePrefix = function (path) {
        var prefix = '';
        var storagePrefixCount = 0;
        jQuery.each(path.split('/'), function (index, name) {
            // stop if..
            // - found home directory
            // - found admin directory
            // - name length is 2 (language directory, e.g. en, nl, th)
            // - only first 2 directories
            if (name.toLowerCase().indexOf('home') === 0 || name.toLowerCase().indexOf('admin') === 0 || name.length === 2 || storagePrefixCount === 2)
                return false;

            if (name) {
                prefix += name;
                storagePrefixCount++;
            }
        });
        return prefix + '_';
    };
    window.storagePrefix = window.getStoragePrefix(location.pathname);

    // test localStorage and fallback to use memory if no support
    if (!window.Storage || !localStorage.getItem('_test')) {
        try {
            localStorage.setItem('_test', '1');
        }
        catch (ex) {
            var tmpStorage = {};
            var tmpStorageKey = 'EA_';
            Storage.prototype.setItem = function (key, value) {
                tmpStorage[tmpStorageKey + key] = value;
            };
            Storage.prototype.getItem = function (key) {
                return tmpStorage[tmpStorageKey + key] === undefined ? null : tmpStorage[tmpStorageKey + key];
            };
            Storage.prototype.removeItem = function (key) {
                delete tmpStorage[tmpStorageKey + key];
            };
            Storage.prototype.clear = function () {
                tmpStorage = {};
            };
        }
    }

    // clear specific storage if QuotaExceededError
    var clearStorageKeys = ['classes', 'fields', 'fields_instance', 'field_sources', 'field_domains'];
    var clearLargeStorages = function (storage) {
        jQuery.each(storage, function (key) {
            if (isClearStorageKey(key))
                storage.removeItem(key);
        });
    };
    var isClearStorageKey = function (key) {
        var result = false;
        jQuery.each(clearStorageKeys, function (index, clearKey) {
            if (key.indexOf('_' + clearKey) !== -1) {
                result = true;
                return false;
            }
        });
        return result;
    };

    // get all storage keys
    var getAllKeys = function (storage) {
        var values = [],
            // keys as array
            keys = Object.keys(storage),
            i = keys.length;

        while (i--) {
            // get only if that key has match the prefix
            if (keys[i].substr(0, window.storagePrefix.length) === window.storagePrefix) {
                values.push(keys[i].substr(window.storagePrefix.length));
            }
        }

        return values;
    };

    // get storage
    var getItem = function (storage, key) {
        var value = storage.getItem(window.storagePrefix + key);
        return value && JSON.parse(value);
    };

    // set storage,
    // clear list of following storage name if get error
    // - error would be QuotaExceededError
    // - try to add it again (1 time) after got the error
    var setItem = function (storage, key, value, retry, isJSON) {
        try {
            storage.setItem(window.storagePrefix + key, isJSON === false ? value : JSON.stringify(value));
        }
        catch (ex) {
            clearLargeStorages(storage);
            if (retry !== false)
                setItem(storage, key, value, false, isJSON);
        }
    };

    // remove storage
    var removeItem = function (storage, key) {
        storage.removeItem(window.storagePrefix + key);
    };

    // remove all
    var removeAll = function (storage, excludeKeys) {
        jQuery.each(storage, function (key) {
            if (isValidStorageKey(key, excludeKeys))
                storage.removeItem(key);
        });
    };

    var isValidStorageKey = function (key, excludeKeys) {
        if (!excludeKeys) {
            excludeKeys = [];
        }
        
        excludeKeys = jQuery.map(excludeKeys, function (excludeKey) {
            return window.storagePrefix + excludeKey;
        });
        
        return typeof key === 'string' &&
                        key.indexOf(window.storagePrefix) === 0 &&
                        excludeKeys.indexOf(key) === -1;
    };

    jQuery.extend(jQuery, {
        injectCSS: function (rules, id) {
            if (!document.getElementById('css-' + id)) {
                var style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                if (id)
                    style.setAttribute('id', 'css-' + id);
                if (style.styleSheet) {
                    style.styleSheet.cssText = rules;
                }
                else {
                    style.innerHTML = rules;
                }
                document.body.appendChild(style);
            }
        },
        localStorage: function (key, value, isJSON) {
            if (arguments.length === 1)
                return getItem(localStorage, key);
            else
                setItem(localStorage, key, value, false, isJSON);
        },
        sessionStorage: function (key, value, isJSON) {
            if (arguments.length === 1)
                return getItem(sessionStorage, key);
            else
                setItem(sessionStorage, key, value, false, isJSON);
        }
    });
    jQuery.localStorage.getAllKeys = function () {
        return getAllKeys(localStorage);
    };
    jQuery.localStorage.removeItem = function (key) {
        removeItem(localStorage, key);
    };
    jQuery.localStorage.removeAll = function () {
        removeAll(localStorage,
            [NotificationsFeedRepository.StorageKey]);
    };
    jQuery.localStorage.adjust = function () {
        clearLargeStorages(localStorage);
    };

    jQuery.sessionStorage.getAllKeys = function () {
        return getAllKeys(sessionStorage);
    };
    jQuery.sessionStorage.removeItem = function (key) {
        removeItem(sessionStorage, key);
    };
    jQuery.sessionStorage.removeAll = function () {
        removeAll(sessionStorage);
    };

    // set kendo grid column width
    jQuery.setGridWidth = function (grid, columnIndex, newWidth) {
        var headerWrapper, column, columnSize, columnOffset;

        headerWrapper = grid.wrapper.find('.k-grid-header-wrap');
        column = headerWrapper.find('th').eq(columnIndex);
        columnSize = column.outerWidth();
        columnOffset = column.offset();

        if (grid._createResizeHandle && grid.resizable) {
            grid._createResizeHandle(headerWrapper, column);
            grid.resizable.trigger('start', { currentTarget: grid.resizeHandle[0], x: { location: columnOffset.left + columnSize } });
            grid.resizable.trigger('resize', { x: { location: columnOffset.left + newWidth } });
            grid.resizable.trigger('resizeend');
        }
    };

    // highlighter
    var normalizeText = function (text) {
        // clean up text
        text = jQuery.trim(text);
        text = text.replace(/\"\"/g, '"');
        text = text.replace(/ \" /g, ' ');
        text = text.replace(/\s\s/g, ' ');
        text = text.replace(/\" /g, '"" ');
        text = text.replace(/ \"/g, ' ""');
        return text;
    };
    var isWordWithDblQoute = function (word) {
        return word[0] === '"' && word[word.length - 1] === '"';
    };
    var cleanWords = function (rawWords, words) {
        jQuery.each(rawWords, function (index, word) {
            word = jQuery.trim(word);
            if (word.indexOf('" ') !== -1) {
                // e.g. ["a b" c]
                cleanWords(word.split('" '), words);
            }
            else if (word.indexOf(' "') !== -1) {
                // e.g. [a "b c"]
                cleanWords(word.split(' "'), words);
            }
            else if (isWordWithDblQoute(word)) {
                // e.g. ["a b c"] or [""a"]
                word = word.replace(/\"\"/g, '"');
                words.push(word.substr(1, word.length - 2));
            }
            else if (word.indexOf(' ') !== -1) {
                // e.g. [a b c]
                cleanWords(word.split(' '), words);
            }
            else {
                // finally
                words.push(word);
            }
        });
    };
    var getWords = function (text) {
        text = normalizeText(text);
        var words = [];
        cleanWords([text], words);
        return words.distinct();
    };
    var truncateElement = function (target) {
        // restore old content
        var storedCache = target.data('highlightCache');
        if (storedCache)
            target.html(storedCache);

        // store old content
        var cache = target.html();
        target.removeClass('truncated').data('highlightCache', cache);

        target.find('.highlight:first').addClass('first');
        var html = target.html();
        var index = html.indexOf('<span class="highlight first">') - 20;
        if (index > 0) {
            html = '...' + html.substr(index);
            target.addClass('truncated').html(html);
        }
    };
    jQuery.highlighter = {
        getWords: getWords
    };
    jQuery.fn.highlighter = function (text) {
        // required highlight library
        if (!jQuery.fn.highlight || !jQuery.trim(text))
            return;

        // clear highlight
        var elements = jQuery(this);
        elements.removeHighlight();

        // highlight
        var words = getWords(text);
        jQuery.each(words, function (index, word) {
            elements.highlight(word);
        });

        // truncate if need
        elements.filter('.truncatable').each(function () {
            truncateElement(jQuery(this));
        });
    };

})(window, window.jQuery);