(function (win, users) {

    function UserDefaultSettings() {
        var self = this;
        self.SaveUri = '';
        self.SelectedBusinessProcesses = [];
        self.BusinessProcessesData = [];
        self.BusinessProcessesHandler = null;

        self.Initial = function (data) {
            self.SaveUri = '';
            self.SelectedBusinessProcesses = [];
            self.BusinessProcessesData = [];
            self.BusinessProcessesHandler = null;

            jQuery.extend(self, data || {});

            setTimeout(function () {

                $('#GeneralDecimalSeperatorDropdown').kendoDropDownList();
                $('#GeneralThousandSeperatorDropdown').kendoDropDownList();
                $('#DefaultLanguages').kendoDropDownList();
                $('#DecimalsNumbers').kendoDropDownList();
                $('#DecimalsNumbersPrefix').kendoDropDownList();
                $('#DecimalsCurrencies').kendoDropDownList();
                $('#DecimalsCurrenciesPrefix').kendoDropDownList();
                $('#DecimalsPercentages').kendoDropDownList();
                $('#DecimalsPercentagesPrefix').kendoDropDownList();
                $('#DefaultExportLines').kendoDropDownList();
                $('#DefaultEnum').kendoDropDownList();
                $('#DefaultPeriod').kendoDropDownList();             
                $('#FormatLocale').kendoDropDownList();
                $('#DateOrderDropdown').kendoDropDownList();
                $('#DateDayDropdown').kendoDropDownList();
                $('#DateMonthDropdown').kendoDropDownList();
                $('#DateYearDropdown').kendoDropDownList();
                $('#DateSeparatorDropdown').kendoDropDownList();
                $('#TimeHourFormatDropdown').kendoDropDownList();
                $('#TimeSeparatorDropdown').kendoDropDownList();

                self.InitialBusinessProcesses();

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.InitialBusinessProcesses = function () {
            var bpUserDefaultSelecting = {};
            jQuery.each(self.BusinessProcessesData, function (index, bp) {
                bp.is_allowed = true;
            });
            jQuery.each(self.SelectedBusinessProcesses, function (index, bp) {
                bpUserDefaultSelecting[bp] = true;
            });
            self.BusinessProcessesHandler = new BusinessProcessesViewModel(self.BusinessProcessesData);
            self.BusinessProcessesHandler.CurrentActive(bpUserDefaultSelecting);
            self.BusinessProcessesHandler.MultipleActive(true);
            self.BusinessProcessesHandler.ApplyHandler('#UserDefaulBusinessProcess');
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {
                'default_language': $('#DefaultLanguages').val(),
                'default_currency': $('#DefaultCurrency').val(),
                'format_numbers': JSON.stringify({'decimals': parseInt($('#DecimalsNumbers').val()), 'prefix': $('#DecimalsNumbersPrefix').val() == "" ? null : $('#DecimalsNumbersPrefix').val(), 'thousandseparator': $('#DecimalsNumbersThousandSeparator').is(':checked') }), 
                'format_currencies': JSON.stringify({'decimals': parseInt($('#DecimalsCurrencies').val()), 'prefix': $('#DecimalsCurrenciesPrefix').val() == "" ? null: $('#DecimalsCurrenciesPrefix').val(), 'thousandseparator': $('#DecimalsCurrenciesThousandSeparator').is(':checked') }), 
                'format_percentages': JSON.stringify({ 'decimals': parseInt($('#DecimalsPercentages').val()), 'prefix': $('#DecimalsPercentagesPrefix').val() == "" ? null : $('#DecimalsPercentagesPrefix').val(), 'thousandseparator': $('#DecimalsPercentagesThousandSeparator').is(':checked') }),
                'default_export_lines': parseInt($('#DefaultExportLines').val()),
                'sap_fields_in_chooser': $('#sap_fields_in_chooser').is(':checked'),
                'sap_fields_in_header': $('#sap_fields_in_header').is(':checked'),
                'default_Starred_Fields': $('#default_Starred_Fields').is(':checked'),
                'default_Suggested_Fields': $('#default_Suggested_Fields').is(':checked'),
                'compressed_list_header': $('#compressed_list_header').is(':checked'),
                'compressed_bp_bar': $('#compressed_bp_bar').is(':checked'),
                'default_business_processes': self.BusinessProcessesHandler.GetActive(),
                'auto_execute_items_on_login': $('#auto_execute_items_on_login').is(':checked'),
                'format_enum': $('#DefaultEnum').val(),
                //'format_period': $('#DefaultPeriod').val(),
                'format_locale': $('#FormatLocale').val(),
                'general_decimal_seperator': $('#GeneralDecimalSeperatorDropdown').val(),
                'general_thousand_seperator': $('#GeneralThousandSeperatorDropdown').val(),              
                'format_time': JSON.stringify({ hour: $('#TimeHourFormatDropdown').val(), separator: $('#TimeSeparatorDropdown').val() }),
                'format_date': JSON.stringify({ order: $('#DateOrderDropdown').val(), day: $('#DateDayDropdown').val(), month: $('#DateMonthDropdown').val(), year: $('#DateYearDropdown').val(), separator: $('#DateSeparatorDropdown').val() })
            };

            return data;
        };

        self.SaveUserDefaultSetting = function () {
            MC.form.clean();

            if (!jQuery('#UserDefaultsSettingForm').valid()) {
                $('#UserDefaultsSettingForm .error:first').focus();
                return false;
            }

            var data = self.GetData();

            MC.ajax.request({
                type: "POST",
                url: self.SaveUri,
                parameters: {
                    userDefaultsSettingsData: JSON.stringify(data)
                },
                ajaxSuccess: function (metadata, data, status, xhr) {
                    MC.ajax.reloadMainContent();
                }
            });
            return false;
        };
    }

    win.MC.Users = users || {};
    jQuery.extend(win.MC.Users, {
        UserDefaultSettings: new UserDefaultSettings()
    });

})(window, MC.Users);
