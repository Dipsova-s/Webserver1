(function (win, globalSettings) {

    function Authentication() {
        var self = this;
        self.AllAuthenticationProviderUri = '';
        self.SaveUri = '';
        self.SaveAuthenticationProviderUri = '';
        self.SystemRolesData = [];
        self.SystemAuthenticationProviderData = [];

        self.Initial = function (data) {
            self.SaveUri = '';
            self.SaveAuthenticationProviderUri = '';
            self.SystemRolesData = [];
            self.SystemAuthenticationProviderData = [];

            jQuery.extend(self, data || {});

            setTimeout(function () {
                $('#AuthenticationProviderTypesSelect').width(300).kendoDropDownList();
                if (!self.SaveAuthenticationProviderUri) {
                    MC.form.page.init(self.GetData);
                }
                else {
                    var defaultRoles = self.SystemAuthenticationProviderData.default_roles || [];
                    var defaultRolesValue = [];
                    $.each(defaultRoles, function (idx, item) {
                        if (item.ModelId)
                            defaultRolesValue.push({ role: item.RoleId, value: item.ModelId + ":" + item.RoleId, tooltip: item.ModelId + " model role" });
                        else
                            defaultRolesValue.push({ role: item.RoleId, value: item.RoleId, tooltip: "System role" });
                    });

                    var systemRolesValue = [];
                    $.each(self.SystemRolesData, function (idx, item) {
                        if (item.ModelId)
                            systemRolesValue.push({ role: item.RoleId, value: item.ModelId + ":" + item.RoleId, tooltip: item.ModelId + " model role" });
                        else
                            systemRolesValue.push({ role: item.RoleId, value: item.RoleId, tooltip: "System role" });
                    });

                    $("#DefaultSystemRoles").kendoMultiSelect({
                        dataTextField: "role",
                        dataValueField: "value",
                        dataSource: systemRolesValue,
                        itemTemplate: '<span data-tooltip-title="#: tooltip #">#: role # </span>',
                        tagTemplate: '<span title="#: tooltip #">#: role #</span>',
                        change: function (e) {
                            e.sender.element.valid();
                        },
                        value: defaultRolesValue
                    });
                }
            }, 1);
        };

        self.DeleteAuthenticationProvider = function (e, obj) {
            var confirmMessage = MC.form.template.getRemoveMessage(obj);

            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    element: obj,
                    type: 'Delete'
                })
                .done(function () {
                    MC.ajax.reloadMainContent();
                });
            });
            MC.util.preventDefault(e);
        };

        self.ShowCreateNewAuthenticationProviderTypesPopup = function () {
            MC.ui.popup('setScrollable', {
                element: '#popupAuthenticationProviderTypes'
            });
            var win = $('#popupAuthenticationProviderTypes').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });

        };

        self.CreateNewAuthentication = function (e, obj) {

            $(obj).data('parameters', {
                authenticationProviderUri: '',
                AuthenticationProviderTypesUri: jQuery('#AuthenticationProviderTypesSelect').val()
            });
            MC.util.redirect(e, obj);
        };

        self.SaveAuthenticationProvider = function () {
            var formAuthenticationProvider = $('#formAuthenticationProvider');
            if (!$('#formAuthenticationProvider').valid()) {
                $('#formAuthenticationProvider .error:first').focus();
                return false;
            }

            MC.form.clean();

            var data = {};
            var default_roles_data = [];
            $.each(formAuthenticationProvider.find('[name="DefaultSystemRoles"]').val(), function (idx, item) {
                var roleInfo = item.split(':');
                if (roleInfo[1])
                    default_roles_data.push({ role_id: roleInfo[1], model_id: roleInfo[0] });
                else
                    default_roles_data.push({ role_id: roleInfo[0] });
            });
            data.authenticationProvider = {
                'id': formAuthenticationProvider.find('[name="Id"]').val(),
                'description': formAuthenticationProvider.find('[name="Description"]').val(),
                'is_enabled': formAuthenticationProvider.find('[name="is_enabled"]').is(':checked'),
                'auto_create_users': formAuthenticationProvider.find('[name="auto_create_users"]').is(':checked'),
                'domain_name': formAuthenticationProvider.find('[name="domain_name"]').val(),
                'target': formAuthenticationProvider.find('[name="target"]').val(),
                'sync_roles_to_groups': formAuthenticationProvider.find('[name="sync_roles_to_groups"]').is(':checked'),
                'identity': formAuthenticationProvider.find('[name="identity"]').val(),
                'type': formAuthenticationProvider.find('[name="authenticationProviderTypes"]').val(),
                'default_roles': default_roles_data,
                'container': formAuthenticationProvider.find('[name="container"]').val(),
                'identity_provider_issuer': formAuthenticationProvider.find('[name="identityProviderIssuer"]').val(),
                'identity_provider_single_sign_on_url': formAuthenticationProvider.find('[name="identityProviderSingleSignOnUrl"]').val(),
                'identity_provider_certificate_string': formAuthenticationProvider.find('[name="identityProviderCertificateString"]').val()
            };

            var isNew = $('input[name=Id]').is('[readonly]') === false ? true : false;
            MC.ajax.request({
                url: self.SaveAuthenticationProviderUri,
                parameters: { isNewAuthenticationProvider: isNew, authenticationProviderData: JSON.stringify(data.authenticationProvider), updateAuthenticationProviderUri: formAuthenticationProvider.find('[name="Uri"]').val() },
                type: 'POST'
            })
            .done(function () {
                location.hash = self.AllAuthenticationProviderUri;
            });
            return false;
        };

        self.SaveAll = function () {
            MC.form.clean();
            if (!jQuery('#SystemSettingsForm').valid()) {
                $('#SystemSettingsForm .error:first').focus();
                return false;
            }
            var data = self.GetData();

            MC.ajax.request({
                type: "POST",
                url: self.SaveUri,
                parameters: {
                    systemSettingsData: JSON.stringify(data.systemSettings),
                    authenticationProviderData: JSON.stringify(data.authenticationProvider)
                }
            })
            .done(function () {
                MC.ajax.reloadMainContent();
            });
            return false;
        };

        self.GetData = function () {
            MC.form.clean();

            var defaultProvider = '';
            var trustedWebservers = $('#ReFormatTrustedWebservers').val().split(',');

            var authenticationProviderData = [];
            $('#SystemAuthenticationGrid .k-grid-content tr').each(function (k, provider) {
                if ($(provider).find('[name="IsDefaultProvider"]').is(':checked')) {
                    defaultProvider = $(provider).find('[name="IsDefaultProvider"]').val();
                }
                authenticationProviderData.push({
                    'uri': $(provider).find('[name="IsEnabled"]').val(),
                    'is_enabled': $(provider).find('[name="IsEnabled"]').is(':checked')
                });
            });

            var systemSettingsData = {
                'default_authentication_provider': defaultProvider,
                'trusted_webservers': trustedWebservers
            };

            return {
                systemSettings: systemSettingsData,
                authenticationProvider: authenticationProviderData
            };
        };

        self.CheckIsDefault = function (obj) {
            if ($(obj).parents('tr:first').find('input[type=radio]').is(':checked')) {
                obj.checked = !obj.checked;
            }
            else {
                $(obj).parents('tr:first').find('input[type=radio]').removeAttr('disabled');
            }
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        Authentication: new Authentication()
    });

})(window, MC.GlobalSettings);
