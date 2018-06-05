(function (win, models) {
    function Modules() {
        var self = this;
        self.SaveUri = '';
        self.ValidateSaveUri = '';
        self.GetExtensionsDetailUri = '';
        self.SaveExtensionsDetailUri = '';
        self.ModelUri = '';
        self.ValidatedModules = [];
        self.ModulesChanges = [];
        self.CurrentChangeData = null;
        self.ModuleExtensionCaches = {};
        self.LastModuleExtensionUri = '';
        var warningMessage = {};
        var conflictMessage = {};

        self.COLLAPSIBLE = {
            COLLAPSE: 'collapse',
            EXPAND: 'expand'
        };

        self.MODULETYPE = {
            LONGTEXT: 'long_texts',
            CLASSIFICATION: 'classifications',
            PARTNERROLES: 'partner_roles',
            STATUS: 'sap_statuses'
        };

        self.Initial = function (data) {
            self.SaveUri = '';
            self.ValidateSaveUri = '';
            self.GetExtensionsDetailUri = '';
            self.ModelUri = '';
            self.ValidatedModules = [];
            self.ModulesChanges = [];
            self.ModuleExtensionCaches = {};
            self.LastModuleExtensionUri = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {

                var treeList = jQuery('#treelist').data('kendoTreeList');
                if (treeList) {
                    treeList.bind('dataBound', self.ModuleTreeListDataBound);

                    treeList.wrapper.on('click', '.top', function (e) {
                        var target = jQuery(e.target);
                        if (!target.hasClass('k-i-collapse') && !target.hasClass('k-i-expand')) {
                            var row = jQuery(e.currentTarget).closest('tr');
                            if (row.find('.k-i-collapse').length) {
                                treeList.collapse(row);
                            }
                            else {
                                treeList.expand(row);
                            }
                            treeList.trigger('dataBound');
                        }
                    });

                    treeList.wrapper.on('click', '.k-i-collapse, .k-i-expand', function (e) {
                        treeList.trigger('dataBound');
                    });
                }

                setTimeout(function () {
                    MC.form.page.setCustomState(MC.form.page.STATE.CLIENT, function () {
                        return {
                            selector: '#ModuleFilterBox',
                            query: {
                                q: jQuery('#ModuleFilterBox').val() || ''
                            }
                        };
                    }, function (state) {
                        jQuery(state.options.selector).val(state.options.query.q).trigger('keyup');
                    });
                }, 10);

                MC.form.page.init(self.GetData);
            }, 1);
        };

        var fnCheckLayout;
        self.ModuleTreeListDataBound = function (e) {
            MC.ui.popup('#treelist [data-role="mcPopup"]');

            var dataItems = e.sender.dataItems();
            var rowAltIndex;
            $.each(e.sender.items(), function (index, item) {
                var dataItem = dataItems[index];
                item = jQuery(item).attr('id', 'row-' + dataItem.idString);
            });
        };

        self.CheckDependRow = function () {
            $.each(self.ValidatedModules, function (index, item) {
                var data = $(':checkbox[value="' + item.id + '"]');
                if (data.length) {
                    data.prop("checked", item.enabled);
                    self.EditModuleEnableValue(data[0], false);
                }
            });
            jQuery('#popupConfirmSave').data('kendoWindow').close();
        };

        self.CancelEnabledModule = function () {
            if (self.CurrentChangeData != null) {
                var data = $(':checkbox[value="' + self.CurrentChangeData.id + '"]');
                if (data.length) {
                    data.prop("checked", !self.CurrentChangeData.enabled);
                    self.EditModuleEnableValue(data[0], false);
                }
            }
            self.CurrentChangeData = null;
            jQuery('#popupConfirmSave').data('kendoWindow').close();
        };

        self.ModulesSearchCallback = function () {
            //if (jQuery.trim(jQuery('#ModuleFilterBox').val())) {
            //    self.CollapseOrExpandAllModules(self.COLLAPSIBLE.EXPAND);
            //}

            //// highlight panel header
            //jQuery('#panelBar > .k-item > .k-link').removeHighlight();

            //if (result.length != 0) {
            //    var firstGrid = null;
            //    jQuery.each(result, function (k, v) {
            //        if (v.rows.length != 0) {
            //            var header = jQuery(v.grid).prev('.k-link');
            //            var text = header.clone().children('.warning').remove().end().text();
            //            header.highlight(jQuery.trim(text));
            //            header.find('.highlight').append(' ... found ' + v.rows.length + ' items');

            //            if (!firstGrid) firstGrid = header;
            //        }
            //    });
            //    if (jQuery('#panelBar .k-grid:visible').length == 0) {
            //        firstGrid.trigger('click');
            //    }
            //}
        };

        self.ShowModuleInfo = function (element) {
            MC.ui.popup('setScrollable', {
                element: '#popupModulelInfo'
            });

            element = $(element);
            var textid = element.context.dataset.textid;

            var text;
            $.when(textid && textid !== 'null' && MC.ajax.request({
                url: self.GetHelpTextsUri + '?helpTextUri=' + escape(self.ModelUri + '/helptexts?ids=' + textid + '&viewmode=details')
            }))
            .done(function (list, status, xhr) {
                if (list && list.length > 0 && list[0].html_help) {
                    text = list[0].html_help;
                }
                else {
                    text = element.prev().val();
                }
                $('#popupModulelInfo .popupContent').html(text);
            });
        };

        self.ShowModuleEdit = function (target, type) {
            
            MC.ui.popup('setScrollable', {
                element: '#popupModuleEdit',
                getHeight: function (win) {
                    return win.element.height() - win.element.find('.popupToolbar').outerHeight() - 20;
                },
                onResize: function (win) {
                    var grid = win.element.find('.k-grid');
                    grid.height(win.element.find('.popupContent').height() - 35);
                    kendo.resize(grid, true);
                }
            });

            var win = $('#popupModuleEdit').data('kendoWindow');
            var sender = $(target);
            var uid = sender.parents('tr:first').data('uid');
            var moduleName = sender.data('title');
            var uri = sender.prev('input').val();

            if (!win.__has_set_partner_roles_popup_settings) {
                win.bind('maximize', function (e) {
                    e.sender.trigger('resize');
                });
                win.__has_set_partner_roles_popup_settings = true;
            }

            win.setOptions({
                actions: ["Maximize"]
            });

            if (self.LastModuleExtensionUri == uri) {
                setTimeout(function () {
                    MC.ui.popup('requestEnd');
                    if (win) win.trigger('resize');
                }, 200);
                return;
            }
            self.LastModuleExtensionUri = uri;

            $('#popupModuleEdit .contentSectionGrid').show();
            var btnUpdate = win.element.find('.btnUpdate').addClass('btnPrimary alwaysHidden disabled');
            var btnClose = win.element.find('.btnClose').addClass('btnPrimary');
            if (type == self.MODULETYPE.CLASSIFICATION) {
                win.setOptions({ title: moduleName });
                MC.ui.popup('setTooltip', {
                    element: '#popupModuleEdit'
                });
                win.element.find('.contentSectionGrid').hide();
                return;
            }

            var gridColumns = [];
            var gridSortColumn = '';
            if (type == self.MODULETYPE.LONGTEXT) {
                gridSortColumn = 'tdobject';
                gridColumns = [
                    { field: 'description', title: 'Description' },
                    { field: 'tdobject', title: 'TDOBJECT', width: 100 },
                    { field: 'tdid', title: 'TDID', width: 100 }
                ];

                btnUpdate
                    .removeClass('alwaysHidden')
                    .off('click')
                    .on('click', function (e) {
                        self.SetEnableModuleExtension(uri, type, uid);
                    });
                btnClose.removeClass('btnPrimary');
            }
            else if (type == self.MODULETYPE.PARTNERROLES) {
                gridSortColumn = 'id';
                gridColumns = [
                    { field: 'description', title: 'Description' },
                    { field: 'id', title: 'ID', width: 100 },
                    { field: 'type', title: 'Type', width: 100 }
                ];

                btnUpdate
                    .removeClass('alwaysHidden')
                    .off('click')
                    .on('click', function (e) {
                        self.SetEnableModuleExtension(uri, type, uid);
                    });
                btnClose.removeClass('btnPrimary');
            }
            gridColumns.splice(0, 0, {
                field: 'enabled',
                title: 'Active',
                width: 60,
                headerAttributes: { 'class': 'columnBoolean' },
                attributes: { 'class': 'columnBoolean' },
                template: '<label><input data-default="#= enabled #" type="checkbox" #= enabled ? \' checked=\"checked\"\' : \'\' # /><span class="label"></span></label>'
            });


            var fnGetExetionsionDetails = function (extensionUri) {
                if (!self.ModuleExtensionCaches[extensionUri]) {
                    return MC.ajax.request({
                        url: self.GetExtensionsDetailUri,
                        parameters: { extensionUri: extensionUri }
                    });
                }
                else {
                    var deferred = jQuery.Deferred();
                    setTimeout(function () {
                        deferred.resolve(self.ModuleExtensionCaches[extensionUri]);
                    }, 100);
                    return deferred.promise();
                }
            };

            jQuery('#ModuleExtensionFilterBox').val('');
            var grid = jQuery('#ModuleExtensionInfoGrid').data('kendoGrid');
            if (!grid) {
                grid = jQuery('#ModuleExtensionInfoGrid').kendoGrid({
                    height: 285,
                    resizable: true,
                    sortable: {
                        mode: 'single',
                        allowUnsort: false
                    },
                    scrollable: true
                }).data('kendoGrid');
            }

            if (grid) {
                var dataSource = new kendo.data.DataSource({ data: [], sort: { field: gridSortColumn } });
                grid.setOptions({ columns: gridColumns });
                grid.unbind('dataBound');
                grid.setDataSource(dataSource);
                grid.bind('dataBound', function (e) {
                    if (type == self.MODULETYPE.LONGTEXT || type == self.MODULETYPE.PARTNERROLES) {
                        e.sender.element.find(':checkbox').prop('disabled', false);
                    }
                    else {
                        e.sender.element.find(':checkbox').prop('disabled', true);
                    }
                });
                jQuery('#ModuleExtensionFilterBox').removeData('defaultValue').trigger('keyup');
                setTimeout(function () {
                    win.trigger('resize');
                }, 50);

                var fnGetExetionsionDetails = function (extensionUri) {
                    if (!self.ModuleExtensionCaches[extensionUri]) {
                        return MC.ajax.request({
                            url: self.GetExtensionsDetailUri,
                            parameters: { extensionUri: extensionUri }
                        });
                    }
                    else {
                        var deferred = jQuery.Deferred();
                        setTimeout(function () {
                            deferred.resolve(self.ModuleExtensionCaches[extensionUri]);
                        }, 100);
                        return deferred.promise();
                    }
                };

                MC.ui.popup('requestStart');
                fnGetExetionsionDetails(uri)
                    .done(function (response) {
                        
                        self.ModuleExtensionCaches[uri] = response;
                        var extensionData = self.GenerateExtensionData(response, type);

                        win.setOptions({ title: moduleName + (response.description ? ' - ' + response.description : '') });
                        MC.ui.popup('setTooltip', {
                            element: '#popupModuleEdit'
                        });
                        grid.thead.find('[data-field="description"] .k-link').html(response.description);
                        dataSource.data(extensionData);
                        grid.setDataSource(dataSource);

                        btnUpdate.removeClass('disabled');
                    })
                    .fail(function (xhr, status, error) {
                        win.wrapper.hide();
                        $('.k-overlay').hide();
                    })
                    .always(function () {
                        setTimeout(function () {
                            MC.ui.popup('requestEnd');
                            win.trigger('resize');
                        }, 100);
                    });
            }
        };

        self.ShowModuleEditPlaintext = function (target, type) {
            MC.ui.popup('setScrollable', {
                element: '#popupModuleEditPlaintext',
                onResize: function (win) {
                    $('#popupModuleEditPlaintext #plaintext').css('height', win.element.find('.popupContent').height());
                }
            });

            var win = $('#popupModuleEditPlaintext').data('kendoWindow');
            var sender = $(target);
            var uid = sender.parents('tr:first').data('uid');
            var moduleName = sender.data('title');
            var uri = sender.prev('input').val();

            $('#popupModuleEditPlaintext .contentSectionGrid').show();
            var btnUpdate = win.element.find('.btnUpdate').addClass('btnPrimary alwaysHidden disabled');
            var btnClose = win.element.find('.btnClose').addClass('btnPrimary');
            if (type == self.MODULETYPE.CLASSIFICATION || type == self.MODULETYPE.STATUS) {
                win.setOptions({ title: moduleName });
                MC.ui.popup('setTooltip', {
                    element: '#popupModuleEditPlaintext'
                });
                win.element.find('.contentSectionGrid').hide();

                $('#plaintext').attr('readonly', 'readonly');
                btnUpdate
                    .off('click')
                    .on('click', function (e) {
                        self.SetPlainTextModuleExtension(uri, type, uid);
                    });
                btnClose.text(Localization.Close);
            }

            var fnGetExetionsionDetails = function (extensionUri) {
                if (!self.ModuleExtensionCaches[extensionUri]) {
                    return MC.ajax.request({
                        url: self.GetExtensionsDetailUri,
                        parameters: { extensionUri: extensionUri }
                    });
                }
                else {
                    var deferred = jQuery.Deferred();
                    setTimeout(function () {
                        deferred.resolve(self.ModuleExtensionCaches[extensionUri]);
                    }, 100);
                    return deferred.promise();
                }
            };

             MC.ui.popup('requestStart');
            fnGetExetionsionDetails(uri)
                .done(function (response) {
                    self.ModuleExtensionCaches[uri] = response;
                    $('#plaintext').val(response.plaintext);
                    $('#plaintext').removeAttr("disabled");
                    btnUpdate.removeClass('disabled');
                })
                .fail(function (xhr, status, error) {
                    win.wrapper.hide();
                    $('.k-overlay').hide();
                })
                .always(function () {
                    setTimeout(function () {
                        MC.ui.popup('requestEnd');
                        win.trigger('resize');
                    }, 100);
                });
        };

        self.SetPlainTextModuleExtension = function (uri, type, uid) {
            var btnUpdate = jQuery('#popupModuleEdit .btnUpdate');
            if (btnUpdate.hasClass('disabled')) return;

            var moduleType = (type == 'classifications') ? 'sap_classifications' : type;
            var extensionData = { type: moduleType, plaintext: jQuery('#popupModuleEditPlaintext #plaintext').val() };

            MC.ajax.request({
                url: self.SaveExtensionsDetailUri,
                parameters: { extensionUri: uri, extensionData: JSON.stringify(extensionData) },
                type: 'PUT'
            })
            .done(function (response, status, xhr) {
                var moduleExtensionData = response.module.module_extensions.findObject('type_uri', response.extension.uri);
                if (moduleExtensionData) {
                    var treelist = $('#treelist').data('kendoTreeList');
                    if (treelist) {
                        var dataItem = treelist.dataSource.getByUid(uid);
                        if (dataItem) {
                            treelist.refresh();
                        }
                    }
                }
                self.ModuleExtensionCaches[uri] = response.extension;
            })
            .always(function () {
                btnUpdate.removeClass('disabled');
                MC.ui.popup('requestEnd');
            });

            $('#popupModuleEditPlaintext').data('kendoWindow').close();
        };

        self.GenerateExtensionData = function (data, type) {
            //var data = JSON.parse(response);
            return data[type];
        };
        self.SetEnableModuleExtension = function (uri, type, uid) {
            var btnUpdate = jQuery('#popupModuleEdit .btnUpdate');
            if (btnUpdate.hasClass('disabled')) return;

            // build update data
            var extensionData = {};
            extensionData[type] = [];
            var afterSaveData = function () {
                btnUpdate.removeClass('disabled');
                MC.ui.popup('requestEnd');
                $('#popupModuleEdit').data('kendoWindow').close();
            }

            var grid = jQuery('#ModuleExtensionInfoGrid').data('kendoGrid');
            if (grid) {
                var items = grid.items();
                var foundChanged = false;
                jQuery.each(grid.dataItems(), function (index, dataItem) {
                    var enabledStatusElement = items.eq(index).find(':checkbox');
                    var enabledStatus = enabledStatusElement.is(':checked');
                    var model = dataItem.toJSON();
                    if (enabledStatusElement.data('default') !== enabledStatus) {
                        
                        foundChanged = true;
                    }

                    dataItem.enabled = enabledStatus;
                    model.enabled = enabledStatus;
                    extensionData[type].push(model);
                });

                btnUpdate.addClass('disabled');
                MC.ui.popup('requestStart');
                if (foundChanged) {
                    MC.ajax.request({
                        url: self.SaveExtensionsDetailUri,
                        parameters: { extensionUri: uri, extensionData: JSON.stringify(extensionData) },
                        type: 'PUT'
                    })
                    .done(function (response, status, xhr) {
                        var moduleExtensionData = response.module.module_extensions.findObject('type_uri', response.extension.uri);
                        if (moduleExtensionData) {
                            var treelist = $('#treelist').data('kendoTreeList');
                            if (treelist) {
                                var dataItem = treelist.dataSource.getByUid(uid);
                                if (dataItem) {
                                    if (type == self.MODULETYPE.CLASSIFICATION) {
                                        dataItem.TotalClassification = moduleExtensionData.activated_items_count;
                                    }
                                    else if (type == self.MODULETYPE.LONGTEXT) {
                                        dataItem.TotalLongText = moduleExtensionData.activated_items_count;
                                    }
                                    else if (type == self.MODULETYPE.PARTNERROLES) {
                                        dataItem.TotalPartnerRoles = moduleExtensionData.activated_items_count;
                                    }

                                    treelist.refresh();
                                }
                            }
                        }

                        self.ModuleExtensionCaches[uri] = response.extension;
                        var extensionData = self.GenerateExtensionData(response.extension, type);
                        grid.dataSource.data(extensionData);
                    })
                    .always(function () {
                        afterSaveData();
                    });
                }
                else {
                    setTimeout(function () {
                        afterSaveData();
                    }, 150);
                }
                
            }
        };

        self.EditModuleEnableValue = function (modelElement, checkValidate) {
            if (typeof checkValidate == 'undefined') checkValidate = true;
            var moduleId = modelElement.value;
            var enebleValue = modelElement.checked;

            if (checkValidate) {
                if (warningMessage[moduleId])
                    warningMessage[moduleId] = undefined;
                else
                    warningMessage[moduleId] = true;

                if (conflictMessage[moduleId])
                    conflictMessage[moduleId] = undefined;
                else
                    conflictMessage[moduleId] = true;
            }

            if (self.ModulesChanges.length > 0) {
                var existingIndex = -1;
                jQuery.each(self.ModulesChanges, function (index, moduleItem) {
                    if (moduleItem.id == moduleId) {
                        existingIndex = index;
                    }
                });
                if (existingIndex != -1) {
                    self.ModulesChanges.splice(existingIndex, 1);
                }
            }
            self.ModulesChanges.push({ id: moduleId, enabled: enebleValue });

            if (checkValidate) {
                self.ValidateSaveModules({ id: moduleId, enabled: enebleValue });
            }

        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};
            data.modelUri = self.ModelUri;
            data.modulesChanges = self.ModulesChanges.slice();

            return data;
        };

        self.ValidateSaveModules = function (moduleData) {
            var changedData = {}, isSave;
            if (typeof moduleData == 'undefined') {
                self.CurrentChangeData = null;
                changedData.module_list = self.ModulesChanges;
                isSave = true;
            }
            else {
                self.CurrentChangeData = jQuery.extend({}, moduleData);
                changedData.module_list = [moduleData];
                isSave = false;
            }

            if (!changedData.module_list.length) {
                MC.ui.loading.showAndHide();
            }
            else {
                MC.ajax.request({
                    url: self.ValidateSaveUri,
                    parameters: {
                        modulesData: JSON.stringify(changedData),
                        modelUri: self.ModelUri
                    },
                    type: 'POST',
                    ajaxSuccess: function (metadata, data, status, xhr) {
                        if (data.validateStatus) {
                            if (isSave) {
                                self.SaveModules();
                            }
                            else {
                                if (data.modulesData.length != 0) {
                                    self.ValidatedModules = data.modulesData;
                                    var headerMessage = (data.modulesData[0].enabled) ? Localization.MC_EnableSelectedModules : Localization.MC_DisableSelectedModules;
                                    var includeText = (data.modulesData[0].enabled) ? Localization.MC_NotIncludeInModule : Localization.MC_IncludeInModule;

                                    var text = '<p>' + headerMessage + '</p>';
                                    text += '<ul>';

                                    var numberOfWarningMessage = 0;
                                    $.each(data.modulesData, function (index, item) {
                                        if (!warningMessage[item.id]) {
                                            warningMessage[item.id] = true;
                                            numberOfWarningMessage++;
                                            text += '<li>' + ($('[data-id="' + item.id + '"]').data('name') || item.id + ' ' + includeText) + '</li>';
                                        }
                                    });
                                    text += '</ul>';
                                   
                                    if (numberOfWarningMessage > 0) {
                                        $('#popupConfirmSave .popupContent').html(text);
                                        $('#btnConfirmSave').trigger('click');
                                    }
                                    else
                                        self.CheckDependRow();
                                }
                            }
                        }
                        else {
                            var validateResult;
                            try {
                                validateResult = JSON.parse(data.validateResult);
                            }
                            catch (ex) {
                                validateResult = data.validateResult;
                            }

                            if (typeof validateResult == 'string' || validateResult.message) {
                                $(document).trigger('ajaxError', [{
                                    responseText: JSON.stringify({
                                        reason: data.errorReason,
                                        message: typeof validateResult == 'string' ? validateResult : validateResult.message
                                    }),
                                    status: data.errorCode
                                }, metadata, data.errorReason]);
                            }
                            else {
                                var text = '<p>' + MC_ConflictingModulesSelection + '</p>';
                                text += '<ul>'
                                var numberOfConflictMessage = 0;
                                $.each(validateResult.module_list, function (index, item) {
                                    if (!conflictMessage[item.id]) {
                                        conflictMessage[item.id] = true;
                                        numberOfConflictMessage++;
                                        text += '<li>' + $('#' + item.id).data('name') + '</li>';
                                    }
                                });
                                text += '</ul>';

                                if (numberOfConflictMessage > 0) {
                                    $('#popupShowConflict .popupContent').html(text);
                                    $('#btnCancelSave').trigger('click');
                                }
                                else
                                    self.CheckDependRow();
                            }
                        }
                    }
                });
            }
        };

        self.SaveModules = function () {
            var data = self.GetData();

            MC.ajax.request({
                url: self.SaveUri,
                parameters: { 
                    modulesData: JSON.stringify(data.modulesChanges),
                    modelUri: data.modelUri
                },
                type: 'POST',
                ajaxSuccess: function () {
                    MC.ajax.reloadMainContent();
                }
            });
        };

        self.CollapseOrExpandAllModules = function (type) {
            var treeList = $('#treelist').data('kendoTreeList');
            if (typeof treeList[type] == 'function') {
                treeList.unbind('dataBound', self.ModuleTreeListDataBound);
                treeList.content.find('tr .k-i-' + type).each(function () {
                    var row = jQuery(this).parents('tr:first');
                    treeList[type](row);
                });
                treeList.bind('dataBound', self.ModuleTreeListDataBound);
                treeList.trigger('dataBound');
            }
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Modules: new Modules()
    });

})(window, MC.Models);
