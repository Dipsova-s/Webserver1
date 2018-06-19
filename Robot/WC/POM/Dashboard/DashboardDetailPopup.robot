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
${tabDashboardFieldandFilter}    css=#DashboardTabs .fieldsfilters

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

#Fields and Filters
${btnAddFilter}    css=#DashboardAddfilter

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

Open Dashboard From First Dashboard in Search Page
    [Arguments]    ${angleName}
    Click Link First Item From Search Result
    Sleep    2s
    Wait Dashboard Document Loaded

Click Dashboard Detail FieldandFilter Tab
    Wait Until Element Is Visible    ${tabDashboardFieldandFilter}
    Click Element    ${tabDashboardFieldandFilter}

Click Add Dashboard Filter
    Wait Until Element Is Visible    ${btnAddFilter}
    Click Element    ${btnAddFilter}

