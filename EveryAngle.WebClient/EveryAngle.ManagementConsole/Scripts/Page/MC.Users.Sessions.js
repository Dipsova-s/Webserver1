(function (win, users) {

    function Sessions() {
        var self = this;
        self.CurrentUserUri = '';
        self.DeleteUri = '';
        self.GetUsersByUri = '';
        self.UpdateDebugLoggingUri = '';
        self.UsersData = {};

        self.Initial = function (data) {
            self.CurrentUserUri = '';
            self.DeleteUri = '';
            self.GetUsersByUri = '';
            self.UpdateDebugLoggingUri = '';
            self.UsersData = {};

            jQuery.extend(self, data || {});

            setTimeout(function () {
                var grid = jQuery('#SessionsGrid').data('kendoGrid');
                if (grid) {
                    MC.util.gridScrollFixed(grid);
                    grid.bind('dataBound', self.SessionsGridDataBound);
                    if (!MC.ajax.isReloadMainContent) {
                        grid.dataSource.read();
                    }
                    else {
                        grid.trigger('dataBound');
                    }
                }
            }, 1);
        };

        self.SessionsGridDataBound = function (e) {
            var setUserText = function (userUrl) {
                var userData = self.UsersData[userUrl] || { Id: 'Unknown' };
                jQuery('#SessionsGrid').find('[data-uri="' + userUrl + '"]').text(userData.Id);
            };

            var usersUrl = [];
            jQuery.each(e.sender.dataItems() || [], function (index, session) {
                if (self.CurrentUserUri !== session.UserUri) {
                    if (typeof self.UsersData[session.UserUri] === 'undefined') {
                        self.UsersData[session.UserUri] = null;

                        usersUrl.push(session.UserUri);
                    }
                    else if (typeof self.UsersData[session.UserUri] === 'object') {
                        setUserText(session.UserUri);
                    }
                }
            });

            MC.ui.localize();

            if (usersUrl.length) {
                disableLoading();
                MC.ajax.request({
                    url: self.GetUsersByUri,
                    parameters: { usersUrl: usersUrl.join(',') },
                    type: 'POST'
                })
                .done(function (data, status, xhr) {
                    jQuery.each(data, function (index, user) {

                        self.UsersData[user.Uri] = user;

                        setUserText(user.Uri);
                    });
                });
            }
        };

        self.UpdateDebugLogging = function (obj) {
             MC.ajax.request({
                    url: self.UpdateDebugLoggingUri,
                    parameters: { sessionUri: obj.value, isDebugLogging: obj.checked },
                    type: "Post",
                    ajaxSuccess: function () {
                        MC.ajax.reloadMainContent();
                    }
                });
        };

        self.DeleteSessions = function (obj, sessionUri) {
            if ($(obj).hasClass('disabled'))
                return false;

            var confirmMessage = MC.form.template.getRemoveMessage(obj);

            MC.util.showPopupConfirmation(confirmMessage, function () {
                MC.ajax.request({
                    url:self.DeleteUri ,
                    parameters: { sessionUri: sessionUri },
                    type: 'delete'
                })
                .done(function () {
                    $(obj).parents('tr:first').remove();
                    MC.util.resetGridRows($('#SessionsGrid tbody tr'));
                });
            })
        };
    }

    win.MC.Users = users || {};
    jQuery.extend(win.MC.Users, {
        Sessions: new Sessions()
    });

})(window, MC.Users);
