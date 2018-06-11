*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc

*** Test Cases ***
Test Global Packages
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
    Verify Package Page Is Ready
    Verify Filter Not Found
    Verify Upload Package And Filter The Package
    Delete Uploaded Package

GUI Testing For Export Package Popup
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
    Click To Open Export Package Popup
    Verify GUI Export Package Popup
    Change GUI Export Package options
    Click To Close Export Package Popup
    Click To Open Export Package Popup
    Verify GUI Export Package Popup   # make sure that GUI reset correctly on 2nd time opening
    Click To Close Export Package Popup
