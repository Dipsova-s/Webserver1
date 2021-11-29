*** Variables ***
${tblSessionsGrid}      //div[@id='SessionsGrid']
${txtSessionsFilter}        css=#AllSessionsGridFilterBox
${gridSessionsTable}        css=.k-scrollbar-vertical
${gridRows}                 css=#SessionsGrid .k-grid-content tr

*** Keywords ***
Go to Sessions page in MC
    Go To MC Page    /Users/Sessions/
    Wait Until Sessions Page Is Ready

Enter Text in Sessions filter page
    [Arguments]     ${filterText}
    Input Text      ${txtSessionsFilter}      ${filterText}
    Wait Until Sessions Page Is Ready

Verify the User Sessions Filtered with Text
    [Arguments]     ${filterText}
    Enter Text in Sessions filter page      ${filterText}
    @{rowList}  Get Grid Column Texts    ${gridRows}    1
    ${rowCount}  Get Element Count  css=#SessionsGrid .k-grid-content tr
    :For    ${index}      IN RANGE    1   ${rowCount+1}
    \       Scroll Element Into View    ${gridRows}:nth-child(${index})
    \       Should Contain      ${rowList}[${index}]    ${filterText}   ignore_case=True

Verify the User Sessions Filtered with no Text
    ${randomString}     Generate Random String   12    [UPPER]
    Enter Text in Sessions filter page      ${randomString}
    ${rowCount}  Get Element Count  css=#SessionsGrid .k-grid-content tr
    Should Be Equal As Integers     ${rowCount}     0

Wait Until Sessions Grid Is Ready
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    css=#SessionsGrid .k-loading-mask   

Wait Until Sessions Page Is Ready
    Wait Until Page Contains    Sessions
    Wait Until Page Contains Element     ${tblSessionsGrid}
    Wait MC Progress Bar Closed
    Wait Until Sessions Grid Is Ready