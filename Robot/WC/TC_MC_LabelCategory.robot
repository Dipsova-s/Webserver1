*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags        	MC   smk_mc

*** Variables ***
${TEST_EXPORT_PRIVILEGES}    [ROBOT] Test Label Category
${LABEL_CATEGORY_NAME}       TestLabelCategory
${LABEL_NAME}                TestLabel
${INVALID_LABEL_NAME}        Invalid Label

*** Test Cases ***
Test Label Category
    [Documentation]     This test case deals with creating a Label category which includes Labels and verifying the same by editing/filtering.
    [Tags]      TC-571      TC-572      TC-573      TC-575
    Login To MC By Admin User
    Wait Until Overview Page Loaded    
    Go To Label Category Setting Page
    Create Label Category Setting    ${LABEL_CATEGORY_NAME}
    Add Label    ${LABEL_NAME}
    Verify Existence Of Label Category      ${LABEL_CATEGORY_NAME}
    Click Edit Label Category By ID    ${LABEL_CATEGORY_NAME}
    Verify Label Category data      ${LABEL_CATEGORY_NAME}      ${LABEL_NAME}
	Edit Invalid Label    ${LABEL_NAME}    ${INVALID_LABEL_NAME}  
    Click Cancel Edit Label Category
    Verify the Reordering of Label Categories    ${LABEL_CATEGORY_NAME}
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Labels
    Verify Existence Of Label Category      ${LABEL_CATEGORY_NAME}
    Verify Existence Of Labels      ${LABEL_NAME}
    Verify Filter   ${LABEL_CATEGORY_NAME}      ${LABEL_NAME}
    Check Active, Valid And Required Checkboxes   ${LABEL_CATEGORY_NAME}
    Uncheck Required, Valid and Active Checkboxes   ${LABEL_CATEGORY_NAME}
    Go To Label Category Setting Page
    Delete Label Category Setting    ${LABEL_CATEGORY_NAME}
