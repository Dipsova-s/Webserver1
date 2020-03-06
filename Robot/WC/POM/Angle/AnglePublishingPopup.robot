*** Variables ***
${divPublishingPopup}       css=#popupPublishSettings
${pgbPublishingPopup}       css=#popupPublishSettings .k-loading-mask
${btnClosePublishPopup}     //span[@id='popupPublishSettings_wnd_title']/..//div/a[@class='k-button k-bare k-button-icon k-window-action']/span[@class='k-icon k-i-close icon icon-close']/..
${btnSavePublishSettings}   css=#SavePublishSettingsButton
${btnPublishAngle}          css=#PublishButton
${btnUnpublishAngle}        css=#UnpublishButton
${chkAllowUserToObtainMoreDetails}    AllowMoreDetails


*** Keywords ***
Wait Angle Publishing Popup Loaded
    Wait Until Element Exist And Visible   ${divPublishingPopup}
    Wait Until Page Does Not Contain Element    ${pgbPublishingPopup}

Wait Angle Publishing Saved
    Wait Until Page Does Not Contain Element    ${divPublishingPopup}
    Wait Progress Bar Closed
    Wait Until Ajax Complete
	Page Should Contain Toast Success

Click Do Not Allow User To Obtain More Details
    Select Checkbox    ${chkAllowUserToObtainMoreDetails}

Click Allow User To Obtain More Details
    Unselect Checkbox    ${chkAllowUserToObtainMoreDetails}

Click Save Angle Publish Settings
    Click Element    ${btnSavePublishSettings}
    Wait Angle Publishing Saved

Click Publish Angle
    Click Element    ${btnPublishAngle}
    Wait Angle Publishing Saved

Click Unpublish Angle
    Click Element    ${btnUnpublishAngle}
    Wait Angle Publishing Saved

Close Publish Angle Popup
    Wait Until Element Is Visible    ${btnClosePublishPopup}
    Click Element    ${btnClosePublishPopup}

Click Plus Icon To Add Label
    [Arguments]     ${labelCatogory}
    Click Element   xpath=//div[contains(text(),'${labelCatogory}')]/parent::div/..//i

Select Label To Add
    [Arguments]     ${labelName}
    Click Element   //span[contains(text(), '${labelName}')]