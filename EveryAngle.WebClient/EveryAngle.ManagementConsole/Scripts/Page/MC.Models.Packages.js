(function (win, models) {

    function Packages() {
        var self = this;
        self.ModelId = '';
        self.ShowPackageErrorMessageUri = '';
        self.ManagePackageUri = '';
        self.DownloadPackageUri = '';
        self.ManageMultiplePackagesUri = '';
        self.DeletePackageUri = '';
        self.GetPackageSummaryUri = '';
        self.GetExportPackageStatusUri = '';
        self.PostExportPackageUri = '';
        self.IsMultiSelect = false;
        self.IsPopuprequired = false;
        self.CheckedPackages = [];

        let timeoutId;

        const _self = {};
        _self.ActivatePackagePopupId = '#ActivatePackagePopup';
        _self.ActivatePackageFormId = '#ActivatePackageForm';
        _self.PackageModelSelectorId = '#ModelActivateSelector';
        _self.PopupExportPackageId = '#PopupExportPackage';
        _self.ExportPackageFormId = '#ExportPackageForm';
        _self.ModelExportSelectorId = '#ModelExportSelector';
        _self.ExportPackageButtonId = '#ExportPackageButton';
        _self.ExportPackageCountId = '#ExportPackageCount';

        _self.ModelActivatorValue = {};

        self.PACKAGE_STATUS = {
            ACTIVATING: 'Activating',
            DEACTIVATING: 'Deactivating',
            ACTIVATIONFAILED: 'ActivationFailed'
        };

        self.Initial = function (data) {
            self.ModelId = '';
            self.ShowPackageErrorMessageUri = '';
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#PackageGrid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.PackageGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }

                var packagesHistoryGrid = jQuery('#PackagesHistoryGrid').data('kendoGrid');
                if (packagesHistoryGrid) {
                    MC.util.gridScrollFixed(packagesHistoryGrid);
                    packagesHistoryGrid.bind('dataBound', self.PackagesHistoryGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        packagesHistoryGrid.dataSource.read();
                    }
                    else {
                        packagesHistoryGrid.trigger('dataBound');
                    }
                }

                setTimeout(function () {
                    MC.form.page.setCustomState(MC.form.page.STATE.SERVER, function () {
                        var grid = jQuery('#PackageGrid').data('kendoGrid');
                        return {
                            selector: '#PackageGrid',
                            query: {
                                page: grid ? grid.dataSource.page() || 1 : 1,
                                sort: grid ? grid.dataSource.sort() || [] : [],
                                q: encodeURIComponent(jQuery('#PackagesGridFilterBox').val() || ''),
                                activeStatus: jQuery('input[name="FilterPackages"]:checked').val()
                            }
                        };
                    }, function (state) {
                        jQuery('input[name="FilterPackages"][value="' + state.options.query.activeStatus + '"]').attr('checked', 'checked');
                        var grid = jQuery(state.options.selector).data('kendoGrid');
                        if (grid) {
                            self.PackagesGridBeforeFilter(grid);
                        }

                        MC.form.page.executeState(state);
                    });
                }, 10);
            }, 1);
        };

        self.PackageGridDataBound = function (e) {
            MC.ui.localize();
            MC.ui.btnGroup();
            MC.ui.popup();
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].name);
            });
        };

        self.PersistCheckedPakcages = function (data) {
            data.IsSelected = false;
            self.CheckedPackages.forEach(function (element) {
                if (element.PackageUri === data.Uri) {
                    data.IsSelected = true;
                    return;
                }
            });
        };

        self.GetPackageButtonsTemplate = function (data, enable) {
            // persist cheked packeages
            self.PersistCheckedPakcages(data);

            // package action button html
            var actionAttributes = self.GetPackageActionHtmlAttributes(data, enable);
            var actionButton = self.GetPackageButtonHtml(actionAttributes);

            // package download button html
            var downloadAttributes = self.GetPackageDownloadHtmlAttributes(data, enable);
            var downloadButton = self.GetPackageButtonHtml(downloadAttributes);

            let deleteButton = '';
            if (!self.ModelId) {
                const deleteAttribute = self.GetPackageDeleteHtmlAttributes(data, enable);
                deleteButton = self.GetPackageButtonHtml(deleteAttribute);
            }

            return actionButton + downloadButton + deleteButton;
        };
        self.GetPackageActionHtmlAttributes = function (data, enable) {
            var attributes = {};
            if (self.IsActivatingPackage(data.status)) {
                // activating package will disable the button
                attributes['class'] = 'btn btnSetInactive disabled';
                attributes.text = Localization.Activate;
            }
            else if (self.IsDeactivatingPackage(data.status)) {
                // de-activating package will disable the button
                attributes['class'] = 'btn btnSetActive disabled';
                attributes.text = Localization.Deactivate;
            }
            else {
                // common attributes for managing package
                attributes.onclick = 'MC.Models.Packages.ManagePackage(event, this)';
                attributes['data-parameters'] = kendo.format(
                    '\{"packageUri":"{0}", "isActive": {1}, "modelId":"{2}", "isUpgradePackage":{3},"activatedModel":"{4}","content":"{5}"\}',
                    data.Uri,
                    !data.active,
                    self.ModelId,
                    data.IsUpgradePackage,
                    data.RePlaceActivatedModels,
                    data.ReContentsList
                );

                if (self.CanDeactivatePackage(data)) {
                    // can deactivate package
                    attributes['class'] = 'btn btnSetInactive';
                    if (!self.ModelId && self.IsModelPackage(data.Contents)) {
                        // management console type package
                        attributes.href = '#ActivatePackagePopup';
                        attributes['data-role'] = 'mcPopup';
                        attributes['data-width'] = '425';
                        attributes['data-height'] = '290';
                        attributes['title'] = Localization.MC_DeactivatePackage;
                    }
                    else attributes.href = self.ManagePackageUri;
                    attributes.text = Localization.Deactivate;
                    attributes['data-delete-template'] = Localization.MC_ConfirmDeactivatePackage;
                }
                else {
                    // can activate/update package
                    attributes['class'] = 'btn btnSetActive';
                    attributes.title = Localization.MC_ActivatePackage;

                    if (!self.ModelId && self.IsModelPackage(data.Contents)) {
                        // management console type package
                        attributes.href = '#ActivatePackagePopup';
                        attributes['data-role'] = 'mcPopup';
                        attributes['data-width'] = '425';
                        attributes['data-height'] = '290';
                        attributes['title'] = Localization.MC_ActivatePackage;
                    }
                    else if (data.IsUpgradePackage) {
                        // management console type package
                        attributes.href = '#ImportPackagePopup';
                        attributes['data-role'] = 'mcPopup';
                        attributes['data-width'] = '425';
                        attributes['data-height'] = '365';
                    }
                    else {
                        // other type package
                        attributes.href = self.ManagePackageUri;
                    }

                    if (self.CanUpdatePackage(data)) {
                        // update package
                        attributes.text = Localization.Update;
                        attributes['data-delete-template'] = Localization.MC_ConfirmUpdatePackage;
                    }
                    else {
                        // activate package
                        attributes.text = Localization.Activate;
                        attributes['data-delete-template'] = Localization.MC_ConfirmActivatePackage;
                    }
                }

                if (!enable) {
                    // set disable & clean attributes
                    attributes['class'] += ' disabled';
                    delete attributes.href;
                    delete attributes.onclick;
                    delete attributes['data-parameters'];
                    delete attributes['data-delete-template'];
                }
            }
            return attributes;
        };
        self.GetPackageDownloadHtmlAttributes = function (data, enable) {
            var attributes = {};
            attributes.text = Localization.Download;
            attributes['class'] = 'btn btnDownload';
            attributes.href = kendo.format('{0}?packageFileUri={1}', self.DownloadPackageUri, data.packageFileUri);
            attributes.onclick = 'MC.Models.Packages.DownloadPackage(event, this)';

            if (!self.CanDownloadPackage(enable)) {
                // set disable & clean attributes
                attributes['class'] += ' disabled';
                delete attributes.href;
                delete attributes.onclick;
            }
            return attributes;
        };
        self.GetPackageButtonHtml = function (attributes) {

            // get label and remove it from creating attributes
            var label = attributes.text;
            delete attributes.text;

            // create attributes
            var attributeText = '';
            $.each(attributes, function (name, value) {
                attributeText += kendo.format(' {0}=\'{1}\'', name, value);
            });

            // create html
            return kendo.format('<a{1}>{0}</a>', label, attributeText);
        };
        self.IsActivatingPackage = function (status) {
            return status === self.PACKAGE_STATUS.ACTIVATING;
        };
        self.IsDeactivatingPackage = function (status) {
            return status === self.PACKAGE_STATUS.DEACTIVATING;
        };
        self.CanDeactivatePackage = function (data) {
            return (!self.ModelId && data.active) || (data.active && data.active_version === data.Version || data.status === self.PACKAGE_STATUS.ACTIVATIONFAILED);
        };
        self.CanUpdatePackage = function (data) {
            return !data.active && data.active_version !== null && data.active_version !== data.Version;
        };
        self.CanDownloadPackage = function (enable) {
            // enable and not safari on touch devices
            return enable && (!Modernizr.touch || !$.browser.safari);
        };

        self.GetPackageNameTooltip = function (element) {
            var text = jQuery(element).text();
            var grid = jQuery('#PackageGrid').data('kendoGrid');
            if (grid) {
                var row = jQuery(element).parents('tr:first');
                var dataItem = grid.dataSource.getByUid(row.data('uid'));
                if (dataItem && dataItem.Description) {
                    text = dataItem.Description.replace(/\n/g, '<br/>');
                }
            }
            return text;
        };

        self.PackagesHistoryGridDataBound = function (e) {
            MC.util.setGridWidth(e.sender, e.sender.columns.length - 1, 75);
            MC.ui.localize();
            MC.ui.popup();

            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });
        };

        self.PackagesGridBeforeFilter = function (grid) {
            self.IsMultiSelect = false;
            self.IsPopuprequired = false;
            self.CheckedPackages = [];
            var url = grid.dataSource.transport.options.read.url;
            var queryIndex = url.indexOf('?') + 1;
            var query, sourceUrl;
            if (queryIndex === 0) {
                query = {};
                sourceUrl = url;
            }
            else {
                query = jQuery.parseParams(url.substr(queryIndex));
                sourceUrl = url.substr(0, queryIndex - 1);
            }
            query.activeStatus = $('input[name="FilterPackages"]:checked').val();
            grid.dataSource.transport.options.read.url = sourceUrl + '?' + jQuery.param(query);
            self.DisableCheckBox(query);
        };

        self.EnableDisableButtonAndCheckBox = function (query) {
            if (query.activeStatus === 'all') {
                $('#btnactivatedeactivate').hide();
                $('input[name="IsSelected"]').attr('disabled', true);
            } else {
                query.activeStatus === 'active' ? $('#btnactivatedeactivate > span').text(Localization.Deactivate) : $('#btnactivatedeactivate > span').text(Localization.Activate);
                $('#btnactivatedeactivate').show();
                $('#btnactivatedeactivate').attr("disabled", true);
                $('input[name="IsSelected"]').attr('disabled', false);
            }
        };

        self.DisableCheckBox = function (query) {
            if ($('.gridToolbarFilter .loader-spinner-inline').length) {
                setTimeout(function () {
                    self.DisableCheckBox(query);
                }, 10)
            } else {
                self.EnableDisableButtonAndCheckBox(query);
            }
        };

        self.PackagesGridFilter = function () {
            $('#PackagesGridFilterBox').data('defaultValue', '***********').trigger('keyup');
        };

        self.ActivatePackages = function () {
            self.IsMultiSelect = true;
            $('#btnactivatedeactivate').attr("disabled", true);
            if (self.IsPopuprequired) {
                var popup = $('<a />', {
                    attr: {
                        href: '#ImportPackagePopup',
                        title: Localization.MC_ActivatePackage
                    },
                    data: {
                        width: 600,
                        height: 400,
                        minWidth: 500,
                        role: "mcPopup"
                    }
                });
                MC.ui.popup(popup);
                popup.trigger('click');
            }
            else {
                self.PostPackages(self.CheckedPackages);
            }
        };

        self.ShowPackageErrorMessage = function (e, obj) {
            var win = $('#popupPackageErrorMessage').data('kendoWindow');
            if (win && !win.__bind_resize_event) {
                win.__bind_resize_event = true;
                win.bind('resize', function () {
                    var grid = win.element.find('.k-grid');
                    grid.height(win.element.height() - 2);
                    kendo.resize(grid, true);
                });
            }
            MC.ui.popup('requestStart');

            MC.ajax
                .request({
                    url: self.ShowPackageErrorMessageUri,
                    parameters: "packageUri=" + $(obj).data('parameters').packageUri,
                    type: 'POST'
                })
                .done(function (data) {
                    $('#GridPackageErrorMessage').html(data);

                    setTimeout(function () {
                        var win = $('#popupPackageErrorMessage').data('kendoWindow');
                        win.trigger('resize');
                    }, 100);
                })
                .fail(function () {
                    MC.ui.popup('close');
                })
                .always(function () {
                    MC.ui.popup('requestEnd');
                });

            MC.util.preventDefault(e);
        };

        // activate or deactivate package
        self.ManagePackage = function (e, element) {
            const dataParameters = $(element).data('parameters');

            if (!self.ModelId && self.IsModelPackage(dataParameters.content.split(',').map(e => e.trim()))) {
                self.GetActivatePopupForGlobalPackage(dataParameters);
            }
            else if (dataParameters.isActive && dataParameters.isUpgradePackage) {
                MC.ui.popup('setScrollable', {
                    element: '#ImportPackagePopup'
                });

                var importPackagePopup = $('#ImportPackagePopup');
                importPackagePopup.find('form').trigger('reset');
                importPackagePopup.find('.btnSubmit').data('parameters', dataParameters);
                self.includeLabelsSelected(true);
                $(element).closest('.btnGroupContainer').removeClass('open');
            }
            else {
                const confirmMessage = MC.form.template.getRemoveMessage(element);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    if (!self.ModelId) {
                        const dropdown = jQuery.parseJSON($("#ModelActivateSelectorHidden").val());
                        element = self.GetElementWithParameter(dataParameters, dropdown);
                    }
                    self.PostPackage(element);
                });
            }
            MC.util.preventDefault(e);
        };

        self.ActivatePackage = function (submitButton) {
            if (!self.IsMultiSelect) {
                var importPackagePopup = $('#ImportPackagePopup').data('kendoWindow');
                var importPackageFormData = importPackagePopup.element.find('form').serializeArray();
                var packageParameters = $(submitButton).data('parameters');

                importPackageFormData.forEach(function (field) {
                    packageParameters[field.name] = field.value;
                });

                var element = $('<a>')
                    .attr('href', self.ManagePackageUri)
                    .data('parameters', packageParameters);

                importPackagePopup.close();
                self.PostPackage(element);
            } else {
                var importPackagePopup = $('#ImportPackagePopup').data('kendoWindow');
                var importPackageFormData = importPackagePopup.element.find('form').serializeArray();
                self.CheckedPackages.forEach(function (field) {
                    if (field.IsUpgradePackage) {
                        importPackageFormData.forEach(function (f) {
                            field[f.name] = f.value;
                        });
                    }
                });
                importPackagePopup.close();
                self.PostPackages(self.CheckedPackages);
            }
        };

        self.PostPackage = function (element) {
            const requestParams = {
                element: element,
                type: 'POST'
            };

            MC.ajax.request(requestParams)
                .fail(self.PostPackageFailureCallback)
                .done(function () {
                    var parameters = $(element).data('parameters');
                    self.PostPackageSuccessCallback(parameters);
                });
        };

        self.PostPackages = function (input) {
            MC.ajax
                .request({
                    url: self.ManageMultiplePackagesUri,
                    parameters: {
                        packages: input
                    },
                    type: 'POST'
                })
                .fail(self.PostPackageFailureCallback)
                .done(function (result) {
                    var input = { isActive: true };
                    self.IsPopuprequired = false;
                    self.CheckedPackages = [];
                    self.IsMultiSelect = false;
                    self.PostPackageSuccessCallback(input);
                });
        };

        self.PostPackageFailureCallback = function () {
            $(MC.ui.loading.loaderCloseButton).one('click.close', function () {
                self.PackagesGridFilter();
            });
        };

        self.PostPackageSuccessCallback = function (parameters) {
            const timeout = 150;

            // if user click active package
            if (parameters.isActive) {
                $('[name=FilterPackages][value=active]').prop('checked', true);
            }

            // refresh package grid
            setTimeout(function () {
                self.PackagesGridFilter();
            }, timeout);

            // refresh history grid
            setTimeout(function () {
                var packagesHistoryGrid = jQuery('#PackagesHistoryGrid').data('kendoGrid');
                if (packagesHistoryGrid) {
                    packagesHistoryGrid.dataSource.read();
                }
            }, timeout * 2);
        };

        self.DownloadPackage = function (e, obj) {
            if (!$(obj).hasClass('disabled')) {
                MC.util.download(obj.href);
            }
            MC.util.preventDefault(e);
        };

        self.includeLabelsSelected = function (isChecked) {
            let labelCategoriesSection = $('.labelCategoriesSection');
            let radioButtons = labelCategoriesSection.find('input[type=radio]');
            if (isChecked) {
                labelCategoriesSection.removeClass('hidden');
                radioButtons.attr('disabled', false);
            }
            else {
                labelCategoriesSection.addClass('hidden');
                radioButtons.attr('disabled', true);
            }
        };

        self.EnableDisableActivateDeactivateButton = function () {
            return function (e) {
                var selected = JSON.parse(e.target.value);
                if (e.target.checked) {
                    var input = {
                        PackageUri: selected.Uri,
                        ModelId: self.ModelId,
                        IsActive: !selected.active,
                        IsUpgradePackage: selected.IsUpgradePackage
                    }
                    if (!selected.active && selected.IsUpgradePackage) {
                        self.IsPopuprequired = true;
                    }
                    if (!self.CheckedPackages.findObject('PackageUri', input.PackageUri)) {
                        self.CheckedPackages.push(input);
                    }
                }
                else {
                    if (!selected.active && selected.IsUpgradePackage) {
                        self.IsPopuprequired = false;
                    }
                    self.CheckedPackages.removeObject('PackageUri', selected.Uri);
                }

                self.ResetActivateDeactivateButton();
            }
        };

        self.ResetActivateDeactivateButton = function () {
            self.CheckedPackages.length > 0 ? $('#btnactivatedeactivate').attr("disabled", false) :
                $('#btnactivatedeactivate').attr("disabled", true);
        };

        //#region Global Setting Package

        self.GetPackageDeleteHtmlAttributes = (data, enable) => {
            let attributes = {};
            attributes.text = Localization.Delete;
            attributes['class'] = 'btn btnDelete';
            attributes.href = kendo.format('{0}?packageUri={1}', self.DeletePackageUri, data.Uri);
            attributes.onclick = 'MC.Models.Packages.DeletePackage(event, this)';

            if (!self.CanDeletePackage(enable, data)) {
                // set disable & clean attributes
                attributes['class'] += ' disabled';
                delete attributes.href;
                delete attributes.onclick;
            }
            return attributes;
        };
        self.DeletePackage = (e, obj) => {
            if (!$(obj).hasClass('disabled')) {
                const confirmMessage = MC.form.template.getRemoveMessage(obj);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    MC.ajax.request({
                        element: obj,
                        type: 'POST'
                    })
                        .done(function () {
                            MC.ajax.reloadMainContent();
                        });
                });
            }
            MC.util.preventDefault(e);
        };
        self.CanDeletePackage = (enable, data) => {
            return enable && !data.RePlaceActivatedModels;
        };
        self.ActivatePackageFromPopup = (e) => {
            const dataParameters = $(e).data('parameters');
            const importPackagePopup = $(_self.ActivatePackagePopupId).data('kendoWindow');

            const element = self.GetElementWithParameter(dataParameters, _self.ModelActivatorValue);

            importPackagePopup.close();
            self.PostPackage(element);
        };
        self.DropdownValuesById = function (id) {
            return $(id).data('kendoDropDownList').value();
        };
        self.GetPackageContentHtml = contents => {
            let html = "";
            contents.forEach(ele => {
                html += "<div class=\"rowPackageContent\">" +
                    "<span>" + ele + "</span>" +
                    "</div>"

            });
            return html;
        };

        self.GetActivatePopupForGlobalPackage = (dataParameters) => {
            MC.ui.popup('setScrollable', {
                element: _self.ActivatePackagePopupId
            });
            const popup = $(_self.ActivatePackagePopupId);

            //Update Model selector
            self.ModelSelectorDropdown(dataParameters);

            //Update content html
            const html = self.GetPackageContentHtml(dataParameters.content.split(',').map(e => e.trim()));
            popup.find('#contentSection').html(html);

            popup.find('.btnSubmit').data('parameters', dataParameters);
        };

        self.ModelSelectorDropdown = (dataParameters) => {
            const models = dataParameters.activatedModel.split(",");
            const dropdownModelElement = $(_self.ActivatePackageFormId).find(_self.PackageModelSelectorId);
            let dropdownValues = [];
            $($("#ModelActivateSelectorHidden")[0].options).each(function () {
                const value = jQuery.parseJSON($(this).val())
                if (dataParameters.isActive || models.includes(value.modelId)) {
                    let drop = {
                        id: value.modelId,
                        name: value.modelId,
                        packageUri: value.packageUri
                    }
                    dropdownValues.push(drop);
                }
            });
            self.SetModelDropdownValue(dropdownValues[0]);
            dropdownModelElement.kendoDropDownList({
                dataSource: dropdownValues,
                dataTextField: "name",
                dataValueField: "id",
                value: dropdownValues[0],
                select: (e) => {
                    self.SetModelDropdownValue(e.dataItem);
                }
            });
        };
        self.SetModelDropdownValue = (value) => {
            _self.ModelActivatorValue = {
                modelId: value.id,
                packageUri: value.packageUri
            }
        };
        self.IsModelPackage = (contents) => {
            const modelItems = ["angles", "labels", "dashboards", "helptexts", "model_authorizations"];
            return contents.some(e => modelItems.includes(e));
        };
        self.GetElementWithParameter = (dataParameters, dropdown) => {
            dataParameters.packageUri = dropdown.packageUri + "/" + dataParameters.packageUri.split("/").pop();
            dataParameters.modelId = dropdown.modelId;
            delete dataParameters.activatedModel;
            delete dataParameters.content;
            return $('<a>')
                .attr('href', self.ManagePackageUri)
                .data('parameters', dataParameters);
        };

        self.SavePackage = function () {
            if (!jQuery('#UploadPackageFileForm').valid()) {
                jQuery('#UploadPackageFileForm .error:first').focus();
                return false;
            }
            if (!jQuery('#file').val())
                return false;

            if (!Modernizr.xhr2)
                MC.ui.loading.setUpload(null);

            let fnCheck = null;
            let xhr = MC.util.ajaxUpload('#UploadPackageFileForm', {
                loader: false,
                timeout: 300000,
                progress: function (e) {
                    MC.ui.loading.setUploadStatus(e.percent);
                },
                successCallback: function () {
                    // upload success or error occured
                    jQuery(MC.ui.loading.loaderCloseButton)
                        .off('click.close')
                        .one('click.close', function () {
                            clearTimeout(fnCheck);
                            MC.ui.loading.clearUpload();
                            MC.ajax.reloadMainContent();
                        });

                    MC.ui.loading.setUploadStatus(100);
                    MC.ui.loading.type = MC.ui.loading.TYPE.normal;

                    fnCheck = setTimeout(function () {
                        MC.ui.loading.clearUpload();
                        MC.ajax.reloadMainContent();
                    }, 1);
                },
                completeCallback: function () {
                    MC.util.ajaxUploadClearInput('#file');
                }
            });

            if (Modernizr.xhr2)
                MC.ui.loading.setUpload(xhr);
        };

        // export package

        // on click open export package form
        self.OpenExportPopup = function () {
            MC.ui.popup('setScrollable', { element: _self.PopupExportPackageId });
            let popup = $(_self.PopupExportPackageId).data('kendoWindow');
            popup.bind('close', function () {
                let validator = $(_self.ExportPackageFormId).validate();
                validator.resetForm();
            });
            self.InitialExportPackageForm();
            self.InitialPackageSelectionForm();
        };

        self.DisableExportPackageSelectionFilter = function (isEnabled) {
            let form = $(_self.ExportPackageFormId);
            let exportPackageSelectionInput = form.find('.packageFilter input[type=checkbox]');
            $(_self.ModelExportSelectorId).data("kendoDropDownList").enable(!isEnabled);
            exportPackageSelectionInput.each(function () {
                $(this).prop('disabled', isEnabled);
            });
        };

        self.DisableExportUrlFilter = function (isEnabled) {
            let form = $(_self.ExportPackageFormId);
            let exportPackageUrlInput = form.find('.packageUrlFilter :input');
            exportPackageUrlInput.each(function () {
                $(this).prop('disabled', isEnabled);
            });
        };

        self.DisableExportUrlorSelectionFilters = function (isEnable) {
            let form = $(_self.ExportPackageFormId);
            let exportPackageSelectionItems = form.find('.packageFilter');
            let exportPackageUlrItems = form.find('.packageUrlFilter');
            self.DisableExportUrlFilter(!isEnable);
            self.DisableExportPackageSelectionFilter(isEnable);
            if (isEnable) {
                exportPackageUlrItems.removeClass('disabled');
                exportPackageSelectionItems.addClass('disabled');
            }
            else {
                exportPackageSelectionItems.removeClass('disabled');
                exportPackageUlrItems.addClass('disabled');
            }
        }

        //export package selection initialize
        self.InitialPackageSelectionForm = function () {
            let form = $(_self.ExportPackageFormId);
            let modelItems = form.find('.packageSelection input[type=radio]');
            let filterItems = form.find('.packageFilter input[type=checkbox]');
            // intial radio buttons
            if (modelItems.length) {
                modelItems.first().trigger('click');
                self.DisableExportUrlorSelectionFilters(true);
                $(_self.ExportPackageCountId).html(Localization.No);
                modelItems.each(function () {
                    $(this).off('change').on('change', function () {
                        if (this.value === "URL") {
                            self.DisableExportUrlorSelectionFilters(true);
                            self.EnableSubmitButton(false);
                        }
                        else {
                            self.DisableExportUrlorSelectionFilters(false);
                            self.InitialPackageSummary(filterItems, 0);
                        }
                    });
                });
            }
        };

        // export package form initialize
        self.InitialExportPackageForm = function () {
            let form = $(_self.ExportPackageFormId);
            form.trigger('reset');
            let filterItems = form.find('.packageFilter input[type=checkbox]');
            let dropdownModelElement = form.find(_self.ModelExportSelectorId);
            let dropdownModel = dropdownModelElement.data("kendoDropDownList");
            if (dropdownModel) {
                dropdownModel.selectedIndex = 0;
            }
            else {
                dropdownModelElement.kendoDropDownList({
                    change: function () {
                        self.InitialPackageSummary(filterItems, 0);
                    }
                });
            }
            // initial checkboxes
            filterItems.prop('checked', true);
            filterItems.prop('disabled', false);
            self.InitialItemExportSelector(filterItems)
                .then(self.InitialExportPackageFilter)
                .done(function () {
                    filterItems = filterItems.filter('.item');
                    self.InitialPackageSummary(filterItems, 0);
                });

            // initial package id field
            self.InitialPackageIdGenerator(form);
        };
        self.InitialPackageIdGenerator = function (form) {
            let packageId = form.find('input[name=package_id]');
            let packageName = form.find('input[name=package_name]');

            // auto generate a package id by package name
            packageName.on('change keyup', function () {
                let context = this;
                let id = $(context).val().replace(/\W*/ig, '');
                packageId.val(id);
            }).trigger('change');
        };

        self.InitialItemExportSelector = function (filterItems) {
            let facetCheckBoxes = filterItems.filter('.facetItem');
            facetCheckBoxes.off('change').on('change', function () {
                // request counting data from server
                self.InitialPackageSummary(filterItems, 0);
            });
            filterItems = filterItems.filter('.item');
            return $.when(filterItems);
        };
        self.InitialExportPackageFilter = function (checkboxes) {
            // start binding event
            checkboxes.off('change').on('change', function (e) {
                // intial event counting items
                self.CheckPublishedCheckbox(e.currentTarget);
                self.InitialPackageSummary(checkboxes, 300);
            });
        };
        self.CheckPublishedCheckbox = function (checkbox) {
            if (checkbox.name === 'has_published') {
                let validatedCheckbox = $('[name=has_validated]');
                validatedCheckbox.prop('checked', checkbox.checked);
                validatedCheckbox.prop('disabled', !checkbox.checked);
            }
        };
        self.InitialPackageSummary = function (checkboxes, delay) {
            // remove existing event
            clearTimeout(timeoutId);

            // add event to timeout id
            timeoutId = setTimeout(function () {

                // create facet query string
                let formData = $(_self.ExportPackageFormId).serializeArray();
                let facetParameters = self.GetFacetParameters(formData);
                let facetQuery = self.GetFacetQueryString(facetParameters);

                // show loading indicator
                let popup = $(_self.PopupExportPackageId).data('kendoWindow');
                let itemIds = self.GetFacetString(formData);
                kendo.ui.progress(popup.element, true);

                // disallow black overlay
                MC.ui.popup('requestStart');

                // start get counting items
                self.GetPackageSummary(itemIds, facetQuery).done(function (itemSummaries) {

                    // binding couting items to elements
                    self.BindingPackageSummary(itemSummaries, checkboxes);

                    // enable - disable submit button
                    self.CheckSubmitButtonState(itemSummaries);

                    // allow black overlay
                    MC.ui.popup('requestEnd');

                    // hide loading indicator
                    kendo.ui.progress(popup.element, false);
                }).fail(function () {
                    MC.ui.popup('close');
                });
            }, delay);
        };
        self.InitExportPostData = function () {
            // create object for sending to the server
            return {
                modelId: '',
                packageId: '',
                packageName: '',
                packageVersion: '',
                packageDescription: '',
                facetQuery: '',
                includeLabels: true
            };
        };
        self.CheckSubmitButtonState = function (itemSummaries) {
            let hasItems = self.HasItems(itemSummaries);
            self.EnableSubmitButton(hasItems);
        };
        self.EnableSubmitButton = function (shouldEnable) {
            if (shouldEnable) {
                $(_self.ExportPackageButtonId).removeClass('disabled');
            }
            else {
                $(_self.ExportPackageButtonId).addClass('disabled');
            }
        }
        self.HasItems = function (itemSummaries) {
            let totalItems = itemSummaries.TotalPrivate + itemSummaries.TotalPublished + itemSummaries.TotalValidated;
            return totalItems > 0;
        };
        self.BindingPackageSummary = function (itemSummaries, checkboxes) {
            checkboxes.each(function () {
                let checkbox = $(this);
                self.SetTotalItemSummaryText(itemSummaries, checkbox);
            });
        };
        self.SetTotalItemSummaryText = function (itemSummaries, checkbox) {
            let checkboxNameWrapper = checkbox.next();
            let checkboxItemSummary = checkboxNameWrapper.children('span');
            let hasEnabled = checkbox.is(':checked') && !checkbox.is(':disabled');

            if (hasEnabled) {
                let totalItems = 0;
                if (checkboxItemSummary.is('.totalPrivate')) {
                    totalItems = itemSummaries.TotalPrivate;
                }
                else if (checkboxItemSummary.is('.totalPublished')) {
                    totalItems = itemSummaries.TotalPublished;
                }
                else if (checkboxItemSummary.is('.totalValidated')) {
                    totalItems = itemSummaries.TotalValidated;
                }

                checkboxItemSummary.text(kendo.format('({0})', totalItems));
                checkboxItemSummary.show();
            }
            else {
                checkboxItemSummary.hide();
            }
        };

        // on click export package
        self.ExportPackage = function () {
            if (self.ExportFormIsValid()) {
                clearTimeout(timeoutId);
                MC.ui.popup('close');
                MC.ui.loading.show();
                MC.ui.loading.handleByUser = true;
                let postData = self.GetExportPostData();
                self.PostExportPackage(postData)
                    .done(self.OnExportPackageSuccess)
                    .fail(self.OnExportPackageComplete);
            }
        };
        self.ExportFormIsValid = function () {
            let isValid = true;
            let form = $(_self.ExportPackageFormId);
            let submitButton = $(_self.ExportPackageButtonId);
            if (!form.valid()) {
                isValid = false;
                MC.form.validator.hideErrorMessage();
                let invalidField = form.find('.error:first');
                invalidField.focus();

                form.off('scroll.validation').on('scroll.validation', function () {
                    MC.form.validator.hideErrorMessage();
                });

                form.find('.error').removeClass('error');
            }
            return isValid && !submitButton.attr('disabled');
        };
        self.GetExportPostData = function () {
            let modelId;
            let form = $(_self.ExportPackageFormId);
            let formData = form.serializeArray();
            let postData = self.InitExportPostData();
            let packageCreationBy = formData.findObject('name', 'packageCreationBy').value;
            let includeLabels, facetQueryString;
            let facetParameters = self.GetFacetParameters(formData);
            if (packageCreationBy === "URL") {
                includeLabels = formData.findObject('name', 'has_Labels');
                let urlParams = self.GetParametersFromURL();
                facetQueryString = urlParams.fq;
                modelId = $.deparam(facetQueryString.replace(/\sAND\s/g, "\&").replace(/:/g, "=").replace(/[()]/g, '')).facetcat_models;
            }
            else {
                includeLabels = formData.findObject('name', 'has_label_categories_and_labels');
                facetQueryString = self.GetFacetQueryString(facetParameters);
                modelId = self.DropdownValuesById(_self.ModelExportSelectorId);

            }
            // data mapping
            postData.modelId = modelId;
            postData.packageId = formData.findObject('name', 'package_id').value;
            postData.packageName = formData.findObject('name', 'package_name').value;
            postData.packageVersion = formData.findObject('name', 'package_version').value;
            postData.packageDescription = formData.findObject('name', 'package_description').value;
            postData.facetQuery = facetQueryString;
            postData.includeLabels = includeLabels ? includeLabels.value : false;

            return postData;
        };

        self.GetFacetParameters = function (formData) {
            let modelId = self.DropdownValuesById(_self.ModelExportSelectorId);
            let itemType = self.GetFacetString(formData);
            return {
                modelId: modelId,
                itemType: itemType,
                includePrivate: formData.hasObject('name', 'has_private'),
                includePublished: formData.hasObject('name', 'has_published'),
                includeValidated: formData.hasObject('name', 'has_validated')
            };
        };
        self.GetFacetQueryString = function (facetParameters) {
            let queryTemplate = 'facetcat_itemtype:({0}) AND facetcat_models:({1}){2}';
            let characteristicsQuery = {
                // 'private,published,validated'
                'true,true,true': '',
                'false,true,true': ' AND (facetcat_characteristics:(facet_isvalidated) -facetcat_characteristics:(facet_isprivate))',
                'true,true,false': ' AND -facetcat_characteristics:(facet_isvalidated)',
                'false,false,true': ' AND (facetcat_characteristics:(facet_isprivate facet_isvalidated) AND -facetcat_characteristics:(facet_isprivate))',
                'true,false,false': ' AND (facetcat_characteristics:(facet_isprivate) AND -facetcat_characteristics:(facet_isvalidated))',
                'false,true,false': ' AND -facetcat_characteristics:(facet_isprivate facet_isvalidated)',
                'false,false,false': ' AND (facetcat_characteristics:(facet_isprivate) AND -facetcat_characteristics:(facet_isprivate facet_isvalidated))'
            };

            let key = kendo.format('{0},{1},{2}', facetParameters.includePrivate, facetParameters.includePublished, facetParameters.includeValidated);
            let fq = kendo.format(queryTemplate, facetParameters.itemType, facetParameters.modelId, characteristicsQuery[key]);
            return fq;
        };

        //Build facet values from checkbox
        self.GetFacetString = function (formData) {
            let characteristicsQuery = {
                'true,true,true': 'facet_angle facet_template facet_dashboard',
                'false,true,true': 'facet_template facet_dashboard',
                'true,true,false': 'facet_angle facet_template',
                'true,false,true': 'facet_angle facet_dashboard',
                'false,false,true': 'facet_dashboard',
                'true,false,false': 'facet_angle',
                'false,true,false': 'facet_template',
                'false,false,false': ' '
            };
            let facetAngle = formData.hasObject('name', 'has_facet_angle');
            let facetTemplate = formData.hasObject('name', 'has_facet_template');
            let facetDashboard = formData.hasObject('name', 'has_facet_dashboard');
            let key = kendo.format('{0},{1},{2}', facetAngle, facetTemplate, facetDashboard);
            return characteristicsQuery[key];
        };

        // callback after export package
        self.OnExportPackageSuccess = function (response) {
            switch (response.Status) {
                case 'ready':
                    self.DownloadExportPackage(response.FileUrl);
                    self.OnExportPackageComplete();
                    break;

                case 'failed':
                    MC.util.showPopupAlert(Localization.MC_TaskFailed);
                    self.OnExportPackageComplete();
                    break;

                default:
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(function () {
                        self.GetExportPackageStatus(response.ItemUrl)
                            .done(self.OnExportPackageSuccess)
                            .fail(self.OnExportPackageComplete);
                    }, 2000);
                    break;
            }
        };
        self.OnExportPackageComplete = function () {
            MC.ui.loading.handleByUser = false;
            MC.ui.loading.hide(true);
        };

        // ajax request
        self.GetPackageSummary = function (itemIds, facetQuery) {
            let requestParams = {
                url: self.GetPackageSummaryUri,
                parameters: {
                    itemIds: itemIds,
                    facetQueryString: facetQuery
                },
                type: 'GET'
            };

            return MC.ajax.request(requestParams);
        };
        self.GetExportPackageStatus = function (itemUri) {
            let requestParams = {
                url: self.GetExportPackageStatusUri,
                parameters: {
                    itemUri: itemUri
                },
                type: 'GET'
            };

            return MC.ajax.request(requestParams);
        };
        self.PostExportPackage = function (parameters) {
            let requestParams = {
                url: self.PostExportPackageUri,
                parameters: parameters,
                type: 'POST'
            };

            return MC.ajax.request(requestParams);
        };

        // get export package file
        self.DownloadExportPackage = function (fileUri) {
            let url = kendo.format('{0}?packageFileUri={1}&{2}', self.DownloadPackageUri, fileUri, ValidationRequestService.getVerificationTokenAsQueryString());
            window.location = url;
        };

        self.CreatejQueryObject = function (paramString) {
            return $.deparam(paramString);
        };

        self.GetParametersFromURL = function () {
            let form = $(_self.ExportPackageFormId);
            let formData = form.serializeArray();
            let url = formData.findObject('name', 'package_export_url').value;
            let paramString = url.split('?')[1];
            let urlParameters = self.CreatejQueryObject(paramString);
            let facetHasError = 'AND -facetcat_characteristics:(facet_has_errors)';
            let fqValues = $.deparam(urlParameters.fq.replace(/\sAND\s/g, "\&").replace(/:/g, "="));
            if (!fqValues.facetcat_models) {
                let modelId = self.DropdownValuesById(_self.ModelExportSelectorId);
                facetHasError = kendo.format('AND facetcat_models:({0}) {1}', modelId, facetHasError)
            }
            urlParameters.fq = kendo.format('{0} {1}', urlParameters.fq, facetHasError)
            return urlParameters;
        };

        self.PackageUrlError = function () {
            $(_self.ExportPackageCountId).html(Localization.No);
            $(_self.ExportPackageFormId).find('.packageUrlFilter input[type=text]').focus();
        };

        self.CheckPackageURL = function () {
            let form = $(_self.ExportPackageFormId);
            if (form.valid()) {
                let fqParams = self.GetParametersFromURL();
                let fqValues = $.deparam(fqParams.fq.replace(/\sAND\s/g, "\&").replace(/:/g, "="));
                let facetcat_itemtype = 'facet_angle facet_template facet_dashboard';
                if (fqValues.facetcat_itemtype) {
                    facetcat_itemtype = fqValues.facetcat_itemtype.replace(/[()]/g, '')
                }
                self.GetPackageSummary(facetcat_itemtype, fqParams.fq).done(function (response) {
                    let totalCount = response.TotalPublished + response.TotalPrivate;
                    $(_self.ExportPackageCountId).html(totalCount === 0 ? Localization.No : totalCount);
                    // enable - disable submit button
                    self.CheckSubmitButtonState(response);
                }).fail(function () {
                    $(_self.ExportPackageCountId).html(Localization.No);
                    self.EnableSubmitButton(false);
                });
            }
            else {
                self.PackageUrlError();
            }
        }

        //#endregion

        $(document).on('change', 'input[name="IsSelected"]', self.EnableDisableActivateDeactivateButton());
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Packages: new Packages()
    });

})(window, MC.Models);
