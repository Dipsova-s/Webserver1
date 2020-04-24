*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/SidePanel.robot
Resource            ${EXECDIR}/WC/POM/Shared/ItemBusinessProcess.robot

*** Variables ***
${tabDashboard}                         jquery=#TabDetails .tab-menu-dashboard
${tabDisplays}                          jquery=#TabDetails .tab-menu-displays

# section panel
${divDashboardDefinitionHeader}         css=#TabContentDashboard .section-definition .accordion-header
${divDashboardDescriptionHeader}        css=#TabContentDashboard .section-description .accordion-header
${divDashboardWidgetsHeader}            css=#TabContentWidgets .section-widgets .accordion-header

#Dashboard Personal note
${divTabContentDashboard}               jquery=#TabContentDashboard
${btnDashboardNote}                     .section-personal-note-body
${txtDashboardNote}                     txtareaYourNote

#Description
${btnEditDashboardDescription}          jquery=#TabContentDashboard .action-edit-description
${btnEditDashboardDescriptionOnDashboardName}   jquery=.section-info-header .action-edit-description
${divDashboardDescription}              jquery=#TabContentDashboard .section-description-body

#Execute at logon
${chkDashboardExecuteOnLogin}           css=#ExecuteOnLogin

*** Keywords ***
Expand All Dashboard Section Panels
    Expand Section Panel: Dashboard Filters
    Expand Section Panel: Dashboard Description

Collapse All Dashboard Section Panels
    Collapse Section Panel: Dashboard Filters
    Collapse Section Panel: Dashboard Description

Expand All Displays Section Panels
    Expand Section Panel: Dashboard Widgets

Collapse All Displays Section Panels
    Collapse Section Panel: Dashboard Widgets

Expand Section Panel: Dashboard Filters
    Expand Section Panel  ${divDashboardDefinitionHeader}

Expand Section Panel: Dashboard Description
    Expand Section Panel  ${divDashboardDescriptionHeader}

Expand Section Panel: Dashboard Widgets
    Expand Section Panel  ${divDashboardWidgetsHeader}

Collapse Section Panel: Dashboard Filters
    Collapse Section Panel  ${divDashboardDefinitionHeader}

Collapse Section Panel: Dashboard Description
    Collapse Section Panel  ${divDashboardDescriptionHeader}

Collapse Section Panel: Dashboard Widgets
    Collapse Section Panel  ${divDashboardWidgetsHeader}

Section Panel Should Expanded: Dashboard Filters
    Section Panel Should Expanded  ${divDashboardDefinitionHeader}

Section Panel Should Expanded: Dashboard Description
    Section Panel Should Expanded  ${divDashboardDescriptionHeader}

Section Panel Should Expanded: Dashboard Widgets
    Section Panel Should Expanded  ${divDashboardWidgetsHeader}

Section Panel Should Collapsed: Dashboard Filters
    Section Panel Should Collapsed  ${divDashboardDefinitionHeader}

Section Panel Should Collapsed: Dashboard Description
    Section Panel Should Collapsed  ${divDashboardDescriptionHeader}

Section Panel Should Collapsed: Dashboard Widgets
    Section Panel Should Collapsed  ${divDashboardWidgetsHeader}

Click Dashboard Tab
    [Arguments]  ${expandAll}=${True}
    Click Element  ${tabDashboard}
    Run Keyword If  ${expandAll}==${True}  Expand All Dashboard Section Panels

Click Displays Tab
    [Arguments]  ${expandAll}=${True}
    Click Element  ${tabDisplays}
    Run Keyword If  ${expandAll}==${True}  Expand All Displays Section Panels

Input Dashboard Note
    [Arguments]    ${text}      ${isAdhoc}={False}
    Click Element    ${divTabContentDashboard} ${btnDashboardNote} 
    Wait Until Element Is Visible    ${txtDashboardNote}        
    Input Text    ${txtDashboardNote}    ${text}
    Press Keys    ${txtDashboardNote}    RETURN 
    Run Keyword If  ${isAdhoc} == ${False}  Wait Until Ajax Complete
    ...     Page Should Contain Toast Success

Click Edit Dashboard Description
    Click Element  ${btnEditDashboardDescription}
    Wait Until Edit Description Popup Loaded    

Click Edit Dashboard Description On Dashboard Name
    Click Element  ${btnEditDashboardDescriptionOnDashboardName}
    Wait Until Edit Description Popup Loaded    

Dashboard Description Should Contain
    [Arguments]  ${text}
    Element Should Contain  ${divDashboardDescription}  ${text}

Select Dashboard Execute At Logon
    Select CheckBox  ${chkDashboardExecuteOnLogin}
    Sleep  ${TIMEOUT_GENERAL}
    Wait Until Element Is Enabled  ${chkDashboardExecuteOnLogin}
    Checkbox Should Be Selected  ${chkDashboardExecuteOnLogin}

Unselect Dashboard Execute At Logon
    Unselect CheckBox  ${chkDashboardExecuteOnLogin}
    Sleep  ${TIMEOUT_GENERAL}
    Wait Until Element Is Enabled  ${chkDashboardExecuteOnLogin}
    Checkbox Should Not Be Selected  ${chkDashboardExecuteOnLogin}

Add Dashboard Filter Button Is Visible
    Element Should Be Visible    ${divTabContentDashboard} ${btnAddFilter}

Add Dashboard Filter Button Is Not Visible
    Element Should Not Be Visible    ${divTabContentDashboard} ${btnAddFilter}