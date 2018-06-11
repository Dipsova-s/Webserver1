*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Variables ***
${TEMPLATE_WHICH_DISPLAY_HAS_INVALID_AGGREGATION_STEP}    Template which display has invalid aggregation step
${TEMPLATE_WHICH_DISPLAY_HAS_INVALID_SORTING_STEP}        Template which display has invalid sorting step
${TEMPLATE_WHICH_DISPLAY_HAS_INVALID_FIELDS}              Template which display has invalid fields
${TEMPLATE_HAS_WARNING_ITSELF}                            Template has warning itself

*** Test Cases ***
Verify Display When a Display Has Invalid Query Step
    Check Warning And Error Displays In Display Dropdown    ${TEMPLATE_WHICH_DISPLAY_HAS_INVALID_AGGREGATION_STEP}

Verify Sorting Step When a Display Has Invalid Sorting Step
    Check Warning And Error Displays In Display Dropdown    ${TEMPLATE_WHICH_DISPLAY_HAS_INVALID_SORTING_STEP}

Verify Display Fields When a Display Field Has Warning
    Check Warning And Error Displays In Display Dropdown    ${TEMPLATE_WHICH_DISPLAY_HAS_INVALID_FIELDS}
