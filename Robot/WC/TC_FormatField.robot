*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance     acc_wc



*** Variables ***
${TEST_ADD_ANGLE_DISPLAY_NAME}      Angle For General Test
${selectFieldKeyword}        ID

*** Test Cases ***
Verify Field Alias On Format Field
    Search By Text And Expect In Search Result    ${TEST_ADD_ANGLE_DISPLAY_NAME}
    Open Angle From First Angle in Search Page    ${TEST_ADD_ANGLE_DISPLAY_NAME}
    Wait Progress Bar Closed
    Click Header by Data Field Angle Grid List Display     ${selectFieldKeyword}
    Click Format Field From Header Column
    Input Field Name     Edit Field
    Click OK Button On field Format Popup
    Page Should Contain    Edit Field
    
    