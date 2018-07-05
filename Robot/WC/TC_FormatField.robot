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
    Search Angle From Search Page And Edit Format Field    ${TEST_ADD_ANGLE_DISPLAY_NAME}    ${selectFieldKeyword}    
    Verify Field Alias Was Changed    

