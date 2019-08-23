var privilegesViewModel = new PrivilegesViewModel();

function PrivilegesViewModel() {
    "use strict";

    //BOF: View model properties
    var self = this;
    self.IsLoaded = ko.observable(false);
    self.DirectoryName = 'model_privileges';
    //** kept current user detail after login **
    self.Data = ko.observableArray();
    self.PRIVILEGESTATUS = {
        DENY: { Value: 0, Text: Localization.PrivilegeStatusDeny, Code: 'deny' },
        VIEW : { Value: 1, Text: Localization.PrivilegeStatusView, Code: 'view' },
        ASSIGN: { Value: 2, Text: Localization.PrivilegeStatusAssign, Code: 'assign' },
        MANAGE: { Value: 3, Text: Localization.PrivilegeStatusManage, Code: 'manage' },
        VALIDATE: { Value: 4, Text: Localization.PrivilegeStatusValidate, Code: 'validate' }
    };
    //EOF: View model properties

    // storage
    if (jQuery.localStorage(self.DirectoryName) !== null) {
        self.IsLoaded(true);
        self.Data(jQuery.localStorage(self.DirectoryName));
    }

    if (jQuery.localStorage(userModel.UserPrivilegeName) !== null) {
        userModel.Privileges = jQuery.localStorage(userModel.UserPrivilegeName);
    }

    //BOF: View model methods
    self.Load = function (forced) {
        forced = WC.Utility.ToBoolean(forced);
        if (!forced && self.IsLoaded()) {
            return self.Data();
        }

        /* M4-11442: Use privileges in session */
        var privilegeUri = directoryHandler.ResolveDirectoryUri(sessionModel.Data()[self.DirectoryName]);

        var privilegeParams = {};
        privilegeParams[enumHandlers.PARAMETERS.CACHING] = false;
        privilegeParams[enumHandlers.PARAMETERS.OFFSET] = 0;
        privilegeParams[enumHandlers.PARAMETERS.LIMIT] = systemSettingHandler.GetMaxPageSize();
        return GetDataFromWebService(privilegeUri, privilegeParams)
            .done(self.LoadSuccess);
    };
    self.LoadSuccess = function (data) {
        userModel.Privileges.ModelPrivileges = data.model_privileges.slice(0);
        jQuery.localStorage(userModel.UserPrivilegeName, userModel.Privileges);
        self.Data(data.model_privileges);
        jQuery.localStorage(self.DirectoryName, self.Data());
        self.IsLoaded(true);
    };
    self.IsValidAuthorizedModel = function (modelId, privilegeName) {
        var isValid = false;
        var models = jQuery.grep(self.Data(), function (element) {
            return element.model.replace(webAPIUrl.toLowerCase(), '') === modelId;
        });
        if (models.length === 1) {
            var model = models[0];

            isValid = model.privileges[privilegeName] || false;
        }

        return isValid;
    };
    self.GetModelPrivilegesByUri = function (uri) {
        var results = jQuery.grep(self.Data(), function (modelPrivilege) { return modelPrivilege.model.toLowerCase() === uri; });

        return results;
    };
    self.IsValidLabelAuthorizeModel = function (modelId, labelId, isPrivateAngel) {
        var models = jQuery.grep(self.Data(), function (element) {
            return element.model.replace(webAPIUrl.toLowerCase(), '') === modelId;
        });

        if (models.length) {
            var model = models[0];

            if (isPrivateAngel) {
                return model.label_authorizations[labelId]
                    && model.label_authorizations[labelId].toLowerCase() !== enumHandlers.PRIVILEGES.DENY.toLowerCase();
            }
            else {
                return model.label_authorizations[labelId]
                    && model.label_authorizations[labelId].toLowerCase() !== enumHandlers.PRIVILEGES.VIEW.toLowerCase()
                    && model.label_authorizations[labelId].toLowerCase() !== enumHandlers.PRIVILEGES.DENY.toLowerCase();
            }
        }
        return false;
    };
    self.IsAllowAdvanceSearch = function () {
        return ko.toJS(self.Data()).hasObject('privileges', function (privilege) {
            return privilege.allow_advanced_filter;
        });
    };
    self.IsAllowManagePrivateItems = function (modelUri) {
        var modelPrivilege = self.Data().findObject('model', modelUri);
        if (modelPrivilege) {
            return modelPrivilege.privileges.manage_private_items;
        }
        return false;
    };
    self.GetLabelAuthorization = function (modelUri, labelId) {
        var modelPrivileges = self.GetModelPrivilegesByUri(modelUri);
        if (modelPrivileges.length) {
            var labelAuthorizations = modelPrivileges[0].label_authorizations;
            if (labelAuthorizations[labelId])
                return labelAuthorizations[labelId];
            else if (labelAuthorizations[labelId.toLowerCase()])
                return labelAuthorizations[labelId.toLowerCase()];
            else
                return modelPrivileges[0].default_label_authorization;
        }
        return self.PRIVILEGESTATUS.VIEW.Code;
    };
    self.IsAllowCreateAngle = function () {
        return WC.Utility.ToArray(self.Data()).hasObject('privileges', function (privilege) { return privilege.create_angles; });
    };
    self.IsAllowExecuteDashboard = function () {
        return WC.Utility.ToArray(self.Data()).hasObject('privileges', function (privilege) { return privilege.allow_nonvalidated_items; });
    };
    //EOF: View modle methods
}
