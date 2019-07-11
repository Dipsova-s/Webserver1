*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_VERIFY_PIVOT_DRILLDOWN_NAME}    [ROBOT] Test Verify Pivot Drilldown

*** Test Cases ***
Verify Pivot Settings Result
    Pivot Settings Subtotal / Percentages Column / Custom Name / Field Icons / Collapse

Verify Pivot Display Drilldown Test
    Pivot Display Drilldown    PD    ${TEST_VERIFY_PIVOT_DRILLDOWN_NAME}    OrderDueDate    Order Due Date

Verify Pivot Percentages
    Pivot Percentages
