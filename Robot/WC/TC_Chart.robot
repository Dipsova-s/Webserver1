*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page

*** Test Cases ***
Verify Chart Options Are Presented
    [tags]    intermittent
    Chart Options Are Presented

Verify Chart Options Axis Scale Functionality
    [tags]    acceptance    acc_wc
    Chart Options Axis Scale Functionality

#Will enable when MS finished NULL for Enum
#Verify Chart Display Drilldown Test
#   Drilldown Chart Display