*** Variables ***
${btnPopupNotification}    		btn-popupNotification1
${warningPopUpSection}          jquery=#popupNotification

*** Keywords ***
Click Confirm Warning Create Angle Popup Button
    Scroll Vertical     ${warningPopUpSection}   100
    Click Link    ${btnPopupNotification}