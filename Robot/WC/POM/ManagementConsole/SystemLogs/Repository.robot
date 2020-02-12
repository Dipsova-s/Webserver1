*** Variables ***
${gridSystemLog}        jquery=#SystemLogsGrid
${pgbSystemLogGrid}     jquery=#SystemLogsGrid .k-loading-mask
${colLogFile}           jquery=th[data-title="Logfile"]
${colSize}              jquery=th[data-title="Size"]
${colTimestamp}         jquery=th[data-title="Timestamp"]
${colAction}            jquery=th[data-title="Action"]
${gridContentTable}     jquery=#SystemLogsGrid .k-grid-content table
${gridContentRow}       jquery=#SystemLogsGrid .k-grid-content table tr
${gridContentFirstRow}  jquery=#SystemLogsGrid .k-grid-content table tr:first
${gridContentLastRow}   jquery=#SystemLogsGrid .k-grid-content table tr:last

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
    Run Keyword If  ${count} > 1  Verify Sorting Repository Log
 
Verify Sorting Repository Log
    Click Element  ${colLogFile}
    # Expect Order by Logfile Asc
    ${firstRowValue} =  Get Text     ${gridContentFirstRow} td:eq(0)
    ${lastRowValue} =  Get Text     ${gridContentLastRow} td:eq(0)
    ${result} =  Execute JavaScript  return '${firstRowValue}' < '${lastRowValue}';
    Should Be True  ${result}

    Click Element  ${colLogFile}
    # Expect Order by Logfile Desc
    ${firstRowValue} =  Get Text     ${gridContentFirstRow} td:eq(0)
    ${lastRowValue} =  Get Text     ${gridContentLastRow} td:eq(0)
    ${result} =  Execute JavaScript  return '${lastRowValue}' < '${firstRowValue}';
    Should Be True   ${result}

Verify Download Repository Log If Applicable 
    ${count} =  Get Element Count  ${gridContentRow} 
    Run Keyword If  ${count} > 0  Verify Download Repository Log 

Verify Download Repository Log 
    ${fileName} =  Get Text     ${gridContentFirstRow} td:eq(0)
    Click Element  ${gridContentFirstRow} .btnDownload
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
    Should Contain    ${file}    ${fileName}