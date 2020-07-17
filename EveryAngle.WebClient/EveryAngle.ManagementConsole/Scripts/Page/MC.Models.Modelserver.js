(function (win, models) {

    function ModelServer() {
        var self = this;
        self.SaveUri = '';
        self.DeleteUri = '';
        self.ModelUri = '';
        self.DeleteList = [];

        /* begin - all modelserver page */
        self.AbortServer = function () {
            MC.util.showPopupAlert(Localization.Resource.MC_NotImplemented);
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
            MC.form.clean();
            var data = {
                switchWhenPostprocessing: null,
                settingList: []
            };
            var pushSettingToList = function (setting) {
                if (setting.id === 'switchWhenPostprocessing')
                    data.switchWhenPostprocessing = setting.value;
                else
                    data.settingList.push(setting);
            };

            jQuery('.content .contentSectionInfoItem').each(function () {
                var inputs = jQuery(this).find("input[type!='hidden']");
                var input, i, dropdown;
                for (i = 0; i < inputs.length; i++) {
                    input = jQuery(inputs[i]);
                    var setting = { 'id': input.attr('id'), 'value': null, 'type': null };
                    if (setting.id && !data.settingList.hasObject('id', setting.id)) {
                        if (input.hasClass('enum')) {
                            dropdown = input.data("handler");
                            setting.value = dropdown.value();
                            setting.type = 'enum';
                            pushSettingToList(setting);
                        }
                        else if (input.hasClass('currency_symbol')) {
                            dropdown = input.data("handler");
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
                            if (isNaN(setting.value))
                                setting.value = null;
                            setting.type = 'double';

                            if (setting.value !== null) {
                                pushSettingToList(setting);
                            }
                        }
                        else if (input.hasClass('integer')) {
                            setting.value = parseInt(input.val());
                            if (isNaN(setting.value))
                                setting.value = null;
                            setting.type = 'integer';

                            if (setting.value !== null)
                                pushSettingToList(setting);
                        }
                        else if (input.hasClass('percentage')) {
                            dropdown = input.data("kendoPercentageTextBox");
                            setting.value = parseFloat(dropdown.value());
                            if (isNaN(setting.value))
                                setting.value = null;
                            setting.type = 'percentage';

                            if (setting.value !== null)
                                pushSettingToList(setting);
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
            var element = jQuery(elementId);
            if (element.length && !element.valid()) {
                element.find('.error').first().focus();
                return false;
            }
            return true;
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
            if (!self.ValidEmailInput('#company_settings')
                || !self.ValidEmailInput('#email_settings')
                || !self.ValidEmailInput('#sap_settings'))
                return false;

            var data = self.GetData();

            MC.ajax
                .request({
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
