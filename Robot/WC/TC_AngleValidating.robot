*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go to                   ${URL_WC}
Test Teardown       Logout
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_VERIFY_ANGLE_VALIDATED_NAME}          Test Angle For Validate

*** Test Cases ***
Verify Validate Angle Via Angle Detail Popup Test
    Verify Validate Angle Via Angle Detail Popup      ${TEST_VERIFY_ANGLE_VALIDATED_NAME}
