*** Variables ***
${trRowInManagementConsoleLogsGrid}               jquery=#SystemLogsGrid tbody tr

${btnViewManagementConsoleLog}                    .btnInfo
${btnDownloadManagementConsoleLog}                .btnDownload

#Log popup
${popupLogTable}                       popupLogTable
${ddlSelectLogType}                    css=#popupLogTable.k-dropdown
${txtFilterLog}                        FilterLogTableTextbox
${btnClosePopupLogTable}               jquery=.k-window .k-i-close:eq(1)
${lbLogPopupTitle}                     popupLogTable_wnd_title

${gridSystemLog}        jquery=#SystemLogsGrid
${pgbSystemLogGrid}     jquery=#SystemLogsGrid .k-loading-mask

*** Keywords ***
Click Management Console Action Dropdown By Logfile Name
    [Arguments]    ${logfileName}
    Click Show Action Dropdown In Grid By Name    ${logfileName}    ${trRowInManagementConsoleLogsGrid}

Click Management Console Action Dropdown By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInManagementConsoleLogsGrid}

Click View Management Console Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInManagementConsoleLogsGrid}    ${btnViewManagementConsoleLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click View Management Console Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInManagementConsoleLogsGrid}    ${btnViewManagementConsoleLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click Download Management Console Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInManagementConsoleLogsGrid}    ${btnDownloadManagementConsoleLog}

Click Download Management Console Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInManagementConsoleLogsGrid}    ${btnDownloadManagementConsoleLog}

Go To Management Console Log Page
    Go To MC Page    /Global%20settings/System%20log/Management%20Console/
    Wait Until Management Console Log Page Is Ready
    Wait Until Management Console Log Grid Is Ready

Wait Until Management Console Log Page Is Ready
    Wait Until Page Contains Element    ${gridSystemLog}
    Wait MC Progress Bar Closed

Wait Until Management Console Log Grid Is Ready
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pgbSystemLogGrid}

