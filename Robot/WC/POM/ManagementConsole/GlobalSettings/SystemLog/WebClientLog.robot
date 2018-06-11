*** Variables ***
${trRowInWebClientLogsGrid}               jquery=#SystemLogsGrid tbody tr
${btnViewWebClientLog}                    .btnInfo
${btnDownloadWebClientLog}                .btnDownload

#Log popup
${popupLogTable}                       popupLogTable
${ddlSelectLogType}                    css=#popupLogTable.k-dropdown
${txtFilterLog}                        FilterLogTableTextbox
${btnClosePopupLogTable}               jquery=.k-window .k-i-close:eq(1)
${lbLogPopupTitle}                     popupLogTable_wnd_title

*** Keywords ***
Click Web Client Action Dropdown By Logfile Name
    [Arguments]    ${logfileName}
    Click Show Action Dropdown In Grid By Name    ${logfileName}    ${trRowInWebClientLogsGrid}

Click Web Client Action Dropdown By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInWebClientLogsGrid}

Click View Web Client Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInWebClientLogsGrid}    ${btnViewWebClientLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click View Web Client Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInWebClientLogsGrid}    ${btnViewWebClientLog}
    Wait Until Element Is Visible    ${popupLogTable}

Click Download Web Client Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInWebClientLogsGrid}    ${btnDownloadWebClientLog}

Click Download Web Client Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInWebClientLogsGrid}    ${btnDownloadWebClientLog}


