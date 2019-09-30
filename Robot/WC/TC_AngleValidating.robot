*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go to                   ${URL_WC}
Test Teardown       Logout
Force Tags          acc_wc

*** Test Cases ***
Verify Validate Angle Via Angle Detail Popup Test
    Verify Validate Angle Via Angle Detail Popup      Test Angle For Validate
