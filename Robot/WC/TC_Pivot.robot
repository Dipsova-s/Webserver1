*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          intermittent

*** Test Cases ***
Verify Pivot Settings Result
    Pivot Settings Subtotal / Percentages Column / Custom Name / Field Icons / Collapse
    [Teardown]    Go to Search Page

Verify Pivot Display Drilldown Null Value Test
    Pivot Display Drilldown    PIVOT_DEFAULT_DRILLDOWN_DISPLAY.json    Pivot default drilldown test    EA2_800
    [Teardown]    Back To Search And Delete Angle Are Created    Pivot default drilldown test

Verify Pivot Percentages
    Pivot Percentages
    [Teardown]    Go to Search Page