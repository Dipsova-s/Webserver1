*** Variables ***
${trRowInSystemLogsGrid}               jquery=#SystemLogsGrid tbody tr

${btnSystemLogAction}                  .btnGroupContainer a:first.btnInfo
${btnViewSystemLog}                    .btnInfo
${btnDownloadSystemLog}                .btnDownload

${scrollBarSystemLogGrid}              .k-scrollbar

#Log popup
${popupLogTable}                       popupLogTable
${ddlSelectLogType}                    css=#popupLogTable.k-dropdown
${txtFilterLog}                        FilterLogTableTextbox
${btnClosePopupLogTable}               jquery=.k-window .k-i-close:eq(1)
${lbLogPopupTitle}                     popupLogTable_wnd_title

${gridSystemLog}        jquery=#SystemLogsGrid
${pgbSystemLogGrid}     jquery=#SystemLogsGrid .k-loading-mask
${ViewButton}           //td[@data-field='Name']/..//div[@class='btnGroupContainer']/a[@class='btn btnOpenWindow']
${CloseButton}           xpath=//span[@title='Close']/..
${PIDColumnHeader}           //th[text()='PID']

*** Keywords ***
Click Package Action Dropdown By Logfile Name
    [Arguments]    ${logfileName}
    Click Show Action Dropdown In Grid By Name    ${logfileName}    ${trRowInSystemLogsGrid}

Click Package Action Dropdown By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInSystemLogsGrid}

Click View System Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInSystemLogsGrid}    ${btnViewSystemLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click View System Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInSystemLogsGrid}    ${btnViewSystemLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click Download System Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInSystemLogsGrid}    ${btnDownloadSystemLog}

Click Download System Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInSystemLogsGrid}    ${btnDownloadSystemLog}

Go To Application Server Log Page
    Go To MC Page    /Global%20settings/System%20log/Application%20Server/
    Wait Until Application Server Log Page Is Ready
    Wait Until Application Server Log Grid Is Ready

Wait Until Application Server Log Page Is Ready
    Wait Until Page Contains Element    ${gridSystemLog}
    Wait MC Progress Bar Closed

Wait Until Application Server Log Grid Is Ready
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pgbSystemLogGrid}

Click on View button by index
    [Arguments]  ${index}
    Wait Until Ajax Complete
    Scroll Element into View  (${ViewButton})[${index}]
    Custom click element  (${ViewButton})[${index}]

Verify Log popup appears for all Log files 
    ${NoOfViewButton}=  Get Element Count    ${ViewButton}
    :For   ${i}   IN RANGE   1  ${NoOfViewButton}+1
    \    Click on View button by index   ${i}
    \   Page Should Contain Element   ${CloseButton}  message=After clicking View button Log popup did not appear
    \   Custom click element   ${CloseButton}




