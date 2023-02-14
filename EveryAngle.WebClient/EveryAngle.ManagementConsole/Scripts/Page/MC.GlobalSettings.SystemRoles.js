(function (win, globalSettings) {

    function SystemRoles() {
        var self = this;
        self.SaveUri = '';
        self.AllRolesPageUri = '';
        self.EditRolePageUri = '';
        self.SideMenuUri = '';
        self.RoleId = '';
        self.RoleUri = '';
        self.ConsolidatedRoleUri = '';

        self.InitialAllRoles = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#SystemRolesGrid').data('kendoGrid');
                if (grid) {
                    MC.util.updateTimezoneColumnName('SystemRolesGrid', 'CreatedBy.Created', 'a');
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.SystemRolesGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);
        };

        self.SystemRolesGridDataBound = function (e) {
            MC.ui.btnGroup();

            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Id);
            });
        };

        self.ShowConsolidatedRolePopup = function (roleUri) {
            MC.util.consolidatedRole.showPopup(self.ConsolidatedRoleUri, { roleUri: roleUri });
        };

        self.Initial = function (data) {
            jQuery.extend(self, data || {});

            setTimeout(function () {
                $("#breadcrumbList li").last().replaceWith('<li><a class="noLink">' + self.RoleId + '</a></li>');
                MC.form.page.init(self.GetData);
                $('input[name=allow_impersonation]').attr('disabled', true);
                $('input[name=has_management_access]').attr('disabled', true);
            }, 1);
        };

        self.GetData = function () {
            MC.form.clean();

            var data = {};
            jQuery('#formAccessManagementConsole').find(':input:disabled').removeAttr('disabled');
            jQuery.each(jQuery('#formAccessManagementConsole').serializeObject(), function (key, value) {
                data[key] = value === 'null' ? null : value === 'true';
            });

            var systemRoleData = $('#formSystemRoleInfo').serializeObject();
            if (self.RoleUri) {
                systemRoleData.system_privileges = data;
            }

            return {
                systemRoleUri: self.RoleUri,
                systemRoleData: systemRoleData
            };
        };

        self.SaveEditSystemRole = function () {
            MC.form.clean();
            if (!$('#formSystemRoleInfo').valid() || !$('#formAccessManagementConsole').valid() || !jQuery('#CommentForm').valid()) {
                $('#formSystemRoleInfo,#formAccessManagementConsole,#CommentForm').find('.error:first').focus();
                return false;
            }
            if ($('#CommentText').val()) {
                $('#btnAddComment').trigger('click');
            }
            var data = self.GetData();

            MC.ajax.request({
                url: self.SaveUri,
                parameters: {
                    systemRoleUri: data.systemRoleUri,
                    systemRoleData: JSON.stringify(data.systemRoleData)
                },
                type: 'POST'
            })
            .done(function (response) {
                if (!data.systemRoleUri) {
                    location.hash = self.EditRolePageUri + '?parameters=' + JSON.stringify(response.parameters);
                }
                else {
                    location.hash = self.AllRolesPageUri;
                }
            });
            return false;
        };

        self.DeleteSystemRole = function (e, obj) {
            obj = jQuery(obj);
            var columns = obj.parents('tr:first').children('td');
            var deleteRole = columns.eq(obj.data('delete-field-index') || 0).text();
            var deleteDescription = MC.util.encodeHtml(columns.eq(1).text());
            var deleteUsersCount = columns.eq(4).text();

            var confirmMessage = kendo.format(Localization.MC_DeleteRoleConfirm, deleteRole, deleteDescription, deleteUsersCount);
            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    element: obj,
                    type: 'delete'
                })
                    .done(function () {
                        obj.parents('tr:first').remove();
                        MC.util.resetGridRows($('#SystemRolesGrid tbody tr'));
                    });
            });

            MC.util.preventDefault(e);
        };

        self.ChangeManageUser = function () {
            self.SetAllowImpersonattion();
            self.SetManagementAccess();
        };

        self.ChangeManageSystem = function () {
            self.SetAllowImpersonattion();
            self.SetManagementAccess();
        };

        self.SetAllowImpersonattion = function () {
            if ($('input[name=manage_system]:checked').val() === "true" || $('input[name=manage_users]:checked').val() === "true") {
                $('input[name=allow_impersonation][value=false]').prop("checked", true);
            }
            else {
                $('input[name=allow_impersonation][value=true]').prop("checked", true);
            }
        };

        self.SetManagementAccess = function () {
            if ($('input[name=manage_system]:checked').val() === "true" || $('input[name=manage_users]:checked').val() === "true") {
                $('input[name=has_management_access][value=true]').prop("checked", true);
            }
            else {
                $('input[name=has_management_access][value=false]').prop("checked", true);
            }
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        SystemRoles: new SystemRoles()
    });

})(window, MC.GlobalSettings);
