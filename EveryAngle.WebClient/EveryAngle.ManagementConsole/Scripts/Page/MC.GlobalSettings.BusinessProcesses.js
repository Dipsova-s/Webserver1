(function (win, globalSettings) {

    function BusinessProcesses() {
        var self = this;
        self.DeleteList = [];
        self.SaveUri = '';
        self.DeleteUri = '';
        self.CategoryUri = '';

        self.LanguageInfo = {};
        self.LanguageInfo.EnableVirtual = false;
        self.LanguageInfo.Languages = [];
        self.LanguageInfo.VirtualCount = 6;
        self.LanguageInfo.IndexEN = 2;
        self.LanguageInfo.IndexVirtualStart = self.LanguageInfo.IndexEN + 1;
        self.LanguageInfo.IndexVirtualEnd = self.LanguageInfo.IndexVirtualStart + self.LanguageInfo.VirtualCount - 1;
        self.LanguageInfo.IndexStart = self.LanguageInfo.IndexVirtualEnd + 1;
        self.LanguageInfo.IndexEnd = -1;

        self.Initial = function (data) {
            self.DeleteList = [];
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

                self.InitialBusinessProcessCategoryGrid();

                var grid = jQuery('#BusinessProcessesGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.GridDataBound);
                    grid.trigger('dataBound');

                    self.SetGridColumnSize($('#BusinessProcessesGrid'));

                    MC.util.sortableGrid('#BusinessProcessesGrid');

                    self.SetGridDeleteButton();
                }

                if (!self.UseVirtualUI()) {
                    jQuery('#mainContent .pageBusinessProcesses').removeClass('customLoading');
                    MC.form.page.init(self.GetData);
                }
                else {
                    if (!MC.ajax.isReloadMainContent) {
                        var i;
                        for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                            self.SwitchBusinessProcessLanguage(jQuery('#cboLanguage' + i).get(0));
                        }

                        jQuery('#mainContent .pageBusinessProcesses').removeClass('customLoading');
                        MC.form.page.init(self.GetData);
                    }

                    setTimeout(function () {
                        MC.form.page.setCustomState(MC.form.page.STATE.CLIENT, function () {
                            var query = {}, i;
                            for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                                var cbo = jQuery('#cboLanguage' + i).get(0);
                                query['value' + i] = cbo.value;
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
                                        var i, categoryHeaders = jQuery('#BusinessProcessesCategoryGrid .k-header');
                                        for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                                            categoryHeaders.eq(self.LanguageInfo.IndexVirtualStart + i).data('lang', null);

                                            var cbo = jQuery('#cboLanguage' + i).get(0);
                                            cbo.value = state.options.query['value' + i];
                                            self.SwitchBusinessProcessLanguage(cbo);
                                        }

                                        jQuery('#mainContent .pageBusinessProcesses').removeClass('customLoading');
                                        MC.form.page.init(self.GetData);
                                    }, 100);
                                }
                            }, 100);
                        });
                    }, 10);
                }
            }, 1);

        };

        self.UseVirtualUI = function () {
            return self.LanguageInfo.EnableVirtual
                && self.LanguageInfo.Languages.length > self.LanguageInfo.VirtualCount;
        };

        self.GridDataBound = function (e) {
            self.CheckBusinessProcessGridColumns();

            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });

            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('input[value="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);
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

        self.CheckBusinessProcessGridColumns = function () {
            self.InitialBusinessProcessGrid();

            if (self.UseVirtualUI()) {
                var i;
                for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                    self.BindBusinessProcessNewRowEvent(jQuery('#cboLanguage' + i).get(0));
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

        self.InitialBusinessProcessCategoryGrid = function () {
            var grid = jQuery('#BusinessProcessesCategoryGrid');
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

            self.SetGridColumnSize(grid, 150);
        };

        self.InitialBusinessProcessGrid = function () {
            MC.ui.loading.hide(true);

            var grid = jQuery('#BusinessProcessesGrid');
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

                grid.find('thead tr').between('th', start, end).each(function (index) {
                    var obj = jQuery('#cboLanguage' + index);
                    if (obj.length) {
                        var lang = obj[0].value;
                        obj.parents('.k-header:first').attr('data-field', lang).data('field', lang);
                    }
                });
            }
        };

        self.SwitchBusinessProcessLanguage = function (obj) {
            if (!obj || !obj.value) return;

            var start = self.LanguageInfo.IndexVirtualStart;
            var end = self.LanguageInfo.IndexVirtualEnd;
            var language = self.GetLanguageById(obj.value);
            var header = jQuery(obj).parents('.k-header:first');
            var currentLang = header.data('lang');
            var categoryGrid = jQuery('#BusinessProcessesCategoryGrid');
            var labelGrid = jQuery('#BusinessProcessesGrid');
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

            jQuery('#BusinessProcessesCategoryGrid, #BusinessProcessesGrid')
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

        self.SetGridDeleteButton = function () {
            if ($('#BusinessProcessesGrid .k-grid-content tbody tr:not(.newRow)').length === 1) {
                $('#BusinessProcessesGrid .k-grid-content tbody tr:first').find('.btnDelete').addClass('disabled');
            }
        };

        self.AddBusinessProcessRowCallback = function (tpl) {
            jQuery('input[type="text"]', tpl).attr('value', '');
            jQuery(tpl).find('td:eq(1)').attr('id', 'bp' + jQuery.now());
            jQuery(tpl).find('input[type="checkbox"][name^="enabled"]').attr('name', 'enabled');
            jQuery(tpl).find('input[name="id"]').attr('name', 'abbreviation');
            jQuery(tpl).find(".btnDelete").removeClass("disabled");

            if (self.UseVirtualUI()) {
                var i;
                for (i = 0; i < self.LanguageInfo.VirtualCount; i++) {
                    self.BindBusinessProcessNewRowEvent(jQuery('#cboLanguage' + i).get(0));
                }
            }
        };

        self.BindBusinessProcessNewRowEvent = function (obj) {
            if (obj !== null) {
                var lang = obj.value;
                var header = jQuery(obj).parents('.k-header:first');

                var currentIndex = header.prevAll().length,
                    targetIndex = jQuery('#BusinessProcessesCategoryGrid .k-header[data-field="' + lang + '"]').prevAll().length;

                jQuery('#BusinessProcessesGrid')
                    .find('tbody tr').find('td:eq(' + currentIndex + ')').html(function () {
                        return jQuery(this).parent('tr').find('td').eq(targetIndex).html();
                    })
                    .find('input:not([readonly])').data('target', targetIndex).blur(function () {
                        jQuery(this).parents('tr:first').find('td').eq(jQuery(this).data('target')).find('input[name="' + jQuery(this).attr('name') + '"]').attr('value', this.value);
                    });

                setTimeout(function () {
                    jQuery('#BusinessProcessesGrid .k-header').eq(currentIndex).html(jQuery('#BusinessProcessesGrid .k-header').eq(targetIndex).html());
                }, 1);
            }
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};

            var start, end;
            if (self.UseVirtualUI()) {
                start = self.LanguageInfo.IndexVirtualStart;
                end = self.LanguageInfo.IndexVirtualEnd;
            }
            else {
                start = self.LanguageInfo.IndexStart;
                end = self.LanguageInfo.IndexEnd;
            }
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

            // first table
            var categoryGrid = $('#BusinessProcessesCategoryGrid tbody tr');
            var labelCategoryData = {
                id: categoryGrid.find('input[name="id"]').val(),
                uri: categoryGrid.find('input[type="hidden"]:first').val(),
                multi_lang_name: getLanguageFromRow(categoryGrid),
                contains_businessprocesses: true
            };

            // second table
            var labelData = [];
            var labelGrid = $('#BusinessProcessesGrid tbody tr');
            labelGrid.each(function (index, row) {
                row = $(row);
                if (!row.hasClass('rowMaskAsRemove')) {
                    var abbreviation = row.find('input[name="abbreviation"]').val();
                    var enabled = row.find('input[name="enabled"]').prop('checked');

                    if (row.hasClass('newRow')) {
                        labelData.push({
                            id: abbreviation,
                            order: index + 1,
                            multi_lang_name: getLanguageFromRow(row),
                            abbreviation: abbreviation,
                            enabled: enabled
                        });
                    }
                    else {
                        var uri = row.find("input[name='uri']").val().toLowerCase().replace(webAPIUrl.toLowerCase(), '');
                        labelData.push({
                            id: $.trim(row.children('td').eq(1).attr('id')),
                            order: index + 1,
                            uri: uri,
                            multi_lang_name: getLanguageFromRow(row),
                            abbreviation: abbreviation,
                            enabled: enabled
                        });
                    }
                }
            });

            data.deleteList = self.DeleteList.slice();
            data.labelCategory = labelCategoryData;
            data.labels = labelData;

            return data;
        };

        self.SaveBusinessProcess = function () {
            MC.form.clean();

            var forms = $('#BusinessProcessesCategoryForm, #BusinessProcessLabelForm');
            if (!$('#BusinessProcessesCategoryForm').valid() || !$('#BusinessProcessLabelForm').valid()) {
                forms.find('.error:first').focus();
                return false;
            }
            else if (self.UseVirtualUI()) {
                var start = self.LanguageInfo.IndexVirtualStart;
                var end = self.LanguageInfo.IndexVirtualEnd;
                var startHide = self.LanguageInfo.IndexStart;
                var endHide = self.LanguageInfo.IndexEnd;
                var i;
                var categoryGrid = jQuery('#BusinessProcessesCategoryGrid').data('kendoGrid');
                var labelGrid = jQuery('#BusinessProcessesGrid').data('kendoGrid');
                for (i = startHide; i <= endHide; i++) {
                    categoryGrid.showColumn(i);
                }
                for (i = start; i <= end; i++) {
                    labelGrid.hideColumn(i);
                }

                var invalid = !$('#BusinessProcessesCategoryForm').valid() || !$('#BusinessProcessLabelForm').valid();
                if (invalid) {
                    var lang = forms.find('.error:first').attr('name');
                    jQuery('#cboLanguage0').val(lang);
                }

                for (i = startHide; i <= endHide; i++) {
                    categoryGrid.hideColumn(i);
                }
                for (i = start; i <= end; i++) {
                    labelGrid.showColumn(i);
                }

                if (invalid) {
                    self.SwitchBusinessProcessLanguage(jQuery('#cboLanguage0').get(0));
                    forms.find('.error:first').focus();
                    return false;
                }
            }

            var data = self.GetData();

            return MC.ajax.request({
                url: self.SaveUri,
                parameters: {
                    labelCategoryData: JSON.stringify(data.labelCategory),
                    labelData: JSON.stringify(data.labels),
                    deleteData: JSON.stringify(data.deleteList),
                    categoryUri: self.CategoryUri
                },
                type: 'POST'
            })
            .done(self.SaveBusinessProcessCallback);
        };
        self.SaveBusinessProcessCallback = function (data) {
            if (data.removedData.length || !$.isEmptyObject(data.un_removeData)) {
                var text = '';
                if (data.removedData.length > 0) {
                    text += '<p>' + Localization.MC_RemovedLabelsList + '</p>';
                    $.each(data.removedData, function (index, item) {
                        text += '<p>' + item + '</p>';
                    });
                }
                if (!$.isEmptyObject(data.un_removeData)) {
                    text += '<p>' + Localization.MC_UnRemovedLabelsList + '</p>';
                    $.each(data.un_removeData, function (key, value) {
                        text += '<p>' + key + ', ' + value + '</p>';
                    });
                }
                MC.util.showPopupOK(Localization.MC_DeletedLabels, text, "MC.ajax.reloadMainContent()");
            }
            else {
                MC.ajax.reloadMainContent();
            }
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        BusinessProcesses: new BusinessProcesses()
    });

})(window, MC.GlobalSettings);
