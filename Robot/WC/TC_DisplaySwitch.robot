*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_OPEN_POPUP_WAS_CLOSE_WHEN_SWITCH_DISPLAY}      [ROBOT] Test Popup Was Close When Switch Display

*** Test Cases ***
Popup Was Close When Switch Display Test
    Login And Create Angle By 2 Objects From Object List    PD    ${TEST_OPEN_POPUP_WAS_CLOSE_WHEN_SWITCH_DISPLAY}
    Wait Progress Bar Closed
    Create New Pivot Display on Angle Page
    Click Show Field Chooser For Data Area
    Wait Until Element Is Visible    ${popupFieldChooser}
    Go Back
    Wait Progress Bar Closed
    ${isVisible}    Is Element Visible    ${popupFieldChooser}
    Should Not Be True    ${isVisible}
    Change Display By Name    New Display (1)
    Click Edit Angle
    Go Back
    ${isVisible}    Is Element Visible    ${tabAngleGeneral}
    Should Not Be True    ${isVisible}
    Click Add New Column To List
    Wait Until Element Is Visible    ${popupFieldChooser}
    Go Back
    ${isVisible}    Is Element Visible    ${popupFieldChooser}
    Should Not Be True    ${isVisible}
    Search By Text And Expect In Search Result    ${TEST_OPEN_POPUP_WAS_CLOSE_WHEN_SWITCH_DISPLAY}
    Delete All Search Result Items
    Element Should Not Contain    ${gridSearchResult}    ${TEST_OPEN_POPUP_WAS_CLOSE_WHEN_SWITCH_DISPLAY}





