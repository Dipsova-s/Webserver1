(function (window) {
    "use strict";

    window.WC.HtmlHelper = {
        // common helper
        SetCheckBoxStatus: function (element, value) {
            jQuery(element).prop('checked', !!value);
        },
        GetCheckBoxStatus: function (element) {
            return jQuery(element).is(':checked');
        },
        GetInternalUri: function (action, controller, params) {
            return rootWebsitePath + userSettingModel.GetByName(enumHandlers.USERSETTINGS.DEFAULT_LANGUAGES)
                + '/' + controller.toLowerCase() + '/' + action.toLowerCase()
                + (typeof params === 'object' ? '?' + jQuery.param(params) : '');
        },
        GetInternalApiUri: function (action, controller, params) {
            return rootWebsitePath + controller.toLowerCase() + '/' + action.toLowerCase()
                + (typeof params === 'object' ? '?' + jQuery.param(params) : '');
        },
        GetModelUriFromMetadataUri: function (uri) {
            if (uri.charAt(0) !== '/')
                uri = '/' + uri;
            return uri.split('/').slice(0, 3).join('/');
        },
        StripHTML: function (str, removeHeadingTag) {
            var rawText = '';

            if (typeof removeHeadingTag === 'undefined')
                removeHeadingTag = false;

            if (!IsNullOrEmpty(str)) {
                if (removeHeadingTag) {
                    // add [space] after hx tag
                    str = str.replace(/(<\/(h\d)>)/ig, '$1 ');

                    // remove hx tag
                    str = str.replace(/<h\d\b[^>]*>(.*?)<\/h\d>/ig, '');
                }

                // add \n for block tag
                str = str.replace(/(<\/(blockquote|tr|ol|ul|li|div|p|h\d)>)/ig, '$1\n');

                // add * for each <li>
                str = str.replace(/(<li>)/ig, '<li>* ');

                // add space for each close html tag </...>
                str = str.replace(/(<\/[a-z]+>)/ig, '$1 ');

                // replace <br /> with \n
                str = str.replace(/<br ?\/?>/ig, ' \n');

                // replace <hr /> with --------------------------------
                str = str.replace(/<hr ?\/?>/ig, '------------------------------\n');
                str = str.replace(/<img[^>]*>/ig, '');
                str = str.replace(/<%/ig, '');
                str = str.replace(/%>/ig, '');

                // remove multiple spaces to 1
                str = str.replace(/\s{2,}/g, ' ');

                // convert html to text
                var inceptedText = $('<div></div>').html(str).text();
                rawText = $('<div></div>').html(inceptedText).text();
            }

            return jQuery.trim(rawText);
        },
        SetPageTitle: function (titleText) {
            document.title = titleText;
        },
        GetFontCss: function (element) {
            return element.css('font-style') + ' ' + element.css('font-variant') + ' ' + element.css('font-weight') + ' ' + Math.ceil(parseFloat(element.css('font-size'))) + 'px ' + element.css('font-family');
        },
        ApplyKnockout: function (handler, element, clean) {
            element = jQuery(element).get(0);
            if (clean)
                ko.cleanNode(element);
            if (typeof ko.dataFor(element) === 'undefined')
                ko.applyBindings(handler, element);
        },

        AdjustNameContainer: function (container, reserveSize, getSize) {
            getSize = getSize || function (size) { return size; };
            jQuery(container).find('.displayNameContainer').each(function () {
                var element = jQuery(this);
                var elementName = element.children('.name').css('max-width', 100);
                var elementSize = WC.Utility.ToNumber(element.width(), reserveSize);
                if (elementSize) {
                    var frontElementSize = WC.Utility.ToNumber(element.children('.front').width());
                    var rearElementSize = WC.Utility.ToNumber(element.children('.rear').width());
                    elementName.css('max-width', getSize(elementSize - frontElementSize - rearElementSize));
                }
            });
        },

        AdjustToolbar: function () {
            var space = 20;
            var toolbar = jQuery('.toolbar');
            var breaker = toolbar.children('.col-break');
            var itemsSize = toolbar.children('.form-col').map(function () { return jQuery(this).outerWidth(); }).get().sum();
            if (toolbar.width() < itemsSize + space)
                breaker.removeClass('hidden');
            else
                breaker.addClass('hidden');
        },

        // kendo ui helper
        Editor: function (element, options) {
            element = jQuery(element);
            var ui = element.data(enumHandlers.KENDOUITYPE.EDITOR);

            if (!element.length) {
                ui = null;
            }
            else if (!ui) {
                var settings = jQuery.extend({
                    execute: function (e) {
                        if (e.name === 'createlink') {
                            setTimeout(function () {
                                var label = jQuery('#k-editor-link-target').next('label'),
                                    labelText = label.text();
                                label.empty();
                                label.append(jQuery('#k-editor-link-target').attr('checked', 'checked'));
                                label.append(' <span class="label">' + labelText + '</span>');
                            }, 1);
                        }
                    },
                    paste: function (e) {
                        // remove all existing target attributes
                        e.html = e.html.replace(/<a[^>]*/ig, function (a) {
                            // first remove existing target attribute
                            a = a.replace(/target\s*=\s*['"][^"']*['"]/, '');

                            // then add a target attribute
                            a += ' target="_blank"';

                            return a;
                        });
                    },
                    tools: [
                        {
                            name: "formatting",
                            items: jQuery.grep(kendo.ui.editor.FormattingTool.prototype.options.items, function (tool) { return !/(h4|h5|h6)/i.test(tool.value); })
                        },
                        "foreColor", "backColor", "bold", "italic", "underline", "strikethrough",
                        "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
                        "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                        "createTable", "addRowAbove", "addRowBelow", "addColumnLeft", "addColumnRight", "deleteRow", "deleteColumn",
                        "createLink", "unlink", "insertImage",
                        "cleanFormatting"
                    ],
                    stylesheets: [window.editorStyleSheet]
                }, options || {});

                ui = element.kendoEditor(settings).data(enumHandlers.KENDOUITYPE.EDITOR);
            }
            return ui;
        },
        DropdownList: function (element, data, options) {
            element = jQuery(element);
            var ui = element.data(enumHandlers.KENDOUITYPE.DROPDOWNLIST);

            if (!element.length) {
                ui = null;
            }
            else if (ui) {
                if (data) {
                    ui.setDataSource(ko.toJS(data));
                }
            }
            else {
                // return null if getting
                if (arguments.length === 1)
                    return null;

                var isLargeDropdown = element.hasClass('k-dropdown-large'),
                    settings = jQuery.extend({
                        dataTextField: 'name',
                        dataValueField: 'id',
                        index: 0,
                        height: isLargeDropdown ? 40 * 8 : 28 * 8
                    }, options || {});
                if (!settings.template && settings.dataValueField) {
                    settings.template = '<span data-text="#: ' + settings.dataTextField + ' #">#: ' + settings.dataTextField + ' #</span>';
                }

                if (data) {
                    if (data instanceof kendo.data.DataSource) {
                        settings.dataSource = data;
                    }
                    else {
                        settings.dataSource = ko.toJS(data);
                    }
                }

                ui = element.kendoDropDownList(settings).data(enumHandlers.KENDOUITYPE.DROPDOWNLIST);

                var elementId = element.attr('id');
                if (elementId)
                    ui.wrapper.attr('id', elementId + '_ddlWrapper');

                if (isLargeDropdown)
                    ui.list.addClass('k-list-container-large');

                var fontSize = ui.wrapper.css('font-size');
                if (fontSize) {
                    ui.list.css('font-size', fontSize);
                }
            }

            return ui;
        },
        DestroyDropdownList: function (element) {
            var ui = WC.HtmlHelper.DropdownList(element);
            if (ui) {
                ui.destroy();
                ui.popup.element.remove();
            }
        },
        DestroyDropdownPopup: function () {
            jQuery('[data-role="popup"]').each(function () {
                var handler = jQuery(this).data('handler');
                if (!handler)
                    return;

                if (typeof handler.options.anchor === 'object') {
                    var dropdown = handler.options.anchor.find('[data-role="dropdownlist"]');
                    if (!dropdown.length)
                        jQuery(this).parent('.k-animation-container').remove();

                }
            });
        },
        GridPrefetch: function (grid, i, callback) {

            grid.content.busyIndicator(true);
            grid.dataSource.prefetch(i * grid.dataSource.take(), grid.dataSource.take(), function () {
                i++;
                if (i < grid.dataSource.totalPages()) {
                    window.WC.HtmlHelper.GridPrefetch(grid, i, callback);
                }
                else {
                    callback();
                }
            });
        },
        SetTouchScrollEvent: function (element) {
            // scroll area can use on touch device only (because laptop and pc can scroll by wheel mouse)
            if (Modernizr.touch) {
                new kendo.UserEvents(element, { //NOSONAR
                    global: true,
                    move: function (e) {
                        var target = jQuery(e.sender.currentTarget);
                        target.scrollTop(target.scrollTop() - e.y.delta);
                        e.preventDefault();
                    }
                });
            }
        },
        SetFocusInput: function (input) {
            if (!jQuery.browser.mozilla) {
                try {
                    // prevent error in IE
                    input.selectionStart = 0;
                    input.selectionEnd = 0;
                }
                catch (ex) {
                    // do nothing
                }
            }
            input.focus();
        },
        GetPastedText: function (e) {
            var element = jQuery(e.currentTarget);
            var dfd = jQuery.Deferred();
            var clipboardData = e.clipboardData || e.originalEvent.clipboardData || window.clipboardData;
            var text = '';
            if (clipboardData && clipboardData.getData) {
                try {
                    text = jQuery.trim(clipboardData.getData('text') || '');
                }
                catch (ex) {
                    // do nothing
                }
            }

            if (text) {
                dfd.resolve(text);
            }
            else {
                setTimeout(function () {
                    text = jQuery.trim(element.val()).replace(/\s/g, '\n');
                    dfd.resolve(text);
                }, 1);
            }

            return dfd.promise();
        },
        EnableMouseScrolling: function (grid) {
            // fixed IE issue
            if (!jQuery.browser.msie)
                return;

            var virtualScroll = grid.content.data('kendoVirtualScrollable');
            grid.content
                .off('mousewheel.iefix')
                .on('mousewheel.iefix', function (e) {
                    if (!grid.content.find('.k-loading-mask').length) {
                        virtualScroll.verticalScrollbar.scrollTop(virtualScroll.verticalScrollbar.scrollTop() - e.deltaFactor * e.deltaY);
                    }
                });
        }
    };

})(window);
