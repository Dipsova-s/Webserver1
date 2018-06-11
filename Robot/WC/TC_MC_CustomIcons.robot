*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags        	MC    smk_mc


*** Test Cases ***
Test Upload New Icons
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Custom Icons Page
    Add New Custom Icons And Save    ROBOT_icon
    Verify Custom Icons Were Uploaded    ROBOT_icon
    Delete Adding Custom Icons    ROBOT_icon