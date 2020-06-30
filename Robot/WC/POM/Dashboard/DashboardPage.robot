*** Settings ***
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardSidePanel.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardPublishingPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardValidatingPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardExecuteParametersPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardStatisticPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/SaveDashboardAsPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardWidgetDefinition.robot

*** Variables ***
${ddlDashboardActionDropdownList}                   ActionDropdownList
${ddlDashboardActionDropdownListExecuteDashboard}   css=#ActionDropdownListPopup .exitEditMode
${ddlDashboardActionDropdownDownload}               css=#ActionDropdownListPopup .download

${divWidgetDisplayHeader}               jquery=.widget-display-header
${btnWidgetDelete}                      jquery=.widgetButtonDelete
${btnConfirmDeleteWidget}               jquery=#btn-popupNotification1
${lnkWidgetOpenNewWindow}               jquery=.widgetButtonOpenNewWindow
${divWidgets}                           jquery=#dashboardWrapper .widget-display-column
${linkMaximizeDashboard}                jquery=.widgetButtonMaximize
${linkMinimizeDashboard}                jquery=.widgetButtonMinimize

${btnShowPublishSettings}               css=#ShowPublishSettingsButton
${btnShowValidateButton}                css=#ShowValidateButton
${btnCancelConfirmation}                css=#btn-popupNotification0

#Save Buttons
${btnDashboardSaveMain}                 jquery=#DashboardSavingWrapper .btn-main-saving
${btnDasboardSaveOption}                jquery=#DashboardSavingWrapper .btn-saving-options
${btnDashboardSaveAll}                  jquery=#AngleSavingWrapper .action-save-all                       
${btnSaveDashboardAs}                   jquery=#DashboardSavingWrapper .action-save-dashboard-as

*** Keywords ***
Wait Dashboard Document Loaded
    Wait Until Page Initialized
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Wait Dashboard Widgets Loaded

Wait Dashboard Widgets Loaded
    Sleep    ${TIMEOUT_LARGEST}
    ${widgetCount}    Get Element Count    ${divWidgets}
    : FOR    ${INDEX}    IN RANGE    0    ${widgetCount}
    \   Wait Until Page Does Not Contain Element    ${divWidgets}:eq(${INDEX}) .k-loading-mask
    \   Sleep    ${TIMEOUT_GENERAL}

Reload Dashboard Page
    Reload Page
    Wait Dashboard Document Loaded

Show Dashboard Widget Menu
    [Arguments]    ${index}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${divWidgets}:eq(${index}) .k-loading-mask
    Mouse Over    ${divWidgetDisplayHeader}:eq(${index})
    Sleep    ${TIMEOUT_GENERAL}

Click Maximize Dashboard
    [Arguments]    ${index}
    Show Dashboard Widget Menu    ${index}
    Wait Until Element Is Visible    ${linkMaximizeDashboard}:eq(${index})
    Click Element   ${linkMaximizeDashboard}:eq(${index})

Click Minimize Dashboard
    [Arguments]    ${index}
    Show Dashboard Widget Menu    ${index}
    Wait Until Element Is Visible    ${linkMinimizeDashboard}:eq(${index})
    Click Element   ${linkMinimizeDashboard}:eq(${index})

Click Link Go To Angle
    [Arguments]    ${index}
    Show Dashboard Widget Menu    ${index}
    Click Element    ${lnkWidgetOpenNewWindow}:eq(${index})

Click Delete Widget
    [Arguments]  ${index}
    Show Dashboard Widget Menu    ${index}
    Click Element  ${btnWidgetDelete}:eq(${index})
    Click Element  ${btnConfirmDeleteWidget}
    Wait Progress Bar Closed

Click Execute Dashboard Action
    Wait Until Element Is Visible    ${ddlDashboardActionDropdownListExecuteDashboard}
    Click Element    ${ddlDashboardActionDropdownListExecuteDashboard}

Click Download Dashboard
    Click Element  ${ddlDashboardActionDropdownDownload}

Dashboard Download Button Should Be Available
    Element Should Be Visible    ${ddlDashboardActionDropdownDownload}

Dashboard Download Button Should Not Be Available
    Element Should Not Be Visible    ${ddlDashboardActionDropdownDownload}

Dashboard Downloading Should Get A Confirmation Popup
    Click Download Dashboard
    Page Should Contain Element  ${popupNotification} .confirm
    Click Element   ${btnCancelConfirmation}

Open Dashboard Publishing Popup
    Click Element   ${btnShowPublishSettings}
    Wait Dashboard Publishing Popup Loaded

Dashboard Publishing Should Get A Confirmation Popup
    Click Element   ${btnShowPublishSettings}
    Page Should Contain Element  ${popupNotification} .confirm
    Click Element   ${btnCancelConfirmation}

Check Dashboard Is Published
    Page Should Contain Element    ${btnShowPublishSettings}.btn-primary

Check Dashboard Is Unpublished
    Page Should Contain Element    ${btnShowPublishSettings}.btn-light

Open Dashboard Validating Popup
    Click Element   ${btnShowValidateButton}
    Wait Angle Validating Popup Loaded

Check Dashboard Is Validated
    Page Should Contain Element    ${btnShowValidateButton}.btn-success

Check Dashboard Is Unvalidated
    Page Should Contain Element    ${btnShowValidateButton}.btn-light

Click Drilldown Chart Widget
    [Arguments]  ${index}
    Click Element  ${divWidgets}:eq(${index}) .k-chart:eq(0) > svg > g > g:nth-child(3) > g:nth-child(5) > g > g:nth-child(1)
    Wait Dashboard Widgets Loaded

Click Drilldown Pivot Widget
    [Arguments]  ${index}
    Click Element  ${divWidgets}:eq(${index}) .dxpgCell:eq(0)
    Wait Dashboard Widgets Loaded   

Click Dashboard Main Save
    Click Element    ${btnDashboardSaveMain}

Dashboard Main Save Button Is Download
    Element Text Should Be  ${btnDashboardSaveMain}  Download Dashboard

Dashboard Save Button Should Be Disabled
    Page Should Contain Element  ${btnDashboardSaveMain}.disabled

Dashboard Save Button Should Be Enable
    Page Should Contain Element  ${btnDashboardSaveMain}:not(.disabled)

Dashboard Save Button Is Save All
    Element Text Should Be    ${btnDashboardSaveMain}  Save

Dashboard Save Button Is Save Dashboard As
    Element Text Should Be    ${btnDashboardSaveMain}  Save Dashboard as...
    
Dashboard Save Button Should Be Available
    Page Should Contain Element    ${btnDashboardSaveMain}

Dashboard Save Button Should Not Be Available
    Page Should Not Contain Element    ${btnDashboardSaveMain}

Dashboard Save All Button Should Be Available
    Page Should Contain Element    ${btnDashboardSaveAll}

Dashboard Save All Button Should Not Be Available
    Page Should Not Contain Element    ${btnDashboardSaveAll}

Dashboard Save As Button Should Be Available
    Page Should Contain Element    ${btnSaveDashboardAs}

Dashboard Save As Button Should Not Be Available
    Page Should Not Contain Element    ${btnSaveDashboardAs}

Click Dashboard Option Save
    [Arguments]    ${element}
    Click Caret Of Dashboard Save Button
    Click Element  ${element}

Click Caret Of Dashboard Save Button
    Click Element  ${btnDasboardSaveOption}
    Sleep  ${TIMEOUT_LARGEST}

Click Dashboard Save All
    ${hasButton}  Is Element Exist  ${btnDashboardSaveAll} 
    Run Keyword If  ${hasButton}  Click Dashboard Option Save    ${btnDashboardSaveAll} 
    ...    ELSE                   Click Dashboard Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Toast Success
    Wait Dashboard Widgets Loaded

Click Save Dashboard As
    ${hasButton}  Is Element Exist  ${btnSaveDashboardAs} 
    Run Keyword If  ${hasButton}  Click Dashboard Option Save    ${btnSaveDashboardAs}  
    ...    ELSE                   Click Dashboard Main Save
    Wait Until Save Dashboard As Popup Loaded

Dashboard Name Should Be
    [Arguments]    ${dashboardName}
    ${text}    Get Dashboard Name
    Should Be Equal    ${text}    ${dashboardName}

Get Dashboard Name
    ${text}  Get Text  css=#SectionInfo .name
    [Return]  ${text}

Click Apply Dashboard Filter
   Click Apply Filter Button
   Wait Dashboard Document Loaded

Widget Should Be List Display
    [Arguments]  ${index}
    Page Should Contain Element  ${divWidgets}:eq(${index}).displayList

Widget Should Be Chart Display
    [Arguments]  ${index}
    Page Should Contain Element  ${divWidgets}:eq(${index}).displayChart

Widget Should Be Pivot Display
    [Arguments]  ${index}
    Page Should Contain Element  ${divWidgets}:eq(${index}).displayPivot

All Widgets Should Display Properly
    ${widgetCount}    Get Element Count    ${divWidgets}
    : FOR    ${INDEX}    IN RANGE    0    ${widgetCount}
    \   ${width}  ${height}  Get Element Size  ${divWidgets}:eq(${INDEX})
    \   Should Be True  ${width} > 30
    \   Should Be True  ${height} > 30
