*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Variables ***
${TEST_COPY_DISPLAY_TO_ANGLE_NAME_COPIED_ANGLE}         Angle For General Test
${TEST_COPY_DISPLAY_TO_ANGLE_NAME_PASTED_ANGLE}         Angle For General Test

${TEST_COPY_DISPLAY_TO_INVALIE_ANGLE_NAME}              Angle For General Test
${INVALIE_ANGLE_NAME}                                   Angle has warning itself

${TEST_COPY_INVALID_FIELD_DISPLAY_ANGLE_NAME}           Angle For General Test
${TEST_COPY_INVALID_QUERY_STEP_DISPLAY_ANGLE_NAME}      Angle For General Test
${TEST_COPY_INVALID_SORTING_STEP_DISPLAY_ANGLE_NAME}    Angle For General Test

${INVALID_FIELDS_DISPLAY_ANGLE_NAME}                    Angle which display has invalid fields
${INVALID_QUERY_STEP_DISPLAY_ANGLE_NAME}                Angle which display has invalid aggregation step
${INVALID_SORTING_STEP_DISPLAY_ANGLE_NAME}              Angle which display has invalid sorting step

*** Test Cases ***
Verify Copy Display Test
    [Documentation]     This test verifies that displays can be copied from one angle to another.
    [Tags]      acc_wc_aci  TC_C231295
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_DISPLAY_TO_ANGLE_NAME_COPIED_ANGLE}
    Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_DISPLAY_TO_ANGLE_NAME_PASTED_ANGLE}
    Paste Display
    Check If Angle Or Display Has A Warning Then Close The Popup

Verify Copy Display When Angle Invalid Test
    [Documentation]     This test verifies that displays cannot be copied from an angle to invalid angle.
    [Tags]      TC_C231295
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_DISPLAY_TO_INVALIE_ANGLE_NAME}
    Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${INVALIE_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Is Element Has CssClass    ${ddlAngleActionDropdownListPasteDisplay}    disabled

Verify Copy Display When Display Invalid Field Test
    [Documentation]     This test verifies that displays containing invalid field can be copied from one angle to another.
    [Tags]      acc_wc_aci  TC_C231295
    Search Angle From Search Page And Execute Angle    ${INVALID_FIELDS_DISPLAY_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_INVALID_FIELD_DISPLAY_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Paste Display
    Check If Angle Or Display Has A Warning Then Close The Popup

Verify Copy Display When Display Invalid Query Step Test
    [Documentation]     This test verifies that displays containing invalid query step cannot be copied from one angle to another.
    [Tags]      TC_C231295
    Search Angle From Search Page And Execute Angle    ${INVALID_QUERY_STEP_DISPLAY_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_INVALID_QUERY_STEP_DISPLAY_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Paste Display But Invalid

Verify Copy Display When Display Invalid Sorting Step Test
    [Documentation]     This test verifies that displays containing invalid sorting step can be copied from one angle to another.
    [Tags]      TC_C231295
    Search Angle From Search Page And Execute Angle    ${INVALID_SORTING_STEP_DISPLAY_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_INVALID_SORTING_STEP_DISPLAY_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Paste Display