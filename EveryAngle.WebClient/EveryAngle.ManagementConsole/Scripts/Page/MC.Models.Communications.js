(function (win, models) {

    function Communications() {
        var self = this;
        self.SaveUri = '';
        self.ModelUri = '';

        self.Initial = function (data) {
            self.SaveUri = '';
            self.ModelUri = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};

            data.companyInformationData = {
                "contact": $('#CompanyInformation_contact').val(),
                "address": $('#CompanyInformation_address').val(),
                "city": $('#CompanyInformation_city').val(),
                "country": $('#CompanyInformation_country').val(),
                "telephone": $('#CompanyInformation_telephone').val(),
                "email": $('#CompanyInformation_email').val()                
                //"": $('#').val()
            };

            data.emailSettingsData = {
                //"smtp_server": $('#EmailSettings_smtp_server').val(),
                "sender": $('#EmailSettings_sender').val(),
                //"username": $('#EmailSettings_username').val(),
                //"password": $('#EmailSettings_password').val(),
                "recipients": $('#EmailSettings_ReOrderrecipients').val().split(','),
                "send_logs_frequency": $('#EmailSettings_send_system_logs_frequency_hours').val(),
                "attach_logfiles": $('#EmailSettings_attach_logfiles').is(":checked")
            };

            return data;
        };

        self.SaveModelCommunication = function () {
            MC.form.clean();            
            if (!$('#CompanyInformationForm').valid() || !$('#EmailSettingsForm').valid()) {
                $('#CompanyInformationForm,#EmailSettingsForm').find('.error:first').focus();
                return false;
            }

            var data = self.GetData();

            MC.ajax.request({
                url: self.SaveUri,
                parameters: { modelUri: self.ModelUri, companyInformationsData: JSON.stringify(data.companyInformationData), emailSettingsData: JSON.stringify(data.emailSettingsData) },
                type: 'POST'
            })
            .done(function () {
                MC.ajax.reloadMainContent();
            });
            return false;
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        Communications: new Communications()
    });

})(window, MC.Models);
