*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Go to Search Page
    ${searchPageUrl}    Execute Javascript    return window.searchPageUrl;
    Go to    http://${URL}${searchPageUrl}
    Wait Search Page Document Loaded

Search By Text Without Double Quote
    [Arguments]   ${searchText}
    Wait Search Page Document Loaded
    Input Search Text    ${searchText}
    Click Search Button
    Wait Progress Bar Search Closed

Search By Text
    [Arguments]    ${searchText}
    Search By Text Without Double Quote    "${searchText}"

Search By Text And Expect In Search Result
    [Arguments]    ${searchText}
    Search By Text    ${searchText}
    Check Existing Angle From Search Result    ${searchText}

Search Filter By Item IDS
    [Arguments]    ${ids}
    Open Advance Filters Popup
    Input IDS Filter    ${ids}
    Submit Advance Filters Search

Search Filter By Query String
    [Arguments]    ${queryString}
    ${searchPageUrl}    Execute Javascript    return window.searchPageUrl;
    Go To    http://${URL}${searchPageUrl}#/?${queryString}
    Click Search Button
    Wait Progress Bar Search Closed

Search Filter By All Angles And Business Processes
    Click Search Filter Angle
    Click Search Filter Template
    ${statusMoreBP} =    Is Element Visible    ${divBusinessProcessesItemMore}
    Run Keyword If    ${statusMoreBP} == True    Click Element    ${divBusinessProcessesItemMore}
    ${bpCount} =    Get Elements Count    ${divBusinessProcessesItems}
    : FOR    ${INDEX}    IN RANGE    0    ${bpCount}
    \   Click Element If Not Active    ${divBusinessProcessesItems}:eq(${INDEX})
    Wait Progress Bar Search Closed

Search Filter By All Angles And Business Process
    [Arguments]   ${bp}
    Click Search Filter Angle
    Click Search Filter Template
    ${statusMoreBP} =    Is Element Visible    ${divBusinessProcessesItemMore}
    Run Keyword If    ${statusMoreBP} == True    Click Element    ${divBusinessProcessesItemMore}
    Page Should Contain Element    ${divBusinessProcessesItems}.${bp}
    Click Element If Not Active    ${divBusinessProcessesItems}.${bp}
    ${bpCount} =    Get Elements Count    ${divBusinessProcessesItems}
    : FOR    ${INDEX}    IN RANGE    0    ${bpCount}
    \   ${isMatchBP} =    Is Element Has CssClass    ${divBusinessProcessesItems}:eq(${INDEX})    ${bp}
    \   Run Keyword If    ${isMatchBP} == False    Click Element If Active    ${divBusinessProcessesItems}:eq(${INDEX})
    Wait Progress Bar Search Closed

Write All Angles in Search Result to Test File
    [Arguments]    ${anglePerTest}
    ${angleCount}    Get Number Of Search Results
    Run Keyword If    ${angleCount} != 0    Click Select All Items from Search Result
    @{items}    Get Selected Items Data
    ${itemCount}    Get Length    ${items}
    Should Be Equal    ${itemCount}    ${angleCount}
    Log    ==============================================================================
    Log    Collecting ${angleCount} Angles
    Log    ==============================================================================
    ${itemNumber}    Set Variable    0

    # Clean up file
    Remove File    ${EXECDIR}/WC/${RunAllAngleName}*

    : FOR    ${item}    IN    @{items}
    # Create test file name
    \   ${testFileName}    Execute Javascript    return kendo.format("${RunAllAngleName}{0:0000}.robot", Math.floor(${itemNumber} / ${anglePerTest}))
    \   ${testFile}    Set Variable    ${EXECDIR}/WC/${testFileName}

    # Check file existing, create if not
    \   ${status}    ${value}    Run Keyword And Ignore Error    File Should Exist    ${testFile}
    \   Run Keyword If    '${status}' == 'FAIL'    Copy File    ${RunAllAngleTemplateFile}    ${testFile}

    # Add test to file
    \   ${itemNumber}    Execute Javascript    return ${itemNumber} + 1
    \   ${angleId}    Get From Dictionary    ${item}    id
    \   ${angleUri}    Get From Dictionary    ${item}    uri
    \   ${angleName}    Get From Dictionary    ${item}    name
    \   ${newAngleName}    Replace String Using Regexp    ${angleName}    (\\s){2,}    ${SPACE}
    \   ${line}    Set Variable    [${angleId}][${angleUri}] ${newAngleName} ${SPACE4}${angleId}${SPACE4}${angleUri}${SPACE4}${newAngleName}\n
    \   Append To File    ${testFile}    ${line}

Find And Execute Angle
    [Arguments]    ${angleId}    ${angleUri}    ${angleName}
    Search Filter By Query String    ids=${angleId}
    Click Link Item From Search Result By Item Uri: ${angleUri}
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Check If Angle Is A Template Then Close The Popup
    Execute All Displays In Angle

Execute First Search Item In Edit Mode
    Click First Item Info Button
    Click Edit Mode Button Via Item Info Popup
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup

Click Select All Items from Search Result
    ${totalItems} =    Execute Javascript     return $('#${lblSearchTotal}').text();
    Click Select First Item From Search Result
    Click Search Action Select All
    Wait Until Page Contains    ${totalItems} item(s) selected

Delete Selecting Items
    Click Search Action Delete Items
    Wait Until Page Contains    Are you sure you want to delete
    Click Element    ${btnConfirmDeleteAngle}
    Wait Progress Bar Closed
    Wait Until Element Is Visible    ${btnCloseDeleteAngleReportPopup}
    Click Element    ${btnCloseDeleteAngleReportPopup}
    Check And Wait Until Element Is Not Visible    ${divDeleteAngleProgress}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Progress Bar Search Closed

Delete First Search Result Item
    Click Select First Item From Search Result
    Delete Selecting Items

Delete All Search Result Items
    Click Select All Items from Search Result
    Delete Selecting Items

Copy Angle Via Search Action
    Click Select First Item From Search Result
    Wait Until Element Contains    ${lblSearchResult}    1 item(s) selected
    Click Search Action Copy Angle
    Wait Until Page Contains    Copy 1 Angle(s)
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${btnConfirmCopyAngle}
    Click Element    ${btnConfirmCopyAngle}
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${btnCloseCopyAngleReportPopup}
    Click Element    ${btnCloseCopyAngleReportPopup}
    Check And Wait Until Element Is Not Visible    ${divCopyAngleProgress}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Progress Bar Search Closed
