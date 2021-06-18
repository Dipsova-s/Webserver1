*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Force Tags          MC    acc_mc

*** Test Cases ***
# Test removed until M4-94396 is complete
#Verify Systemlog File Should Show Forbidden When Access Path Denied
#    [Tags]  acc_mc_aci
#    Get Systemlog File By Arbitrary Path Traversal
#    Go To Application Server Log Page
#    Get Systemlog File By Wrong File Extension

Validate logs can be viewed for Application Server
    [Documentation]  This TC is to validate that logs can be viewed for Application Server for all files
    ...   using view button instead of downloading and viewing
    [Tags]  TC_C228919
    Go To Application Server Log Page
    Verify View button present for all Log files 

Validate logs can be viewed for Management Console
    [Documentation]  This TC is to validate that logs can be viewed for Management Console for all files
    ...   using view button instead of downloading and viewing
    [Tags]  TC_C228919
    Go To Management Console Log Page
    Verify View button present for all Log files 

Validate logs can be viewed for Web Client
    [Documentation]  This TC is to validate that logs can be viewed for Web Client for all files
    ...   using view button instead of downloading and viewing
    [Tags]  TC_C228919
    Go To Web Client Log Page
    Verify View button present for all Log files 

Validate logs can be viewed for Model Server
    [Documentation]  This TC is to validate that logs can be viewed for Model Server for all files
    ...   using view button instead of downloading and viewing
    [Tags]  TC_C228919
    Go To Model Server Log Page
    Verify View button present for all Log files 

Validate logs can be viewed for Repository
    [Documentation]  This TC is to validate that logs can be viewed for Repository for all files
    ...   using view button instead of downloading and viewing
    [Tags]  TC_C228919
    Go To Repository Log Page
    Verify View button present for all Log files 
