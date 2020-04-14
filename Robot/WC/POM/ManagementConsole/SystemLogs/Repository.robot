*** Variables ***
${gridSystemLog}        jquery=#SystemLogsGrid
${pgbSystemLogGrid}     jquery=#SystemLogsGrid .k-loading-mask
${colLogFile}           jquery=th[data-title="Logfile"]
${colSize}              jquery=th[data-title="Size"]
${colTimestamp}         jquery=th[data-title="Timestamp"]
${colAction}            jquery=th[data-title="Action"]
${gridContentTable}     jquery=#SystemLogsGrid .k-grid-content table
${trRowInRepositoryLogsGrid}    jquery=#SystemLogsGrid tbody tr
${btnDownloadRepositoryLog}     .btnDownload
${gridContentFirstRow}  jquery=#SystemLogsGrid .k-grid-content table tr:first
${gridContentRow}  xpath=//div[@class='k-virtual-scrollable-wrap']//tbody//tr
${gridContentLastRow}   jquery=#SystemLogsGrid .k-grid-content table tr:last

${btnDownloadindex}        1

# ${DOWNLOAD_DIRECTORY}      ${EXECDIR}/resources

*** Keywords ***
Go To Repository Log Page
    Go To MC Page    /Global%20settings/System%20log/Repository/
    Wait Until Repository Log Page Is Ready
    Wait Until Repository Log Grid Is Ready

Wait Until Repository Log Page Is Ready
    Wait Until Page Contains Element    ${gridSystemLog}
    Wait MC Progress Bar Closed

Wait Until Repository Log Grid Is Ready
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pgbSystemLogGrid}

Verify Repository Log Grid Column
    Page Should Contain Element   ${colLogFile}
    Page Should Contain Element   ${colSize}
    Page Should Contain Element   ${colTimestamp}
    Page Should Contain Element   ${colAction}

Verify Sorting Repository Log If Applicable
    ${count} =  Get Element Count  ${gridContentRow}
    Log    ${count}
    Run Keyword If  ${count} > 1    Verify Sorting Repository Log
 
Verify Sorting Repository Log 
    # Expect Order by Logfile Asc
    Click Element  ${colLogFile}
    ${firstRowValueAsc} =  Get Text    ${gridContentFirstRow} td:eq(0)
    Log  ${firstRowValueAsc}
    scroll element into view    ${gridContentLastRow} td:eq(0)
    ${lastRowValueAsc} =  Get Text     ${gridContentLastRow} td:eq(0)
    Log  ${lastRowValueAsc}
    ${result} =  Execute JavaScript  return '${firstRowValueAsc}' < '${lastRowValueAsc}';
    Should Be True  ${result}

    # Expect Order by Logfile Desc
    Click Element  ${colLogFile}
    scroll element into view    ${gridContentFirstRow} td:eq(0)
    ${firstRowValueDesc} =  Get Text     ${gridContentFirstRow} td:eq(0)
    Log  ${firstRowValueDesc}
    scroll element into view    ${gridContentLastRow} td:eq(0)
    ${lastRowValueDesc} =  Get Text     ${gridContentLastRow} td:eq(0)
    Log  ${lastRowValueDesc}
    ${result} =  Execute JavaScript  return '${lastRowValueDesc}' < '${firstRowValueDesc}';
    Should Be True   ${result}

Click Download Repository Log By Logfile Name
    [Arguments]    ${logfileName}
    Click Show Action Dropdown In Grid By Name  ${logfileName}    ${trRowInRepositoryLogsGrid}
    Click Action In Grid By Name     ${logfileName}    ${trRowInRepositoryLogsGrid}    ${btnDownloadRepositoryLog}

Verify Download Repository Log If Applicable
    ${count} =  Get Element Count  ${gridContentRow}
    Run Keyword If  ${count} > 0  Verify Download Repository Log 

Verify Download Repository Log
    Click Element  ${colLogFile}
    scroll element into view    ${gridContentFirstRow} td:eq(0)
    ${fileName} =  Get Text     ${gridContentFirstRow} td:eq(0) 
    Click Download Repository Log By Logfile Name     ${fileName}
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
    Should Contain    ${file}    ${fileName}