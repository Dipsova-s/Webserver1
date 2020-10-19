(function (win, globalSettings) {

    function SystemSettings() {
        var self = this;
        self.SaveUri = '';

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.SaveSystemSettings = function (recipient) {

            MC.form.clean();
            if (!jQuery('#SystemSettingsForm').valid()) {
                $('#SystemSettingsForm .error:first').focus();
                return false;
            }
            var recipientData = null;
            if (recipient) {
                var win = $('#TestEmailPopup').data('kendoWindow');
                if (win) {
                    win.close();
                }

                jQuery.localStorage('test_recipient', recipient);

                recipientData = JSON.stringify({ "recipient": recipient });
                $('#btnShowTestEmailResult').trigger('click');
                jQuery('#TestEmailResult').prev().find('.k-i-close').hide();
                jQuery('#TestEmailResult').busyIndicator(true);

                jQuery('#TestEmailResult h3, #TestEmailResult pre').empty();

                MC.ui.popup('requestStart');
            }
            var data = self.GetData();

            MC.ajax.request({
                type: "POST",
                url: self.SaveUri,
                parameters: { systemSettingsData: JSON.stringify(data.systemSettings), recipient: recipientData }
            })
                .fail(function () {
                    var win = $('#TestEmailResult').data('kendoWindow');
                    if (win) {
                        win.close();
                    }
                })
                .done(function (data) {
                    jQuery.when(MC.ajax.reloadMainContent())
                        .done(function () {
                            if (recipient) {
                                MC.ui.popup('requestEnd');

                                MC.ui.popup();
                                $('#btnShowTestEmailResult').trigger('click');

                                var response = JSON.parse(data);
                                var title = response.success ? Localization.MC_TestResultSuccessful : Localization.MC_TestResultFailure;
                                var message = '';
                                if (!response.success) {
                                    message += response.result;
                                    if (response.log) {
                                        message += '\n\nTechnical info.\n' + response.log.join('\n');
                                    }
                                }
                                jQuery('#TestEmailResult h3').text(title);
                                jQuery('#TestEmailResult pre').html(message);
                                jQuery('#TestEmailResult').prev().find('.k-i-close').show();
                            }
                        });
                });
            return false;
        };

        self.ShowTestEmailSettingsPopup = function () {
            if (!jQuery('#SystemSettingsForm').valid()) {
                $('#TestEmailButton').addClass('disabled');
                setTimeout(function () {
                    $('#TestEmailButton').removeClass('disabled');
                }, 1);

                $('#SystemSettingsForm .error:first').focus();
                return false;
            }

            MC.form.validator.init('#TestEmailForm');
            $('#TestEmailForm').submit(function (e) {
                $('#TestEmailPopup .btnPrimary').trigger('click');
                e.preventDefault();
            });

            $('#EmailSettings_recipient').val(jQuery.localStorage('test_recipient') || '');
        };

        self.TestEmailSettings = function () {
            MC.form.clean();
            if (!jQuery('#TestEmailForm').valid()) {
                $('#TestEmailForm .error:first').focus();
                return false;
            }
            var recipient = $('#EmailSettings_recipient').val();
            self.SaveSystemSettings(recipient);
        };

        self.GetData = function () {
            MC.form.clean();

            var sessionExpiryMinutes = $('#session_expiry_minutes').val();
            var modelserverCheckSeconds = $('#modelserver_check_seconds').val();
            var defaultCacheMinutes = $('#default_cache_minutes').val();
            var minLabelcategoriesToPublish = $('#min_labelcategories_to_publish').val();
            var checkExpiredEessionsMinutes = $('#check_expired_sessions_minutes').val();
            var instancesPerModel = $('#instances_per_model').val();
            var isAutoCreateUsers = $('#auto_create_users').is(':checked');
            var defaultSystemRoles = $('#DefaultSystemRoles').val();
            var defaultPagesize = $('#default_pagesize').val();
            var maxPagesize = $('#max_pagesize_appserver').val();
            var directorySizeLimit = $('#active_directory_size_limit').val();
            var defaultMaxExportPageSize = $('#default_max_export_page_size').val();
            var rememberExpiredSessionsMinutes = $('#remember_expired_sessions_minutes').val();
            var modelserverTimeout = $('#modelserver_timeout').val();
            var modelserverMetadataTimeout = $('#modelserver_metadata_timeout').val();
            var maxDomainelementsForSearch = $('#max_domainelements_for_search').val();
            var smtpServer = $('#EmailSettings_smtp_server').val();
            var smtpPort = $('#EmailSettings_smtp_port').val();
            var smtpSender = $('#EmailSettings_smtp_sender').val();
            var ssl = $('#smtp_use_ssl').is(':checked');
            var username = $('#EmailSettings_username').val();
            var password = $('#EmailSettings_password').val();
            var maxGeneralHistory = $('#max_general_history').val();
            var maxAuditLogHistory = $('#max_audit_log_history').val();
            var allowGroupingInPivotExcelExport = $('#allow_grouping_in_pivot_excel_export').is(':checked');
            var includeSelfInExportHeaders = $('#include_self_in_export_headers').is(':checked');
            var scriptLocation = $('#script_location').val();
            var fallbackFieldLength = $('#fallback_field_length').val();
            var defaultApprovalState = $('#default_approval_state').val();
            var logLevel = $('#log_level').val();

            var emailSettings = {
                "smtp_server": smtpServer,
                "smtp_user": username,
                "smtp_password": password,
                "smtp_use_ssl": ssl,
                "smtp_port": smtpPort,
                "smtp_sender": smtpSender
            };

            var systemSettingsData = {
                'session_expiry_minutes': sessionExpiryMinutes,
                'modelserver_check_seconds': modelserverCheckSeconds,
                'default_cache_minutes': defaultCacheMinutes,
                'min_labelcategories_to_publish': minLabelcategoriesToPublish,
                'check_expired_sessions_minutes': checkExpiredEessionsMinutes,
                'instances_per_model': instancesPerModel,
                'auto_create_users': isAutoCreateUsers,
                'default_system_roles': defaultSystemRoles,
                'default_pagesize': defaultPagesize,
                'max_pagesize': maxPagesize,
                'remember_expired_sessions_minutes': rememberExpiredSessionsMinutes,
                'modelserver_timeout': modelserverTimeout,
                'modelserver_metadata_timeout': modelserverMetadataTimeout,
                'max_domainelements_for_search': maxDomainelementsForSearch,
                'email_settings': emailSettings,
                'active_directory_size_limit': directorySizeLimit,
                'max_general_history': maxGeneralHistory,
                'max_audit_log_history': maxAuditLogHistory,
                'allow_grouping_in_pivot_excel_export': allowGroupingInPivotExcelExport,
                'include_self_in_export_headers': includeSelfInExportHeaders,
                'default_max_export_page_size': defaultMaxExportPageSize,
                'script_location': scriptLocation,
                'fallback_field_length': fallbackFieldLength,
                'default_approval_state': defaultApprovalState,
                'log_level': logLevel
            };

            return {
                systemSettings: systemSettingsData
            };
        };

        self.DetectSMTPPortValue = function (context) {
            var defaultPort = 25;
            if (!context.value()) {
                context.value(defaultPort);
            }
        };

    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        SystemSettings: new SystemSettings()
    });

})(window, MC.GlobalSettings);
