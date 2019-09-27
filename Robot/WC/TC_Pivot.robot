*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify Pivot Settings Result
    Pivot Settings Subtotal / Percentages Column / Custom Name / Field Icons / Collapse

Verify Pivot Display Drilldown Test
    Pivot Display Drilldown    PD    [ROBOT] Test Verify Pivot Drilldown    OrderDueDate    Order Due Date

Verify Pivot Percentages
    Pivot Percentages
