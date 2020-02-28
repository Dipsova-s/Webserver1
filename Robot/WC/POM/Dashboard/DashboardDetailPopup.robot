*** Variables ***
${pgbDashboardDetailsPopup}    	css=#popupDashboardDetails > div.k-loading-mask

#Generic buttons
${btnCloseDashboardDetailsPopup}    //span[@id='popupDashboardDetails_wnd_title']/..//div/a[@class='k-button k-bare k-button-icon k-window-action']/span[@class='k-icon k-i-close icon icon-close']/..
${btnSaveDashboard}    btn-popupDashboardDetails2
${btnSaveDashboardAs}    btn-popupDashboardDetails1
${btnCancel}    btn-popupDashboardDetails0
${lnkDashboardName}    css=#DashboardName span.Name
${lnkEditDashboard}    css=#DashboardDescriptionWrapper .descriptionHeader a

#Dashboard Tabs
${tabDashboardGeneral}    css=#DashboardTabs .general
${tabDashboardDescription}    css=#DashboardTabs .description
${tabDashboardDefinition}    css=#DashboardTabs .definition
${tabDashboardStatistic}    css=#DashboardTabs .statistic
${tabDashboardFilters}    css=#DashboardTabs .fieldsfilters

#General tab elements
${txtDashboardId}           AngleId
${divDashboardBusinessProcess}      css=.businessProcesses
${chkDashboardExecuteAtLogin}    DashboadAtLogin

#Description tab elements
${btnLanguage}    css=.btnAddLanguage
${dashboardLanguageItem}    css=.LanguageItem a
${txtDashboardName}    css=#DashboardArea .languageName

#Definition tab elements
${divDashboardDefinitionHeader}   jquery=#FilterWrapper .FilterHeader

#Statistic tab elements
${lblCreatedBy}    jquery=#DashboardArea .statisticArea .input:eq(0) span:eq(1)
${lblLastChangedBy}    jquery=#DashboardArea .statisticArea .input:eq(1) span:eq(1)
${lblLastExecutedBy}    jquery=#DashboardArea .statisticArea .input:eq(2) span:eq(1)

#Filters Tab
${btnAddDashboardFilter}        css=#DashboardAddfilter
${ddlValueList}                 jquery=#InputValue-0_listbox li[data-offset-index=0]
${ddSelectValueDropdownList}    css=#FilterDetail-0-PlaceHolder  .k-input
${spanDateField}                css=#InputValue-
${divFieldFilter}            jquery=#FieldsFiltersWrapper .FilterHeader
${chkValueInFilter}             jquery=#FilterDetail-3-PlaceHolder


*** Keywords ***
Wait Dashboard Detail Document Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${tabDashboardGeneral}
    Wait Until Element Is Visible       ${tabDashboardGeneral}    60s
    Wait Until Element Is Visible       ${tabDashboardDescription}
    Wait Until Element Is Visible       ${tabDashboardDefinition}
    Wait Until Element Is Visible       ${btnCloseDashboardDetailsPopup}
    Wait Until Page Does Not Contain Element    ${btnCancel}.executing


Input Dashboard name
    [Arguments]    ${dashboardName}
    Wait Until Element Is Visible    ${txtDashboardName}    60s
    Wait Until Ajax Complete
    Input Text    ${txtDashboardName}    ${dashboardName}

Save Dashboard
    Wait Until Element Is Enabled    ${btnSaveDashboard}
    Click Element    ${btnSaveDashboard}
    Wait Progress Bar Closed
    Page Should Contain Toast Success

Cancel Dashboard
    Click Element    ${btnCancel}

Open Dashboard Detail Popup
    Wait Until Element Is Visible    ${lnkDashboardName}
    Sleep    ${TIMEOUT_LARGEST}
    Click Element    ${lnkDashboardName}
    Wait Dashboard Detail Document Loaded

Click Dashboard Detail Desciption Tab
    Wait Until Element Is Visible    ${tabDashboardDescription}
    Click Element    ${tabDashboardDescription}

Click Dashboard Detail General Tab
    Wait Until Element Is Visible    ${tabDashboardGeneral}
    Click Element    ${tabDashboardGeneral}

Click Dashboard Detail Definition Tab
    Wait Until Element Is Visible    ${tabDashboardDefinition}
    Click Element    ${tabDashboardDefinition}

Click Dashboard Detail Statistic Tab
    Wait Until Element Is Visible    ${tabDashboardStatistic}
    Click Element    ${tabDashboardStatistic}

Close Dashboard Detail Popup
    Wait Until Element Is Visible    ${btnCloseDashboardDetailsPopup}
    Click Element    ${btnCloseDashboardDetailsPopup}
    Wait Until Ajax Complete

Open Dashboard Definition Widget Panel
    [Arguments]   ${index}
    ${isPanelClosed}  Is Element Has CssClass  ${divDashboardDefinitionHeader}  Collapse
    Run Keyword If   ${isPanelClosed}   Click Element   ${divDashboardDefinitionHeader}:eq(${index})

Close Dashboard Definition Widget Panel
    [Arguments]   ${index}
    ${isPanelOpened}  Is Element Has CssClass  ${divDashboardDefinitionHeader}  Expand
    Run Keyword If   ${isPanelOpened}   Click Element   ${divDashboardDefinitionHeader}:eq(${index})

Click Dashboard Detail Filters Tab
    Wait Until Element Is Visible    ${tabDashboardFilters}
    Click Element    ${tabDashboardFilters}

Click Add Filter Button In Dashboard Detail Popup
    Wait Until Element Is Visible    ${btnAddDashboardFilter}
    Click Element    ${btnAddDashboardFilter}

Choose Dropdown Filter Operator In FilterField In Filters tab
    [Arguments]    ${index}    ${selectText}
    Choose Dropdown Filter Operator    ${index}    ${selectText}

Input Filter Value
    [Arguments]    ${value}
    Input Text    ${ddSelectValueDropdownList}    ${value}

Input Date Value
    [Arguments]    ${index}    ${value} 
    Input Text    ${spanDateField}${index}    ${value} 

Click Add Filter From Field
    [Arguments]    ${index}
    Mouse Over    ${divFieldFilter}:eq(${index})
    Click Element    ${divFieldFilter}:eq(${index}) .btnAddFilter

Select Checkbox Value List
    [Arguments]    ${index}
    Select Checkbox    ${chkValueInFilter} input:eq(${index})        

Remove Field In Fields Tab
    [Arguments]    ${index}
    Mouse Over    ${divFieldFilter}:eq(${index})
    Click Element    ${divFieldFilter}:eq(${index}) .btnDelete


    