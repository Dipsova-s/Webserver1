*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Verify Search SidePanel
    Open Side Panel
    Click Toggle Side Panel
    Logout
    Login To WC By Power User
    Side Panel Should Be Closed
    Click Toggle Side Panel  
    Side Panel Should Be Opened