*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
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
    [Tags]  acc_wc_aci
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_DISPLAY_TO_ANGLE_NAME_COPIED_ANGLE}
    Wait Angle Page Document Loaded
    Click Angle Dropdown Actions Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_DISPLAY_TO_ANGLE_NAME_PASTED_ANGLE}
    Click Angle Dropdown Actions Paste Display
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup

Verify Copy Display When Angle Invalid Test
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_DISPLAY_TO_INVALIE_ANGLE_NAME}
    Wait Angle Page Document Loaded
    Click Angle Dropdown Actions Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${INVALIE_ANGLE_NAME}
    Check If Angle Or Display Has A Warning Then Close The Popup
    Is Element Has CssClass    ${ddlAngleActionDropdownListPasteDisplay}    disabled

Verify Copy Display When Display Invalid Field Test
    [Tags]  acc_wc_aci
    Search Angle From Search Page And Execute Angle    ${INVALID_FIELDS_DISPLAY_ANGLE_NAME}
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Angle Dropdown Actions Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_INVALID_FIELD_DISPLAY_ANGLE_NAME}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown Actions Paste Display
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup

Verify Copy Display When Display Invalid Query Step Test
    Search Angle From Search Page And Execute Angle    ${INVALID_QUERY_STEP_DISPLAY_ANGLE_NAME}
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Angle Dropdown Actions Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_INVALID_QUERY_STEP_DISPLAY_ANGLE_NAME}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown Actions Paste Display
    Wait Until Notification Popup Show
    Element Should Contain     ${popupNotification}    Display cannot be pasted
    Click Close Info Button

Verify Copy Display When Display Invalid Sorting Step Test
    Search Angle From Search Page And Execute Angle    ${INVALID_SORTING_STEP_DISPLAY_ANGLE_NAME}
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
    Click Angle Dropdown Actions Copy Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_COPY_INVALID_SORTING_STEP_DISPLAY_ANGLE_NAME}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Angle Dropdown Actions Paste Display
    Wait Angle Page Document Loaded
    Check If Angle Or Display Has A Warning Then Close The Popup
