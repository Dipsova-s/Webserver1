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
        if ((!setting.force && self.IsLoaded()) || !uri) {
            setting.callback();
            return jQuery.when(self.Data());
        }
        
        return GetDataFromWebService(uri)
            .done(function (data, status, xhr) {
                /* M4-11442: Use privileges in session */
                self.Privileges.SystemPrivileges = jQuery.extend({}, sessionModel.Data().system_privileges);                
                self.LoadSuccess(data, status, xhr);
                setting.callback();
            });
    };

    self.LoadSuccess = function (data, status, xhr) {

        defaultValueHandler.CheckAndExtendProperties(data, enumHandlers.VIEWMODELNAME.USERMODEL, true);
        self.Data(data);
        jQuery.localStorage(self.DirectoryName, self.Data());
        jQuery.localStorage(self.UserPrivilegeName, self.Privileges);
        self.IsLoaded(true);
    };

    self.GetAssignedRoles = function () {
        return sessionModel.Data().assigned_roles;
    };

    self.FullnameWithId = function () {
        return self.Data() ? (self.Data().id + ' (' + self.Data().full_name + ')') : '';
    };
    self.DisplayName = function () {
        return self.Data() ? (self.Data().full_name !== '' ? self.Data().full_name : self.Data().id) : '';
    };
    self.GetAnglePrivilegeByUri = function (uri) {
        var results = jQuery.grep(self.Privileges.AnglePrivileges, function (anglePrivilege) {
            return anglePrivilege.uri === uri;
        });

        return results.length > 0 ? results[0] : null;
    };
    self.GetCreateAngleAuthorization = function () {
        var isValids = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivilege) {
            return modelPrivilege.privileges.create_angles;
        });

        return isValids.length > 0 ? true : false;
    };
    self.GetAngleAllowMoreDetailsAuthorization = function (angleUri) {
        var isAuthorizes = jQuery.grep(self.Privileges.AnglePrivileges, function (anglePrivilege) {
            return anglePrivilege.uri === angleUri && anglePrivilege.allow_more_details;
        });

        return isAuthorizes.length === 0 ? false : true;
    };
    self.GetModelAllowMoreDetailsAuthorization = function (modelUri) {
        var isAuthorizes = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivileges) {
            return modelPrivileges.model === modelUri && modelPrivileges.privileges.allow_more_details;
        });

        return isAuthorizes.length === 0 ? false : true;
    };
    self.GetCreateAngleAuthorizationByModelUri = function(modelUri) {
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
    self.GetAngleFollowupAuthorization = function (angleUri) {
        var isAuthorizes = jQuery.grep(self.Privileges.AnglePrivileges, function (anglePrivilege) {
            return anglePrivilege.uri === angleUri && anglePrivilege.allow_followups;
        });

        return isAuthorizes.length === 0 ? false : true;
    };
    self.GetModelFollowupAuthorization = function (modelUri) {
        var isAuthorizes = jQuery.grep(self.Privileges.ModelPrivileges, function (modelPrivileges) {
            return modelPrivileges.model === modelUri && modelPrivileges.privileges.allow_followups;
        });

        return isAuthorizes.length === 0 ? false : true;
    };
    self.UpdateAnglePrivilege = function (angle) {
        var anglePrivilege = self.GetAnglePrivilegeByUri(angle.uri);
        
        if (!IsNullOrEmpty(anglePrivilege)) {
            anglePrivilege.allow_more_details = angle.allow_more_details;
            anglePrivilege.allow_followups = angle.allow_followups;
            anglePrivilege.privileges = angle.privileges;
            anglePrivilege.uri = angle.uri;
            anglePrivilege.model = angle.model;
        }
        else {
            self.Privileges.AnglePrivileges.push({
                uri: angle.uri,
                model: angle.model,
                allow_more_details: angle.allow_more_details,
                allow_followups: angle.allow_followups,
                privileges: angle.privileges
            });
        }

        jQuery.localStorage(self.UserPrivilegeName, self.Privileges);
    };
    self.GetUserAuthorizationByAngle = function (angle) {
        var isCreateAngle = self.GetCreateAngleAuthorizationByModelUri(angle.model);
        var isSaveDisplay = self.CanSaveDisplays(angle.model);
        var allowMoreDetails = self.GetAngleAllowMoreDetailsAuthorization(angle.uri);
        var allowFollowups = self.GetAngleFollowupAuthorization(angle.uri);
        var result = {};
        var angle = {
            CreateAngle: ko.observable(isCreateAngle),
            ChangeAngleDetails: ko.observable(allowMoreDetails),
            AddAngleFilters: ko.observable(allowMoreDetails),
            AddAngleFollowups: ko.observable(allowMoreDetails && allowFollowups)
        };
        var display = {
            ShowCreateDisplay: ko.observable(isSaveDisplay && allowMoreDetails),
            ChangePrivateDisplay: ko.observable(isSaveDisplay && allowMoreDetails),
            ChangePublicDisplay: ko.observable(isSaveDisplay && isCreateAngle && allowMoreDetails),
            DeletePrivateDisplay: ko.observable(isSaveDisplay && allowMoreDetails),
            DeletePublicDisplay: ko.observable(isSaveDisplay && isCreateAngle && allowMoreDetails),
            AddDisplayFilters: ko.observable(isSaveDisplay && allowMoreDetails),
            AddDisplayFollowups: ko.observable(isSaveDisplay && allowMoreDetails && allowFollowups)
        };

        return jQuery.extend(result, angle, display);
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
    self.GetAssignRoleDisplay = function (roleObj) {        
        if ((typeof roleObj) == "object") {
            if (roleObj.model_id)
                return roleObj.model_id + ': ' + roleObj.role_id;
            else
                return roleObj.role_id
        } else
            return roleObj;
    };
    //EOF: View modle methods
}
