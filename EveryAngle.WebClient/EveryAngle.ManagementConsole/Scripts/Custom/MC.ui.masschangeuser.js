(function (win) {
    win.Masschangeuser = function () {

        // initial variables
        var self = this;

        self.KendoPopup = {};

        self.manageUserRolePopupId = '#UserInRolePopup';
        self.manageUserRoleTitleId = '#UserInRolePopup_wnd_title';

        self.addUserButtonId = '#btnAddUserInRole';
        self.removeUserButtonId = '#btnRemoveUserInRole';

        self.availableUserGridId = '#GridAvaliableUser';
        self.selectedUserGridId = '#GridSelectedUser';

        self.reportPopupId = '#UserInRoleReportPopup';
        self.displayReportButtonId = '#ButtonShowRoleReport';

        self.roleId = '#UsersInRoleId';
        self.modelId = '#UsersInRoleForModelId';

        self.logoutFormId = '#logoutForm';

        self.AuthenticationProviders = '';
        self.SaveUserInRoleUri = '';
        self.GetUserInRoleUri = '';
        self.GetUsersUri = '';

        self.UserViewModelAvaliableList = [];
        self.UserViewModelInRoleList = [];

        self.SelectedUsers = [];
        self.UserViewModelInRoleRemoveList = [];

        self.UserInRolePopupWidth = 0;
        self.UserInRolePopupHeight = 0;
        self.UserInRolePopupIsMaximized = false;
        self.UserInRolePopupPosition = [];

        self.FilterTimeout = 1000;
        self.FadeTimeout = 1000;
        self.ResizeTimeout = 100;
        self.LoadingTimeout = 100;
        self.BindingTimeout = 10;

        self.TimeoutId = null;

        self.USERS = {
            EA_SYSTEM: 'EASystem'
        };
        self.RESULT_KEY = {
            SUCCESSFUL_UPDATES: 'Successful updates',
            SESSION_NEEDS_UPDATE: 'Session needs update'
        };

        // open popup function
        // roleUri: string = '[appserver_url]/system/roles/[id]'
        // roleId: string = '[role_id]'
        // modelId: string = '[model_id]'
        self.ShowUserInRolePopup = function (roleUri, roleId, modelId) {
            self.UserViewModelInRoleRemoveList = [];
            self.PopupSettings();
            self.CreateHtmlStructure(roleId, modelId);
            self.CreateComponents(roleUri);
        };
        self.CreateComponents = function (roleUri) {
            MC.ui.popup('requestStart');
            MC.ajax.request({
                url: self.GetUserInRoleUri,
                parameters: {
                    roleUri: roleUri
                },
                type: 'GET'
            }).done(function (users) {

                // init data
                self.InitializeViewObject(users);
                self.SelectedUsers = self.SerializeUsers(users);
                self.UserViewModelInRoleList = jQuery.extend([], users);

                // create grid layout
                self.InitialGridAvaliableUser();
                self.InitialGridSelectedUser();
                self.GetAvaliableUsers(true);
                self.SetDataGridSelectedUser(users);

                // binding events
                self.InitializeEvents();
                self.SubmitButtonHandler();

                // display html
                jQuery(self.manageUserRolePopupId).find('.manageUserRoleMainContainer').hide().removeClass('hidden').fadeIn(self.FadeTimeout);

                setTimeout(function () {
                    self.UpdatePopupScale();
                }, self.ResizeTimeout);
            })
            .fail(function () {
                self.KendoPopup.close();
            });

        };

        // popup settings
        self.PopupSettings = function () {
            self.KendoPopup = jQuery(self.manageUserRolePopupId).data('kendoWindow');
            self.KendoPopup.setOptions({
                minWidth: 760,
                minHeight: 450,
                resizable: true,
                actions: ['Maximize', 'Close'],
                close: function () {
                    self.UserInRolePopupWidth = self.KendoPopup.size().width;
                    self.UserInRolePopupHeight = self.KendoPopup.size().height;
                    self.UserInRolePopupIsMaximized = self.KendoPopup.options.isMaximized;
                    self.UserInRolePopupPosition = jQuery.extend(true, {}, self.KendoPopup.options.position);
                }
            });

            // binding resize and maximize event
            self.KendoPopup.unbind('resize').bind('resize', self.OnPopupAdjustLayout);
            self.KendoPopup.unbind('maximize').bind('maximize', self.OnPopupAdjustLayout);

            // display ok and cancel buttons
            jQuery(self.manageUserRolePopupId).find('div.popupToolbar > a.btn.btnPrimary').show();
            jQuery(self.manageUserRolePopupId).find('div.popupToolbar > a.btn.btnClose').show();

            // clear popup content
            jQuery(self.manageUserRolePopupId).find('.popupContent').empty();
        };
        self.UpdatePopupScale = function () {
            self.KendoPopup.trigger('resize');
            if (self.UserInRolePopupWidth !== 0 && self.UserInRolePopupHeight !== 0) {
                if (self.UserInRolePopupIsMaximized)
                    self.KendoPopup.toggleMaximization();
                else {
                    self.KendoPopup.setOptions({
                        width: self.UserInRolePopupWidth,
                        height: self.UserInRolePopupHeight,
                        position: self.UserInRolePopupPosition
                    });
                }
            }
        };

        // HTML
        self.CreateHtmlStructure = function (roleId, modelId) {
            var htmlTemplateUserInRole = [
                '<div class="manageUserRoleMainContainer hidden">',
                    '<div class="contentSection contentSectionInfo">',
                        '<h2>' + roleId + '</h2>',
                    '</div>',
                    '<div class="manageUserRoleRow clearfix">',
                        '<div class="contentSection contentSectionGrid avaliableUserGridColumn">',
                            '<div class="gridToolbar gridToolbarTop">',
                                '<div class="gridToolbarFilter">',
                                    '<input type="text" id="FilterGridAvaliableUser" placeholder="' + Localization.Filter + '" onkeyup="MC.ui.masschangeuser.OnKeyupFilterAvaliableUsers(this)" />',
                                    '<span class="icon icon-filter"></span>',
                                '</div>',
                            '</div>',
                            '<h2>Available users</h2>',
                            '<div class="gridContainer">',
                                '<div id="GridAvaliableUser"></div>',
                            '</div>',
                            '<div class="gridToolbar gridToolbarBottom">',
                                '<a class="btn btnSelectAll" id="chkSelectAllAvaliableUser">' + Localization.SelectAll + '</a>',
                                '<a class="btn btnClearAll" id="chkClearAllAvaliableUser">' + Localization.ClearAll + '</a>',
                            '</div>',
                        '</div>',
                        '<div class="actionMoveColumn">',
                            '<a class="btn btnAddUser" id="btnAddUserInRole">Add &gt;</a>',
                            '<a class="btn btnRemoveUser" id="btnRemoveUserInRole">&lt; Remove</a>',
                         '</div>',
                         '<div class="contentSection contentSectionGrid selectedUserGridColumn">',
                            '<div class="gridToolbar gridToolbarTop">',
                                '<div class="gridToolbarFilter">',
                                    '<input type="text" id="FilterGridSelectedUser" placeholder="' + Localization.Filter + '"data-role="gridfilter" data-target="' + self.selectedUserGridId + '" onkeyup="MC.ui.masschangeuser.OnKeyupFilterSelectedUsers()" />',
                                    '<span class="icon icon-filter"></span>',
                                '</div>',
                            '</div>',
                            '<h2>Selected users</h2>',
                            '<div class="gridContainer">',
                                '<div id="GridSelectedUser"></div>',
                            '</div>',
                            '<div class="gridToolbar gridToolbarBottom">',
                                '<a class="btn btnSelectAll" id="chkSelectAllSelectedUser">' + Localization.SelectAll + '</a>',
                                '<a class="btn btnClearAll" id="chkClearAllSelectedUser">' + Localization.ClearAll + '</a>',
                            '</div>',
                        '</div>',
                        '<input type="hidden" id="UsersInRoleId" name="UsersInRoleId" value="' + roleId + '" />',
                        '<input type="hidden" id="UsersInRoleForModelId" name="UsersInRoleForModelId" value="' + modelId + '" />',
                    '</div>',
                '</div>'
            ].join('');

            jQuery(self.manageUserRolePopupId).find('.popupContent').html(htmlTemplateUserInRole);
        };

        // events
        self.InitializeEvents = function () {
            self.OnClickAddUsersButton();
            self.OnClickRemoveUsersButton();
            self.OnClickSelectAllButton();
            self.OnClickClearAllButton();
        };
        self.OnClickAddUsersButton = function () {
            // add user button
            jQuery(self.addUserButtonId).click(function () {
                var hasCheckboxesSelected = self.BeginMoveUsersToSelectedUsersGrid();
                self.ResetAvaliableUsersCheckedStatus();
                self.MoveUsers(hasCheckboxesSelected);
            });
        };
        self.OnClickRemoveUsersButton = function () {
            // remove user button
            jQuery(self.removeUserButtonId).click(function () {
                var hasCheckboxesSelected = self.BeginMoveUsersToAvaliableUsersGrid();
                self.ResetSelectedUsersCheckedStatus();
                self.MoveUsers(hasCheckboxesSelected);
            });
        };
        self.OnClickSelectAllButton = function () {
            var checked = true;
            self.OnCheckedAllEventHandler('#chkSelectAllAvaliableUser', self.availableUserGridId, checked);
            self.OnCheckedAllEventHandler('#chkSelectAllSelectedUser', self.selectedUserGridId, checked);
        };
        self.OnClickClearAllButton = function () {
            var checked = false;
            self.OnCheckedAllEventHandler('#chkClearAllAvaliableUser', self.availableUserGridId, checked);
            self.OnCheckedAllEventHandler('#chkClearAllSelectedUser', self.selectedUserGridId, checked);
        };
        self.OnCheckedAllEventHandler = function (buttonId, gridId, checked) {
            jQuery(buttonId).click(function () {
                jQuery(gridId).find('tbody input:checkbox').each(function (index, checkbox) {
                    checkbox = jQuery(checkbox);
                    checkbox.prop('checked', checked);
                    self.UpdateCheckedUserViewModel(checkbox.closest('.k-grid').attr('id'), checkbox.closest('tr').data('uid'), checked);
                });
            });
        };
        self.OnKeyupFilterAvaliableUsers = function (filterElement) {
            clearTimeout(self.TimeoutId);
            self.TimeoutId = setTimeout(function () {
                self.GetAvaliableUsers(true, {
                    filter: filterElement.value
                });
            }, self.FilterTimeout);
        };
        self.OnKeyupFilterSelectedUsers = function () {
            var selectedUsersDataGrid = jQuery(self.selectedUserGridId).data('kendoGrid');
            selectedUsersDataGrid.dataSource.data().forEach(function (user) {
                user.IsChecked = false;
            });
        };
        self.OnSubmit = function (event, context) {
            if (jQuery(context).hasClass('disabled')) {
                return;
            }

            MC.ui.popup('close');
            self.UpdateUsers();
        };
        self.OnPopupAdjustLayout = function () {

            var gridElement = self.KendoPopup.element.find('.k-grid');

            // set grid height for grid
            gridElement.height(self.KendoPopup.element.height() - 120);

            // apply grid size
            kendo.resize(gridElement);

            try {
                gridElement.each(function () {
                    var grid = jQuery(this).data('kendoGrid');
                    var width = grid.wrapper.find('.k-grid-header-wrap').width();
                    width -= grid.wrapper.find('.k-header:first').outerWidth();
                    width /= 2;
                    MC.util.setGridWidth(grid, 1, width);
                    MC.util.setGridWidth(grid, 2, width);
                });
            }
            catch (ex) {
                // do nothing
            }

        };

        // users data
        self.GetAvaliableUsers = function (isUseServerSide, query) {
            if (!self.UserViewModelAvaliableList.length || isUseServerSide) {
                MC.ui.popup('requestStart');
                MC.ajax.request({
                    url: self.GetUsersUri,
                    parameters: query,
                    type: 'GET'
                })
                .done(function (users) {
                    self.InitializeViewObject(users);
                    self.UserViewModelAvaliableList = users;
                    self.CreateAvaliableUsersData();

                    setTimeout(function () {
                        self.KendoPopup.trigger('resize');
                    }, self.ResizeTimeout);
                })
                .fail(function () {
                    self.KendoPopup.close();
                })
                .always(function () {
                    // M4-38447 User management screen became unresponsive
                    setTimeout(function () {
                        MC.ui.popup('requestEnd');
                    }, self.LoadingTimeout);
                });
            }
            else {
                self.CreateAvaliableUsersData();
            }

        };
        self.CreateAvaliableUsersData = function () {
            var users = [];
            jQuery.each(self.UserViewModelAvaliableList, function (index, user) {
                if (!self.HasUserOnSelectedGrid(user.Id)) {
                    users.push(user);
                }
            });
            // start add users to datasource
            self.SetDataGridAvaliableUser(users);
        };
        self.HasUserOnSelectedGrid = function (userId) {
            var hasValue = false;
            jQuery.each(self.UserViewModelInRoleList, function (index, user) {
                if (userId === user.Id) {
                    hasValue = true;
                    return;
                }
            });
            return hasValue;
        };

        // grid layout
        self.InitialGridAvaliableUser = function () {
            self.CreateGridLayout(self.availableUserGridId);
        };
        self.InitialGridSelectedUser = function () {
            self.CreateGridLayout(self.selectedUserGridId);
        };
        self.SetDataGridAvaliableUser = function (userViewModelList) {
            var datasource = self.GetDatasourceByUserViewModel(userViewModelList);
            jQuery(self.availableUserGridId).data('kendoGrid').dataSource.data(datasource);
        };
        self.SetDataGridSelectedUser = function (userViewModelList) {
            var datasource = self.GetDatasourceByUserViewModel(userViewModelList);
            // add timeout for client side data binding
            setTimeout(function () {
                jQuery(self.selectedUserGridId).data('kendoGrid').dataSource.data(datasource);
            }, self.BindingTimeout);
        };

        // utilities
        self.CreateGridLayout = function (gridId) {
            jQuery(gridId).kendoGrid({
                height: 400,
                scrollable: true,
                resizable: true,
                selectable: false,
                columns: [{
                    field: 'Id',
                    title: '&nbsp;',
                    width: 30,
                    attributes: { 'class': 'columnBoolean' },
                    template: '<label><input type="checkbox"  value="#=Id#" #=IsChecked ? "checked" : ""# /><span class="label"></span></label>'
                }, {
                    field: 'Fullname',
                    title: Localization.MC_FullName
                }, {
                    field: 'AuthenticationProvider',
                    title: Localization.MC_AuthenticationProvider
                }]
            });
            jQuery(gridId).find('.k-grid-content').off('click').on('click', 'tr', self.UpdateCheckboxComponent);
        };
        self.GetDatasourceByUserViewModel = function (userViewModelList) {
            var datasource = [];
            jQuery.each(userViewModelList, function (index, userViewModel) {
                if (userViewModel.Fullname !== self.USERS.EA_SYSTEM) {
                    var userGridModel = self.GetUserGridModel(userViewModel);
                    datasource.push(userGridModel);
                }
            });
            return datasource;
        };
        self.GetUserGridModel = function (userViewModel) {
            var authenticationProvider = self.GetAuthenticationIdByUrl(userViewModel.AuthenticationProvider);
            var userGridModel = {
                Fullname: userViewModel.Fullname,
                AuthenticationProvider: authenticationProvider,
                Id: userViewModel.Id,
                IsChecked: !!userViewModel.IsChecked
            };
            return userGridModel;
        };
        self.GetAuthenticationIdByUrl = function (uri) {
            var authentication = '';
            jQuery.each(self.AuthenticationProviders, function (index, AuthenticationProvider) {
                if (uri === AuthenticationProvider.Uri) {
                    authentication = AuthenticationProvider.Id;
                    return;
                }
            });
            return authentication;
        };
        self.UpdateCheckboxComponent = function (e) {
            var target = jQuery(e.target);
            var isChecked = false;
            if (!target.is('input') && !target.is('label') && !target.hasClass('.label')) {
                target = jQuery(e.currentTarget).find('input[type="checkbox"]');
                isChecked = !target.prop('checked');
                target.prop('checked', isChecked);
            }
            else {
                isChecked = target.prop('checked');
            }
            self.UpdateCheckedUserViewModel(target.closest('.k-grid').attr('id'), target.closest('tr').data('uid'), isChecked);

        };
        self.UpdateCheckedUserViewModel = function (gridId, uid, isChecked) {
            var grid = jQuery(kendo.format('#{0}', gridId)).data('kendoGrid');
            var user = grid.dataSource.getByUid(uid);
            user.IsChecked = isChecked;
        };
        self.MoveUsers = function (hasCheckboxesSelected) {
            if (hasCheckboxesSelected) {
                self.SetDataGridSelectedUser(self.UserViewModelInRoleList);
                self.GetAvaliableUsers();
                self.SubmitButtonHandler();
            }
        };
        self.SubmitButtonHandler = function () {
            var submitButton = jQuery(self.manageUserRolePopupId).find('.btn.btnPrimary');
            var updatedUsers = self.SerializeUsers(self.UserViewModelInRoleList);
            submitButton.removeClass('disabled');
            if (updatedUsers === self.SelectedUsers) {
                submitButton.addClass('disabled');
            }
        };
        self.InitializeViewObject = function (users) {
            users.forEach(function (user) {
                user['IsChecked'] = false;
            });
        };
        self.SerializeUsers = function (users) {
            var userIds = jQuery.map(users, function (user) {
                return user.Id;
            });
            userIds.sort();
            return userIds.join(',');
        };
        self.ResetAvaliableUsersCheckedStatus = function () {
            self.UserViewModelAvaliableList.forEach(function (user) {
                user.IsChecked = false;
            });
        };
        self.ResetSelectedUsersCheckedStatus = function () {
            self.UserViewModelInRoleList.forEach(function (user) {
                user.IsChecked = false;
            });
        };
        self.BeginMoveUsersToAvaliableUsersGrid = function () {
            var hasCheckboxesSelected = false;
            if (typeof self.UserViewModelInRoleRemoveList === 'undefined') {
                self.UserViewModelInRoleRemoveList = [];
            }
            jQuery(self.selectedUserGridId).find('tbody input:checkbox:checked').each(function () {
                var userId = this.value;

                self.UserViewModelInRoleRemoveList.push(userId);

                self.UserViewModelInRoleList.forEach(function (user, index) {
                    if (user.Id === userId) {
                        self.UserViewModelInRoleList.splice(index, 1);
                        return;
                    }
                });

                self.UserViewModelAvaliableList.forEach(function (user) {
                    if (user.Id === userId) {
                        user.IsChecked = true;
                        return;
                    }
                });

                hasCheckboxesSelected = true;
            });
            return hasCheckboxesSelected;
        };
        self.BeginMoveUsersToSelectedUsersGrid = function () {
            var hasCheckboxesSelected = false;
            if (typeof self.UserViewModelInRoleList === 'undefined') {
                self.UserViewModelInRoleList = [];
            }

            jQuery(self.availableUserGridId).find('tbody input:checkbox:checked').each(function () {
                var userId = this.value;

                self.UserViewModelInRoleRemoveList.forEach(function (removedId, index) {
                    if (removedId === userId) {
                        self.UserViewModelInRoleRemoveList.splice(index, 1);
                        return;
                    }
                });

                self.UserViewModelAvaliableList.forEach(function (user) {
                    if (user.Id === userId) {
                        var userSelected = jQuery.extend({}, user);
                        userSelected.IsChecked = true;
                        self.UserViewModelInRoleList.push(userSelected);
                        return;
                    }
                });

                hasCheckboxesSelected = true;
            });
            return hasCheckboxesSelected;
        };


        // save users
        self.GetUpdateUsersParameters = function () {
            var roleId = jQuery(self.roleId).val() || null;
            var modelId = jQuery(self.modelId).val() || null;

            var assignUserList = [];
            var unAssignUserList = self.UserViewModelInRoleRemoveList;

            jQuery(self.selectedUserGridId).find('tbody input:checkbox').each(function () {
                assignUserList.push(this.value);
            });

            return {
                modelId: modelId,
                roleId: roleId,
                assignUserList: assignUserList.toString(),
                unAssignUserList: unAssignUserList.toString()
            };
        };
        self.UpdateUsers = function () {
            MC.ajax.request({
                url: self.SaveUserInRoleUri,
                parameters: self.GetUpdateUsersParameters(),
                type: 'POST'
            })
            .done(function (report) {
                self.CreateReportPopup(report).then(function () {
                    var reportButton = jQuery(self.displayReportButtonId);
                    reportButton.trigger('click');
                });
            })
            .fail(function () {
                self.KendoPopup.close();
            })
            .always(function () {
                jQuery(self.manageUserRolePopupId).find('.popupContent').empty();
                jQuery(self.manageUserRoleTitleId).html(Localization.MC_Status);
            });
        };

        // result popup
        self.CreateReportPopup = function (reports) {
            var dfd = jQuery.Deferred();

            var popupHeight = 245;
            var heightIncrement = 30;

            var reportPopup = jQuery(self.reportPopupId);
            var isLogoutRequired = false;

            var htmlTemplate = kendo.format('<strong>{0}:</strong>', Localization.Result);
            var htmlContent = '';

            jQuery.each(reports, function (index, report) {
                var title = report.arguments.findObject('name', 'mass_update_type');
                var information = JSON.parse(report.details);

                if (information.results[self.RESULT_KEY.SUCCESSFUL_UPDATES]) {
                    htmlContent += kendo.format('<li><strong>{0}:</strong></li>', title.value);
                    htmlContent += kendo.format('<li>{0}: {1}</li>', self.RESULT_KEY.SUCCESSFUL_UPDATES, information.results[self.RESULT_KEY.SUCCESSFUL_UPDATES]);

                    if (information.results[self.RESULT_KEY.SESSION_NEEDS_UPDATE]) {
                        isLogoutRequired = true;
                    }
                    popupHeight += heightIncrement;
                }
            });

            htmlTemplate += kendo.format('<ul>{0}</ul>', htmlContent);

            if (isLogoutRequired) {
                htmlTemplate += kendo.format('<br><br><strong>{0}</strong>', Localization.MC_ManageUsersRole_RequiresReLogin);
                popupHeight += heightIncrement;
            }

            reportPopup.find('.popupContent').html(htmlTemplate);
            reportPopup.data(self.RESULT_KEY.SESSION_NEEDS_UPDATE, isLogoutRequired);
            reportPopup.data('kendoWindow').setOptions({
                height: popupHeight,
                close: MC.ui.masschangeuser.ReloadCurrentPage
            });

            dfd.resolve();
            return dfd.promise();
        };
        self.ReloadCurrentPage = function () {
            if (jQuery(self.reportPopupId).data(self.RESULT_KEY.SESSION_NEEDS_UPDATE)) {
                MC.util.showPopupConfirmation(Localization.MC_ConfirmChangePrivileges,
                function () {
                    // on confirm
                    jQuery(self.logoutFormId).submit();
                },
                function () {
                    // on cancel
                    MC.ajax.reloadMainContent();
                });
            }
            else {
                MC.ajax.reloadMainContent();
            }
        };
    };

    win.MC.ui.masschangeuser = new Masschangeuser();

})(window);
