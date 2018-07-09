*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance     acc_wc 



*** Variables ***
${TEST_ADD_ANGLE_DISPLAY_NAME}      Angle For General Test
${selectFieldKeyword}               ID
${selectFieldKeyword2}              CompanyCode__CompanyCode

*** Test Cases ***
Verify Field Alias On Format Field
    Search Angle From Search Page And Execute Angle    ${TEST_ADD_ANGLE_DISPLAY_NAME} 
    Edit Format Field From Field Header    ${selectFieldKeyword}    
    Verify Field Alias Was Changed    Edit Field
    Remove Field Format From Changing    ${selectFieldKeyword}    

Verify Field Alias With Checking Set As Default 
    Search Angle From Search Page And Execute Angle    ${TEST_ADD_ANGLE_DISPLAY_NAME}
    Edit Format Field With Checking Set As Default From Field Header    ${selectFieldKeyword2} 
    Verify Field Alias Was Changed    Edit Field    
    Remove Field Format From Changing    ${selectFieldKeyword2} 
