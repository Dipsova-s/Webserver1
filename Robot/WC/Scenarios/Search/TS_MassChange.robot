*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Set Personal Note To Angle Via Search Page
    [Arguments]       ${angleName}
    ${privateNote} =    Set Variable    ข้อความส่วนตัว จาก แนมนะจ๊ะ
    Search By Text And Expect In Search Result    ${angleName}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Input Private Note Via Mass Change Popup    ${privateNote}
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Check Existing Angle From Search Result    ${angleName}
    Check Existing Private Note From Search Result    ${privateNote}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Input Private Note Via Mass Change Popup    ${EMPTY}
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Page Should Not Contain    ${privateNote}


Set Starred To Angle Via Search Page
    [Arguments]       ${angleName}
    Search By Text And Expect In Search Result    ${angleName}
    ${countIsStarred}    Get Is Starred Count
    Run Keyword If    '${countIsStarred}'!='Starred (0)'    Click Starred First Item
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Starred Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Click Search Filter Is Starred
    Check Existing Angle From Search Result    ${angleName}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Not Starred Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Element Should Not Contain    ${gridSearchResult}    ${angleName}

Set Template To Angle Via Search Page
    [Arguments]    ${objectName}    ${angleName}
    Create Angle From Object List And Save   ${objectName}    ${angleName}
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Published Via Mass Change Popup
    Click Set Template Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Click Search Filter Template
    Check Existing Angle From Search Result    ${angleName}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Angle Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Element Should Not Contain    ${gridSearchResult}    ${angleName}
    Click Search Filter Template
    Wait Progress Bar Search Closed
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName}

Set Publish To Angle Via Search Page
    [Arguments]    ${objectName}    ${angleName}
    Create Angle From Object List And Save   ${objectName}    ${angleName}
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Published Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Check Existing Angle From Search Result    ${angleName}
    Check First Angle From Search Result Is Public
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Private Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Check Existing Angle From Search Result    ${angleName}
    Check First Angle From Search Result Is Private
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName}

Set Validate To Angle Via Search Page
    [Arguments]    ${objectName}    ${angleName}
    Create Angle From Object List And Save   ${objectName}    ${angleName}
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Published Via Mass Change Popup
    Click Set Validated Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Check Existing Angle From Search Result    ${angleName}
    Check First Angle From Search Result Is Validated
    Click Select First Item From Search Result
    Open Mass Change Popup
    Click Set Not Validated Via Mass Change Popup
    Click Save Mass Change
    Click Close Mass Change Report Popup
    Check Existing Angle From Search Result    ${angleName}
    Page Should Not Contain Element    ${validatedStatusFromFirstAngleInSearchResult}
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName}
