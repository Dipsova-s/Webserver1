*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Force Logout MC Them Close Browser
Force Tags          MC    acc_mc

*** Test Cases ***
Verify Systemlog File Should Show Forbidden When Access Path Denied
    Get Systemlog File By Arbitrary Path Traversal
    Get Systemlog File By Wrong File Extension