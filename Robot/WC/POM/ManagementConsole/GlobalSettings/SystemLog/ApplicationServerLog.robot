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


