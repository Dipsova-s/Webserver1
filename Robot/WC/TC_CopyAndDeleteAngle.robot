*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags        	smoke    smk_wc

*** Variables ***
${TEST_COPY_ANGLE_NAME}             Angle For General Test

*** Test Cases ***
Copy And Delete Angle Via Search Action Test
    Copy And Delete Angle Via Search Page    ${TEST_COPY_ANGLE_NAME}
