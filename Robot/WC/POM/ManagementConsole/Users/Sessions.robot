*** Variables ***
${chbActiveDebugLogging}    xpath=(//input[@name='IsDebugLogging' and not(@disabled)])
${tblSessionsGrid}      //div[@id='SessionsGrid']
${txtSessionsFilter}        css=#AllSessionsGridFilterBox
${gridSessionsTable}        css=.k-scrollbar-vertical

*** Keywords ***
Select the Debug logging checkbox for all the users in sessions grid
    ${rowCount}  Get Element Count  ${chbActiveDebugLogging}
    :FOR    ${index}    IN RANGE    1  ${rowCount+1}
    \       Scroll Element Into View    ${chbActiveDebugLogging}[${index}]
    \       Select Checkbox     ${chbActiveDebugLogging}[${index}]
    \       Wait Until Sessions Page Is Ready

Verify the Debug logging checkbox checked for all the users in Sessions grid
    ${rowCount}  Get Element Count  ${chbActiveDebugLogging}
    :FOR    ${index}    IN RANGE    1  ${rowCount+1}
    \       Scroll Element Into View    ${chbActiveDebugLogging}[${index}]
    \       Checkbox should be selected     ${chbActiveDebugLogging}[${index}]

Go to Sessions page in MC
    Go To MC Page    /Users/Sessions/
    Wait Until Sessions Page Is Ready

Unselect the Debug logging checkbox for all the users in sessions grid
    ${rowCount}  Get Element Count  ${chbActiveDebugLogging}
    :FOR    ${index}    IN RANGE    1  ${rowCount+1}
    \       Scroll Element Into View    ${chbActiveDebugLogging}[${index}]
    \       Unselect Checkbox   ${chbActiveDebugLogging}[${index}]
    \       Wait Until Sessions Page Is Ready

Verify the Debug logging checkbox is not checked for all the users in Sessions grid
    ${rowCount}  Get Element Count  ${chbActiveDebugLogging}
    :FOR    ${index}    IN RANGE    1  ${rowCount+1}
    \       Scroll Element Into View    ${chbActiveDebugLogging}[${index}]
    \       Checkbox should not be selected     ${chbActiveDebugLogging}[${index}]

Enter Text in Sessions filter page
    [Arguments]     ${filterText}
    Input Text      ${txtSessionsFilter}      ${filterText}
    Wait Until Sessions Page Is Ready

Verify the User Sessions Filtered with Text
    [Arguments]     ${filterText}
    Enter Text in Sessions filter page      ${filterText}
    @{rowList}  Get Grid Column Texts  css=#SessionsGrid .k-grid-content tr  1
    ${rowCount}  Get Element Count  css=#SessionsGrid .k-grid-content tr
    :For    ${index}      IN RANGE    0   ${rowCount-1}
    \       Should Contain      @{rowList}[${index}]    ${filterText}

Wait Until Sessions Grid Is Ready
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    css=#SessionsGrid .k-loading-mask

Wait Until Sessions Page Is Ready
    Wait Until Page Contains    Sessions
    Wait Until Page Contains Element     ${tblSessionsGrid}
    Wait MC Progress Bar Closed
    Wait Until Sessions Grid Is Ready