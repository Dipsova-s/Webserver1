*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Force Tags          auto_refresh

*** Test Cases ***
Verify session token is automatically refreshed in background
    [Documentation]     This test deals with automatic refresh of session token.
    ...                 As this test takes more than 120 minutes to execute so before executing make sure in TSA Settings TestMaxMinutes is set to 150.
    Wait for 30 minutes
    Go To All Users Page
    Wait for 35 minutes
    Go to Sessions page in MC
    Wait for 65 minutes
    Go To All Users Page and Session logs out