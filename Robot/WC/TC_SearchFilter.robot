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