*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc

*** Test Cases ***
Verify Pivot Settings Result
    [Tags]  acc_wc_aci
    Pivot Settings Subtotal / Percentages Column / Alias Name / Field Icons / Collapse
    [Teardown]    Go to Search Page

Verify Pivot Display Drilldown Test
    [Tags]  acc_wc_aci
    Pivot Display Drilldown    PIVOT_DEFAULT_DRILLDOWN_DISPLAY.json    [ROBOT] Pivot default drilldown test    EA2_800
    [Teardown]    Back To Search And Delete Angle Are Created    [ROBOT] Pivot default drilldown test

Verify Pivot Percentages
    Pivot Percentages
    [Teardown]    Go to Search Page