*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Display When a Display Has Invalid Query Step
    Check Warning And Error Displays In Display Dropdown    Template which display has invalid aggregation step

Verify Sorting Step When a Display Has Invalid Sorting Step
    Check Warning And Error Displays In Display Dropdown    Template which display has invalid sorting step

Verify Display Fields When a Display Field Has Warning
    Check Warning And Error Displays In Display Dropdown    Template which display has invalid fields
