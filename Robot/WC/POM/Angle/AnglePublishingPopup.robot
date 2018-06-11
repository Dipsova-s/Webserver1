*** Variables ***
${divPublishingPopup}       css=#popupAnglePublishing
${btnClosePublishPopup}     css=.popupAnglePublishing .k-i-close
${btnPublishAngle}          btn-popupAnglePublishing1
${pgbPublishingPopup}       css=#popupAnglePublishing .k-loading-mask

*** Keywords ***
Wait Angle Publishing Popup Loaded
    Wait Until Page Does Not Contain Element    ${pgbPublishingPopup}

Open Angle Publishing Popup
    Click Angle Detail Publishing Tab
    Click Angle Set to Publish
    Wait Angle Publishing Popup Loaded

Click Publish Angle
    Wait Until Element Is Visible    ${btnPublishAngle}
    Click Element    ${btnPublishAngle}
    Wait Until Page Does Not Contain Element    ${divPublishingPopup}

Close Publish Popup
    Wait Until Element Is Visible    ${btnClosePublishPopup}
    Click Element    ${btnClosePublishPopup}