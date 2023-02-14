(function (win, models) {

    function Packages() {
        var self = this;
        self.ModelId = '';
        self.ShowPackageErrorMessageUri = '';
        self.ManagePackageUri = '';
        self.DownloadPackageUri = '';
        self.ManageMultiplePackagesUri = '';
        self.IsMultiSelect = false;
        self.IsPopuprequired = false;
        self.CheckedPackages = [];

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
                    MC.util.updateTimezoneColumnName('PackageGrid', 'CreatedDate', 'a');
                    MC.util.updateTimezoneColumnName('PackageGrid', 'activated.Created', 'span');
                    MC.util.updateTimezoneColumnName('PackageGrid', 'deactivated.Created', 'span');
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
                    MC.util.updateTimezoneColumnName('PackagesHistoryGrid', 'start_time', 'span');
                    MC.util.updateTimezoneColumnName('PackagesHistoryGrid', 'end_time', 'span');
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

            return actionButton + downloadButton;
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
                    '\{"packageUri":"{0}", "isActive": {1}, "modelId":"{2}", "isUpgradePackage":{3}\}',
                    data.Uri,
                    !data.active,
                    self.ModelId,
                    data.IsUpgradePackage
                );

                if (self.CanDeactivatePackage(data)) {
                    // can deactivate package
                    attributes['class'] = 'btn btnSetInactive';
                    attributes.href = self.ManagePackageUri;
                    attributes.text = Localization.Deactivate;
                    attributes['data-delete-template'] = Localization.MC_ConfirmDeactivatePackage;
                }
                else {
                    // can activate/update package
                    attributes['class'] = 'btn btnSetActive';
                    attributes.title = Localization.MC_ActivatePackage;

                    if (data.IsUpgradePackage) {
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
            return data.active && data.active_version === data.Version || data.status === self.PACKAGE_STATUS.ACTIVATIONFAILED;
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
                setTimeout(function() {
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
            var dataParameters = $(element).data('parameters');
            if (dataParameters.isActive && dataParameters.isUpgradePackage) {
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
                var confirmMessage = MC.form.template.getRemoveMessage(element);
                MC.util.showPopupConfirmation(confirmMessage, function () {
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
            var requestParams = {
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
            var timeout = 150;

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
            var labelCategoriesSection = $('.labelCategoriesSection');
            var radioButtons = labelCategoriesSection.find('input[type=radio]');
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

        $(document).on('change', 'input[name="IsSelected"]', self.EnableDisableActivateDeactivateButton());
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Packages: new Packages()
    });

})(window, MC.Models);
