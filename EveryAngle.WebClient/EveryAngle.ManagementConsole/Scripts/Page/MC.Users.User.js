(function (win, users) {

    function User() {
        var self = this;

        /* begin - all users page */
        self.AllUserPageUri = '';
        self.GetSystemProviderUri = '';
        self.GetRolesIDUri = '';
        self.SaveMassChangeUserUri = '';
        self.CurrentUser = '';
        self.AllRoles = [];
        self.UserModelPrivileges = '';
        self.UserGridSelection = null;
      

        self.InitialAllUsersPage = function (data) {
            self.AllUserPageUri = '';
            self.GetSystemProviderUri = '';
            self.UserModelPrivileges = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {
                self.UserGridSelection = new KendoGridSelection('UsersGrid', {
                    key: 'Id',
                    selection: KendoGridSelection.SELECTION.MULTIPLE,
                    validateSelection: self.CanUserSelected,
                    onSelected: self.UpdateMassChangeButton
                });
                var grid = jQuery('#UsersGrid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.UsersGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);
        };
        self.CanUserSelected = function (e, dataItem) {
            // 1. not element in .btnGroupContainer
            // 2. not current user
            // 3. not system\\easystem
            var target = $(e ? e.target : null);
            return !target.closest('.btnGroupContainer').length
                && MC.Users.User.CurrentUser !== dataItem.Uri
                && dataItem.Id.toLowerCase() !== 'system\\easystem';
        };
        self.UpdateMassChangeButton = function (selected) {
            if (selected.length) {
                jQuery('#MassChangeUsersBtn').removeClass('disabled');
            }
            else {
                jQuery('#MassChangeUsersBtn').addClass('disabled');
            }
        };
        self.UsersGridDataBound = function (e) {
            MC.ui.btnGroup();
            MC.ui.popup();
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Id);
            });
        };
        self.ImportNewUserPopup = function () {
            var ddlSystemProvider = jQuery('#systemProvider');
            if (ddlSystemProvider.data('kendoDropDownList'))
                return;

            MC.ui.popup('setScrollable', {
                element: '#popupSystemProvider'
            });
            var win = $('#popupSystemProvider').data('kendoWindow');
            win.setOptions({
                resizable: false,
                actions: ["Close"]
            });


            ddlSystemProvider.hide();
            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: self.GetSystemProviderUri,
                type: 'GET'
            })
            .done(function (data) {
                ddlSystemProvider.show().removeAttr('disabled').empty();
                jQuery.each(data.providers, function (k, v) {
                    ddlSystemProvider.append('<option value="' + v.Users + '"' + ((v.Uri + '/').indexOf(data.default_provider + '/') !== -1 ? ' selected' : '') + '>(' + v.Id + ') ' + v.Description + '</option>');
                });
                ddlSystemProvider.kendoDropDownList();;
            })
            .always(function () {
                setTimeout(function () {
                    MC.ui.popup('requestEnd');
                }, 100);
            });
        };
        self.ClearUsersGridSelection = function () {
            self.UserGridSelection.ClearSelection();
            self.UpdateMassChangeButton([]);
        };
        self.MassChangeUsersPopup = function () {
            MC.ui.popup('setScrollable', {
                element: '#popupMassChangeUsers'
            });

            var win = $('#popupMassChangeUsers').data('kendoWindow');
            if (win && !win.__bind_masschange_close) {
                win.__bind_masschange_close = true;
                win.bind('close', function () {
                    MC.form.validator.hideErrorMessage();
                });
            }

            MC.form.validator.init('#FormMassChangeUsers');
            $('#FormMassChangeUsers').submit(function (e) {
                $('#popupMassChangeUsers .btnSubmit').trigger('click');
                e.preventDefault();
            });

            $('#MassChangeAddRoles').prop('checked', true);
            self.SetRequiredRoles($('#MassChangeAddRoles')[0]);
            var ddlMassChangeUsersRole = $('#MassChangeUsersRole').data('kendoMultiSelect');
            if (ddlMassChangeUsersRole) {
                $('#MassChangeUsersRole').data('kendoMultiSelect').value([]);
                ddlMassChangeUsersRole.dataSource.data(self.AllRoles.slice());
            }
            else {
                ddlMassChangeUsersRole = $('#MassChangeUsersRole').kendoMultiSelect({
                    dataSource: new kendo.data.DataSource({ data: [] }),
                    enable: false,
                    dataTextField: 'Text',
                    dataValueField: 'Value',
                    itemTemplate: '<span data-tooltip-title="#: Tooltip #">#: Text # </span>',
                    tagTemplate: '<span title="#: Tooltip #">#: Text #</span>'
                }).data('kendoMultiSelect');

                MC.ui.popup('requestStart');
                MC.ajax.request({
                    url: self.GetRolesIDUri,
                    type: 'get'
                })
                .done(function (data) {
                    self.AllRoles = data.slice();

                    ddlMassChangeUsersRole.dataSource.data(self.AllRoles.slice());

                    ddlMassChangeUsersRole.enable(true);
                })
                .always(function () {
                    setTimeout(function () {
                        MC.ui.popup('requestEnd');
                    }, 500);
                });
            }
        };
        self.SetRequiredRoles = function (element) {
            MC.form.validator.hideErrorMessage();
            if (element.id === 'MassChangeSetRole') {
                $('#MassChangeUsersRole').removeClass('required');
            }
            else {
                $('#MassChangeUsersRole').addClass('required');
            }
        };
        self.GetMassChangeData = function (item) {
            var updatedUserroles = { 'assigned_roles': [] };
            var massChangeData = $('#MassChangeUsersRole').val() || [];
            var massChangeUsersRole = self.ConvertUIDataToRoles(massChangeData);
            var massChangeType = $('input[name=UsersMassChangeType]:checked').val();
            var existingRoles = self.ConvertAssignRoleViewModelToJSON(item.AssignedRoles || []);

            switch (massChangeType) {
                case 'add':
                    updatedUserroles = { 'assigned_roles': jQuery.merge(existingRoles, massChangeUsersRole) };
                    break;
                case 'remove':
                    if (existingRoles.length) {
                        jQuery.each(massChangeUsersRole, function (index, role) {
                            var indexes = $.map(existingRoles, function (obj, index) {
                                if (role.model_id === obj.model_id && role.role_id === obj.role_id) {
                                    return index;
                                }
                            });
                            if (indexes.length) {
                                existingRoles.splice(indexes[0], 1);
                            }
                        });
                        updatedUserroles = { 'assigned_roles': existingRoles };
                    }
                    else {
                        updatedUserroles = { 'assigned_roles': [] };
                    }
                    break;
                case 'set':
                    updatedUserroles = { 'assigned_roles': massChangeUsersRole };
                    break;
                default:
                    break;
            }
            return updatedUserroles;
        };
        self.SaveMassChangeUsers = function () {
            var selectedUsers = self.UserGridSelection.GetSelection();
            if (selectedUsers.length && $('#FormMassChangeUsers').valid()) {
                var win = $('#popupMassChangeUsers').data('kendoWindow');
                if (win)
                    win.close();

                var saveUserMassChange = function (fullName, userUri, assignRoles, reportIndex) {
                    var deferred = jQuery.Deferred();
                    MC.ajax.request({
                        url: self.SaveMassChangeUserUri,
                        parameters: { userUri: userUri, assignRoleData: JSON.stringify(assignRoles) },
                        type: 'POST'
                    })
                    .done(function () {
                        MC.util.massReport.onDone(arguments, deferred, Localization.Username, fullName, reportIndex);
                    })
                    .fail(function () {
                        MC.util.massReport.onFail(arguments, deferred, Localization.Username, fullName, reportIndex);
                    });

                    return deferred.promise();
                };

                var requests = [];
                jQuery.each(selectedUsers, function (index, item) {
                    var assignRoleData = self.GetMassChangeData(item);
                    requests.push(saveUserMassChange(item.Fullname, item.Uri, assignRoleData, index));
                });

                MC.util.massReport.start(requests, function () {
                    MC.util.massReport.showReport(Localization.MC_MassChangeReport);
                });
            }
        };

        self.GetNewUser = function (e, obj) {
            $(obj).data('parameters', { uri: jQuery('#systemProvider').val() });
            MC.util.redirect(e, obj);
        };
        self.DeleteUser = function (e, obj) {
            if (!($(obj).hasClass("disabled"))) {
                var confirmMessage = MC.form.template.getRemoveMessage(obj);
                MC.util.showPopupConfirmation(confirmMessage, function () {
                    MC.ajax.request({
                        element: obj,
                        type: 'Delete'
                    })
                    .done(function () {
                        var grid = jQuery('#UsersGrid').data('kendoGrid');
                        if (grid) {
                            grid.dataSource.read();
                        }
                    })
                    .always(function () {
                        self.ClearUsersGridSelection();
                    });
                });
            }
            MC.util.preventDefault(e);
        };
        /* end - all users page */

        /* begin - import users page */
        self.SelectedAvailableUsers = [];
        self.SelectedUsersFromGrid = [];
        self.ImportUserUri = '';
        self.AllUsersPageUri = '';

        self.InitialImportUsersPage = function (data) {

            self.SelectedAvailableUsers = [];
            self.SelectedUsersFromGrid = [];
            self.ImportUserUri = '';
            self.AllUsersPageUri = '';

            jQuery.extend(self, data || {});

            setTimeout(function () {

                var grid = jQuery('#AvailableUserGrid').data('kendoGrid');
                if (grid) {
                    grid.bind('dataBound', self.ImportUserGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }

                MC.form.page.init(self.GetImportUsersData);

                self.InitialGridSelectedUser();
                self.InitialImportUserButtons();

            }, 1);
        };
        self.ImportUserGridDataBound = function (e) {
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                item = $(item);
                item.attr('id', 'row-' + dataItems[index].Id);

                if ($.inArray(dataItems[index].Uri, self.SelectingImportUsers) !== -1) {
                    item.find(':checkbox').prop('checked', true);
                }
            });
        };
        self.ImportUserGridRequestEnd = function (e) {
            if (e.response && e.response.TotalTruncated) {
                $('#ImportUserInfo').removeClass('hidden');
            }
            else {
                $('#ImportUserInfo').addClass('hidden');
            }
        };
        self.GetImportUsersData = function () {
            MC.form.clean();
            var data = {};

            var ddlUserRoles = $('#UserRoles').data('kendoMultiSelect');
            data.roles = ddlUserRoles ? ddlUserRoles.value() : [];
            data.users = self.SelectedAvailableUsers.map(function (a) { return a.Uri; });

            return data;
        };

        self.ConvertUIDataToRoles = function (roles) {
            var assignRols = [];
            $.each(roles, function (index, role) {
                var roledata = role.split(':');
                if (roledata.length === 1)
                    assignRols.push({ role_id: roledata[0] });
                else
                    assignRols.push({ model_id: roledata[0], role_id: roledata[1] });
            });
            return assignRols;
        };
        self.ConvertAssignRoleViewModelToJSON = function (viewModels) {
            var datas = [];
            $.each(viewModels, function (index, role) {
                if (!role.ModelId)
                    datas.push({ role_id: role.RoleId });
                else
                    datas.push({ model_id: role.ModelId, role_id: role.RoleId });
            });
            return datas;
        };

        self.SaveEnableUsers = function () {

            MC.form.clean();

            var data = self.GetImportUsersData();

            if (data.users.length) {
                var userGrid = $('#SelectedUserGrid').data('kendoGrid');
                var userGridData = JSON.parse(JSON.stringify(userGrid.dataSource.data())) || [];
                var getUsername = function (index) {
                    var userUri = data.users[index];
                    var username;
                    var userData = userGridData.findObject('Uri', userUri);
                    if (userData) {
                        username = userData.Fullname;
                    }
                    else {
                        userData = userUri.split('/');
                        username = userData[userData.length - 1];
                    }

                    return username;
                };

                var addUser = function (userUri, roles, reportIndex) {

                    var deferred = jQuery.Deferred();
                    var username = getUsername(reportIndex);
                    var postData = self.ConvertUIDataToRoles(roles);

                    MC.ajax.request({
                        url: self.ImportUserUri,
                        type: 'PUT',
                        parameters: { userUri: userUri, rolesData: JSON.stringify(postData) }
                    })
                    .done(function () {
                        self.SelectedAvailableUsers = [];
                        MC.util.massReport.onDone(arguments, deferred, Localization.MC_AddingUser, username, reportIndex);
                    })
                    .fail(function () {
                        MC.util.massReport.onFail(arguments, deferred, Localization.MC_AddingUser, username, reportIndex);
                    });

                    return deferred.promise();
                };

                var requests = [];
                $.each(data.users, function (index, userUri) {
                    requests.push(addUser(userUri, data.roles, index));
                });

                MC.util.massReport.start(requests, function () {
                    MC.util.massReport.showReport(Localization.MC_AddUserReportTitle);
                });
            }
        };
        self.UserFilterCallback = function () {
        };
        /* end - import users page */

        /* begin - edit user page */
        self.EditUserPageUri = '';
        self.SaveUserUri = '';
        self.BusinessProcessesHandler = null;
        self.BusinessProcessesData = [];
        self.CurrentUserBusinessProcesses = [];
        self.CurrentUntilDate = null;
        self.PageTitle = '';
        self.SelectingRoles = {};
        self.AssignedRoles = [];
        self.AssignedRolesData = [];
        self.SubRolesDeleteList = [];

        self.InitialEditUserPage = function (data) {
            self.EditUserPageUri = '';
            self.BusinessProcessesHandler = null;
            self.BusinessProcessesData = [];
            self.CurrentUserBusinessProcesses = [];
            self.CurrentUntilDate = null;
            self.PageTitle = '';
            self.SelectingRoles = {};
            self.AssignedRoles = [];
            self.AssignedRolesData = [];
            self.SubRolesDeleteList = [];

            jQuery.extend(self, data || {});

            setTimeout(function () {
                $("#breadcrumbList li").last().replaceWith('<li><a class="noLink">' + self.PageTitle + '</a></li>');

                self.InitialUnableUntilDate();

                self.InitialUserBusinessProcess();

                self.InitialAssignedRoleGrid();

                self.InitialAvailableRoleGrid();

                MC.form.page.init(self.GetUserData);
            }, 1);
        };
        self.InitialUnableUntilDate = function () {
            var enabledUntilDate = null;
            if (self.CurrentUntilDate) {
                var d = new Date();
                enabledUntilDate = new Date(self.CurrentUntilDate * 1000 - (-1 * d.getTimezoneOffset() * 60 * 1000));
            }

            jQuery('#EnabledUntil').data('kendoDatePicker').value(enabledUntilDate);
        };
        self.InitialUserBusinessProcess = function () {
            var currentActive = {};
            jQuery.each(self.CurrentUserBusinessProcesses, function (index, bp) {
                currentActive[bp] = true;
            });
            jQuery.each(self.BusinessProcessesData, function (index, bp) {
                bp.is_allowed = true;
            });

            self.BusinessProcessesHandler = new BusinessProcessesViewModel(self.BusinessProcessesData);
            self.BusinessProcessesHandler.MultipleActive(true);
            self.BusinessProcessesHandler.CanEmpty(true);
            self.BusinessProcessesHandler.CurrentActive(currentActive);
            self.BusinessProcessesHandler.ApplyHandler('#UserBusinessProcess');
        };
        self.InitialAssignedRoleGrid = function () {
            var grid = jQuery('#GridAssignRoles').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.AssignedRolesGridDataBound);
                grid.trigger('dataBound');
            }
        };
        self.AssignedRolesGridDataBound = function (e) {
            var dataItems = e.sender.dataItems();
            e.sender.items().not('.k-no-data').each(function (index, item) {
                $(item).attr('id', 'row-' + dataItems[index].Id);
            });

            setTimeout(function () {
                jQuery.each(self.SubRolesDeleteList, function (index, uri) {
                    var btnDelete = e.sender.content.find('input[value="' + uri + '"]').parents('tr:first').find('.btnDelete');
                    if (btnDelete.length) {
                        btnDelete.trigger('click');
                    }
                });
            }, 1);
        };
        self.InitialAvailableRoleGrid = function () {
            self.SelectingRoles = {};

            var grid = jQuery('#AvailableRoleGrid').data('kendoGrid');
            if (grid) {
                grid.bind('dataBound', self.AvailableRoleGridDataBound);
                grid.trigger('dataBound');
                $("#AvailableUserGrid .k-grid-content").on('click', 'tr', self.SetGridCheckbox);
            }

        };
        self.AvailableRoleGridDataBound = function (e) {
            // set multiple selection events
            var availableRoleGrid = e.sender;
            if (availableRoleGrid) {
                if (!availableRoleGrid._set_custom_handler) {
                    availableRoleGrid._set_custom_handler = true;

                    availableRoleGrid.content.on('dblclick', 'tr', function () {
                        var row = $(this);
                        if (!row.hasClass('k-state-disabled')) {
                            var item = availableRoleGrid.dataSource.getByUid(row.data('uid'));
                            self.SelectingRoles = {};
                            if (item.ModelRole)
                                self.SelectingRoles[item.Id + ":" + item.ModelRole] = item;
                            else
                                self.SelectingRoles[item.Id] = item;

                            $('#popupSubRolesTable .btnAddRoles').trigger('click');
                        }
                    });

                    availableRoleGrid.content.on('click', 'tr', function () {
                        var row = $(this);
                        if (!row.hasClass('k-state-disabled')) {
                            var item = availableRoleGrid.dataSource.getByUid(row.data('uid'));
                            if (row.hasClass('k-state-selected')) {
                                if (item.ModelRole)
                                    delete self.SelectingRoles[item.Id + ":" + item.ModelRole]
                                else
                                    delete self.SelectingRoles[item.Id];
                                row.removeClass('k-state-selected');
                            }
                            else {
                                if (item.ModelRole)
                                    self.SelectingRoles[item.Id + ":" + item.ModelRole] = item;
                                else
                                    self.SelectingRoles[item.Id] = item;
                                row.addClass('k-state-selected');
                            }
                        }
                    });
                }

                // set selected / disabled
                self.CheckAvailableRoleGrid(availableRoleGrid);
            }
        };
        self.CheckAvailableRoleGrid = function (grid) {
            grid.content.find('tr').removeClass('k-state-selected k-state-disabled');
            $.each(grid.dataSource.data(), function (index, item) {
                if (item.ModelRole) {
                    if ($.inArray(item.Id + ":" + item.ModelRole, self.AssignedRoles) !== -1 || item.ModelRole.indexOf('No privilege') !== -1) {
                        grid.content.find('tr[data-uid="' + item.uid + '"]').addClass('k-state-disabled');
                    }
                    else if (self.SelectingRoles[item.Id + ":" + item.ModelRole]) {
                        grid.content.find('tr[data-uid="' + item.uid + '"]').addClass('k-state-selected');
                    }
                } else {
                    if ($.inArray(item.Id, self.AssignedRoles) !== -1 || item.ModelRole.indexOf('No privilege') !== -1) {
                        grid.content.find('tr[data-uid="' + item.uid + '"]').addClass('k-state-disabled');
                    }
                    else if (self.SelectingRoles[item.Id]) {
                        grid.content.find('tr[data-uid="' + item.uid + '"]').addClass('k-state-selected');
                    }
                }
            });
        };
        self.ShowAvailableRoleGridPopup = function (obj) {
            if (!$(obj).hasClass('disabled')) {
                MC.ui.popup('setScrollable', {
                    element: '#popupSubRolesTable',
                    getHeight: function (win) {
                        return win.element.height() - win.element.find('.popupToolbar').outerHeight() - 20;
                    },
                    onResize: function (win) {
                        var grid = win.element.find('.k-grid');
                        grid.height(win.element.find('.popupContent').height() - 45);
                        kendo.resize(grid, true);
                    }
                });


                self.SelectingRoles = {};

                // set assigned roles
                self.AssignedRoles = [];
                var assignRolesGrid = $('#GridAssignRoles').data('kendoGrid');
                if (assignRolesGrid) {
                    for (var i = 0; i < assignRolesGrid.dataItems().length; i++) {
                        var item = assignRolesGrid.dataItems()[i];
                        var roleData = {};
                        if (item.ModelPrivilege.model !== null) {
                            roleData = { "RoleId": item.Id, "ModelId": item.ModelRole };
                        } else {
                            roleData = { "RoleId": item.Id };
                        }
                        self.AssignedRoles.push(roleData);
                    }
                }

                var availableRoleGrid = $('#AvailableRoleGrid').data('kendoGrid');
                if (availableRoleGrid) {
                    availableRoleGrid.trigger('dataBound');
                }
            }
        };

        self.ShowConsolidatedRolePopup = function (userUri, modelPrivilegesUri) {
            MC.util.consolidatedRole.showPopup(self.UserModelPrivileges, { userUri: userUri, modelPrivilegesUri: modelPrivilegesUri });
        };

        self.AddRoles = function () {
            var grid = $('#GridAssignRoles');
            $.each(self.SelectingRoles, function (index, item) {
                if ($.inArray(item.Id, self.AssignedRoles) === -1) {
                    var roleData = {};
                    if (item.ModelPrivilege.model) {
                        roleData = { "RoleId": item.Id, "ModelId": item.ModelRole };
                    } else {
                        roleData = { "RoleId": item.Id };
                    }
                    self.AssignedRoles.push(roleData);

                    MC.form.template.addRow($('<div />', {
                        data: {
                            template: '#templateGetAvailableRole',
                            grid: '#GridAssignRoles'
                        }
                    }));
                    var row = grid.find('.k-grid-content tr:last');
                    row.children(':eq(0)').html(item.Id);
                    row.children(':eq(1)').html(item.Description);
                    row.children(':eq(2)').html(item.Subrole_ids.length);
                    row.children(':eq(3)').html(item.ModelRole);
                    //hidden model id
                    row.children(':eq(5)').html(item.ModelId);
                }
            });
        };
        self.SubrolesDeletionCheckMark = function (obj, isRemove) {
            var data = $(obj).data('parameters');

            var index = $.inArray(data.roleId, self.SubRolesDeleteList);
            if (isRemove) {
                if (index === -1) {
                    self.SubRolesDeleteList.push(data.roleId);
                }
            }
            else {
                if (index !== -1) {
                    self.SubRolesDeleteList.splice(index, 1);
                }
            }
        };
        self.GetUserData = function () {
            MC.form.clean();

            var data = {};

            // userData
            var enabledUntil = $('#EnabledUntil').data('kendoDatePicker').value();
            if (enabledUntil) {
                enabledUntil = Date.UTC(enabledUntil.getFullYear(), enabledUntil.getMonth(), enabledUntil.getDate(), 0, 0, 0) / 1000;
            }
            var userData = {
                'enabled': $('#ylabelForUserEnabled').is(':checked'),
                'enabled_until': enabledUntil,
                'default_business_processes': self.BusinessProcessesHandler.GetActive()
            };
            data.userData = userData;

            // user uri
            data.userUri = $('#Uri').val();

            // rolesData
            var rolesData = { assigned_roles: [] };
            $('#GridAssignRoles .k-grid-content tr').each(function (index, row) {
                row = $(row);
                if (!row.hasClass('rowMaskAsRemove')) {
                    var roleData;
                    var roleId = $.trim(row.children('td:first').text());
                    var modelId = $.trim(row.children('td:eq(5)').text()) === "" ?
                                  $.trim(row.children('td:eq(3)').text()) :
                                  $.trim(row.children('td:eq(5)').text());
                    if (modelId !== 'No Data' || !modelId) {
                        roleData = { "role_id": roleId, "model_id": modelId };
                    }
                    else {
                        roleData = { "role_id": roleId };
                    }
                    rolesData.assigned_roles.push(roleData);
                }
            });
            data.rolesData = rolesData;

            return data;
        };
        self.SaveEditUser = function () {

            MC.form.clean();
            if (!$('#formUserInfo').valid() || !$('#formAssignedRoles').valid() || !jQuery('#CommentForm').valid()) {
                $('#formUserInfo,#formAssignedRoles,#CommentForm').find('.error:first').focus();
                return false;
            }

            var data = self.GetUserData();
            if ($('#CommentText').val()) {
                $('#btnAddComment').trigger('click');
            }

            MC.ajax.request({
                url: self.SaveUserUri,
                parameters: { rolesData: JSON.stringify(data.rolesData), userData: JSON.stringify(data.userData), userUri: data.userUri },
                type: 'POST'
            })
            .done(function (response) {
                if (response.session_needs_update) {
                    MC.util.showPopupConfirmation(Localization.MC_ConfirmChangePrivileges, function () {
                        jQuery('#logoutForm').submit();
                    }, function () {
                        location.hash = self.AllUserPageUri;
                    });
                }
                else {
                    location.hash = self.AllUserPageUri;
                }
            });
        };

        self.AddSelectedUsers = function () {
            var availableUserDataSource = $("#AvailableUserGrid").data('kendoGrid').dataSource;
            $("#AvailableUserGrid input:checkbox:enabled:checked").each(function () {
                var uid = $(this).closest("tr").attr('data-uid');
                var user = availableUserDataSource.getByUid(uid);
                if (jQuery.inArray(user, self.SelectedAvailableUsers) < 0) {
                    self.SelectedAvailableUsers.push(user);
                }
            });

            self.SetDataSourceToSelectedUserGrid(self.SelectedAvailableUsers);
        };
        self.SetDataSourceToSelectedUserGrid = function (selectedUser) {
            $("#SelectedUserGrid").data('kendoGrid').dataSource.data(selectedUser);
        };
        self.RemovedSelectedUsers = function () {
            var selectedUserDataSource = $("#SelectedUserGrid").data('kendoGrid').dataSource;
            $("#SelectedUserGrid input:checkbox:enabled:checked").each(function () {
                var uid = $(this).closest("tr").attr('data-uid');
                //Not sure this is need or not, if it doesn I will get it back
                //var checkbox = $("#AvailableUserGrid").data("kendoGrid").tbody.find("tr[data-uid='" + uid + "']").find('[type=checkbox]').prop("checked", false);

                var user = selectedUserDataSource.getByUid(uid);
                var index = jQuery.inArray(user, self.SelectedAvailableUsers);
                if (jQuery.inArray(user, self.SelectedAvailableUsers) > -1) {
                    self.SelectedAvailableUsers.splice(index, 1);
                    self.RemoveUserFromSelectedList(false, uid);
                }
            });
            self.SetDataSourceToSelectedUserGrid(self.SelectedAvailableUsers);
        };
        self.InitialGridSelectedUser = function () {
            $("#SelectedUserGrid").kendoGrid({
                height: 537,
                scrollable: true,
                resizable: true,
                selectable: false,
                sortable: {
                    allowUnsort: false
                },
                columns: [{
                    field: "Id",
                    title: ' ',
                    width: 30,
                    attributes: { 'class': 'columnBoolean' },
                    template: '<label><input type="checkbox" onclick="MC.Users.User.OnChangeSelectedGridCheckbox(this)" /><span class="label"></span></label>',
                    sortable: false
                },
                {
                    field: "Id",
                    title: Localization.Username
                },
                {
                    field: "Fullname",
                    title: Localization.MC_FullName
                }]
            });
            var grid = jQuery('#SelectedUserGrid').data('kendoGrid');
            grid.bind('dataBound', self.SelectedGridCallback);
            $("#SelectedUserGrid .k-grid-content").on('click', 'tr', self.SetGridCheckbox);

        };

        self.SetGridCheckbox = function (e) {
            var target = $(e.target);
            if (!target.is('input') && !target.is('label') && !target.hasClass('.label')) {
                var checkbox = $(e.currentTarget).find('input');
                checkbox.prop('checked', !checkbox.prop('checked'));
            }
        };
        self.InitialImportUserButtons = function () {

            $("#chkSelectAllAvaliableUser").click(function () {
                $("#AvailableUserGrid tbody input:checkbox").prop('checked', true);
            });

            $("#chkClearAllAvaliableUser").click(function () {
                $("#AvailableUserGrid tbody input:checkbox:enabled").prop('checked', false);
            });

            $("#chkSelectAllSelectedUser").click(function () {
                $("#SelectedUserGrid tbody input:checkbox").prop('checked', true);
            });

            $("#chkClearAllSelectedUser").click(function () {
                $("#SelectedUserGrid tbody input:checkbox:enabled").prop('checked', false);
            });

            $("#btnImportNewUser").click(function () {
                self.AddSelectedUsers();
            });

            $("#btnRemovedSelectedUser").click(function () {
                self.RemovedSelectedUsers();
            });
        };
        self.SelectedGridCallback = function () {
            $.each(self.SelectedUsersFromGrid, function (index, item) {
                jQuery('#SelectedUserGrid').data("kendoGrid").tbody.find("tr[data-uid='" + item + "']").find('[type=checkbox]').prop("checked", true);
            });
        };
        self.OnChangeSelectedGridCheckbox = function (obj) {
            var uid = $(obj).closest("tr").attr('data-uid');
            self.RemoveUserFromSelectedList(obj.checked, uid);
        };
        self.RemoveUserFromSelectedList = function (isChecked, uid) {
            if (isChecked) {
                if (jQuery.inArray(uid, self.SelectedUsersFromGrid) < 0) {
                    self.SelectedUsersFromGrid.push(uid);
                }
            }
            else {
                var index = jQuery.inArray(uid, self.SelectedUsersFromGrid);
                if (jQuery.inArray(uid, self.SelectedUsersFromGrid) > -1) {
                    self.SelectedUsersFromGrid.splice(index, 1);
                }
            }
        };

        /* begin - edit user page */
    }

    win.MC.Users = users || {};
    jQuery.extend(win.MC.Users, {

        User: new User()
    });

})(window, MC.Users);
