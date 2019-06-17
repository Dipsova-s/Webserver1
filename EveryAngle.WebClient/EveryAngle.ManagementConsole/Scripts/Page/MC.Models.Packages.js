(function (win, models) {

    function Packages() {
        var self = this;
        self.ModelId = '';
        self.ShowPackageErrorMessageUri = '';
        self.ManagePackageUri = '';
        self.DownloadPackageUri = '';

        self.PACKAGE_STATUS = {
            ACTIVATING: 'Activating',
            DEACTIVATING: 'Deactivating'
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

        self.GetPackageButtonsTemplate = function (data, enable) {
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
                        attributes['data-width'] = '400';
                        attributes['data-height'] = '360';
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
            return data.active && data.active_version === data.Version;
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
        };

        self.PackagesGridFilter = function () {
            $('#PackagesGridFilterBox').data('defaultValue', '***********').trigger('keyup');
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

        self.PostPackageFailureCallback = function () {
            $('#loading .loadingClose').one('click.close', function () {
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
                location.href = obj.href;
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
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Packages: new Packages()
    });

})(window, MC.Models);
