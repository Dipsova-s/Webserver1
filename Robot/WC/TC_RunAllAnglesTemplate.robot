*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          allangles
Test Template       Find And Execute Angle

*** Test Cases ***                  AngleId    AngleUri    AngleName
