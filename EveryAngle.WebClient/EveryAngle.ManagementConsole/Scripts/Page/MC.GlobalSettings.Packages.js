(function (win, globalSettings) {

    function Packages() {
        var self = this;
        var timeoutId;

        self.SaveUri = '';
        self.GetPackageSummaryUri = '';
        self.GetExportPackageStatusUri = '';
        self.PostExportPackageUri = '';
        self.DownloadPackageUri = '';

            self.PopupExportPackageId = '#PopupExportPackage';
        self.ExportPackageFormId = '#ExportPackageForm';
        self.ItemExportSelectorId = '#ItemExportSelector';
        self.ModelExportSelectorId = '#ModelExportSelector';
        self.ExportPackageButtonId = '#ExportPackageButton';
        self.ExportPackageCountId = '#ExportPackageCount';

        self.Initial = function (data) {
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

                setTimeout(function () {
                    MC.form.page.setCustomState(MC.form.page.STATE.SERVER, function () {
                        var grid = jQuery('#PackageGrid').data('kendoGrid');
                        return {
                            selector: '#PackageGrid',
                            query: {
                                page: grid ? grid.dataSource.page() || 1 : 1,
                                sort: grid ? grid.dataSource.sort() || [] : [],
                                q: encodeURIComponent(jQuery('#GlobalPackagesGridFilterBox').val() || '')
                            }
                        };
                    }, function (state) {
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
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Name);
            });
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

        self.SavePackage = function () {
            if (!jQuery('#UploadPackageFileForm').valid()) {
                jQuery('#UploadPackageFileForm .error:first').focus();
                return false;
            }
            if (!jQuery('#file').val())
                return false;

            if (!Modernizr.xhr2)
                MC.ui.loading.setUpload(null);

            var fnCheck = null;
            var xhr = MC.util.ajaxUpload('#UploadPackageFileForm', {
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

        self.DeletePackage = function (e, obj) {
            if (!$(obj).hasClass('disabled')) {
                var confirmMessage = MC.form.template.getRemoveMessage(obj);
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

        self.DownloadPackage = function (e, obj) {
            if (!$(obj).hasClass('disabled')) {
                location.href = obj.href + "&" + ValidationRequestService.getVerificationTokenAsQueryString();
            }
            MC.util.preventDefault(e);
        };

        self.PackagesGridBeforeFilter = function (grid) {
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
            grid.dataSource.transport.options.read.url = sourceUrl + '?' + jQuery.param(query);
        };

        self.PackagesGridFilter = function () {
            $('#GlobalPackagesGridFilterBox').data('defaultValue', '***********').trigger('keyup');
        };



        // export package

        // on click open export package form
        self.OpenExportPopup = function () {
            MC.ui.popup('setScrollable', { element: self.PopupExportPackageId });
            var popup = $(self.PopupExportPackageId).data('kendoWindow');
            popup.bind('close', function () {
                var validator = $(self.ExportPackageFormId).validate();
                validator.resetForm();
            });
            self.InitialExportPackageForm();
            self.InitialPackageSelectionForm();
        };

        self.DisableExportPackageSelectionFilter = function (isEnabled) {
            var form = $(self.ExportPackageFormId);
            var exportPackageSelectionInput = form.find('.packageFilter input[type=checkbox]');
            $(self.ModelExportSelectorId).data("kendoDropDownList").enable(!isEnabled);
            $(self.ItemExportSelectorId).data("kendoDropDownList").enable(!isEnabled);
            exportPackageSelectionInput.each(function () {
                $(this).prop('disabled', isEnabled);
            });
        };

        self.DisableExportUrlFilter = function (isEnabled) {
            var form = $(self.ExportPackageFormId);
            var exportPackageUrlInput = form.find('.packageUrlFilter :input');
            exportPackageUrlInput.each(function () {
                $(this).prop('disabled', isEnabled);
            });
        };

        self.DisableExportUrlorSelectionFilters = function (isEnable) {
            var form = $(self.ExportPackageFormId);
            var exportPackageSelectionItems = form.find('.packageFilter');
            var exportPackageUlrItems = form.find('.packageUrlFilter');
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
            var form = $(self.ExportPackageFormId);
            var modelItems = form.find('.packageSelection input[type=radio]');
            var filterItems = form.find('.packageFilter input[type=checkbox]');
            // intial radio buttons
            if (modelItems.length) {
                modelItems.first().trigger('click');
                self.DisableExportUrlorSelectionFilters(true);
                $(self.ExportPackageCountId).html(Localization.No);
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
            var form = $(self.ExportPackageFormId);
            form.trigger('reset');
            var filterItems = form.find('.packageFilter input[type=checkbox]');
            var dropdownModelElement = form.find(self.ModelExportSelectorId);
            var dropdownModel = dropdownModelElement.data("kendoDropDownList");
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
            filterItems = filterItems.filter('.item');
            self.InitialItemExportSelector(form, filterItems)
                .then(self.InitialExportPackageFilter)
                .done(function () {
                    self.InitialPackageSummary(filterItems, 0);
                });

            // initial package id field
            self.InitialPackageIdGenerator(form);
        };
        self.InitialPackageIdGenerator = function (form) {
            var packageId = form.find('input[name=package_id]');
            var packageName = form.find('input[name=package_name]');

            // auto generate a package id by package name
            packageName.on('change keyup', function () {
                var context = this;
                var id = $(context).val().replace(/\W*/ig, '');
                packageId.val(id);
            }).trigger('change');
        };
        self.InitialItemExportSelector = function (form, filterItems) {
            var dropdownElement = form.find(self.ItemExportSelectorId);
            var dropdown = dropdownElement.data("kendoDropDownList");
            if (dropdown) {
                dropdown.selectedIndex = 0;
            }
            else {
                dropdownElement.kendoDropDownList({
                    change: function () {
                        // request counting data from server
                        self.InitialPackageSummary(filterItems, 0);
                    }
                });
            }

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
                var validatedCheckbox = $('[name=has_validated]');
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
                var formData = $(self.ExportPackageFormId).serializeArray();
                var facetParameters = self.GetFacetParameters(formData);
                var facetQuery = self.GetFacetQueryString(facetParameters);

                // show loading indicator
                var popup = $(self.PopupExportPackageId).data('kendoWindow');
                var itemIds = self.DropdownValuesById(self.ItemExportSelectorId);
                kendo.ui.progress(popup.element, true);

                // disallow black overlay
                MC.ui.popup('requestStart');

                // start get counting items
                self.GetPackageSummary(itemIds,facetQuery).done(function (itemSummaries) {

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
            var hasItems = self.HasItems(itemSummaries);
            self.EnableSubmitButton(hasItems);
        };
        self.EnableSubmitButton = function (shouldEnable) {
            if (shouldEnable) {
                $(self.ExportPackageButtonId).removeClass('disabled');
            }
            else {
                $(self.ExportPackageButtonId).addClass('disabled');
            }
        }
        self.HasItems = function (itemSummaries) {
            var totalItems = itemSummaries.TotalPrivate + itemSummaries.TotalPublished + itemSummaries.TotalValidated;
            return totalItems > 0;
        };
        self.BindingPackageSummary = function (itemSummaries, checkboxes) {
            checkboxes.each(function () {
                var checkbox = $(this);
                self.SetTotalItemSummaryText(itemSummaries, checkbox);
            });
        };
        self.SetTotalItemSummaryText = function (itemSummaries, checkbox) {
            var checkboxNameWrapper = checkbox.next();
            var checkboxItemSummary = checkboxNameWrapper.children('span');
            var hasEnabled = checkbox.is(':checked') && !checkbox.is(':disabled');

            if (hasEnabled) {
                var totalItems = 0;
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
                var postData = self.GetExportPostData();
                self.PostExportPackage(postData)
                    .done(self.OnExportPackageSuccess)
                    .fail(self.OnExportPackageComplete);
            }
        };
        self.ExportFormIsValid = function () {
            var isValid = true;
            var form = $(self.ExportPackageFormId);
            var submitButton = $(self.ExportPackageButtonId);
            if (!form.valid()) {
                isValid = false;
                MC.form.validator.hideErrorMessage();
                var invalidField = form.find('.error:first');
                invalidField.focus();

                form.off('scroll.validation').on('scroll.validation', function () {
                    MC.form.validator.hideErrorMessage();
                });

                form.find('.error').removeClass('error');
            }
            return isValid && !submitButton.attr('disabled');
        };
        self.GetExportPostData = function () {
            var form = $(self.ExportPackageFormId);
            var formData = form.serializeArray();
            var postData = self.InitExportPostData();
            var packageCreationBy = formData.findObject('name', 'packageCreationBy').value;
            var includeLabels, facetQueryString;
            var facetParameters = self.GetFacetParameters(formData);
            var modelId = self.DropdownValuesById(self.ModelExportSelectorId);
            if (packageCreationBy === "URL") {
                includeLabels = formData.findObject('name', 'has_Labels');
                var urlParams = self.GetParametersFromURL();
                facetQueryString = urlParams.fq;
            }
            else {
                includeLabels = formData.findObject('name', 'has_label_categories_and_labels');
                facetQueryString = self.GetFacetQueryString(facetParameters);

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

        self.DropdownValuesById = function (id) {
            return $(id).data('kendoDropDownList').value();
        }

        self.GetFacetParameters = function (formData) {
            var modelId = self.DropdownValuesById(self.ModelExportSelectorId);
            var itemType = self.DropdownValuesById(self.ItemExportSelectorId);
            return {
                modelId: modelId,
                itemType: itemType,
                includePrivate: formData.hasObject('name', 'has_private'),
                includePublished: formData.hasObject('name', 'has_published'),
                includeValidated: formData.hasObject('name', 'has_validated')
            };
        };
        self.GetFacetQueryString = function (facetParameters) {
            var queryTemplate = 'facetcat_itemtype:({0}) AND facetcat_models:({1}){2}';
            var characteristicsQuery = {
                // 'private,published,validated'
                'true,true,true': '',
                'false,true,true': ' AND (facetcat_characteristics:(facet_isvalidated) -facetcat_characteristics:(facet_isprivate))',
                'true,true,false': ' AND -facetcat_characteristics:(facet_isvalidated)',
                'false,false,true': ' AND (facetcat_characteristics:(facet_isprivate facet_isvalidated) AND -facetcat_characteristics:(facet_isprivate))',
                'true,false,false': ' AND (facetcat_characteristics:(facet_isprivate) AND -facetcat_characteristics:(facet_isvalidated))',
                'false,true,false': ' AND -facetcat_characteristics:(facet_isprivate facet_isvalidated)',
                'false,false,false': ' AND (facetcat_characteristics:(facet_isprivate) AND -facetcat_characteristics:(facet_isprivate facet_isvalidated))'
            };

            var key = kendo.format('{0},{1},{2}', facetParameters.includePrivate, facetParameters.includePublished, facetParameters.includeValidated);
            var fq = kendo.format(queryTemplate, facetParameters.itemType, facetParameters.modelId, characteristicsQuery[key]);
            return fq;
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
        self.GetPackageSummary = function (itemIds,facetQuery) {
            var requestParams = {
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
            var requestParams = {
                url: self.GetExportPackageStatusUri,
                parameters: {
                    itemUri: itemUri
                },
                type: 'GET'
            };

            return MC.ajax.request(requestParams);
        };
        self.PostExportPackage = function (parameters) {
            var requestParams = {
                url: self.PostExportPackageUri,
                parameters: parameters,
                type: 'POST'
            };

            return MC.ajax.request(requestParams);
        };

        // get export package file
        self.DownloadExportPackage = function (fileUri) {
            var url = kendo.format('{0}?packageFileUri={1}&{2}', self.DownloadPackageUri, fileUri, ValidationRequestService.getVerificationTokenAsQueryString());
            window.location = url;
        };

        self.CreatejQueryObject = function (paramString) {
            return $.deparam(paramString);
        };

        self.GetParametersFromURL = function () {
            var form = $(self.ExportPackageFormId);
            var formData = form.serializeArray();
            var url = formData.findObject('name', 'package_export_url').value;
            var paramString = url.split('?')[1];
            var urlParameters = self.CreatejQueryObject(paramString);
            var facetHasError = 'AND -facetcat_characteristics:(facet_has_errors)';
            var fqValues = $.deparam(urlParameters.fq.replace(/\sAND\s/g, "\&").replace(/:/g, "="));
            if (!fqValues.facetcat_models) {
                var modelId = self.DropdownValuesById(self.ModelExportSelectorId);
                facetHasError = kendo.format('AND facetcat_models:({0}) {1}', modelId, facetHasError)
            }
            urlParameters.fq = kendo.format('{0} {1}', urlParameters.fq, facetHasError)
            return urlParameters;
        };

        self.PackageUrlError = function () {
            $(self.ExportPackageCountId).html(Localization.No);
            $(self.ExportPackageFormId).find('.packageUrlFilter input[type=text]').focus();
        };

        self.CheckPackageURL = function () {
            var form = $(self.ExportPackageFormId);
            if (form.valid()) {
                var fqParams = self.GetParametersFromURL();
                var fqValues = $.deparam(fqParams.fq.replace(/\sAND\s/g, "\&").replace(/:/g, "="));
                var facetcat_itemtype = 'facet_angle facet_template facet_dashboard';
                if (fqValues.facetcat_itemtype) {
                    facetcat_itemtype = fqValues.facetcat_itemtype.replace(/[()]/g, '')
                }
                self.GetPackageSummary(facetcat_itemtype, fqParams.fq).done(function (response) {
                    var totalCount = response.TotalPublished + response.TotalPrivate;
                    $(self.ExportPackageCountId).html(totalCount === 0 ? Localization.No : totalCount);
                    // enable - disable submit button
                    self.CheckSubmitButtonState(response);
                }).fail(function () {
                    $(self.ExportPackageCountId).html(Localization.No);
                    self.EnableSubmitButton(false);
                });
            }
            else {
                self.PackageUrlError();
            }
        }
    
        // export package

    };

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        Packages: new Packages()
    });

})(window, MC.GlobalSettings);
