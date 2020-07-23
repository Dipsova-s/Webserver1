/*
* Author: Gaj
*
* TagTextBox extend from MultiSelect
*/

(function ($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var keys = kendo.keys;
    var Widget = ui.MultiSelect;
    var HIDDENCLASS = 'k-hidden';

    var TagTextBox = Widget.extend({
        init: function (element, options) {
            // base call to widget initialization
            var that = this;
            that._$searchIcon = $();
            that.header = $();
            that._defaultValue = null;
            that._forcedTags = [];
            that._canTriggerChanged = true;
            that._forceClosing = false;
            that._userOptions = $.extend({
                open: $.noop,
                close: $.noop,
                filtering: $.noop,
                dataBound: $.noop,
                deselect: $.noop,
                change: $.noop
            }, options);
            var forcedOptions = {
                headerTemplate: function () {
                    return that._headerTemplate();
                },
                footerTemplate: function () {
                    return that._footerTemplate();
                },
                open: function (e) {
                    that._forcedOpen(e);
                },
                close: function (e) {
                    that._forcedClose(e);
                },
                filtering: function (e) {
                    that._forcedFiltering(e);
                },
                dataBound: function (e) {
                    that._forcedDataBound(e);
                },
                deselect: function (e) {
                    that._forcedDeselect(e);
                },
                change: function (e) {
                    that._forcedChange(e);
                }
            };
            var uiOptions = $.extend({}, that._userOptions, forcedOptions);
            Widget.fn.init.call(that, element, uiOptions);
            that._setDefaultValue();
            that.wrapper.addClass('k-tagtextbox');
            that.input.attr('maxlength', that.options.maxInputLength);
            that.dataSource.bind('requestEnd', $.proxy(that._requestEnd, that));
            that._searchIcon();
        },

        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: 'TagTextBox',

            // other options go here
            dataTextField: 'name',
            dataValueField: 'name',
            inputRegExp: '^[a-z0-9_]*$',
            clearButton: false,
            autoClose: false,
            placeholder: 'Input tags...',
            minLength: 1,
            maxInputLength: 25,
            visibleLength: 10,
            delay: 500,
            hasHeader: true,
            canAddNew: true,
            itemClassName: '',
            messages: {
                suggestion: 'Suggestions',
                noData: 'No suggestion',
                newTag: '{0} (new tag)'
            }
        },

        _setDefaultValue: function () {
            var that = this;
            if (that._userOptions.value)
                that.value(that._userOptions.value);
        },
        _forcedOpen: function (e) {
            var that = this;
            var filter = that._filterText();
            if (filter.length < that.options.minLength) {
                e.preventDefault();
            }
            else {
                that.list.addClass('k-tagtextbox-list-container');
                that._toggleNoData(!that._hasData());
                that._updatePopup();
                if (!that.options.autoClose)
                    that._canTriggerChanged = false;
                that._userOptions.open.call(that, e);
            }
        },
        _forcedClose: function (e) {
            var that = this;
            that._clearFilterText();
            if (!that.options.autoClose) {
                that._canTriggerChanged = true;
                that.trigger('change');
            }
            that._userOptions.close.call(that, e);
        },
        _forcedFiltering: function (e) {
            var that = this;
            that.input.css('max-width', that.wrapper.find('.k-multiselect-wrap').width() - 2);
            that._checkFilteringTag(e, that._filterText());
            that._userOptions.filtering.call(that, e);
        },
        _forcedDataBound: function (e) {
            var that = this;
            that._toggleNoData(!that._hasData());
            if (!that._hasSuggestion())
                that.footer.children('.k-item').addClass('k-state-focused');

            that._updatePopup();
            if (!that.ul.children('.k-state-focused:visible').length)
                that._triggerKeydown(keys.DOWN);
            that.ul.children('.k-item').attr({
                'data-role': 'tooltip',
                'data-showwhenneed': true
            });
            that.footer.children('.k-item').attr({
                'data-role': 'tooltip',
                'data-showwhenneed': true
            });
            that._userOptions.dataBound.call(that, e);
        },
        _forcedDeselect: function (e) {
            var that = this;
            if (!that.options.autoClose)
                that._forceClosing = true;
            var dataItem = that._getTagByName(e.dataItem[that.options.dataTextField]);
            if (dataItem)
                dataItem.deselected = true;
            that._isDeselected = true;
            that._userOptions.deselect.call(that, e);
        },
        _forcedChange: function (e) {
            var that = this;

            // check deselected item
            var deselectedIitem = that.dataSource.data().find(function (x) { return x.deselected; });
            if (deselectedIitem) {
                var filter = that._filterText().toLowerCase();
                if (!filter || deselectedIitem[that.options.dataTextField].toLowerCase().indexOf(filter) === -1) {
                    that.dataSource.remove(deselectedIitem);
                }
            }

            var forceClosed = that._forceClosing;
            that._forceClosing = false;
            if (that.popup.visible()) {
                that._toggleNoData(!that._hasData());
                that._updatePopup();
                if (forceClosed) {
                    // close popup on deselect item
                    that.popup.close();
                    return;
                }
            }

            if (that._canTriggerChanged && that._hasChanged()) {
                that._defaultValue = that.value().slice();
                that._userOptions.change.call(that, e);
                delete that._isDeselected;
            }
        },

        _requestEnd: function (e) {
            if (!e.response)
                return;

            var that = this;
            var mergeTags = that._forcedTags.concat(that.value());
            $.each(mergeTags, function (_index, value) {
                if (value && !e.response.filter($.proxy(that._existTag, that, value)).length)
                    e.response.push(that._createTag(value));
            });
            that._forcedTags = [];
        },
        _existTag: function (tag, source) {
            return source[this.options.dataTextField].toLowerCase() === tag.toLowerCase();
        },
        _filterText: function () {
            return $.trim(this._inputValue());
        },
        _clearFilterText: function () {
            this.input.val('');
            this._search();
            this.popup._hideDirClass();
        },
        _checkFilteringTag: function (e, tag) {
            if (tag.length < this.options.minLength) {
                this.popup.close();
                e.preventDefault();
            }
        },
        _isNewTag: function (tag) {
            var that = this;
            return tag && !that._getTagByName(tag);
        },
        _getTagByName: function (tag) {
            var that = this;
            return that.dataSource.data().find($.proxy(that._existTag, that, tag));
        },
        _setNewTag: function () {
            var that = this;
            var name = that._filterText();
            that.value(that.value().concat([name]));
            that.popup.close();
            that.trigger('change');
        },
        _createTag: function (name, isNew) {
            var that = this;
            var tag = { "new": isNew };
            tag[that.options.dataValueField] = name;
            tag[that.options.dataTextField] = name;
            return tag;
        },
        _headerTemplate: function () {
            return this.options.hasHeader ? kendo.format('<div class="k-header"><div class="k-item">{0}</div></div>', this.options.messages.suggestion) : '';
        },
        _footerTemplate: function () {
            var that = this;
            var tag = that._filterText();
            return that.options.canAddNew && that._isNewTag(tag) ? '<div class="k-item">' + kendo.format(that.options.messages.newTag, tag) + '</div>' : '';
        },
        _hasSuggestion: function () {
            return this.ul.children(':visible').length;
        },
        _hasData: function () {
            return this._hasSuggestion() || this.footer.children('.k-item').length;
        },
        _updatePopup: function () {
            var that = this;
            var isVisible = that.popup.visible();
            if (!isVisible) {
                that.popup.element.show();
                that.popup.element.closest('.k-animation-container').show();
            }
            var items = that.ul.children(':visible');
            var heights = [
                that.options.hasHeader ? that.header.outerHeight() : 0,
                that.noData.outerHeight(),
                that.footer.outerHeight(),
                items.outerHeight()
            ];
            var itemHeight = Math.max.apply({}, heights);
            var listHeight = itemHeight * Math.min(items.length, that.options.visibleLength);
            var count = 0;
            if (that.options.hasHeader)
                count++;
            if (that.footer.children('.k-item').length)
                count++;
            if (!that._hasData())
                count++;
            var popupHeight = listHeight + (itemHeight * count);
            if (isVisible) {
                that.popup.wrapper.css('height', popupHeight);
                that.popup.element.css('height', popupHeight);
            }
            else {
                that.options.height = popupHeight;
            }
            that.listView.content.css('max-height', itemHeight * that.options.visibleLength);
            that.listView.content.css('height', listHeight);
            if (!isVisible) {
                that.popup.element.hide();
                that.popup.element.closest('.k-animation-container').hide();
            }
            else {
                that.popup.flipped = that.popup._position();
                that.popup._hideDirClass();
                var animation = that.popup._openAnimation();
                that.popup._showDirClass(animation);
            }
        },
        _searchIcon: function () {
            this._$searchIcon = $('<span class="icon icon-find btn-search"></span>').insertAfter(this.input);
        },
        _loader: function () {
            Widget.fn._loader.call(this);
            this._loading.addClass('loader-spinner-inline');
        },
        _hideBusy: function () {
            Widget.fn._hideBusy.call(this);
            this._$searchIcon.removeClass(HIDDENCLASS);
        },
        _showBusyHandler: function () {
            Widget.fn._showBusyHandler.call(this);
            this._$searchIcon.addClass(HIDDENCLASS);
        },
        _selectValue: function () {
            Widget.fn._selectValue.apply(this, arguments);
            this._updateSelectedValueHtml();
        },
        _updateTagListHTML: function () {
            Widget.fn._updateTagListHTML.apply(this, arguments);
            this._updateSelectedValueHtml();
        },
        _updateSelectedValueHtml: function () {
            var that = this;
            that.tagList
                .children('li').removeClass('k-button').addClass('item-label ' + that.options.itemClassName)
                .children('.k-select').addClass('btn-remove').removeAttr('title').attr({
                    'data-role': 'tooltip',
                    'data-tooltip-text': that.options.messages.deleteTag
                })
                .children('.k-icon').attr('class', 'icon icon-close');
        },
        _editable: function (options) {
            var that = this;
            that.footer.off(that.ns);
            Widget.fn._editable.call(that, options);
            if (!options.disable && !options.readonly) {
                that.tagList.on('click' + that.ns + ' touchend' + that.ns, 'li.item-label .k-select', $.proxy(that._tagListClick, that));
                that.footer.on('click' + that.ns + ' touchend' + that.ns, '.k-item', $.proxy(that._setNewTag, that));
            }
        },
        _keydown: function (e) {
            var that = this;
            var $current = that.listView.focus();
            var $footer = that.footer.children('.k-item');

            // prevent closing popup on keyup
            if (that.popup.visible() && e.keyCode === keys.UP && !e.shiftKey
                && $current && !$current.prevAll(':visible').length) {
                e.preventDefault();
                return;
            }

            // prevent remove
            if (e.keyCode === keys.ENTER && !that._hasData()) {
                e.preventDefault();
                return;
            }

            // footer
            if ($footer.is(':visible')) {
                if ($footer.hasClass('k-state-focused')) {
                    // add new tag
                    if (e.keyCode === keys.ENTER) {
                        that._setNewTag();
                        e.preventDefault();
                        return;
                    }
                    else if (e.keyCode === keys.DOWN || e.keyCode === keys.HOME || e.keyCode === keys.END) {
                        e.preventDefault();
                        return;
                    }
                    else if (e.keyCode === keys.UP && !e.shiftKey) {
                        if ($current) {
                            $footer.removeClass('k-state-focused');
                            $current.addClass('k-state-focused');
                            if ($current.is(':hidden'))
                                that._triggerKeydown(keys.UP);
                        }
                        e.preventDefault();
                        return;
                    }
                }
                else if (e.keyCode === keys.DOWN && !e.shiftKey && $current && !$current.nextAll(':visible').length) {
                    // focus at footer
                    $current.removeClass('k-state-focused');
                    $footer.addClass('k-state-focused');
                    e.preventDefault();
                    return;
                }
            }

            // call default
            Widget.fn._keydown.call(that, e);

            // skip selected item
            $current = that.listView.focus();
            if (that.popup.visible() && $current && !$current.is(':visible') && !e.shiftKey) {
                if ((e.keyCode === keys.DOWN || e.keyCode === keys.ENTER) && ($current.nextAll(':visible').length || $footer.is(':visible'))) {
                    that._triggerKeydown(keys.DOWN);
                }
                else if (e.keyCode === keys.UP && $current.prevAll(':visible').length) {
                    that._triggerKeydown(keys.UP);
                }
            }
        },
        _triggerKeydown: function (keyCode) {
            var e = jQuery.Event('keydown');
            e.keyCode = keyCode;
            this._keydown(e);
        },
        _search: function () {
            var that = this;
            var value = that._inputValue();
            var regexp = new RegExp(that.options.inputRegExp, 'ig');
            if (!regexp.test(value)) {
                that.input.val(that._prev);
            }
            Widget.fn._search.call(that);
        },
        _hasChanged: function () {
            var that = this;
            var getValue = function (value) {
                return value.slice().sort().join(',');
            };
            return that.options.autoClose || getValue(that._defaultValue || []) !== getValue(that.value());
        },
        value: function (value) {
            var that = this;
            if (typeof value !== 'undefined') {
                value = that._normalizeValues(value);
                if (that._defaultValue === null)
                    that._defaultValue = value.slice();
                that._forcedTags = value.slice();
                $.each(value, function (_index, name) {
                    if (!that._getTagByName(name))
                        that.dataSource.add(that._createTag(name));
                });
                Widget.fn.value.call(that, value);
            }
            else {
                return Widget.fn.value.call(that);
            }
        },
        destroy: function () {
            var that = this;
            Widget.fn.destroy.call(that);
            that.popup.wrapper.remove();
            that.wrapper.replaceWith(that.element.clone());
        }
    });

    ui.plugin(TagTextBox);

})(jQuery);
