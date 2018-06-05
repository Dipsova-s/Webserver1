(function (win, globalSettings) {

    function Languages() {
        var self = this;
        self.DeleteList = [];
        self.SaveUri = '';
        self.AllLanguages = [];

        self.Initial = function (data) {
            self.DeleteList = [];
            self.AllLanguages = [];
            jQuery.extend(self, data || {});

            self.AllLanguages.splice(0, 0, {
                Name: Localization.PleaseSelect,
                Uri: ''
            });

            setTimeout(function () {
                var grid = jQuery('#AvailableLanguagesGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.GridDataBound);
                    grid.trigger('dataBound');
                }

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.GetCleanLanguageUri = function (uri) {
            return $.trim(uri).replace(webAPIUrl.toLowerCase(), '');
        };

        self.DeletionCheckMark = function (obj, isRemove) {
            var data = $(obj).data('parameters');
            var languageUri = self.GetCleanLanguageUri(data.languageUri);
            var index = $.inArray(languageUri, self.DeleteList);
            if (isRemove) {
                if (index === -1) {
                    self.DeleteList.push(languageUri);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteList.splice(index, 1);
                }
            }
        };

        self.GridDataBound = function (e) {
            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('a[data-parameters$="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });

                MC.form.page.resetInitialData();
            }, 1);
        };

        self.AddNewLanguageCallback = function (row) {

            //check if not have language in option
            if (self.AllLanguages.length <= 1) {
                MC.util.showPopupAlert(Localization.MC_AvailableLanguagesActive);
                $('#AvailableLanguagesGrid tr').last().remove();
            }
            else {
                var data = JSON.parse(JSON.stringify(self.AllLanguages));
                row.find('input').kendoDropDownList({
                    dataSource: { data: data },
                    dataTextField: 'Name',
                    dataValueField: 'Uri'
                });
            }
        };

        self.GetData = function () {
            MC.form.clean();
            var languagesData = [];
            $('#AvailableLanguagesGrid').find('tbody').find('tr').each(function (index) {
                var isNew = $(this).hasClass('newRow');
                var languageUri = self.GetCleanLanguageUri($(this).find("input[name=uri]").val());
                if (languageUri) {
                    var row;
                    var isMarkAsRemove = isNew ? false : $(this).hasClass('rowMaskAsRemove');
                    var langName = $.trim(isNew ? $(this).find('.k-input').text() : $(this).find("td:first").text());
                    if (isMarkAsRemove) {
                        row = { 'Uri': languageUri, 'Enabled': false, 'Name': langName };
                        var index = $.inArray(languageUri, self.DeleteList);
                        if (index !== -1)
                            self.DeleteList.splice(index, 1);
                    }
                    else {
                        row = { 'Uri': languageUri, 'Enabled': true, 'Name': langName };
                    }
                    languagesData.push(row);
                }
            });

            if (self.DeleteList.length) {
                for (var i = 0; i < self.DeleteList.length; i++) {
                    var row = { 'Uri': self.DeleteList[i], 'Enabled': false };
                    languagesData.push(row);
                }
            }

            return {
                languages: languagesData
            };

        };

        self.SaveLanguageSettings = function () {
            
            MC.form.clean();

            if (!jQuery('#LanguageSettingsForm').valid()) {
                setTimeout(function () {
                    $('#errorContainer .error:first').show();
                }, 1);
                return false;
            }
            var languagesData = self.GetData();

            MC.ajax.request({
                type: "POST",
                url: self.SaveUri,
                parameters: {
                    languagesData: JSON.stringify(languagesData.languages)
                }
            })
            .fail(function () {
                $('#loading .loadingClose').one('click.close', MC.ajax.reloadMainContent);
            })
            .done(function (data, status, xhr) {
                if (data.removedData.length > 0 || !($.isEmptyObject(data.un_removeData))) {
                    var text = '';
                    if (data.removedData.length > 0) {
                        text += '<p>' + Localization.MC_RemovedLanguagesList + '</p>'
                        $.each(data.removedData, function (index, item) {
                            text += '<p>' + item + '</p>'
                        });
                    }
                    if (!$.isEmptyObject(data.un_removeData)) {
                        text += '<p>' + Localization.MC_UnRemovedLanguagesList + '</p>'
                        $.each(data.un_removeData, function (key, value) {
                            text += '<p>' + key + ', ' + value + '</p>'
                        });
                    }

                    MC.util.showPopupOK(Localization.MC_DeletedLanguagesTitle, text, "MC.ajax.reloadMainContent()");
                }
                else {
                    MC.ajax.reloadMainContent();
                }
            });
            return false;
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        Languages: new Languages()
    });

})(window, MC.GlobalSettings);
