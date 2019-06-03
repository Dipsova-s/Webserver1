(function (win, globalSettings) {

    function LabelCategories() {
        var self = this;
        self.DeleteList = [];
        self.SaveUri = '';
        self.DeleteUri = '';
        self.EditPageUri = '';
        self.CategoryUri = '';
        self.CategoryEnName = '';

        self.LanguageInfo = {};
        self.LanguageInfo.EnableVirtual = false;
        self.LanguageInfo.Languages = [];
        self.LanguageInfo.VirtualCount = 6;
        self.LanguageInfo.IndexEN = 1;
        self.LanguageInfo.IndexVirtualStart = self.LanguageInfo.IndexEN + 1;
        self.LanguageInfo.IndexVirtualEnd = self.LanguageInfo.IndexVirtualStart + self.LanguageInfo.VirtualCount - 1;
        self.LanguageInfo.IndexStart = self.LanguageInfo.IndexVirtualEnd + 1;
        self.LanguageInfo.IndexEnd = 0;
        self.AllModelsLabelCategoriesPageUri = '';
        self.GetLabelsUri = '';
        self.SaveLabelCategoryUri = '';
        self.LabelsData = {};
        self.InitialCategoryPage = function (data) {
            self.AllModelsLabelCategoriesPageUri = '';
            self.GetLabelsUri = '';
            self.SaveLabelCategoryUri = '';
            self.LabelsData = {};

            jQuery.extend(self, data || {});

            setTimeout(function () {

                var grid = jQuery('#Grid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.AllLabelCategoryGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }

                    MC.util.sortableGrid('#Grid', self.LabelcategoryDragend);
                }

            }, 1);
        };
        self.AllLabelCategoryGridDataBound = function (e) {
            MC.ui.btnGroup();

            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });

            function setLabelsText(labelUrl) {
                var labelText = jQuery.map(self.LabelsData[labelUrl] || [], function (label) { return label.abbreviation || label.id; }).join(', ');
                jQuery('#Grid').find('[data-uri="' + labelUrl + '"]').text(labelText || Localization.MC_NoData);
            }

            var labelsUrl = [];
            jQuery.each(e.sender.dataItems() || [], function (index, category) {
                if (typeof self.LabelsData[category.labels] === 'undefined') {
                    self.LabelsData[category.labels] = null;

                    labelsUrl.push(category.labels);
                }
                else if (self.LabelsData[category.labels] instanceof Array) {
                    setLabelsText(category.labels);
                }
            });

            if (labelsUrl.length) {
                disableLoading();
                MC.ajax
                    .request({
                        url: self.GetLabelsUri,
                        parameters: { labelsUrl: labelsUrl.join(',') },
                        type: 'POST'
                    })
                    .done(function (data) {
                        jQuery.each(data, function (index, category) {
                            self.LabelsData[category.uri] = category.labels || [];

                            setLabelsText(category.uri);
                        });
                    });
            }
        };
        self.LabelcategoryDragend = function (row, oldIndex, newIndex) {
            var grid = $('#Grid').data('kendoGrid');
            if (grid) {
                row = $(row);
                var uid = row.data('uid');
                var dataItem = grid.dataSource.getByUid(uid);
                var sortData = {};
                var targetUid, targetDataItem;
                if (oldIndex < newIndex) {
                    targetUid = row.prev().data('uid');
                }
                else {
                    targetUid = row.next().data('uid');
                }
                targetDataItem = grid.dataSource.getByUid(targetUid);
                sortData.order = targetDataItem.order;

                disableLoading();
                grid.element.busyIndicator(true);
                MC.ajax
                    .request({
                        url: self.SaveLabelCategoryUri,
                        parameters: { labelCategoryUri: dataItem.uri, labelCategoryOrderData: JSON.stringify(sortData) },
                        type: 'PUT'
                    })
                    .always(function () {
                        grid.element.busyIndicator(false);
                        grid.dataSource.read();
                    });
            }
        };
        self.SaveLabelCategoryOrder = function () {
            var grid = $('#Grid').data('kendoGrid');
            if (grid) {
                var saveLabelCategoryOrder = function (name, uri, data, reportIndex) {
                    var deferred = jQuery.Deferred();
                    MC.ajax
                        .request({
                            url: self.SaveLabelCategoryUri,
                            parameters: { labelCategoryUri: uri, labelCategoryOrderData: JSON.stringify(data) },
                            type: 'PUT'
                        })
                        .done(function (data, status, xhr) {
                            MC.util.massReport.onDone(arguments, deferred, Localization.Username, name, reportIndex);
                        })
                        .fail(function (xhr, status, error) {
                            MC.util.massReport.onFail(arguments, deferred, Localization.Username, name, reportIndex);
                        });

                    return deferred.promise();
                };

                var requests = [];
                $('#Grid .k-grid-content tr').each(function (index, row) {
                    var uid = $(row).data('uid');
                    var dataItem = grid.dataSource.getByUid(uid);

                    if (dataItem.order !== index + 2) {
                        requests.pushDeferred(saveLabelCategoryOrder, [dataItem.name, dataItem.uri, { order: index + 2 }, index]);
                    }
                });

                if (requests.length) {
                    MC.util.massReport.start(requests, function () {
                        MC.util.massReport.showReport(Localization.MC_MassChangeReport);
                    });
                }
                else {
                    MC.ui.loading.showAndHide();
                }
            }
        };

        self.Initial = function (data) {
            self.DeleteList = [];
            self.CategoryEnName = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {

                self.LanguageInfo.Languages = $('#cboLanguage option').map(function (index, element) {
                    element = $(element);
                    return {
                        id: element.attr('value'),
                        text: element.text()
                    };
                });
                self.LanguageInfo.IndexEnd = self.LanguageInfo.IndexStart + self.LanguageInfo.Languages.length;

                $("#breadcrumbList li").last().replaceWith('<li><a class="noLink">' + self.CategoryEnName + '</a></li>');

                self.InitialLabelCategoryGrid();

                self.InitialLabelGrid();

                if (!self.UseVirtualUI()) {
                    jQuery('#mainContent .pageLabelEdit').removeClass('customLoading');
                    MC.form.page.init(self.GetData);
                }
                else {
                    if (!MC.ajax.isReloadMainContent) {
                        var i;
                        for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                            self.SwitchLanguage(jQuery('#cboLanguage' + i).get(0));
                        }

                        jQuery('#mainContent .pageLabelEdit').removeClass('customLoading');
                        MC.form.page.init(self.GetData);
                    }

                    setTimeout(function () {
                        MC.form.page.setCustomState(MC.form.page.STATE.CLIENT, function () {
                            var query = {}, i;
                            for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                                var cbo = jQuery('#cboLanguage' + i).get(0);
                                if (cbo) {
                                    query['value' + i] = cbo.value;
                                }
                            }

                            return {
                                selector: '#cboLanguage',
                                query: query
                            };
                        }, function (state) {
                            var fnCheckAsyncSuccess = setInterval(function () {
                                if (!jQuery.active) {
                                    clearInterval(fnCheckAsyncSuccess);
                                    setTimeout(function () {
                                        var i, categoryHeaders = jQuery('#LabelCategoryGrid .k-header');
                                        for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                                            categoryHeaders.eq(self.LanguageInfo.IndexVirtualStart + i).data('lang', null);

                                            var cbo = jQuery('#cboLanguage' + i).get(0);
                                            cbo.value = state.options.query['value' + i];
                                            self.SwitchLanguage(cbo);
                                        }

                                        jQuery('#mainContent .pageLabelEdit').removeClass('customLoading');
                                        MC.form.page.init(self.GetData);
                                    }, 100);
                                }
                            }, 100);
                        });
                    }, 50);
                }
            }, 1);
        };

        self.UseVirtualUI = function () {
            return self.LanguageInfo.EnableVirtual
                && self.LanguageInfo.Languages.length > self.LanguageInfo.VirtualCount;
        };

        self.SetGridColumnSize = function (gridElement) {
            var grid = jQuery(gridElement).data('kendoGrid');
            if (grid) {
                var showLanguageCount, start, i;
                if (self.UseVirtualUI()) {
                    start = self.LanguageInfo.IndexVirtualStart;
                    showLanguageCount = self.LanguageInfo.VirtualCount;
                }
                else {
                    start = self.LanguageInfo.IndexStart;
                    showLanguageCount = self.LanguageInfo.Languages.length;
                }
                for (i = 0; i < showLanguageCount; i++) {
                    MC.util.setGridWidth(grid, start + i, 170);
                }
            }
        };

        self.GetLanguageById = function (id) {
            var lang = null;
            $.each(self.LanguageInfo.Languages, function (index, language) {
                if (language.id === id) {
                    lang = language;
                    return false;
                }
            });
            return lang;
        };

        self.InitialLabelCategoryGrid = function () {
            $('#Grid .k-no-data').remove();

            var grid = jQuery('#LabelCategoryGrid');
            var gridObject = grid.data('kendoGrid');
            var start = self.LanguageInfo.IndexVirtualStart;
            var end = self.LanguageInfo.IndexVirtualEnd;
            var i;

            if (!self.UseVirtualUI()) {
                // hide virtual columns
                for (i = start; i <= end; i++) {
                    gridObject.hideColumn(i);
                }
            }
            else {
                // hide other languages
                var startHide = self.LanguageInfo.IndexStart;
                var endHide = self.LanguageInfo.IndexEnd;
                for (i = startHide; i <= endHide; i++) {
                    gridObject.hideColumn(i);
                }

                var headers = grid.find('.k-header');
                grid.find('thead tr').between('th', start, end).each(function (index, element) {
                    element = $(element);

                    var lang = headers.eq(self.LanguageInfo.IndexStart + index).data('field');
                    var language = self.GetLanguageById(lang);
                    var tpl = jQuery('#cboLanguage').clone();
                    var ddlWrapper = jQuery('<div class="columnSwitchLanguageInner" />');

                    tpl.attr('id', 'cboLanguage' + index).removeClass('hidden').val(language.id);
                    ddlWrapper.append(tpl).append('<input type="text" readonly="readonly" value="' + language.text + '" />');

                    element.data('lang', null).empty().append(ddlWrapper);
                });
            }

            self.SetGridColumnSize(grid);
        };

        self.InitialLabelGrid = function () {
            $('#Grid .k-no-data').remove();
            MC.ui.loading.hide(true);

            self.DeleteList = [];

            var gridElement = jQuery('#Grid');
            var grid = gridElement.data('kendoGrid');
            if (grid) {
                if (!grid.__bind_databound) {
                    grid.__bind_databound = true;
                    grid.bind('dataBound', self.GridDataBound);
                }
                grid.trigger('dataBound');

                self.SetGridColumnSize(gridElement);
            }
        };

        self.GridDataBound = function (e) {
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });

            var grid = e.sender.element;
            var gridObject = e.sender;
            var start = self.LanguageInfo.IndexVirtualStart;
            var end = self.LanguageInfo.IndexVirtualEnd;
            var i;

            if (!self.UseVirtualUI()) {
                // hide virtual columns
                for (i = start; i <= end; i++) {
                    gridObject.hideColumn(i);
                }
            }
            else {
                // hide other languages
                var startHide = self.LanguageInfo.IndexStart;
                var endHide = self.LanguageInfo.IndexEnd;
                for (i = startHide; i <= endHide; i++) {
                    gridObject.hideColumn(i);
                }

                grid.find('thead tr').between('th', start, end).each(function (index) {
                    var obj = jQuery('#cboLanguage' + index);
                    if (obj.length) {
                        var lang = obj[0].value;
                        obj.parents('.k-header:first').attr('data-field', lang).data('field', lang);
                    }
                });
            }

            self.CheckGridColumns();

            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = grid.find('input[value="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });

                MC.form.page.resetInitialData();
            }, 100);
        };

        self.CheckGridColumns = function () {
            if (self.UseVirtualUI()) {
                var i;
                for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                    self.BindNewRowEvent(jQuery('#cboLanguage' + i).get(0));
                }
            }
        };

        self.DeletionCheckMark = function (obj, isRemove) {

            var data = $(obj).data('parameters');
            var row = { 'uri': data.uri, 'abbreviation': data.abbreviation };
            var index = self.DeleteList.indexOfObject('uri', data.uri);

            if (isRemove) {
                if (index === -1) {
                    self.DeleteList.push(row);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteList.splice(index, 1);
                }
            }
        };

        self.SwitchLanguage = function (obj) {
            if (!obj || !obj.value) return;

            var start = self.LanguageInfo.IndexVirtualStart;
            var end = self.LanguageInfo.IndexVirtualEnd;
            var language = self.GetLanguageById(obj.value);
            var header = jQuery(obj).parents('.k-header:first');
            var currentLang = header.data('lang');
            var categoryGrid = jQuery('#LabelCategoryGrid');
            var labelGrid = jQuery('#Grid');
            var getAllVisibleLanguages = function () {
                return categoryGrid.find('thead tr').between('th', start, end)
                    .map(function () {
                        return jQuery(this).data('lang');
                    }).get();
            };
            var visibleLangs = getAllVisibleLanguages();

            // if already shown then do nothing
            if (jQuery.inArray(language.id, visibleLangs) !== -1) {
                obj.value = currentLang;
                return false;
            }

            var currentIndex = header.prevAll().length,
                targetIndex = categoryGrid.find('.k-header[data-field="' + language.id + '"]').prevAll().length;

            header.data('lang', language.id);
            labelGrid.find('.k-header').eq(currentIndex)
                .attr('data-field', language.id)
                .data('field', language.id)
                .html(labelGrid.find('.k-header').eq(targetIndex).html());
            jQuery(obj).next('input').val(language.text);

            jQuery('#LabelCategoryGrid, #Grid')
                .find('tbody tr').find('td:eq(' + currentIndex + ')').html(function () {
                    return jQuery(this).parent('tr').find('td').eq(targetIndex).html();
                })
                .find('input:not([readonly])').data('target', targetIndex).blur(function () {
                    jQuery(this).parents('tr:first').find('td').eq(jQuery(this).data('target')).find('input[name="' + jQuery(this).attr('name') + '"]').attr('value', this.value);
                });

            visibleLangs = getAllVisibleLanguages();
            if (visibleLangs.length === self.LanguageInfo.VirtualCount) {
                var i;
                for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                    jQuery('#cboLanguage' + i + ' option').removeAttr('disabled')
                        .filter(function () {
                            return $.inArray($(this).attr('value'), visibleLangs) !== -1;
                        }).attr('disabled', 'disabled');
                }
            }
        };

        self.AddRowCallback = function (tpl) {
            tpl.find('input[type="text"]').val('').attr('value', '');
            tpl.find('td:gt(1) input[type="text"]').removeClass('required');
            tpl.children('td:last').show();

            if (self.UseVirtualUI()) {
                var i;
                for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                    self.BindNewRowEvent(jQuery('#cboLanguage' + i).get(0));
                }
            }
        };

        self.BindNewRowEvent = function (obj) {
            var lang = obj.value;
            var header = jQuery(obj).parents('.k-header:first');

            var currentIndex = header.prevAll().length,
                targetIndex = jQuery('#LabelCategoryGrid .k-header[data-field="' + lang + '"]').prevAll().length;

            jQuery('#Grid')
                .find('tbody tr').find('td:eq(' + currentIndex + ')').html(function () {
                    return jQuery(this).parent('tr').find('td').eq(targetIndex).html();
                })
                .find('input:not([readonly])').data('target', targetIndex).blur(function () {
                    jQuery(this).parents('tr:first').find('td').eq(jQuery(this).data('target')).find('input[name="' + jQuery(this).attr('name') + '"]').attr('value', this.value);
                });

            setTimeout(function () {
                jQuery('#Grid .k-header').eq(currentIndex).html(jQuery('#Grid .k-header').eq(targetIndex).html());
            }, 1);
        };

        self.LabelGridFilterStart = function (grid) {
            var start, end;
            if (self.UseVirtualUI()) {
                start = self.LanguageInfo.IndexVirtualStart;
                end = self.LanguageInfo.IndexVirtualEnd;
            }
            else {
                start = self.LanguageInfo.IndexStart;
                end = self.LanguageInfo.IndexEnd;
            }

            var qlang = [];
            var row = jQuery('#Grid thead tr');
            var columns = row.children().eq(self.LanguageInfo.IndexEN);
            columns = columns.add(row.between('th', start, end));
            columns.each(function (indexColumn, column) {
                qlang.push($(column).data('field').replace('lang_', ''));
            });

            grid.dataSource.transport.options.read.url += '&qlang=' + qlang.join(',');
        };

        self.GetData = function () {
            MC.form.clean();

            var start = self.LanguageInfo.IndexStart;
            var end = self.LanguageInfo.IndexEnd;
            var getLanguageFromRow = function (row) {
                var languages = [];
                var columns = row.children().eq(self.LanguageInfo.IndexEN);
                columns = columns.add(row.between('td', start, end));
                columns.each(function (indexColumn, column) {
                    var input = $(column).find('input:text');
                    languages.push({
                        'lang': input.attr('name').replace('lang_', ''),
                        'text': $.trim(input.val())
                    });
                });
                return languages;
            };

            // category
            var categoryGrid = $('#LabelCategoryGrid tbody tr');
            var categoryData = {
                id: $.trim(categoryGrid.find('td:first input').val()),
                multi_lang_name: getLanguageFromRow(categoryGrid),
                contains_businessprocesses: false
            };
            var isNew = $('#categoryUri').val() === '';
            if (!isNew) {
                categoryData.uri = categoryGrid.find('input[type="hidden"]:first').val();
            }

            // labels
            var labels = [];
            if (!isNew) {
                var labelGrid = $('#Grid tbody tr');
                labelGrid.each(function (index, row) {
                    row = $(row);
                    if (!row.hasClass('rowMaskAsRemove')) {
                        var abbreviation = row.find("td:first input").val();
                        if (row.hasClass('newRow')) {
                            labels.push({
                                abbreviation: abbreviation,
                                uri: null,
                                multi_lang_name: getLanguageFromRow(row)
                            });
                        }
                        else {
                            labels.push({
                                abbreviation: abbreviation,
                                uri: row.find("input[name='uri']").val(),
                                multi_lang_name: getLanguageFromRow(row)
                            });
                        }
                    }
                });
            }

            return {
                isNew: isNew,
                type: 'POST',
                category: categoryData,
                labels: labels,
                deleteList: self.DeleteList.slice()
            };
        };

        self.SaveAll = function () {
            MC.form.clean();

            var forms = $('#LabelCategoryForm, #LabelForm,#CommentForm');
            if (!$('#LabelCategoryForm').valid() || !$('#LabelForm').valid() || !jQuery('#CommentForm').valid()) {
                forms.find('.error:first').focus();
                return false;
            }

            else if (self.UseVirtualUI()) {
                var start = self.LanguageInfo.IndexVirtualStart;
                var end = self.LanguageInfo.IndexVirtualEnd;
                var startHide = self.LanguageInfo.IndexStart;
                var endHide = self.LanguageInfo.IndexEnd;
                var i;
                var categoryGrid = jQuery('#LabelCategoryGrid').data('kendoGrid');
                var labelGrid = jQuery('#Grid').data('kendoGrid');
                for (i = startHide; i <= endHide; i++) {
                    categoryGrid.showColumn(i);
                }
                if (labelGrid) {
                    for (i = start; i <= end; i++) {
                        labelGrid.hideColumn(i);
                    }
                }

                var invalid = !$('#LabelCategoryForm').valid() || !$('#LabelForm').valid();
                if (invalid) {
                    var lang = forms.find('.error:first').attr('name');
                    jQuery('#cboLanguage0').val(lang);
                }

                for (i = startHide; i <= endHide; i++) {
                    categoryGrid.hideColumn(i);
                }
                if (labelGrid) {
                    for (i = start; i <= end; i++) {
                        labelGrid.showColumn(i);
                    }
                }

                if (invalid) {
                    self.SwitchLanguage(jQuery('#cboLanguage0').get(0));
                    forms.find('.error:first').focus();
                    return false;
                }
            }

            var data = self.GetData();

            var updatedData;
            if (data.isNew) {
                updatedData = {
                    jsonData: JSON.stringify(data.category),
                    deleteLabelData: self.DeleteList.length > 0 ? JSON.stringify(self.DeleteList) : ''
                };
            }
            else {
                updatedData = {
                    jsonData: JSON.stringify(data.category),
                    labelData: JSON.stringify(data.labels),
                    deleteLabelData: self.DeleteList.length > 0 ? JSON.stringify(self.DeleteList) : '',
                    categoryLabelsUri: $('#categoryLabelsUri').val(),
                    categoryUri: $('#categoryUri').val()
                };
            }

            if ($('#CommentText').val()) {
                $('#btnAddComment').trigger('click');
            }

            MC.ajax
                .request({
                    url: self.SaveUri,
                    parameters: updatedData,
                    type: data.type
                })
                .fail(function () {
                    $('#loading .loadingClose').one('click.close', MC.ajax.reloadMainContent);
                })
                .done(function (response) {
                    location.hash = self.AllModelsLabelCategoriesPageUri;
                    if (data.isNew) {
                        location.hash = self.EditPageUri + '?parameters=' + JSON.stringify(response.parameters);
                    }
                    else {
                        location.hash = self.AllModelsLabelCategoriesPageUri;
                    }
                });
        };

        self.DeleteLabelCategory = function (obj, labelUri) {
            var confirmMessage = MC.form.template.getRemoveMessage(obj);

            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    url: self.DeleteUri,
                    parameters: { labelUri: labelUri },
                    type: 'delete'
                })
                    .done(function () {
                        MC.ajax.reloadMainContent();
                    });
            });
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        LabelCategories: new LabelCategories()
    });

})(window, MC.GlobalSettings);
