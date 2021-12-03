*** Variables ***
${divPublishingPopup}       css=#popupPublishSettings
${pgbPublishingPopup}       css=#popupPublishSettings .k-loading-mask
${btnClosePublishPopup}     //span[@id='popupPublishSettings_wnd_title']/..//div/a[@class='k-button k-flat k-button-icon k-window-action']/span[@class='k-icon k-i-close icon icon-close']/..
${btnSavePublishSettings}   css=#SavePublishSettingsButton
${btnPublishAngle}          css=#PublishButton
${btnUnpublishAngle}        css=#UnpublishButton
${chkAllowUserToObtainMoreDetails}    AllowMoreDetails
${chkAllowUserToGoToRelatedObjectViaJump}    AllowFollowups
${lastdisplay}              jquery=#popupPublishSettings .displayNameContainer .name:last
${divPublishLabelCategory}  jquery=.item-label-wrapper .multiple-select-header
${divListPublishLabel}      jquery=.multiple-select-list-label

*** Keywords ***
Wait Angle Publishing Popup Loaded
    Wait Until Element Exist And Visible   ${divPublishingPopup}
    Wait Until Page Does Not Contain Element    ${pgbPublishingPopup}

Wait Angle Publishing Saved
    Wait Until Page Does Not Contain Element    ${divPublishingPopup}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Do Not Allow User To Obtain More Details
    Select Checkbox    ${chkAllowUserToObtainMoreDetails}

Click Allow User To Obtain More Details
    Unselect Checkbox    ${chkAllowUserToObtainMoreDetails}

Click Do Not Allow Users To Go To Related Objects Via The Jumps
    Select Checkbox    ${chkAllowUserToGoToRelatedObjectViaJump}

Click Allow Users To Go To Related Objects Via The Jumps
    Unselect Checkbox    ${chkAllowUserToGoToRelatedObjectViaJump}

Click Save Angle Publish Settings
    Click Element    ${btnSavePublishSettings}
    Wait Angle Publishing Saved

Do Not Allow Users to Obtain More Details Is Checked    
    Open Angle Publishing Popup
    Checkbox Should Be Selected     ${chkAllowUserToObtainMoreDetails}
    Close Publish Angle Popup

Do Not Allow Users to Obtain More Details Is Unchecked
    Open Angle Publishing Popup
    Checkbox Should Not Be Selected     ${chkAllowUserToObtainMoreDetails}
    Close Publish Angle Popup

Do Not Allow Users To Go To Related Objects Via The Jumps Is Checked
    Open Angle Publishing Popup
    Checkbox Should Be Selected     ${chkAllowUserToGoToRelatedObjectViaJump}
    Close Publish Angle Popup

Do Not Allow Users To Go To Related Objects Via The Jumps Is Unchecked
    Open Angle Publishing Popup
    Checkbox Should Not Be Selected     ${chkAllowUserToGoToRelatedObjectViaJump}
    Close Publish Angle Popup

Click Publish Angle
    Click Element    ${btnPublishAngle}
    Wait Angle Publishing Saved

Click Unpublish Angle
    Click Element    ${btnUnpublishAngle}
    Wait Angle Publishing Saved  

Close Publish Angle Popup
    Wait Until Element Is Visible    ${btnClosePublishPopup}
    Click Element    ${btnClosePublishPopup}

Verify Publishing Displays Should Contain A Display
    [Arguments]    ${displayname}    
    Element Text Should Be    ${lastdisplay}    ${displayname}	

Verify Publishing Displays Should Not Contain A Display
    [Arguments]    ${displayname}    
    Element Text Should Not Be    ${lastdisplay}    ${displayname}

Click Plus Icon To Add Label
    [Arguments]     ${labelCatogory}
    Click Element   ${divPublishLabelCategory}:contains(${labelCatogory}) + .multiple-select-button

Select Label To Add
    [Arguments]     ${labelName}
    Click Element   ${divListPublishLabel}:contains(${labelName})