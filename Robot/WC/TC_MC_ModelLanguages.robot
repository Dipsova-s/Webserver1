*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Setup          Go To EA2_800 Model Language Page
Force Tags          acc_mc


*** Test Cases ***
Validate multiple languages can be activated
    [Tags]   TC_C666
    [Documentation]     Validate multiple languages can be activated/enabled from particular Models 

    Click on Enable radio button for language:"Dutch"
    Click on Enable radio button for language:"German"
    Click on save Language settings   
    Validate Radio button:"Dutch" is selected
    Validate Radio button:"German" is selected
