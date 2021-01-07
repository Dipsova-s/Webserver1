*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page

*** Test Cases ***
Verify Select All
    [Tags]  acc_wc
    Search Filter By Item IDS    EA_*
    Click Select All Items from Search Result

Search Item With Potentially Dangerous
    [Tags]  acc_wc
    Search By Text    <script>alert("1")</script>
    Page Should Contain    potentially dangerous

Verify Search Terms
    [Tags]  acc_wc_s

    ${Text1}  Set Variable  Example text for search terms 1
    ${Text2}  Set Variable  Example text for search terms 2
    ${Text3}  Set Variable  Example text for search terms 3
    ${Text4}  Set Variable  Example text for search terms 4
    ${Text5}  Set Variable  Example text for search terms 5
    ${Text6}  Set Variable  Example text for search terms 6

    Search By Text Without Double Quote     ${Text1}
    Blur Search Input
    Search By Text Without Double Quote     ${Text2}
    Blur Search Input
    Search By Text Without Double Quote     ${Text3}
    Blur Search Input
    Search By Text Without Double Quote     ${Text4}
    Blur Search Input
    Search By Text Without Double Quote     ${Text5}
    Blur Search Input
    Search By Text Without Double Quote     ${Text6}
    Blur Search Input

    Sleep    ${TIMEOUT_GENERAL}
    Click Search Input
    Search Terms Should Visible
    Search Terms Should Not Contain         ${Text1}
    Search Terms Should Contain             ${Text2}
    Search Terms Should Contain             ${Text3}
    Search Terms Should Contain             ${Text4}
    Search Terms Should Contain             ${Text5}
    Search Terms Should Contain             ${Text6}

    Blur Search Input
    Sleep    ${TIMEOUT_GENERAL}
    Click Search Input
    Click Last Item Search Term
    Wait Progress Bar Search Closed
    Wait Search Terms Closed
    Search Input Should Be                  ${Text2}

Verify Search Tags
    [Tags]  acc_wc  TC_C230000
    [Documentation]     Search items by tags
    [Setup]  Run Keywords  Import Angle By API  /models/1  ANGLE_SearchTag1.json  user=${Username}
    ...         AND        Import Angle By API  /models/1  ANGLE_SearchTag2.json  user=${Username}
    ...         AND        Reload Search Page

    # check most used tags are existed
    Check Existing Most Used Tag From Search Filter
    
    # there are 3 tags available
    Filter Item Tag  SearchTag
    Tag Should Be Available  SearchTag1
    Tag Should Be Available  SearchTag2
    Tag Should Be Available  SearchTag3

    # filter with SearchTag2 will get 2 items
    Select Tag  SearchTag2  ${True}
    Wait Progress Bar Search Closed
    Number Of Search Results Should Be  2
    Check Existing Angle From Search Result  [ROBOT] Angle Search Tag 1
    Check Existing Angle From Search Result  [ROBOT] Angle Search Tag 2
    Check Existing Tag From Search Result  SearchTag1
    Check Existing Tag From Search Result  SearchTag2
    Check Existing Tag From Search Result  SearchTag3

    # filtering remains 2 tags
    Filter Item Tag  SearchTag
    Tag Should Be Available  SearchTag1
    Tag Should Not Be Available  SearchTag2
    Tag Should Be Available  SearchTag3

    [Teardown]  Run Keywords  Clean Up Items And Go To Search Page
    ...         AND           Go to Search Page

Verify Add Or Remove Starred Via Search Page
    [Tags]  acc_wc  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Angle starred
    Upload Item And Check From Search Result  AGNLE_STARRED.json    EA2_800    ${angleName}

    ${countIsStarredBeforeAdd}    Get Is Starred Count
    Click Starred First Item
    ${countIsStarredAfterAdd}    Get Is Starred Count
    Should Not Be Equal    ${countIsStarredBeforeAdd}    ${countIsStarredAfterAdd}
    Run Keyword If    '${countIsStarredAfterAdd}'!='Starred (0)'    Click Starred First Item

    [Teardown]  Run Keywords  Back To Search And Delete Angle Are Created    ${angleName}
    ...         AND           Go to Search Page