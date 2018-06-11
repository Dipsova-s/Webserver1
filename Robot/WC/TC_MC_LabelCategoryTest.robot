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

*** Test Cases ***
Test Labal Category
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Label Category Setting Page
    Create Label Category Setting    ${LABEL_CATEGORY_NAME}
    Add Label    ${LABEL_NAME}
    Click Edit Label Category By ID    ${LABEL_CATEGORY_NAME}
    Click Cancel Edit Label Category
    Delete Label Category Setting    ${LABEL_CATEGORY_NAME}
