*** Variables ***

${trRowInEventLogsGrid}               jquery=#EventLogGrid tbody tr

${btnViewEventLog}                    .btnInfo

#Log popup
${popupLogTable}                       popupLogTable
${btnClosePopupLogTable}               jquery=.k-window .k-i-close:eq(1)
${lbLogPopupTitle}                     popupLogTable_wnd_title

*** Keywords ***
Click Download Event Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Action In Grid By Name     ${logfileName}    ${trRowInEventLogsGrid}    ${btnViewEventLog}

Click Download Event Log By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInEventLogsGrid}    ${btnViewEventLog

Close Popup Log Table
    Wait Until Page Contains Element    ${btnClosePopupLogTable}
    Click Element    ${btnClosePopupLogTable}