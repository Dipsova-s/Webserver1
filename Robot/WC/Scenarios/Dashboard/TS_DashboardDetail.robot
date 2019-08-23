*** Settings ***
Resource    		${EXECDIR}/WC/POM/Dashboard/DashboardPage.robot
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource            ${EXECDIR}/WC/POM/Angle/AddToDashboardPopup.robot

***Variables***
${dashboardName}   [ROBOT] Dashboard Test


*** Keywords ***
Dashboard Details
    Create Dashboard With 2 Angles    ${dashboardName}
    Open Dashboard Detail Popup
    Check Details on General Tab of last created Dashboard
    Check Details on Description Tab of last created Dashboard
    Check Details on Definition Tab of last created Dashboard
    Close Dashboard Detail Popup
    Click Add Note On Dashboard
    Input Dashboard Note      my note
    Dashboard Note Should Be Equal    my note
    Back To Search And Delete Dashboard Are Created    ${dashboardName}

Add Display To Dashboard Dashboard
    Create Dashboard With 2 Angles    ${dashboardName}
    Back to Search
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Click Angle Dropdown Actions Add To Dashboard
    Click Add To Existing Dashboard
    Click Save Dashboard Button
    Wait Until Page Contains    Display has been added to the Dashboard
    Click Close Info Button
    Back To Search And Delete Dashboard Are Created    ${dashboardName}

###############################################################################

Check Details on General Tab of last created Dashboard
    Page Should Contain    General
    Page Should Contain    Model
    Page Should Contain    Business Processes
    Page Should Contain    Dashboard ID
    Page Should Contain    Execute at login
    Page Should Contain Element     ${chkDashboardExecuteAtLogin}
    Page Should Contain Element     ${divDashboardBusinessProcess}
    Page Should Contain Element     ${txtDashboardId}

Check Details on Description Tab of last created Dashboard
    Click Dashboard Detail Desciption Tab
    Page Should Contain Element    ${btnLanguage}
    Page Should Contain Element    ${dashboardLanguageItem}
    Page Should Contain Element    ${txtDashboardName}

Check Details on Definition Tab of last created Dashboard
    Click Dashboard Detail Definition Tab
    Wait Until Ajax Complete
    Page Should Contain    Definition
    Page Should Contain    Applied Dashboard Displays

Check Details on Statistics Tab of last created Dashboard
    Click Dashboard Detail Statistic Tab
    Wait Until Ajax Complete
    Page Should Contain Element    Created by
    Page Should Contain Element    Last changed by
    Page Should Contain Element    Last executed by

Select Field From Filters Tab
    [Arguments]   ${fieldKeyword}    ${fieldId}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}

Verify Dashboard Filter Still Showing
    [Arguments]   ${index}    ${expectFilterText}
    Click Add Filter From Field    ${index}
    ${filterText}    Get Text    css=#FilterHeader-${index} .filterText  
    Should Be Equal    ${filterText}    ${expectFilterText}   


 