(function (win, globalSettings) {

    function WebClientSettings() {
        var self = this;
        self.SaveUri = '';

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.SaveWebClientSettings = function () {
            MC.form.clean();
            if (!jQuery('#WebClientSettingsForm').valid()) {

                setTimeout(function () {
                    $('#errorContainer .error:first').show();
                }, 1);

                return false;
            }

            var data = self.GetData();
            MC.ajax.request({
                type: "POST",
                url: self.SaveUri,
                parameters: {
                    webClientSettingsData: JSON.stringify(data)
                }
            })
                .done(function () {
                    MC.ajax.reloadMainContent();
                });
            return false;
        };

        self.GetData = function () {
            MC.form.clean();
            var ajaxTimeoutExpirationInSeconds = $('#AjaxTimeoutExpirationInSeconds').val();
            var showAngleAndDisplayID = $('#ShowAngleAndDisplayID').is(':checked');
            var maxNumberOfMassChangeItems = $('#MaxNumberOfMassChangeItems').val();
            var maxNumberOfDashboard = $('#MaxNumberOfDashboard').val();
            var showErrorSourceUri = $('#ShowErrorSourceUri').is(':checked');
            var enableOptimizations = $('#EnableOptimizations').is(':checked');
            var maxLogFileNumber = $('#MaxLogFileNumber').val();
            var maxLogFileSize = $('#MaxLogFileSize').val();
            var dashboardRefreshIntervalTime = $('#DashboardRefreshIntervalTime').val();
            var googleAnalyticsId = $.trim($('#GoogleAnalyticsId').val());

            var webClientSettingsData = {
                'AjaxTimeoutExpirationInSeconds': ajaxTimeoutExpirationInSeconds,
                'ShowAngleAndDisplayID': showAngleAndDisplayID,
                'MaxNumberOfMassChangeItems': maxNumberOfMassChangeItems,
                'MaxNumberOfDashboard': maxNumberOfDashboard,
                'ShowErrorSourceUri': showErrorSourceUri,
                'EnableOptimizations': enableOptimizations,
                'MaxLogFileNumber': maxLogFileNumber,
                'MaxLogFileSize': maxLogFileSize,
                'DashboardRefreshIntervalTime': dashboardRefreshIntervalTime,
                'GoogleAnalyticsId': googleAnalyticsId
            };

            return webClientSettingsData;
        };

    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        WebClientSettings: new WebClientSettings()
    });

})(window, MC.GlobalSettings);
