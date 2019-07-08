*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Test Cases ***
Verify Dashboard Details
    Dashboard Details

Add Display To Existing Dashboard Test
    Add Display To Dashboard Dashboard

Verify Publish Dashboard Via Publishing Popup Test
    Publish Dashboard

Verify Dashboard Execution Parameters
    Dashboard Execution Parameters

Verify Execute Dashboard With Execution Parameters In Edit Mode
    Execute Dashboard With Execution Parameters In Edit Mode    Dashboard with execute parameters in edit mode