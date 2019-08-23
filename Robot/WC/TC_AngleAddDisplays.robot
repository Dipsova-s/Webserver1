*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags          smoke    smk_wc

*** Variables ***
${TEST_ADD_ANGLE_DISPLAY_NAME}      [ROBOT] Test Add Display To Angle Test

*** Test Cases ***
Add Display To Angle Test
    Login And Create Angle By 2 Objects From Object List    PD    ${TEST_ADD_ANGLE_DISPLAY_NAME}
    Wait Progress Bar Closed
    Create New Pivot Display on Angle Page
    Create New Chart Display on Angle Page
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_ADD_ANGLE_DISPLAY_NAME}
    Click Sort By Created Descending In Search Page
    Click Select First Item From Search Result
    ${displayLength}    Get Number Display Of Selected Item From Search Result
    ${expectedResult}    Convert To Integer    3
    Should Be Equal    ${displayLength}    ${expectedResult}
    Click Select First Item From Search Result
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${TEST_ADD_ANGLE_DISPLAY_NAME}