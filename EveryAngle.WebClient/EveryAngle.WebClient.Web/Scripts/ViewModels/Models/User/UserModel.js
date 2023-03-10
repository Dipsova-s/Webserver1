var userModel = new UserViewModel();

function UserViewModel() {
    "use strict";

    //BOF: View model properties
    var self = this;
    self.DirectoryName = 'user';
    self.UserPrivilegeName = 'user_privileges';
    self.IsLoaded = ko.observable(false);
    self.Data = ko.observable();
    self.Privileges = {
        SystemPrivileges: {},
        ModelPrivileges: [],
        AnglePrivileges: []
    };

    // storage
    if (jQuery.localStorage(self.DirectoryName) !== null) {
        self.IsLoaded(true);
        self.Data(jQuery.localStorage(self.DirectoryName));
    }

    if (jQuery.localStorage(self.UserPrivilegeName) !== null) {
        self.Privileges = jQuery.localStorage(self.UserPrivilegeName);
    }

    //BOF: View model methods
    self.Load = function (options) {
        var uri = directoryHandler.ResolveDirectoryUri(directoryHandler.Data.user);
        var setting = jQuery.extend({ force: false, callback: jQuery.noop }, options);
        if (!setting.force && self.IsLoaded() || !uri) {
            setting.callback();
            return jQuery.when(self.Data());
        }

        return GetDataFromWebService(uri)
            .done(function (data, status, xhr) {
                /* M4-11442: Use privileges in session */
                if (sessionModel.Data()) {
                    self.Privileges.SystemPrivileges = jQuery.extend({}, sessionModel.Data().system_privileges);
                }
                self.LoadSuccess(data, status, xhr);
                setting.callback();
            });
    };

    self.LoadSuccess = function (data) {
        defaultValueHandler.CheckAndExtendProperties(data, enumHandlers.VIEWMODELNAME.USERMODEL, true);
        self.Data(data);
        jQuery.localStorage(self.DirectoryName, self.Data());
        jQuery.localStorage(self.UserPrivilegeName, self.Privileges);
        self.IsLoaded(true);
    };

    self.DisplayName = function () {
        return self.Data() ? self.Data().full_name !== '' ? self.Data().full_name : self.Data().id : '';
    };
    self.GetCreateAngleAuthorization = function () {
        var isValids = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.create_angles;
        });

        return isValids.length > 0 ? true : false;
    };
    self.GetCreateAngleAuthorizationByModelUri = function (modelUri) {
        var isValids = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.model === modelUri && modelPrivilege.privileges.create_angles;
        });

        return isValids.length > 0 ? true : false;
    };
    self.CanCreateTemplateAngle = function () {
        var isValids = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.create_template_angles;
        });

        return isValids.length > 0 ? true : false;
    };
    self.CanSaveDisplays = function (modelUri) {
        var isValids = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.model === modelUri && modelPrivilege.privileges.save_displays;
        });

        return isValids.length > 0 ? true : false;
    };
    self.GetAllowExportAuthorizationByModelUri = function (model) {
        var isValids = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.allow_export && modelPrivilege.model === model;
        });

        return isValids.length > 0 ? true : false;
    };
    self.IsPossibleToCreateAngle = function () {
        var hasPrivillage = false;
        var availableModels = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.create_angles;
        });

        if (availableModels.length > 0) {
            hasPrivillage = true;
        }

        return hasPrivillage;
    };
    self.IsPossibleToManageModelingWorkbench = function () {
        var availableModels = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.configure_content || modelPrivilege.privileges.edit_content;
        });
        return availableModels.length > 0;
    };
    self.ShowCreateAngleButton = function () {
        jQuery('#CreateNewAngleButtonWrapper').removeClass('alwaysHide');
    };
    self.HideCreateAngleButton = function () {
        jQuery('#CreateNewAngleButtonWrapper').addClass('alwaysHide');
    };
    self.SetCreateAngleButton = function () {
        if (self.IsPossibleToCreateAngle())
            self.ShowCreateAngleButton();
        else
            self.HideCreateAngleButton();
    };
    self.IsPossibleToCreateAngleFromModel = function (modelId) {
        var hasPrivillage = false;
        var availableModels = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.model === modelId && modelPrivilege.privileges.create_angles === true;
        });
        if (availableModels.length > 0) {
            hasPrivillage = true;
        }
        return hasPrivillage;
    };
    self.IsPossibleToAccessWebClient = function () {
        return jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.access_data_via_webclient;
        }).length !== 0;
    };
    self.IsPossibleToHaveManagementAccess = function () {
        var hasPrivillage = false;
        if (sessionModel.Data()) {
            hasPrivillage = sessionModel.Data().system_privileges.has_management_access || false;
        }
        return hasPrivillage;
    };
    self.IsPossibleToManageSystem = function () {
        var hasPrivillage = false;
        if (sessionModel.Data()) {
            hasPrivillage = sessionModel.Data().system_privileges.manage_system || false;
        }
        return hasPrivillage;
    };
    self.IsPossibleToScheduleAngles = function () {
        // Can use schedule task in Automation tasks section

        var hasPrivillage = false;
        if (sessionModel.Data()) {
            hasPrivillage = sessionModel.Data().system_privileges.schedule_angles || false;
        }
        return hasPrivillage;
    };
    self.ShowManagementControlButton = function () {
        jQuery('.btnMC').show();

    };
    self.HideManagementControlButton = function () {
        jQuery('.btnMC').hide();
    };
    self.SetManagementControlButton = function () {
        var canAccessManagementConsole = self.IsPossibleToHaveManagementAccess() || self.IsPossibleToScheduleAngles();
        if (canAccessManagementConsole)
            self.ShowManagementControlButton();
        else
            self.HideManagementControlButton();
    };
    self.SetWorkbenchButton = function () {
        if (self.IsPossibleToManageModelingWorkbench()) {
            jQuery("#btnWorkbench").show();
        }
        else {
            jQuery("#btnWorkbench").hide();
        }
    };
    self.GetModelPrivilegeByUri = function (modelUri) {
        var modelPrivilege = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.model === modelUri;
        });

        return modelPrivilege.length === 0 ? null : modelPrivilege[0];
    };
    self.GetAuthorizeCreateTemplateAnlge = function (modelUri) {
        var modelPrivilege = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.model === modelUri && modelPrivilege.privileges.create_template_angles;
        });

        return modelPrivilege.length === 0 ? false : true;
    };
    self.GetModelRolesByModelUri = function (modelUri) {
        var model = self.Privileges.ModelPrivileges.findObject('model', modelUri);
        if (model) {
            return model.roles;
        }
        else {
            return [];
        }
    };
    //EOF: View modle methods
}
