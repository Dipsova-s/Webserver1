(function (win, models) {

    function License() {
        var self = this;

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.GetData = function() {
            // only use for check data is change or not

            MC.form.clean();

            var data = {};
            data.licenseData = jQuery('#AddLicenseFileForm').serializeArray();
            data.licenseFile = $('#fileAttached').val();

            return data;
        };

        self.SaveLicenseFile = function () {
            MC.form.clean();

            if (!jQuery('#AddLicenseFileForm').valid()) {
                jQuery('#AddLicenseFileForm .error:first').focus();
                return false;
            }

            if (!$('#fileAttached').val()) {
                MC.ui.loading.showAndHide();
                return false;
            }

            MC.util.ajaxUpload('#AddLicenseFileForm',
            {
                successCallback: function () {
                    MC.ajax.reloadMainContent();
                }
            });
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        License: new License()
    });

})(window, MC.Models);
