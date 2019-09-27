*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify Chart Options Are Presented
    Chart Options Are Presented

Verify Chart Options Axis Scale Functionality
    Chart Options Axis Scale Functionality

Verify Chart Display Drilldown Test
    Drilldown Chart Display