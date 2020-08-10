(function (win, angleExports) {

    function ExcelTemplates() {
        var self = this;

        self.GetAllExcelTemplateUri = '';

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#ExcelTemplatesGrid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.ExcelGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);

        };

        self.ExcelGridDataBound = function (e) {
            MC.ui.localize();
            MC.ui.btnGroup();
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].File);
            });
        };

        // ajax request
        self.GetAllExcelTemplate = function () {
            var requestParams = {
                url: self.GetAllExcelTemplateUri,
                type: 'POST'
            };

            return MC.ajax.request(requestParams);
        };

        self.UploadExcelFile = function() {
            if (!Modernizr.xhr2)
                MC.ui.loading.setUpload(null);

            var fnCheck = null;
            var xhr = MC.util.ajaxUpload('#UploadExcelTemplateFileForm', {
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

        self.SaveExcelTemplates = function () {
            if (!jQuery('#UploadExcelTemplateFileForm').valid()) {
                jQuery('#UploadExcelTemplateFileForm .error:first').focus();
                return false;
            }
            var fileLocation = jQuery('#file').val();
            if (!fileLocation)
                return false;

            var popupMessage = Localization.MC_ReplaceDuplicateExcelFile;
            var fileName = fileLocation.split("\\").pop();
            if (fileName !== "") {
                self.GetAllExcelTemplate().done(function (response) {
                    var isFileExistInServer = false, isFileDefault = false;
                    $.each(response.Data, function (key, value) {
                        if (value.File === fileName) {
                            isFileExistInServer = true;
                            if (value.IsDefaultFile) {
                                isFileDefault = true;
                                popupMessage = Localization.MC_ReplaceNotAllowedForStandardExcel;
                                return false;
                            }
                            return false;
                        }
                    })
                    if (isFileDefault) {
                        MC.util.showPopupAlert(popupMessage);
                    }
                    else if (isFileExistInServer && !isFileDefault) {
                        MC.util.showPopupConfirmation(popupMessage, self.UploadExcelFile);
                    }
                    else {
                        self.UploadExcelFile();
                    }
                }).fail(function () {
                    return false;
                });
            }
        };

        self.DeleteExcelTemplate = function (e, obj) {
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

        self.DownloadExcelTemplate = function (e, obj) {
            if (!$(obj).hasClass('disabled')) {
                MC.util.download(obj.href);
            }
            MC.util.preventDefault(e);
        };
    };

    win.MC.AngleExports = angleExports || {};
    jQuery.extend(win.MC.AngleExports, {
        ExcelTemplates: new ExcelTemplates()
    });

})(window, MC.AngleExports);