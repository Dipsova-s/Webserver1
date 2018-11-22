(function (win) {

    var btnGroup = function (obj) {
        jQuery(obj || '.gridColumnToolbar').each(function () {
            var element = jQuery(this);
            if (element.data('btnGroup'))
                return;

            element.data('btnGroup', true);
            var btns = element.find('.btn');
            if (btns.length > 1) {
                var cBtns = element.children('.btnGroupContainer').length ? element.find('.btnGroupInner .btn').clone(true) : btns.clone(true);
                var cBtnFirst = cBtns.filter(':not(.disabled)').length == 0 ? cBtns[0] : cBtns.filter(':not(.disabled)')[0];
                element.find('.btn, .btnGroupContainer').remove();

                var fnDocumentClick = function (e) {
                    var element = jQuery(e.target);
                    if (element.hasClass('disabled') && element.parent('.btnGroupInner').length) {
                        jQuery(document).one('click', fnDocumentClick);
                    }
                    else {
                        jQuery('.btnGroupInner:visible').trigger('close');
                    }
                };

                var fnBtnClick = function (e) {
                    var btn = jQuery(this);
                    var btnInner = btn.next('.btnGroupInner');
                    var btns = btnInner.children('.btn');

                    // unmark deletion
                    if (btn.parents('tr:first').hasClass('rowMaskAsRemove')) {
                        btnInner.find('.btnDelete').trigger('click');

                        e.preventDefault();
                        return false;
                    }

                    // close others popup
                    var isOpen = btnInner.is(':visible');
                    btnInner.trigger('close');
                    jQuery(document).trigger('click');

                    // get click x position
                    e.offsetX = e.offsetX || e.pageX - jQuery(e.target).offset().left;

                    // click the first part will execute directly
                    if (e.offsetX <= 33) {
                        jQuery(btn.data('clickTarget')).trigger('click');
                        e.preventDefault();
                        return false;
                    }

                    // click the second part will show a context menu popup
                    if (!isOpen && btns.length !== btns.filter('.disabled').length) {
                        var btnWrapper = btn.parent('.btnGroupContainer');
                        var grid = btn.parents('.k-grid-content:first');
                        if (grid.length) {
                            var btnWrapperTop = btnWrapper.offset().top;
                            var gridHeight = grid.height();
                            var btnWrapperSpace = {};
                            btnWrapperSpace.top = btnWrapperTop - grid.offset().top;
                            btnWrapperSpace.bottom = gridHeight - btnWrapperSpace.top - btnWrapper.outerHeight();

                            // the context menu popup will show at bottom by default
                            btnWrapper.addClass('open');

                            // adjust postion of the context menu popup
                            var btnInnerHeight = btnInner.outerHeight();
                            var positionInfo = MC.ui.btnGroup.getMenuPositionInfo(btnInnerHeight, btnWrapperSpace);
                            btn.parent('.btnGroupContainer').addClass(positionInfo.className);
                            btnInner.css('margin-top', positionInfo.marginTop);
                        }

                        // add hide popup on click html element
                        setTimeout(function () {
                            jQuery(document).one('click', fnDocumentClick);
                        }, 1);
                    }
                };

                var wrapper = jQuery('<a />')
                    .data('clickTarget', cBtnFirst)
                    .addClass(cBtnFirst.className)
                    .click(fnBtnClick);
                var tools = jQuery('<div class="btnGroupInner" />').on('close', function () {
                    jQuery(this).parent('.btnGroupContainer').removeClass('open left revert')
                        .find('.btnGroupInner').css('margin-top', 2);
                }).append(cBtns);
                element.append('<div class="btnGroupContainer" />')
                    .find('.btnGroupContainer').append(wrapper).append(tools);
            }
        });
    };
    btnGroup.getMenuPositionInfo = function (btnInnerHeight, btnWrapperSpace) {
        var info = {
            className: '',
            marginTop: 2
        };
        // adjust postion of the context menu popup
        if (btnInnerHeight < btnWrapperSpace.bottom) {
            // do nothing, it has already been placed on bottom
        }
        else if (btnInnerHeight < btnWrapperSpace.top) {
            // place on top
            info.className = 'revert';
        }
        else {
            // place on left
            info.className = 'left';

            // place on the most top or bottom
            if (btnWrapperSpace.top > btnWrapperSpace.bottom) {
                // place near bottom
                info.marginTop = (-1 * btnInnerHeight) + 30;
            }
            else {
                // place near top
                info.marginTop = -60;
            }
        }
        return info;
    };

    var ui = {
        init: function () {
            MC.addPageReadyFunction(this.btn);
            MC.addPageReadyFunction(this.btnGroup);
            MC.addPageReadyFunction(this.placeholder);
            MC.addPageReadyFunction(this.uploader);
            MC.addPageReadyFunction(this.datepicker);
            MC.addPageReadyFunction(this.tab);
            MC.addPageReadyFunction(this.panelbar);
            MC.addPageReadyFunction(this.gridfilter);
            MC.addPageReadyFunction(this.treelistFilter);
            MC.addPageReadyFunction(this.localize);
            MC.addPageReadyFunction(this.timezoneinfo);
            MC.addPageReadyFunction(this.multipleinput);
            MC.addPageReadyFunction(this.customcheckbox);
            MC.addPageReadyFunction(this.textarea);
            MC.addPageReadyFunction(this.percentage);
            MC.addPageReadyFunction(this.autosyncinput);
            MC.addPageReadyFunction(this.hideErrorMessageOnScroll);

            MC.addAjaxDoneFunction(this.btn);
            MC.addAjaxDoneFunction(this.btnGroup);
            MC.addAjaxDoneFunction(this.placeholder);
            MC.addAjaxDoneFunction(this.uploader);
            MC.addAjaxDoneFunction(this.datepicker);
            MC.addAjaxDoneFunction(this.tab);
            MC.addAjaxDoneFunction(this.panelbar);
            MC.addAjaxDoneFunction(this.gridfilter);
            MC.addAjaxDoneFunction(this.treelistFilter);
            MC.addAjaxDoneFunction(this.localize);
            MC.addAjaxDoneFunction(this.timezoneinfo);
            MC.addAjaxDoneFunction(this.multipleinput);
            MC.addAjaxDoneFunction(this.customcheckbox);
            MC.addAjaxDoneFunction(this.textarea);
            MC.addAjaxDoneFunction(this.percentage);
            MC.addAjaxDoneFunction(this.autosyncinput);
        },
        btn: function () {
            if (jQuery(document).data('btn'))
                return;

            jQuery(document).data('btn', true).click(function (e) {
                if (jQuery(e.target).hasClass('disabled'))
                    return false;
            });
        },
        btnGroup: btnGroup,
        placeholder: function (obj) {
            if (!Modernizr.input.placeholder) {
                jQuery(obj || '[placeholder]').filter(':not(.bind-placeholder)').addClass('bind-placeholder').placeholder();
            }
        },
        uploader: function (obj) {
            jQuery(obj || '[data-role="uploader"]').each(function () {
                var element = jQuery(this);
                if (element.data('uploader'))
                    return;

                var settings = jQuery.extend({
                    textBrowse: 'Browse..',
                    onSelect: null
                }, element.data());

                element
                    .attr('autocomplete', 'off')
                    .data('uploader', true)
                    .wrap('<div class="k-widget k-upload" />')
                    .wrap('<div class="k-button k-upload-button btn ' + (element.prop('disabled') ? ' disabled' : '') +'" />')
                    .after('<span>' + settings.textBrowse + '</span>')
                    .change(function (e) {
                        if (typeof e.target.files == 'undefined') {
                            var mime = {
                                '.txt': 'text/plain',
                                '.html': 'text/html',
                                '.csv': 'text/csv',
                                '.pdf': 'application/pdf',
                                '.doc': 'application/msword',
                                '.docx': 'application/msword',
                                '.jpeg': 'image/jpeg',
                                '.jpg': 'image/jpeg',
                                '.png': 'image/png',
                                '.gif': 'image/gif',
                                '.mp4': 'video/mp4'
                            };
                            var value = e.target.value;
                            var file = {};
                            file.lastModifiedDate = null;
                            file.name = value.substr(value.lastIndexOf('/') == -1 ? value.lastIndexOf('\\') + 1 : value.lastIndexOf('/'));
                            file.size = -1;
                            file.type = mime[file.name.substr(file.name.lastIndexOf('.'))] || 'unknown';
                            e.target.files = []
                            e.target.files.push(file);
                        }
                        if (!e.data)
                            e.data = {};
                        e.data.file = e.target.files[0];

                        jQuery(this).parent('.k-upload-button').next('.k-upload-status').text(e.data.file ? e.data.file.name : '');
                        if (settings.onSelect != null) window[settings.onSelect](e);
                    })
                    .parent('.k-upload-button').after('<span class="k-upload-status" />');
            });
        },
        datepicker: function (obj) {
            jQuery(obj || '[data-role="datepicker"]').each(function () {
                var element = jQuery(this);
                if (element.data('datepicker'))
                    return;

                element.data('datepicker', true);

                var value = isNaN(element.val()) ? element.val() : element.val() * 1000;
                var settings = jQuery.extend({
                    format: kendo.culture().calendar.patterns.d,
                    value: new Date(value)
                }, element.data());
                if (typeof settings.min != 'undefined')
                    settings.min = window[settings.min]();
                if (typeof settings.max != 'undefined')
                    settings.max = window[settings.max]();
                element.data('kendoDatePicker').setOptions(settings);
            });
        },
        tab: function (obj) {
            jQuery(obj || '[data-role="tab"]').each(function () {
                var element = jQuery(this);
                if (element.data('tab'))
                    return;

                element.addClass('tab').data('tab', true);
                element.find('.tabNav a').click(function (e) {
                    var parent = jQuery(this).parents('.tab:eq(0)');

                    jQuery('.tabNav a', parent).removeClass('active');
                    jQuery(this).addClass('active');
                    MC.form.validator.hideErrorMessage();
                    var idx = jQuery(this).prevUntil().length;
                    jQuery('.tabPanel', parent)
                        .removeClass('active')
                        .eq(idx)
                            .addClass('active');

                    var callback = element.data('callback');
                    MC.util.getController(callback)(jQuery('.tabPanel', parent).eq(idx));

                    e.preventDefault();
                });

                setTimeout(function () {
                    element.find('.tabNav a.active').trigger('click');
                }, 100);
            });
        },
        panelbar: function (obj) {
            jQuery(obj || '[data-role="panelbar"]').each(function () {
                var element = jQuery(this);
                if (element.data('panelbar'))
                    return;

                var settings = jQuery.extend({
                    expandMode: 'single',
                    select: function (e) {
                        if (jQuery(e.item).data('active')) {
                            this.collapse(e.item);
                        }
                    },
                    activate: function (e) {
                        jQuery(e.item).data('active', true);
                    },
                    collapse: function (e) {
                        jQuery(e.item).data('active', false);
                    }
                }, element.data());
                element.addClass('panelBar').data('panelbar', true).kendoPanelBar(settings);
            });
        },
        treelistFilter: function (obj) {
            jQuery(obj || '[data-role="treelistfilter"]').each(function () {
                var element = jQuery(this);
                if (element.data('treelistfilter'))
                    return;

                element.data({ 'treelistfilter': true, defaultValue: '' }).keyup(function (e) {
                    var self = jQuery(this);
                    var q = jQuery.trim(self.val());
                    var qLength = q.length;
                    var settings = jQuery.extend({

                        // local | remote
                        method: 'local',

                        // display | highlight
                        type: 'display',

                        // delay time for request
                        delay: 500,

                        filter: '',
						min: 1,
                        fnChecker: null,
                        fnCheckRequest: null
                    }, self.data());

                    if ((q == self.data('defaultValue') && e.keyCode != 13) || (qLength > 0 && qLength <= settings.min))
                        return false;

                    self.data('defaultValue', q);
                    var treeList;
                    var target = jQuery(settings.target);
                    if (target.hasClass('k-treelist')) {
                        treeList = target.data('kendoTreeList');
                    }
                    else {
                        treeList = target.find('.k-treelist').data('kendoTreeList');
                    }

                    if (treeList) {
                        MC.util.getController(settings.start)();

                        self.next('.icon').addClass('iconLoading');
                        clearTimeout(settings.fnChecker);
                        settings.fnChecker = setTimeout(function () {
                            treeList.content.removeHighlight();
                            if (settings.filter) {
                                treeList.content.find('tr').find(settings.filter).highlight(q);
                            }
                            else {
                                treeList.content.highlight(q);
                            }

                            var highlighting = treeList.content.find('.highlight');
                            var highlightingCount = highlighting.length;
                            var i, row, dataItem, expandedRowCache = {};
                            var fnExpandParents = function (row, data) {
                                var dataItem = data || treeList.dataSource.getByUid(row.data('uid'));
                                if (dataItem) {
                                    expandedRowCache[dataItem.uid] = true;
                                    if (dataItem.parentId !== null) {
                                        var dataItemParent = treeList.dataSource.get(dataItem.parentId);
                                        if (dataItemParent) {
                                            var rowParent = treeList.content.find('[data-uid="' + dataItemParent.uid + '"]');
                                            if (rowParent.has('.k-i-expand')) {
                                                treeList.expand(rowParent);
                                            }
                                            fnExpandParents(rowParent, dataItemParent);
                                        }
                                    }
                                }
                            };
                            for (i = highlightingCount - 1; i >= 0; i--) {
                                row = jQuery(highlighting[i]).parents('tr:first');
                                if (!expandedRowCache[row.data('uid')]) {
                                    fnExpandParents(row, null);
                                }
                            }

                            self.next('.icon').removeClass('iconLoading');

                            MC.util.getController(settings.callback)();
                        }, e.keyCode == 13 ? 1 : settings.delay);
                        self.data('fnChecker', settings.fnChecker);
                    }
                });
            });
        },
        gridfilter: function (obj) {
            if (typeof (obj) == 'undefined') obj = '[data-role="gridfilter"]';
            jQuery(obj).each(function (k, v) {
                if (jQuery(v).data('gridfilter')) return;

                jQuery(v).data({ 'gridfilter': true, defaultValue: '' }).keyup(function (e) {
                    var self = this,
                        q = jQuery.trim(jQuery(self).val()),
                        settings = jQuery.extend({

                            // local | remote
                            method: 'local',

                            // display | highlight
                            type: 'display',

                            // delay time for request
                            delay: 500,
                            filter: '',
                            fnChecker: null,
                            fnCheckRequest: null
                        }, jQuery(self).data());

                    if (q == jQuery(self).data('defaultValue') && e.keyCode != 13)
                        return false;

                    jQuery(self).data('defaultValue', q);
                    if (settings.method == 'remote') {
                        var grid;
                        var target = jQuery(settings.target);
                        if (target.hasClass('k-grid')) {
                            grid = target.data('kendoGrid');
                        }
                        else {
                            grid = target.find('.k-grid').data('kendoGrid');
                        }
                        if (!grid) {
                            jQuery(settings.target).busyIndicator(true);
                        }
                        jQuery(self).next('.icon').addClass('iconLoading');
                        clearTimeout(settings.fnChecker);
                        clearInterval(settings.fnCheckRequest);
                        settings.fnChecker = setTimeout(function () {
                            if (grid && (
                                (grid.dataSource.options.transport && typeof grid.dataSource.options.transport.read == 'function')
                                || (grid.dataSource.transport.options && grid.dataSource.transport.options.read.url))) {
                                if (!(grid.dataSource.options.transport && typeof grid.dataSource.options.transport.read == 'function')) {
                                    grid.dataSource.transport.options.read.data = function () {
                                        return {
                                            q: encodeURIComponent(q)
                                        };
                                    }
                                }

                                MC.util.getController(settings.start)(grid);

                                grid.dataSource.page(1);
                                if (!grid.dataSource.options.serverPaging) {
                                    grid.dataSource.read();
                                }
                                clearInterval(settings.fnCheckRequest);
                                settings.fnCheckRequest = setInterval(function () {
                                    if (!grid.dataSource._requestInProgress && !jQuery.active) {
                                        clearInterval(settings.fnCheckRequest);
                                        jQuery(self).next('.icon').removeClass('iconLoading');
                                        MC.util.getController(settings.callback)(grid);
                                    }
                                }, 200);
                            }
                            else {
                                MC.ajax.request({
                                    element: self,
                                    ajaxStart: function (metadata) {
                                        metadata.type = 'get';
                                        if (q != '') {
                                            if (typeof metadata.parameters == 'undefined') metadata.parameters = { q: encodeURIComponent(q) };
                                            else metadata.parameters.q = encodeURIComponent(q);
                                        }

                                        MC.util.getController(settings.start)(metadata);

                                        MC.ui.loading.setLoader('loadingHide');
                                    },
                                    ajaxSuccess: function (metadata, data, status, xhr) {
                                        jQuery(metadata.target).busyIndicator(false);
                                        jQuery(self).next('.icon').removeClass('iconLoading');

                                        MC.util.getController(settings.callback)(metadata, data, status, xhr);
                                    }
                                });
                            }
                        }, e.keyCode == 13 ? 1 : settings.delay);
                        jQuery(self).data('fnChecker', settings.fnChecker);
                    }
                    else {
                        clearTimeout(settings.fnChecker);
                        settings.fnChecker = setTimeout(function () {
                            var result = [];
                            var grid;
                            var target = jQuery(settings.target);
                            if (target.hasClass('k-grid')) {
                                grid = target.data('kendoGrid');
                            }
                            else {
                                grid = target.find('.k-grid').data('kendoGrid');
                            }

                            if (typeof settings.start != 'undefined') {
                                window[settings.start](metadata);
                            }

                            if (settings.type) {
                                var filters = [];
                                var filterContainText = function (value, filter) {
                                    value = '' + value;
                                    return value.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                                };
                                if (q) {
                                    if (settings.filter) {
                                        var columns = settings.filter.split(',');
                                        $.each(columns, function (index, filterIndex) {
                                            if (grid.columns[filterIndex] && grid.columns[filterIndex].title != Localization.MC_Action) {
                                                filters.push({ field: grid.columns[filterIndex].field, operator: filterContainText, value: q });
                                            }
                                        });
                                    }
                                    else {
                                        $.each(grid.columns, function (index, column) {
                                            if (column.title != Localization.MC_Action) {
                                                filters.push({
                                                    field: column.field, operator: filterContainText, value: q
                                                });
                                            }
                                        });
                                    }
                                }
                                grid.dataSource.filter({
                                    logic: 'or',
                                    filters: filters
                                });
                            }
                            else {
                                var gridRows = target.find('.k-grid-content tr');

                                gridRows.show();
                                gridRows.removeHighlight();

                                if (q) {
                                    if (settings.filter) {
                                        gridRows.find(settings.filter).highlight(q);
                                    }
                                    else {
                                        gridRows.highlight(q);
                                    }

                                    var highlightingRow;
                                    result.push({ grid: grid.wrapper, rows: [] });
                                    grid.wrapper.find('.k-grid-content tr').each(function (index, row) {
                                        row = jQuery(row);
                                        highlightingRow = row.find('.highlight');
                                        if (highlightingRow.length != 0) {
                                            result[0].rows.push(this);
                                        }
                                    });
                                }
                            }

                            MC.util.getController(settings.callback)(result);
                        }, e.keyCode == 13 ? 1 : settings.delay);
                        jQuery(self).data('fnChecker', settings.fnChecker);
                    }
                });
            });
        },
        localize: function (obj) {
            if (typeof (obj) == 'undefined') obj = '[data-role="localize"]';

            var localizeType, localizeValue, isInput;
            jQuery(obj).each(function (k, v) {
				if (jQuery(v).data('localized'))
					return;

                jQuery(v).data('localized', true);
                isInput = jQuery(v).is('input');
                localizeType = jQuery(v).data('type') || 'datetime';
                localizeValue = jQuery.trim(isInput ? jQuery(v).val() : jQuery(v).text());
                if (/\d/g.test(localizeValue)) {
                    localizeValue = new Date(localizeValue * 1000);
                    switch (localizeType) {
                        case 'date':
                            localizeValue = localizeValue.toLocaleDateString();
                            break;

                        case 'datetime':
                            localizeValue = localizeValue.toLocaleString();
                            break;

                        case 'time':
                            localizeValue = localizeValue.toLocaleTimeString();
                            break;

                        case 'servertime':
                            var localDateOffset = localizeValue.getTimezoneOffset();
                            var serverValue = kendo.timezone.convert(localizeValue, localDateOffset, window.timezoneOffsetWithDst);
                            localizeValue = kendo.format('{0} {1:HH:mm:ss}', serverValue.toLocaleDateString(), serverValue);
                            break;
                    }
                }
                if (isInput) jQuery(v).val(localizeValue);
                else jQuery(v).html(localizeValue);
            });
        },
        timezoneinfo: function (obj) {
            if (typeof (obj) == 'undefined')
                obj = '[data-role="timezoneinfo"]';

            jQuery(obj).each(function (k, v) {
                var element = jQuery(v);
                if (element.data('timezoned'))
                    return;

                element.data('timezoned', true);

                var timezoneInfo = MC.util.getTimezoneInfo(false);
                element.text(timezoneInfo.id);
            });
        },
        multipleinput: function (obj) {
            obj = jQuery(obj || '[data-role="multipleinput"]');
            obj.each(function (k, v) {
                v = jQuery(v);
                if (v.data('multipleinput'))
                    return;

                var settings = jQuery.extend({
                    sensitive: false,
                    defaultText: 'add text',
                    placeholderColor: '#999'
                }, v.data());

                v.data('multipleinput', true).tagsInput(settings);

                var uiOptions = v.data('options');
                if (uiOptions) {
                    jQuery(uiOptions.fake_input).on('paste', function () {
                        var element = $(this);
                        setTimeout(function () {
                            element.trigger('keypress');
                        }, 1);
                    });
                }
            });
        },
        customcheckbox: function (obj) {
            if (typeof (obj) == 'undefined') obj = '[data-role="customcheckbox"]';
            jQuery(obj).each(function (k, v) {
                v = jQuery(v);
                if (v.data('customcheckbox') || !v.children(':checkbox').length) return;

                var settings = jQuery.extend({}, v.data());

                v.children(':checkbox').each(function (index, chk) {
                    jQuery('<span class="input" />')
                        .text(jQuery(chk).data('label') || chk.value)
                        .addClass((chk.checked ? 'checked' : '') + ' ' + (chk.disabled ? 'disabled' : ''))
                        .insertAfter(jQuery(chk));
                });

                v.data('customcheckbox', true)
                .addClass('checkbox')
                .on('click', '.input', function (e) {
                    var ui = jQuery(e.currentTarget),
                        checkbox = ui.prev(':checkbox');
                    if (!checkbox.is(':disabled')) {
                        if (!checkbox.is(':checked')) {
                            ui.addClass('checked');
                            checkbox.prop('checked', true);
                        }
                        else {
                            ui.removeClass('checked');
                            checkbox.prop('checked', false);
                        }
                    }

                    MC.util.getController(settings.callback)(checkbox, ui);
                });
            });
        },
        textarea: function (obj) {
            if (!Modernizr.textareamaxlength) {
                if (typeof (obj) == 'undefined') obj = '[maxlength]';
                jQuery(obj).each(function (k, v) {
                    v = jQuery(v);
                    if (v.data('maxlength'))
                        return;

                    v.data('maxlength', true).limitMaxlength();
                });
            }
        },
        commentbox: function (action, option) {

            var setScrollablePopup = function (win) {
                MC.ui.popup('setScrollable', {
                    element: '#popupCommentForm',
                    onResize: function (win) {
                        win.element.find('textarea').height(win.element.height() - win.element.find('.popupToolbar').height() - 56);
                    }
                });
            };

            switch (action) {
                case 'edit':
                case 'add':
                    if (!jQuery('#CommentForm').valid()) {
                        $('#CommentForm .error:first').focus();
                        return false;
                    }

                    var commentText = $('#CommentText').val();
                    $('#CommentText').val(MC.util.encodeHtml(commentText));

                    jQuery('#CloseCommentForm').trigger('click');

                    disableLoading();
                    jQuery('#contentSectionComment').busyIndicator(true);
                    MC.util.ajaxUpload('#CommentForm', {
                        loader: false,
                        successCallback: function (data) {
                            jQuery('#CommentText').val('');
                            jQuery('#CommentForm .k-upload-status').text('');
                            jQuery('#fileAttached').replaceWith(jQuery('#fileAttached').clone(true));
                            if (jQuery('#GridComment').length) {
                                jQuery('#CloseCommentForm').trigger('click');
                                jQuery('#GridComment').data('kendoGrid').dataSource.read();
                            }
                        },
                        errorCallback: function () {
                            jQuery('#CommentText').val(commentText);
                        },
                        completeCallback: function () {
                            jQuery('#contentSectionComment').busyIndicator(false);
                        }
                    });
                    break;
                case 'editPopup':
                    setScrollablePopup();
                    var grid = jQuery('#GridComment').data('kendoGrid');
                    if (grid) {
                        var dataItem = grid.dataSource.getByUid(option);
                        if (dataItem) {
                            jQuery('#CommentText').val(MC.util.decodeHtml(dataItem.comment));
                            $('.fieldFile').hide();
                            $('#commentUri').val(dataItem.Uri);
                            $('#SaveCommentBtn').attr("onclick", "MC.ui.commentbox('edit')")
                        }
                    }
                    break;
                case 'popup':
                    setScrollablePopup();
                    $('#commentUri').val('');
                    $('.fieldFile').show();
                    $('#SaveCommentBtn').attr("onclick", "MC.ui.commentbox('add')")
                    break;
                case 'delete':
                    var confirmMessage = MC.form.template.getRemoveMessage(option.obj);
                    MC.util.showPopupConfirmation(confirmMessage, function () {
                        disableLoading();
                        jQuery('#contentSectionComment').busyIndicator(true);
                        MC.ajax.request({
                            element: option.obj,
                            type: 'DELETE'
                        })
                        .done(function () {
                            jQuery('#GridComment').data('kendoGrid').dataSource.read();
                        })
                        .always(function () {
                            jQuery('#contentSectionComment').busyIndicator(false);
                        });
                    });
                    MC.util.preventDefault(option.event);
                    break;
                case 'initial':
                    setTimeout(function () {
                        var grid = jQuery('#GridComment').data('kendoGrid');
                        if (grid) {
                            MC.util.gridScrollFixed(grid);
                            grid.bind('dataBound', function (e) {
                                if (e.sender.dataSource.data().length) {
                                    jQuery('#GridCommentContainer').removeClass('hidden');
                                    jQuery('#NoComment').addClass('hidden');
                                }
                                else {
                                    jQuery('#GridCommentContainer').addClass('hidden');
                                    jQuery('#NoComment').removeClass('hidden');
                                }
                                MC.ui.localize();
                                MC.util.triggerResizeKendoGrid();
                            });
                            if (!MC.ajax.isReloadMainContent) {
                                grid.dataSource.read();
                            }
                        }
                    }, 1);
                    break;
            }
        },
        percentage: function (obj) {
            if (typeof (obj) == 'undefined') obj = '[data-role="percentagetextbox"]';

            jQuery(obj).each(function (k, v) {
                if (jQuery(v).data('kendoPercentageTextBox')) return;

                var settings = jQuery.extend({ format: ',0.00 \\%' }, jQuery(v).data());
                if (settings.min === '') delete settings.min;
                if (settings.max === '') delete settings.max;
                jQuery(v).kendoPercentageTextBox(settings);
            });
        },
        autosyncinput: function (obj) {
            // sync input if it's a same id

            if (typeof (obj) == 'undefined')
                obj = '.autosyncinput';

            jQuery(obj).each(function (k, v) {
                v = jQuery(v);
                if (v.data('autosyncinput')) return;

                var settings = jQuery.extend({
                    type: 'textbox'
                }, v.data());

                v.data('autosyncinput', true);

                if (settings.type.indexOf('kendo') != -1) {
                    var kendoUI = v.data(settings.type);
                    if (!kendoUI) {
                        // find the same ui
                        var firstKendoUI = jQuery('[id="' + v.attr('id') + '"]').data(settings.type);
                        if (firstKendoUI) {
                            kendoUI = v[settings.type](firstKendoUI.options).data(settings.type);
                        }
                    }

                    if (kendoUI) {
                        kendoUI.bind('change', function (e) {
                            var uiName = e.sender.element.data('type');
                            var uiValue = e.sender.value();
                            jQuery('[id="' + e.sender.element.attr('id') + '"]').not(e.sender.element).each(function () {
                                var uiOther = jQuery(this).data(uiName);
                                if (uiOther) uiOther.value(uiValue);
                            });
                        });
                    }
                }
                else if (settings.type == 'checkbox') {
                    v.on('change.autosyncinput', function (e) {
                        jQuery('[id="' + v.attr('id') + '"]').not(this).prop('checked', this.checked);
                    });
                }
                else if (settings.type == 'textbox') {
                    v.on('change.autosyncinput', function (e) {
                        jQuery('[id="' + v.attr('id') + '"]').not(this).val(jQuery(this).val());
                    });
                }
            });
        },
        hideErrorMessageOnScroll: function () {
            $('#mainContent').on('scroll.validation touchstart.validation', function () {
                win.MC.form.validator.hideErrorMessage()
            });
        }
    };

    win.MC.ui = ui;
    win.MC.ui.init();

})(window);
