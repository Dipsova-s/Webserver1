*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Test Setup          Go To               ${URL_WC}
Suite Teardown      Logout WC Then Close Browser
#Force Tags          acceptance    acc_wc

*** Variables ***
${ObjectName}                ModelLoad
${AngleName}                 [ROBOT] ObjectType for Grouping EA4IT

*** Test Cases ***
Verify ObjectType For Grouping In Model EA4IT
    Login To WC By Admin User
    Verify Models EA4IT Is Exist
    Create Angle From Object List And Save For EA4IT    ${ObjectName}    ${AngleName}
    Create New Chart Display on Angle Page
    Back To Search
    Search By Text And Expect In Search Result    ${AngleName}
    Click Select First Item From Search Result
    ${displayLength}    Get Number Display Of Selected Item From Search Result
    ${expectedResult}    Convert To Integer    2
    Should Be Equal    ${displayLength}    ${expectedResult}
    Click Select First Item From Search Result
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${AngleName}
