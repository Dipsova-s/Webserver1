*** Variables ***
${btnPopupNotification}    		btn-popupNotification1

*** Keywords ***
Click Confirm Warning Create Angle Popup Button
    Wait Until Element Is Visible    ${btnPopupNotification}
    Click Link    ${btnPopupNotification}