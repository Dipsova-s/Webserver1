(function (win, angleExports) {

    function ExcelTemplates() {
        var self = this;

        self.GetAllExcelTemplateUri = '';
        self.AllDatastoreUri = '';
        self.EditDatastoreUri = '';
        self.DefaultDatastoreUri = '';

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#ExcelTemplatesGrid').data('kendoGrid');
                if (grid) {
                    MC.util.updateTimezoneColumnName('ExcelTemplatesGrid', 'Modified', 'a');
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

        self.UploadExcelFile = function () {
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

        self.ShowDeletePopup = function (e, obj) {
            if (!$(obj).hasClass('disabled')) {
                var filename = self.GetTemplateName(obj);
                if (self.GetDatastoreCount(obj)) {
                    self.GetDatstoreDetails(filename);
                }
                else if (self.GetDisplayCount(obj)) {
                    self.GetDisplayPopupMessage(obj);
                }
                else {
                    var confirmMessage = MC.form.template.getRemoveMessage(obj);
                    self.CallDeleteExcelPopup(obj, confirmMessage);
                }
            }
            MC.util.preventDefault(e);
        };
        self.GetTemplateName = function (obj) {
            var reference = jQuery(obj).parents('tr:first').children('td').eq(jQuery(obj).data('delete-field-index') || 0);
            var referenceForm = reference.find('input:visible,select,textarea');
            var referenceText = MC.util.encodeHtml(jQuery.trim(referenceForm.length ? referenceForm.is('select') ? referenceForm.find('option:selected').text() : referenceForm.val() : reference.text()));
            return referenceText;
        };
        self.GetDatastoreCount = function (obj) {
            var reference = jQuery(obj).parents('tr:last').children('td').eq(6);
            var referenceForm = reference.find('input');
            var referenceText = MC.util.encodeHtml(jQuery.trim(referenceForm.length ? referenceForm.is('select') ? referenceForm.find('option:selected').text() : referenceForm.val() : reference.text()));
            return referenceText | 0;
        };
        self.GetDatstoreDetails = function (filename) {
            MC.ajax.request({
                url: self.AllDatastoreUri,
                parameters: {
                    fileName: filename
                },
                type: 'POST'
            }).
                done(function (result) {
                    self.GetDatastorePopupMessage(result);
                });
        };
        self.GetDisplayCount = function (obj) {
            var reference = jQuery(obj).parents('tr:last').children('td').eq(5);
            var referenceForm = reference.find('input');
            var referenceText = MC.util.encodeHtml(jQuery.trim(referenceForm.length ? referenceForm.is('select') ? referenceForm.find('option:selected').text() : referenceForm.val() : reference.text()));
            return referenceText | 0;
        };

        self.GetDisplayPopupMessage = function (obj) {
            var template = "<div>This Excel template is in use by " + self.GetDisplayCount(obj) + " Display(s).<br><br>" +
                "Are you sure you want to delete this Excel template ?<div>";
            self.CallDeleteExcelPopup(obj, template);
        };

        self.GetDatastorePopupMessage = function (datastore) {
            var template = "<div> This Excel template cannot be deleted, because it is in use by these datastore(s): </div><br>";
            template += '<div class="k-auto-scrollable" data-role="resizable">' +
                '<table role=\"grid\">';
            $.each(datastore, function (index, setting) {
                template += "<tr>" +
                    "<td role =\"gridcell\" class=\"PopupExcelTemplate\">" +
                    "<span class=\"\" data-tooltip-title=\"" + setting.name + "\" data-type=\"html\">" + setting.name + "</span>" +
                    "</td>" +
                    "<td role=\"gridcell\">";
                if (setting.is_default)
                    template += '<a class="btnOpenWindowPopup" href=\'' + self.DefaultDatastoreUri + '\' />';
                else
                    template += '<a href =\'' + self.EditDatastoreUri + '?parameters={"datastoreUri":"' + setting.Uri + '","pluginUri":"","plugin":"msexcel"}\' class="btnOpenWindowPopup" onclick="MC.util.redirect(event, this) data-parameters={}"</a>';
                template+="</td>" +
                        "<tr>"
            });
            template += "</table></div>";
            MC.util.showPopupOK(Localization.Warning_Title, template, "", 500, 200);
        };

        self.CallDeleteExcelPopup = function (obj, confirmMessage) {
            MC.util.showPopupConfirmation(confirmMessage, function () {
                self.DeleteExcelTemplate(obj);
            });
        };

        self.DeleteExcelTemplate = function (obj) {
            MC.ajax.request({
                element: obj,
                type: 'POST'
            })
                .done(function () {
                    MC.ajax.reloadMainContent();
                });
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