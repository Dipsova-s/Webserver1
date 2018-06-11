*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acceptance     acc_wc

*** Variables ***
${VERIFY_STARRED_ANLE_NAME}            Angle has warning itself
${TEST_WARNING_STATUS_ANGLE_NAME}      Angle has warning itself

*** Test Cases ***
Search Item By Text "Angle For General Test" And Expect In Search Result
    Search By Text And Expect In Search Result    Angle For General Test

Verify Select All
    Search Filter By Item IDS    EA_*
    Click Select All Items from Search Result

Verify Add Or Remove Starred Via Search Page
    Search By Text And Expect In Search Result    ${VERIFY_STARRED_ANLE_NAME}
    ${countIsStarredBeforeAdd}    Get Is Starred Count
    Click Starred First Item
    ${countIsStarredAfterAdd}    Get Is Starred Count
    Should Not Be Equal    ${countIsStarredBeforeAdd}    ${countIsStarredAfterAdd}
    Run Keyword If    '${countIsStarredAfterAdd}'!='Starred (0)'    Click Starred First Item

Verify Warning Status In Advance Filter
    Search By Text And Expect In Search Result    ${TEST_WARNING_STATUS_ANGLE_NAME}
    Set Show Angle Warning In Facet Filters
    Facet "Warning" Should Be In Facet Filters
    Open Advance Filters Popup
    Select Advance Filter Publication Status Dropdown By Status Name    Published
    Select Advance Filter Warining Status Dropdown By Status Name    Does not contain warnings
    Submit Advance Filters Search
    Search Result Should Be Empty
    Facet "Private" Should Filter As "Show Public"
    Facet "Warning" Should Filter As "Show No Warning"
    Button Remove Advance Filters Should Not Be Visible
    Open Advance Filters Popup
    Publication Status Should Be "Published"
    Warning Status Should Be "Does not contain warnings"
    Close Advance Filters Popup
    Log    First click will remove negative    level=HTML
    Click Search Filter Has Warning
    Log    Second click will check the checkbox    level=HTML
    Click Search Filter Has Warning
    Check Existing Angle From Search Result    ${TEST_WARNING_STATUS_ANGLE_NAME}
    Open Advance Filters Popup
    Publication Status Should Be "Published"
    Warning Status Should Be "Contains warnings"
    Close Advance Filters Popup
    Set Hide Angle Warning In Facet Filters
    Facet "Warning" Should Not Be In Facet Filters
    Button Remove Advance Filters Should Be Visible
