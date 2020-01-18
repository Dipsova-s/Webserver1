*** Variables ***
${divDashboardPublishingPopup}       css=#popupPublishSettings
${pgbDashboardPublishingPopup}       css=#popupPublishSettings .k-loading-mask
${btnDashboardClosePublishPopup}     css=.popupPublishSettings .k-i-close
${btnSavePublishSettings}       css=#SavePublishSettingsButton
${btnPublishDashboard}          css=#PublishButton
${btnUnpublishDashboard}        css=#UnpublishButton
${divDisplayWarnings}           css=#popupPublishSettings .widget-section-message

*** Keywords ***
Wait Dashboard Publishing Popup Loaded
    Wait Until Element Exist And Visible   ${divDashboardPublishingPopup}
    Wait Until Page Does Not Contain Element    ${pgbDashboardPublishingPopup}

Wait Dashboard Publishing Saved
    Wait Until Page Does Not Contain Element    ${divDashboardPublishingPopup}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Save Dashboard Publish Settings
    Click Element    ${btnSavePublishSettings}
    Wait Dashboard Publishing Saved

Click Publish Dashboard
    Click Element    ${btnPublishDashboard}
    Wait Dashboard Publishing Saved

Click Unpublish Dashboard
    Click Element    ${btnUnpublishDashboard}
    Wait Dashboard Publishing Saved

Close Publish Dashboard Popup
    Wait Until Element Is Visible    ${btnDashboardClosePublishPopup}
    Click Element    ${btnDashboardClosePublishPopup}

Click Link Open Private Display
    [Arguments]    ${index}
    Click Element    jquery=#popupPublishSettings .widget-link:eq(${index})

Dashboard Publish Settings Popup Should Contain Private Display Warnings
    Page Should Contain Element    ${divDisplayWarnings}

Dashboard Publish Settings Popup Should Not Contain Private Display Warnings
    Wait Progress Bar Closed
    Page Should Not Contain Element    ${divDisplayWarnings}