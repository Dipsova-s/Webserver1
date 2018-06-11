*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_VERIFY_SORT_AND_MOVE_FILTERS_FROM_DISPLAY_POPUP}    [ROBOT] Verify Sort And Move Filters From Display Details Popup
${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE}    [ROBOT] Verify Move Filters From Display Details Popup And Save
${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS}    [ROBOT] Verify Move Filters From Display Details Popup And Save As
${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS_WITH_NEW_ANGLE}    [ROBOT] Verify Move Filters From Display Details Popup And Save As With New Angle
${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_WITH_JUMP}    [ROBOT] Verify Move Filters From Display Details Popup And Save With Jump
${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS_WITH_JUMP}    [ROBOT] Verify Move Filters From Display Details Popup And Save As With Jump
${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS__NEW_ANGLE_WITH_JUMP}    [ROBOT] Verify Move Filters From Display Details Popup And Save As New Angle With Jump

*** Test Cases ***
Verify Sort And Move Filters From Display Details Popup Test
    Verify Sort And Move Filters From Display Details Popup    ${TEST_VERIFY_SORT_AND_MOVE_FILTERS_FROM_DISPLAY_POPUP}

Verify Move Filters From Display Details Popup And Save Test
    Verify Move Filters From Display Details Popup And Save    ${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE}

Verify Move Filters From Display Details Popup And Save As Test
    Verify Move Filters From Display Details Popup And Save As    ${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS}

Verify Move Filters From Display Details Popup And Save As With New Angle Test
    Verify Move Filters From Display Details Popup And Save As With New Angle    ${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS_WITH_NEW_ANGLE}

Verify Move Filters From Display Details Popup And Save With Jump Test
    Verify Move Filters From Display Details Popup And Save With Jump    ${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_WITH_JUMP}

Verify Move Filters From Display Details Popup And Save As With Jump Test
    Verify Move Filters From Display Details Popup And Save As With Jump    ${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS_WITH_JUMP}

Verify Move Filters From Display Details Popup And Save As New Angle With Jump Test
    Verify Move Filters From Display Details Popup And Save As New Angle With Jump    ${TEST_VERIFY_MOVE_FILTERS_FROM_DISPLAY_POPUP_AND_SAVE_AS__NEW_ANGLE_WITH_JUMP}