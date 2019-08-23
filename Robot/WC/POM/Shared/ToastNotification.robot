*** Variables ***
${toastContainer}                      jquery=.toast-notification
${toastSuccessContainer}               ${toastContainer}.success

*** Keywords ***
Page Should Contain Toast Success
    Wait Until Page Contains Element                ${toastSuccessContainer}
    Page Should Contain Element                     ${toastSuccessContainer}

Close All Toasts
    Execute Javascript    jQuery('.toast-notification__close-icon').trigger('click');
