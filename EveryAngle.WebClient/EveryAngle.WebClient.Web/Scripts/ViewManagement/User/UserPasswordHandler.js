window.UserPasswordHandler = function () {
    "use strict";

    var self = this;

    var userPasswordHtmlTemplate = function () {
        return [
            '<form autocomplete="off" onsubmit="return false">', 
                '<div class="popupTabPanel changePasswordPanel">',
                    '<div class="row">',
                        '<div class="field">' + Localization.User + ':</div>',
                        '<div class="input">' + userModel.Data().id + '</div>',
                    '</div>',
                    '<div class="row">',
                        '<div class="field">' + Localization.OldPassword + ':</div>',
                        '<div class="input"><input autocomplete="new-password" id="oldPassword" name="wc_oldPassword" class="eaText Password oldPassword" type="password" tabindex="2" placeholder="' + Localization.OldPassword + '" /></div>',
                    '</div>',
                    '<div class="row">',
                        '<div class="field">' + Localization.NewPassword + ':</div>',
                        '<div class="input"><input autocomplete="new-password" id="newPassword" name="wc_newPassword" class="eaText Password newPassword" type="password" tabindex="3" placeholder="' + Localization.NewPassword + '" /></div>',
                    '</div>',
                    '<div class="row">',
                        '<div class="field">' + Localization.ConfirmPassword + ':</div>',
                        '<div class="input"><input autocomplete="new-password" id="ComparedPassword" name="wc_newComparedPassword" class="eaText Password ComparedPassword" type="password" tabindex="4" placeholder="' + Localization.ConfirmPassword + '" /></div>',
                    '</div>',
                '</div>',
            '</form>'
        ].join('');
    };

    self.ShowPopup = function () {
        jQuery('#UserMenu').hide();
        var popupName = 'UserPassword',
            popupSettings = {
                title: Localization.ChangePassword,
                element: '#popup' + popupName,
                html: userPasswordHtmlTemplate(),
                className: 'popup' + popupName,
                width: 500,
                minHeight: 185,
                resizable: false,
                actions: ["Close"],
                buttons: [
                    {
                        text: Captions.Button_Cancel,
                        click: 'close',
                        position: 'right'
                    },
                    {
                        text: Localization.Ok,
                        click: self.SubmitChangePassword,
                        isPrimary: true,
                        position: 'right'
                    }
                ],
                close: popup.Destroy
            };
        popup.Show(popupSettings);
    };

    self.SubmitChangePassword = function () {
        var oldpassword = jQuery('#oldPassword').val();
        var newpassword = jQuery('#newPassword').val();
        var comparedPasswordElement = jQuery('#ComparedPassword').val();

        if (oldpassword === '' || newpassword === '' || comparedPasswordElement === '') {
            self.ShowErrorMessage(Localization.PleaseEnterYourPasswords);
        }
        else if (newpassword !== comparedPasswordElement) {
            self.ShowErrorMessage(Localization.PasswordDoesNotMatch);
        }
        else {
            self.ChangePassword(oldpassword, newpassword);
        }
    };

    self.ChangePassword = function (oldpassword, newpassword) {
        progressbarModel.ShowStartProgressBar();
        var newPasswordContent = { 'user': userModel.Data().id, 'oldpassword': oldpassword, 'newpassword': newpassword };
        var changePasswordUrl = 'password/changepassword';

        errorHandlerModel.IsNeedToRedirectToLoginPage = false;
        UpdateDataToWebService(changePasswordUrl, newPasswordContent)
            .done(function () {
                popup.Close('#popupUserPassword');
                toast.MakeSuccessText(Localization.Toast_ChangePassword);
            })
            .fail(function (data,status, xhr) {
                // to suppress ajax error popup
                errorHandlerModel.Enable(false);
                var errorMsg = window.WC.Authentication.GetErrorMessage(data, status, xhr);
                self.ShowErrorMessage(errorMsg);
            })
            .always(function () {
                progressbarModel.EndProgressBar();
                setTimeout(function () {
                    errorHandlerModel.Enable(true);
                    errorHandlerModel.IsNeedToRedirectToLoginPage = true;
                }, 500);
            });
    };

    self.ShowErrorMessage = function (errMsg) {
        $('#ErrorMessage').parents('.row').remove();
        $('.changePasswordPanel').append(
                ['<div class="row">',
                    '<div class="field"></div>',
                    '<div id="ErrorMessage" class="input loginMessage">' + errMsg + '</div>',
                '</div>'].join(''));
    };
};

var userPasswordHandler = new UserPasswordHandler();