*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          smk_wc

*** Test Cases ***
Add Display To Angle Test
    ${angleName}  Set Variable  [ROBOT] Test Add Display To Angle Test
    Create Angle From Object List And Save    PD    ${angleName}
    Wait Progress Bar Closed
    Create New Pivot Display on Angle Page
    Create New Chart Display on Angle Page
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Sort By Created On Descending On Search Page
    Click Select First Item From Search Result
    ${displayLength}    Get Number Display Of Selected Item From Search Result
    ${expectedResult}    Convert To Integer    3
    Should Be Equal    ${displayLength}    ${expectedResult}
    Click Select First Item From Search Result
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${angleName}