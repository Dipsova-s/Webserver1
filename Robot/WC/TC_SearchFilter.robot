*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags        	acceptance     acc_wc

*** Test Cases ***
Verify Select All
    Search Filter By Item IDS    EA_*
    Click Select All Items from Search Result

    [Teardown]    Go to Search Page

Verify Add Or Remove Starred Via Search Page
    ${angleName}  Set Variable  [ROBOT] Angle starred
    Upload Item And Check From Search Result  AGNLE_STARRED.json    EA2_800    ${angleName}

    ${countIsStarredBeforeAdd}    Get Is Starred Count
    Click Starred First Item
    ${countIsStarredAfterAdd}    Get Is Starred Count
    Should Not Be Equal    ${countIsStarredBeforeAdd}    ${countIsStarredAfterAdd}
    Run Keyword If    '${countIsStarredAfterAdd}'!='Starred (0)'    Click Starred First Item

    [Teardown]  Run Keywords   Back To Search And Delete Angle Are Created    ${angleName}
    ...         AND           Go to Search Page

Verify Warning Status In Advance Filter
    ${angleName}  Set Variable  [ROBOT] Angle with warnings
    Upload Item And Check From Search Result  AGNLE_WITH_WARNING.json    EA2_800    ${angleName}

    Set Show Angle Warning In Facet Filters
    Facet "Warning" Should Be In Facet Filters
    Open Advance Filters Popup
    Select Advance Filter Publication Status Dropdown By Status Name    Private
    Select Advance Filter Warining Status Dropdown By Status Name    Does not contain warnings
    Submit Advance Filters Search
    Search Result Should Be Empty
    Facet "Private" Should Filter As "Show Private"
    Facet "Warning" Should Filter As "Show No Warning"
    Button Remove Advance Filters Should Not Be Visible
    Open Advance Filters Popup
    Publication Status Should Be "Private"
    Warning Status Should Be "Does not contain warnings"
    Close Advance Filters Popup
    Log    First click will remove negative    level=HTML
    Click Search Filter Has Warning
    Log    Second click will check the checkbox    level=HTML
    Click Search Filter Has Warning
    Check Existing Angle From Search Result    ${angleName}
    Open Advance Filters Popup
    Publication Status Should Be "Private"
    Warning Status Should Be "Contains warnings"
    Close Advance Filters Popup
    Set Hide Angle Warning In Facet Filters
    Facet "Warning" Should Not Be In Facet Filters
    Button Remove Advance Filters Should Be Visible

    [Teardown]  Run Keywords   Back To Search And Delete Angle Are Created    ${angleName}
    ...         AND           Go to Search Page