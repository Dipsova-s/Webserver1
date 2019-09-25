*** Variables ***
${btnPopupNotificationWarningAngle}    css=#btn-popupNotification0
${btnWarningCreateAngle}    css=#btn-popupNotification1


*** Keywords ***
Check If Angle Or Display Has A Warning Then Close The Popup
    Sleep   ${TIMEOUT_LARGEST}   Wait make sure warning popup was presented
    Check Web Error
    ${statusWarningPopup}   Is Element Visible    ${btnPopupNotificationWarningAngle}
    ${isBackToSearch}    Execute JavaScript  return WC.Utility.GetParameterByName('isTemplate')=='true'&&'${statusWarningPopup}'=='True';
    Run Keyword If    ${statusWarningPopup} == True    Click Element    ${btnPopupNotificationWarningAngle}
    [Return]  ${isBackToSearch}