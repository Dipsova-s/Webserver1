*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify License and Copyright 
    [Tags]              TC_C201229 
    [Documentation]     Verify user can open License and Copyright  page
    Verify Copy Right


   
  