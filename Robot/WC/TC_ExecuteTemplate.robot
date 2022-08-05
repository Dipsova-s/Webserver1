*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Display When a Display Has Invalid Query Step
    [Documentation]  This test verifies executing template containing a display having Invalid Query Step
    [Tags]  acc_wc_aci  TC_C231305
    Check Warning And Error Displays In Display Dropdown    Template which display has invalid aggregation step

Verify Sorting Step When a Display Has Invalid Sorting Step
    [Documentation]  This test verifies executing template containing a display having Invalid Sorting Step
    [Tags]  acc_wc_aci  TC_C231305
    Check Warning And Error Displays In Display Dropdown    Template which display has invalid sorting step

Verify Display Fields When a Display Field Has Warning
    [Documentation]  This test verifies executing template containing a display having invalid fields
    [Tags]  acc_wc_aci  TC_C231305
    Check Warning And Error Displays In Display Dropdown    Template which display has invalid fields
