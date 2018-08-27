*** Variables ***
${pgbDashboardDetailsPopup}    	css=#popupDashboardDetails > div.k-loading-mask

#Generic buttons
${btnCloseDashboardDetailsPopup}    css=.popupDashboardDetails .k-i-close
${btnSaveDashboard}    btn-popupDashboardDetails2
${btnSaveDashboardAs}    btn-popupDashboardDetails1
${btnCancel}    btn-popupDashboardDetails0
${lnkDashboardName}    css=#DashboardName span.Name
${lnkEditDashboard}    css=#DashboardDescriptionWrapper .descriptionHeader a

#Dashboard Tabs
${tabDashboardGeneral}    css=#DashboardTabs .general
${tabDashboardDescription}    css=#DashboardTabs .description
${tabDashboardDefinition}    css=#DashboardTabs .definition
${tabDashboardPublishing}    css=#DashboardTabs .publishing
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

#Statistic tab elements
${lblCreatedBy}    jquery=#DashboardArea .statisticArea .input:eq(0) span:eq(1)
${lblLastChangedBy}    jquery=#DashboardArea .statisticArea .input:eq(1) span:eq(1)
${lblLastExecutedBy}    jquery=#DashboardArea .statisticArea .input:eq(2) span:eq(1)

#Publish tab elements
${btnPublishDashboard}    css=.btnPublish
${btnConfirmPublishDashboard}    btn-popupDashboardPublishing1

${tabDashboardPrivilege}    jquery=#PublishTabWrapper .tabMenu li:eq(0)
${tabDashboardSearchLabel}    jquery=#PublishTabWrapper .tabMenu li:eq(1)

#Filters Tab
${btnAddDashboardFilter}        css=#DashboardAddfilter
${ddlValueList}                 jquery=#InputValue-0_listbox li[data-offset-index=0]
${ddSelectValueDropdownList}    css=#FilterDetail-0-PlaceHolder  .k-input
${spanDateField}                css=#InputValue-
${divAddFieldFilter}            jquery=#FieldsFiltersWrapper .FilterHeader
${chkValueInFilter}             jquery=#FilterDetail-3-PlaceHolder


*** Keywords ***
Wait Dashboard Detail Document Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${tabDashboardGeneral}
    Wait Until Element Is Visible       ${tabDashboardGeneral}    60s
    Wait Until Element Is Visible       ${tabDashboardDescription}
    Wait Until Element Is Visible       ${tabDashboardDefinition}
    Wait Until Element Is Visible       ${tabDashboardPublishing}
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

Click Dashboard Detail Publishing Tab
    Wait Until Element Is Visible    ${tabDashboardPublishing}
    Click Element    ${tabDashboardPublishing}
    Wait Until Ajax Complete

Click Dashboard Detail Statistic Tab
    Wait Until Element Is Visible    ${tabDashboardStatistic}
    Click Element    ${tabDashboardStatistic}

Close Dashboard Detail Popup
    Wait Until Element Is Visible    ${btnCloseDashboardDetailsPopup}
    Click Element    ${btnCloseDashboardDetailsPopup}
    Wait Until Ajax Complete


Click Confirm Publish Dashboard
    Wait Until Element Is Visible    ${btnConfirmPublishDashboard}
    Click Element    ${btnConfirmPublishDashboard}

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
    Mouse Over    ${divAddFieldFilter}:eq(${index})
    Click Element    ${divAddFieldFilter}:eq(${index}) .btnAddFilter

Select Checkbox Value List
    [Arguments]    ${index}
    Select Checkbox    ${chkValueInFilter} input:eq(${index})        

Remove Field In Fields Tab
    [Arguments]    ${index}
    Mouse Over    ${divAddFieldFilter}:eq(${index})
    Click Element    ${divAddFieldFilter}:eq(${index}) .btnDelete


    