*** Settings ***
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardPublishingPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardValidatingPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardDetailPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardExecuteParametersPopup.robot

*** Variables ***
${btnToggleDashboard}                   ToggleAngle
${ddlDashboardActionDropdownList}       ActionDropdownList
${ddlDashboardActionDropdownListExecuteDashboard}        css=#ActionDropdownListPopup .exitEditMode
${divWidgetDisplayHeader}               jquery=.widget-display-header
${lnkWidgetOpenNewWindow}               jquery=.widgetButtonOpenNewWindow
${btnDashboardNote}                     css=#YourNote
${txtDashboardNote}                     css=#txtYourNote
${divWidgets}                           jquery=#dashboardWrapper .widget-display-column
${divDashboardFilterWrapper}            css=#dashboardFilterWrapper
${btnDashboardFilterToggle}             css=.dashboardFilterToggle

${linkMaximizeDashboard}     jquery=.widgetButtonMaximize
${linkMinimizeDashboard}     jquery=.widgetButtonMinimize
${ddlDashboardPanel}         jquery=#dashboardFilterWrapper
${btnOpenDashboardFilter}    .btnOpenFilters
${ddlDashboardFilterCount}   .dashboardFilterCount 
${btnEditFilter}             .btnEditFilter
${divPopupListFilter}        css=#popupListFilter
${btnCancelEditDashboard}    css=#btn-popupListFilter0

${btnShowPublishSettings}      css=#ShowPublishSettingsButton
${btnShowValidateButton}       css=#ShowValidateButton

*** Keywords ***
Wait Dashboard Document Loaded
    Wait Until Page Initialized
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Wait Dashboard Widgets Loaded

Wait Dashboard Widgets Loaded
    Sleep    ${TIMEOUT_LARGEST}
    ${widgetCount}    Get Elements Count    ${divWidgets}
    : FOR    ${INDEX}    IN RANGE    0    ${widgetCount}
    \   Wait Until Page Does Not Contain Element    ${divWidgets}:eq(${INDEX}) .k-loading-mask
    \   Sleep    ${TIMEOUT_GENERAL}

Click Toggle the Dashboard
    Click Element   ${btnToggleDashboard}
    Sleep    ${TIMEOUT_GENERAL}

Click Edit Dashboard
    Click Element   ${lnkEditDashboard}

Click Dashboard Name
    Click Element   ${lnkDashboardName}
    Wait Dashboard Detail Document Loaded

Show Dashboard Widget Menu
    [Arguments]    ${index}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${divWidgets}:eq(${index}) .k-loading-mask
    Mouse Over    ${divWidgetDisplayHeader}:eq(${index})
    Sleep    ${TIMEOUT_GENERAL}

Click Maximize Dashboard
    [Arguments]    ${index}
    Wait Until Element Is Visible    ${linkMaximizeDashboard}:eq(${index})
    Click Element   ${linkMaximizeDashboard}:eq(${index})

Click Minimize Dashboard
    [Arguments]    ${index}
    Wait Until Element Is Visible    ${linkMinimizeDashboard}:eq(${index})
    Click Element   ${linkMinimizeDashboard}:eq(${index})

Click Link Go To Angle
    [Arguments]    ${index}
    Click Element    ${lnkWidgetOpenNewWindow}:eq(${index})

Click Add Note On Dashboard
    Click Element     ${btnDashboardNote}

Input Dashboard Note
    [Arguments]    ${DashboardNote}
    Wait Until Element Is Visible    ${txtDashboardNote}
    Input Text    ${txtDashboardNote}    ${DashboardNote}
    Press Key    ${txtDashboardNote}    \\13
    Wait Until Ajax Complete

Dashboard Note Should Be Equal
    [Arguments]    ${DashboardNote}
    ${compareDashboardNote}    Get Text    ${btnDashboardNote}
    Should Be Equal    ${compareDashboardNote}    ${DashboardNote}

Click Execute Dashboard Action
    Wait Until Element Is Visible    ${ddlDashboardActionDropdownListExecuteDashboard}
    Click Element    ${ddlDashboardActionDropdownListExecuteDashboard}

Open Filter Panel
    ${isPanelClosed}    Is Element Has CssClass    ${divDashboardFilterWrapper}    close
    Run Keyword If    ${isPanelClosed}    Click Element    ${btnDashboardFilterToggle}

Close Filter Panel
    ${isPanelOpened}    Is Element Has CssClass    ${divDashboardFilterWrapper}    open
    Run Keyword If    ${isPanelOpened}    Click Element    ${btnDashboardFilterToggle}

Open Filter From Dashboard Filter Panel
    Open Filter Panel
    Click Element    ${ddlDashboardPanel} ${btnOpenDashboardFilter}
    Wait Dashboard Detail Document Loaded

Click Editing From Dashboard Filter Panel
    Wait Until Element Is Visible    ${ddlDashboardPanel} ${btnEditFilter}  
    Click Element    ${ddlDashboardPanel} ${btnEditFilter} 

Cancel Edit Dashboard
    Click Element    ${btnCancelEditDashboard}

Get Widget Title For Angle Page
    [Arguments]    ${index}
    ${widgetTitle}    Get Text    ${divWidgets}:eq(${index}) .widgetName
    ${anglePageTitle}    Execute JavaScript    return $.trim('${widgetTitle}'.substr('${widgetTitle}'.indexOf(' - ') + 3));
    [Return]    ${anglePageTitle}

Open Dashboard Publishing Popup
    Click Element   ${btnShowPublishSettings}
    Wait Dashboard Publishing Popup Loaded

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