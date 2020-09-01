(function (win) {
    "use strict";

    var create = function (that) {
        that.element.addClass('multiple-select');
        that.element.html([
            '<div class="item-label-wrapper multiple-select-items ">',
            '<div class="multiple-select-header">' + that.settings.header + '</div>',
            that.settings.readonly ? '' : '<div class="multiple-select-button"><i class="icon icon-plus"></i></div>',
            '</div>'
        ].join(''));
    };

    var removeList = function () {
        jQuery(document).off('click.multiple-select');
        jQuery('.multiple-select-list').remove();
    };

    var adjustListPosition = function (target, list) {
        var listWidth = list.outerWidth();
        var contentHeight = list.height();
        var offset = target.offset();
        offset.top += target.outerHeight();
        if (offset.left + listWidth > WC.Window.Width) {
            offset.left -= listWidth - target.outerWidth();
        }

        if (offset.top + contentHeight > WC.Window.Height) {
            offset.top -= contentHeight + 22;
        }

        list.css(offset);
    };

    var checkElements = function (that) {
        var selectedItemsCount = that.value().length;
        if (selectedItemsCount === that.settings.data.length)
            that.element.find('.multiple-select-button').addClass('disabled');
        else
            that.element.find('.multiple-select-button').removeClass('disabled');

        if (selectedItemsCount <= that.settings.min)
            that.element.find('.multiple-select-item').addClass('disabled');
        else
            that.element.find('.multiple-select-item').removeClass('disabled');
    };

    var showList = function (that, target) {
        if (target.hasClass('disabled'))
            return;

        removeList();
        var list = jQuery('<ul class="listview listview-popup multiple-select-list" />');
        jQuery.each(that.settings.data, function (index, item) {
            var dataId = item[that.settings.dataFieldId];
            if (!that.settings.dataSelected[dataId]) {
                var itemElement = jQuery('<li class="listview-item" />')
                    .html('<span class="multiple-select-list-label">' + item[that.settings.dataFieldName] + '</span>')
                    .on('click', function (e) {
                        if (jQuery(e.currentTarget).hasClass('disabled'))
                            return;

                        e.stopPropagation();
                        addItem(that, jQuery(this), item, false);
                        adjustListPosition(target, list);
                    });
                list.append(itemElement);
                that.settings.render.call(that, 'list', item, itemElement);
            }
        });
        list.appendTo('body');
        jQuery(document)
            .off('click.multiple-select')
            .on('click.multiple-select', function (e) {
                var element = jQuery(e.target);
                if (!element.is(target)
                    && !element.closest('.multiple-select-list').length
                    && !element.closest('.multiple-select-button').length) {
                    removeList();
                }
            });
        adjustListPosition(target, list);
    };

    var addItem = function (that, element, item, isInit) {
        var dataId = item[that.settings.dataFieldId];
        var dataName = item[that.settings.dataFieldName] || dataId;
        var itemElement = jQuery([
            '<div class="item-label multiple-select-item">',
            '<span class="multiple-select-label">' + dataName + '</span>',
            (that.settings.readonly ? '' : '<a class="btn-remove"><i class="icon icon-close"></i></a>'),
            '</div>'
        ].join('')).data('id', dataId);
        that.element.children('.multiple-select-items').append(itemElement);
        that.settings.dataSelected[dataId] = true;
        checkElements(that);
        that.settings.render.call(that, 'value', item, itemElement);
        if (!isInit)
            that.settings.change.call(that, 'add', item, itemElement);

        if (element.length) {
            var container = element.parent();
            element.remove();
            if (!container.children().length)
                removeList();
        }
    };

    var deleteItem = function (that, target) {
        if (that.value().length <= that.settings.min)
            return;

        var itemElement = target.closest('.multiple-select-item');
        var dataId = itemElement.data('id');
        delete that.settings.dataSelected[dataId];

        var item = that.settings.data.findObject('id', dataId);
        that.settings.change.call(that, 'delete', item, itemElement);
        itemElement.remove();
        checkElements(that);
    };

    var initItems = function (that, values) {
        jQuery.each(that.settings.data, function (index, item) {
            var dataId = item[that.settings.dataFieldId];
            if (jQuery.inArray(dataId, values) !== -1)
                addItem(that, jQuery(), item, true);
        });
        delete that.settings.value;
    };

    var getValues = function (that) {
        return jQuery.map(that.settings.dataSelected, function (value, id) {
            if (value)
                return id;
        });
    };

    var getItems = function (that) {
        return jQuery.map(that.settings.dataSelected, function (value, id) {
            if (value)
                return that.settings.data.findObject('id', id);
        });
    };

    var bindEvents = function (that) {
        that.element
            .off('click', '.multiple-select-button')
            .on('click', '.multiple-select-button', function (e) {
            showList(that, jQuery(e.currentTarget));
        });
        that.element
            .off('click', '.multiple-select-item .icon')
            .on('click', '.multiple-select-item .icon', function (e) {
            deleteItem(that, jQuery(e.currentTarget));
        });
        WC.HtmlHelper.MenuNavigatable('.multiple-select-button', '.multiple-select-list', '.listview-item');
    };

    // multiple selection
    var multiSelect = function (selector, options) {
        var that = Object.create({});
        that.settings = jQuery.extend({
            header: '',
            data: [],
            value: [],
            dataSelected: {},
            dataFieldId: 'id',
            dataFieldName: 'name',
            readonly: false,
            min: 0,
            change: jQuery.noop,
            render: jQuery.noop
        }, options);
        that.showList = showList;
        that.hideList = removeList;
        that.element = jQuery(selector);
        that.value = function () {
            return getValues(that);
        };
        that.items = function () {
            return getItems(that);
        };
        create(that);
        initItems(that, that.settings.value);
        bindEvents(that);

        that.element.data('MultiSelect', that);
        return that;
    };

    jQuery.extend(win.WC.HtmlHelper, { MultiSelect: multiSelect });
})(window);