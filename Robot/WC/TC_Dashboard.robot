*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page

*** Test Cases ***
Verify Dashboard Details
    [tags]    acceptance    acc_wc
    Dashboard Details

Add Display To Existing Dashboard Test
    [tags]    acceptance    acc_wc
    Add Display To Dashboard Dashboard

Verify Publish Dashboard Via Publishing Popup Test
    [tags]    acceptance    acc_wc
    Publish Dashboard

Verify Dashboard Execution Parameters
    [tags]    acceptance    acc_wc
    Dashboard Execution Parameters

Verify Execute Dashboard With Execution Parameters In Edit Mode
    [tags]    intermittent
    Execute Dashboard With Execution Parameters In Edit Mode    Dashboard with execute parameters in edit mode