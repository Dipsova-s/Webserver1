*** Settings ***
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardDetailPopup.robot
Resource            ${EXECDIR}/WC/POM/Dashboard/DashboardExecuteParametersPopup.robot

*** Variables ***
${btnToggleDashboard}                   ToggleAngle
${ddlDashboardActionDropdownList}       ActionDropdownList
${ddlDashboardActionDropdownListExecuteDashboard}        css=#ActionDropdownListPopup .exitEditMode
${divWidgetDisplayHeader}               jquery=.widgetDisplayHeader
${btnWidgetButtonMenu}                  jquery=.widgetButtonMenu
${lnkWidgetOpenNewWindow}               jquery=.widgetButtonOpenNewWindow:visible
${btnDashboardNote}         css=#YourNote
${txtDashboardNote}         css=#txtYourNote
${divWidgets}               jquery=#dashboardWrapper .widgetDisplayColumn

${linkMaximizeDashboard}     jquery=.widgetButtonMaximize
${linkMinimizeDashboard}     jquery=.widgetButtonMinimize
${ddlDashboardPanel}         jquery=#dashboardFilterWrapper
${btnOpenDashboardFilter}    .btnOpenFilters
${ddlDashboardFilterCount}   .dashboardFilterCount 

*** Keywords ***
Wait Dashboard Document Loaded
    Wait Until Page Initialized
    Wait Progress Bar Closed

Click Toggle the Dashboard
    Click Element   ${btnToggleDashboard}
    Sleep    ${TIMEOUT_GENERAL}

Click Edit Dashboard
    Click Element   ${lnkEditDashboard}

Click Dashboard Name
    Click Element   ${lnkDashboardName}

Open Dashboard Windget Menu
    [Arguments]    ${index}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${divWidgets}:eq(${index}) .k-loading-mask
    Mouse Over    ${divWidgetDisplayHeader}:eq(${index})
    Sleep    ${TIMEOUT_GENERAL}
    ${isMenuShown}    Is Element Visible    ${divWidgets}:eq(${index}) .widgetToolbarActions
    Run Keyword If    ${isMenuShown} == False    Click Element    ${btnWidgetButtonMenu}:eq(${index})
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
    Capture Page Screenshot
    Click Element    ${lnkWidgetOpenNewWindow}

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

Click Dashboard Dropdown Actions
    Wait Until Page Contains Element    ${ddlDashboardActionDropdownList}
    Wait Until Element Is Visible    ${ddlDashboardActionDropdownList}
    Click Element    ${ddlDashboardActionDropdownList}

Click Execute Dashboard Action
    Click Dashboard Dropdown Actions
    Wait Until Element Is Visible    ${ddlDashboardActionDropdownListExecuteDashboard}
    Click Element    ${ddlDashboardActionDropdownListExecuteDashboard}

Open Dashboard Detail Popup From Dashboard Name
    [Arguments]    ${fieldKeyword}
    Wait Until Element Is Visible    ${txtDashboard} [title="${fieldKeyword}"]
    Click Element    ${txtDashboard} [title="${fieldKeyword}"]
    Wait Dashboard Detail Document Loaded

Open Dashboard From First Dashboard in Search Page
    [Arguments]    ${dashboardName}
    Click Link First Item From Search Result
    Sleep    2s

Open Filter From Dashboard Filter Panel
    Click Element    ${ddlDashboardPanel} ${btnOpenDashboardFilter}
    Wait Dashboard Detail Document Loaded

Verify Dashboard Filters Count
    [Arguments]    ${expectFilterCount}
    ${filterText}    Get Text    ${ddlDashboardPanel} ${ddlDashboardFilterCount}
    Should Be Equal    ${filterText}    ${expectFilterCount}   
