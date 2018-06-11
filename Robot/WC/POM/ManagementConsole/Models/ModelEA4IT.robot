*** Variables ***
${btnEAXractor}                css=#sideMenu-Models-EA4IT-EAXtractor
${btnRefreshCycle}             css=#sideMenu-Models-EA4IT-RefreshCycle
${btnContentParameters}        css=#sideMenu-Models-EA4IT-ContentParameters
${btnModules}                  css=#sideMenu-Models-EA4IT-Modules

${btnBusinessProcessOTHER}               jquery=#CreateAngleByObjectBusinessProcess .OTHER

${btnSelectModelCreateNewAngle}          css=#SelectModelCreateNewAngle
${btnCreateAngleEA4IT}                   jquery=.popupSelectModelCreateNewAngle li[title="EA4IT"]
${btnCreateAngleEA2800}                  jquery=.popupSelectModelCreateNewAngle li[title="EA2_800"]
${btnCloseCreateAnglePopup}              jquery=.k-window-actions [title="Close"]

${btnAngleDetailBusinessProcessS2D}      jquery=#AngleBusinessProcesses .S2D

*** Keywords ***
Click Edit User By User Name
    Wait Until Page Contains Element    ${trRowInAllUserGrid} ${btnEditUser}
    Click Element    ${trRowInAllUserGrid} ${btnEditUser}
    Wait Until Ajax Complete
    Wait MC Progress Bar Closed

Verify EAxtractor
    Element Should Not Be Visible    ${btnEAXractor}

Verify Refresh Cycle
    Element Should Not Be Visible    ${btnRefreshCycle}

Verify Content Parameters
    Element Should Not Be Visible    ${btnContentParameters}

Verify Modules
    Element Should Not Be Visible    ${btnModules}

Select Business Process Other
    Click Element    ${btnBusinessProcessOTHER}
    Wait Until Ajax Complete

Select Model EA4IT For Create Angle
    Click Module EA4IT From Create Angle Button
    Click Object List Button
    Wait Until Ajax Complete
    Wait Create Angle Popup Option Object List Loaded

Click Module EA4IT From Create Angle Button
    Click Element    ${btnSelectModelCreateNewAngle}
    Click Element    ${btnCreateAngleEA4IT}

Select Business Process S2D
    Click Element    ${btnAngleDetailBusinessProcessS2D}

Select Model EA2_800 For Create Angle
    Click Element    ${btnSelectModelCreateNewAngle}
    Click Element    ${btnCreateAngleEA2800}
    Wait Until Ajax Complete

Click Close Create Angle Popup
    Click Element    ${btnCloseCreateAnglePopup}
