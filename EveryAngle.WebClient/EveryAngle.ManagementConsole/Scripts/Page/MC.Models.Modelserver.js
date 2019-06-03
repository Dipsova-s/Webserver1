(function (win, models) {

    function ModelServer() {
        var self = this;
        self.SaveUri = '';
        self.DeleteUri = '';
        self.ModelUri = '';
        self.DeleteList = [];

        /* begin - all modelserver page */
        self.InitialAllModelServer = function (data) {
            self.SaveUri = '';
            self.ModelUri = '';
            self.DeleteUri = '';
            self.DeleteList = [];

            jQuery.extend(self, data || {});

            setTimeout(function () {
                self.InitialModelServerGrid();

                MC.form.page.init(self.GetAllModelServerData);
            }, 1);
        };
        self.InitialModelServerGrid = function () {
            self.DeleteList = [];

            var grid = jQuery('#ModelServerGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.GridDataBound);
                grid.trigger('dataBound');
            }
        };
        self.AddModelServerCallback = function (row) {
            row.find('select').kendoDropDownList();
        };
        self.GetAllModelServerData = function () {
            MC.form.clean();

            var data = {};
            data.modelUri = self.ModelUri;
            data.deleteList = self.DeleteList.slice();
            data.newData = [];
            $('#ModelServerGrid tbody tr.newRow').each(function (k, v) {
                newData.push({
                    id: jQuery('[name="modelServerId"]', v).val(),
                    model: jQuery('input[name="model"]', v).val(),
                    type: jQuery('[name="serverType"]', v).val(),
                    server_uri: jQuery('[name="serverUri"]', v).val()
                });
            });

            return data;
        };
        self.DownloadModelServerMetaData = function (e, obj) {
            var jsondata = jQuery.parseJSON(obj.dataset.parameters);
            var fullPath = jQuery.base64.encode(jsondata.modelServerUri);
            var modelServerId = jsondata.modelServerId;
            var url = kendo.format(
                '{0}?fullPath={1}&modelServerId={2}&instanceid={3}',
                webModelServersDownloadUrl,
                fullPath,
                modelServerId,
                jsondata.modelServerInstanceid);
            $(location).attr('href', url);
        };

        self.ShowModelServerInfo = function (e, obj) {
            MC.util.modelServerInfo.showInfoPopup(e, obj);
        };
        self.AbortServer = function (uri) {
            MC.util.showPopupAlert(Localization.Resource.MC_NotImplemented);
        };
        self.DeletionCheckMark = function (obj, isRemove) {
            var data = $(obj).data('parameters');

            var index = $.inArray(data.modelServerUri, self.DeleteList);
            if (isRemove) {
                if (index === -1) {
                    self.DeleteList.push(data.modelServerUri);
                }
            }
            else {
                if (index !== -1) {
                    self.DeleteList.splice(index, 1);
                }
            }
        };
        self.GridDataBound = function (e) {
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].id);
            });

            setTimeout(function () {
                jQuery.each(self.DeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('a[data-parameters*="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);
        };
        /* end - all modelserver page */

        /* begin - modelserver setting page */
        self.AgentUri = '';

        self.InitialModelServerSettings = function (data) {
            self.SaveUri = '';
            self.AgentUri = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {
                var ddlEnabler;
                jQuery('input:text.enabler').each(function (index, element) {
                    ddlEnabler = jQuery(element).data('kendoDropDownList');
                    if (ddlEnabler) {
                        ddlEnabler.trigger('change');
                    }
                });

                self.SetCustomValidator();

                MC.form.page.init(self.GetData);
            }, 1);
        };
        self.SetCustomValidator = function () {
            // do nothing
        };
        self.EnablerValueChange = function (e) {
            MC.form.validator.hideErrorMessage();
            var selectedItem = e.sender.dataItem();
            jQuery('.' + e.sender.element.attr('id')).hide();
            jQuery('.' + selectedItem.id).show();
        };
        self.GetData = function () {
            var pushSettingToList = function (setting) {
                if (setting.id === 'switchWhenPostprocessing')
                    data.switchWhenPostprocessing = setting.value;
                else
                    data.settingList.push(setting);
            };

            MC.form.clean();
            var data = {
                switchWhenPostprocessing: null,
                settingList: []
            };

            jQuery('.content .contentSectionInfoItem').each(function (index, element) {
                var inputs = jQuery(this).find("input[type!='hidden']");
                var input, i, dropdown;
                for (i = 0; i < inputs.length; i++) {
                    input = jQuery(inputs[i]);
                    var setting = { 'id': input.attr('id'), 'value': null, 'type': null };
                    if (setting.id && !data.settingList.hasObject('id', setting.id)) {
                        if (input.hasClass('enum')) {
                            dropdown = input.data("kendoDropDownList");
                            setting.value = dropdown.value();
                            setting.type = 'enum';
                            pushSettingToList(setting);
                        }
                        else if (input.hasClass('currency_symbol')) {
                            dropdown = input.data("kendoDropDownList");
                            setting.value = dropdown.value();
                            setting.type = 'currency_symbol';
                            pushSettingToList(setting);
                        }
                        else if (input.hasClass('boolean')) {
                            setting.value = input.is(":checked");
                            setting.type = 'boolean';
                            pushSettingToList(setting);
                        }
                        else if (input.hasClass('date')) {
                            var currentTime = new Date(input.val());
                            var utcTime = currentTime.toString() === 'Invalid Date' ? '0' : kendo.toString(currentTime, 'yyyyMMdd');
                            setting.value = parseInt(utcTime);
                            setting.type = 'date';
                            pushSettingToList(setting);

                        }
                        else if (input.hasClass('double')) {
                            setting.value = parseFloat(input.val());
                            if (isNaN(setting.value)) setting.value = null;
                            setting.type = 'double';

                            if (setting.value !== null) {
                                pushSettingToList(setting);
                            }
                        }
                        else if (input.hasClass('integer')) {
                            setting.value = parseInt(input.val());
                            if (isNaN(setting.value)) setting.value = null;
                            setting.type = 'integer';

                            if (setting.value !== null) {
                                pushSettingToList(setting);
                            }
                        }
                        else if (input.hasClass('percentage')) {
                            dropdown = input.data("kendoPercentageTextBox");
                            setting.value = parseFloat(dropdown.value());
                            if (isNaN(setting.value)) setting.value = null;
                            setting.type = 'percentage';

                            if (setting.value !== null) {
                                pushSettingToList(setting);
                            }
                        }
                        else if (input.hasClass('text') || input.hasClass('password') || input.hasClass('email')) {
                            setting.value = input.val();
                            setting.type = 'text';
                            pushSettingToList(setting);

                        }
                    }
                }
            });
            return data;
        };
        self.ValidEmailInput = function (elementId) {
            var isvalid = true;
            var element = jQuery(elementId);
            if (element.length > 0) {
                if (!element.valid()) {
                    element.find('.error').first().focus();
                    return false;
                }
            }
            return isvalid;
        };
        self.ValidCopyMethod = function (elementId) {
            var isvalid = true;
            var element = jQuery(elementId).prev();
            if (element.length > 0) {
                if (element.is(':hidden')) {
                    var target = element.parents('.copy_method');
                    var copyMethod = $.trim(target.attr('class').replace('contentSectionInfoSubItem', '').replace('copy_method', ''));
                    var ddlCopyMethod = $('#copy_method').data('kendoDropDownList');
                    if (ddlCopyMethod) {
                        ddlCopyMethod.value(copyMethod);
                        ddlCopyMethod.trigger('change');
                    }
                }
                if (!element.valid()) {
                    $('#mainContent').scrollTop($('#mainContent').scrollTop() + $('#row-copy_method').position().top);
                    setTimeout(function () { element.valid(); }, 1);
                    return false;
                }
            }
            return isvalid;
        };
        self.SaveServerSettings = function () {
            if (!self.ValidEmailInput('#company_settings'))
                return false;

            if (!self.ValidEmailInput('#email_settings'))
                return false;

            if (!self.ValidEmailInput('#sap_settings'))
                return false;

            var data = self.GetData();

            MC.ajax.request({
                url: self.SaveUri,
                type: 'PUT',
                parameters: {
                    modelUri: self.ModelUri,
                    agentUri: self.AgentUri,
                    settingList: JSON.stringify(data.settingList),
                    switchWhenPostprocessing: data.switchWhenPostprocessing
                }
            })
                .done(function () {
                    MC.ajax.reloadMainContent();
                });

            return false;
        };
        /* end - modelserver setting page */

        /* begin - modelserver Content parameters page */
        self.CollapsibleExpandable = function (elementId) {
            var configIconElementSection = $(elementId).children();
            var configElementSection = $(elementId).next();
            if (configElementSection.is(':visible')) {
                configElementSection.hide();
                configIconElementSection.attr('class', 'k-icon k-i-expand');
            }
            else {
                configElementSection.show();
                configIconElementSection.attr('class', 'k-icon k-i-collapse');
            }
        };
        /* end - modelserver Content parameters page */
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        ModelServer: new ModelServer()
    });

})(window, MC.Models);
