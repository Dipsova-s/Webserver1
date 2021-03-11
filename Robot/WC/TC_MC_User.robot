*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Teardown      Close Browser
Force Tags          smk_mc


*** Test Cases ***
Test All Users Page
    [Documentation]     This test verify All users page   
    Go To All Users Page With Admin User
    Logout MC
